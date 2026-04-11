"use client";

import { useState } from "react";

const API_URL = "http://localhost:3001/api/insert";

export default function HealthAnalyzer() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const parsePDF = async (f) => {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const arrayBuffer = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return text;
  };

  const handleFile = async (f) => {
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
    setError("");
    const text = await parsePDF(f);
    setPdfText(text);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Please enter a patient name."); return; }
    if (!pdfText) { setError("Please upload a PDF report first."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), text: pdfText }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Request failed");
      }
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const d = result?.data;
  const score = d?.score ?? 0;
  const scoreColor =
    score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const barColor =
    score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-5 py-12">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px,transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <span className="text-emerald-400 text-lg leading-none">♥</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Vital<span className="text-emerald-400">Scan</span>
            </h1>
            <p className="text-xs text-slate-500 tracking-widest uppercase mt-0.5">
              AI Health Record Analysis
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 mb-5">
          <p className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase mb-5">
            01 — Patient Input
          </p>

          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors mb-4"
            placeholder="Patient name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label
            className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 cursor-pointer transition-colors ${
              dragOver
                ? "border-emerald-400 bg-emerald-500/5"
                : "border-slate-700 hover:border-slate-600 bg-slate-800/40"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <span className="text-3xl">📋</span>
            <p className="text-sm text-slate-400">
              <span className="text-emerald-400 font-semibold">Drop PDF here</span>{" "}
              or click to browse
            </p>
            <p className="text-xs text-slate-600">
              Lab results, clinical summaries, medical reports
            </p>
          </label>

          {file && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
              <span className="text-emerald-400 text-xs">▶</span>
              <span className="font-mono text-xs text-emerald-300 truncate">{file.name}</span>
              <span className="ml-auto font-mono text-xs text-slate-500 shrink-0">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 font-mono text-xs">
              <span>✕</span> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !file || !name}
            className="mt-5 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm tracking-widest uppercase py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            {loading ? "Analysing…" : "Run Analysis →"}
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500 font-mono text-xs tracking-widest uppercase">
            <svg className="animate-spin w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Processing health data…
          </div>
        )}

        {result && d && (
          <div className="space-y-4">
            <p className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase">
              02 — Analysis Results
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">
                  Health Score
                </p>
                <p className={`text-5xl font-extrabold tracking-tighter leading-none ${scoreColor}`}>
                  {d.score ?? "—"}
                </p>
                <p className="font-mono text-[10px] text-slate-600 mt-1.5">out of 100</p>
                <div className="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                    style={{ width: `${d.score ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">
                  Life Expectancy
                </p>
                <p className="text-5xl font-extrabold tracking-tighter leading-none text-slate-100">
                  {d.life_expectancy ?? "—"}
                </p>
                <p className="font-mono text-[10px] text-slate-600 mt-1.5">estimated years</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TagSection
                title="🏃 Lifestyle"
                items={d.data?.lifestyle}
                tagClass="bg-slate-800 border-slate-700 text-slate-300"
              />
              <TagSection
                title="🩺 Current Health"
                items={d.data?.current_health}
                tagClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              />
            </div>

            {d.data?.anomalies?.length > 0 && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
                <p className="font-mono text-[10px] tracking-widest text-orange-400 uppercase mb-3">
                  ⚠️ Anomalies Detected
                </p>
                <div className="flex flex-wrap gap-2">
                  {d.data.anomalies.map((t, i) => (
                    <span
                      key={i}
                      className="rounded border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-xs text-orange-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <MedBlock title="💊 Vitamins" items={d.medicine?.vitamins} dotClass="bg-emerald-400" />
              <MedBlock title="💉 Medications" items={d.medicine?.drugs} dotClass="bg-orange-400" />
            </div>

            <p className="text-center font-mono text-[10px] text-slate-600 pt-4 tracking-wider uppercase">
              Record ID: {result.id} · AI Analysis · Not a medical diagnosis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TagSection({ title, items, tagClass }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3">{title}</p>
      {items?.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((t, i) => (
            <span key={i} className={`rounded border px-2.5 py-1 font-mono text-xs ${tagClass}`}>
              {t}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-600">None noted</p>
      )}
    </div>
  );
}

function MedBlock({ title, items, dotClass }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3">{title}</p>
      {items?.length ? (
        <ul className="space-y-2">
          {items.map((v, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 text-sm text-slate-300 border-b border-slate-800 pb-2 last:border-0 last:pb-0"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
              {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-600">None recommended</p>
      )}
    </div>
  );
}