"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const SERVICES = [
  {
    icon: "🧬",
    title: "Genomic Profiling",
    desc: "Deep-dive into hereditary markers and genetic risk factors from lab reports.",
    tag: "Precision",
  },
  {
    icon: "🫀",
    title: "Cardiac Risk Index",
    desc: "Evaluate cholesterol panels, ECG summaries, and cardiovascular biomarkers.",
    tag: "Vitals",
  },
  {
    icon: "🩸",
    title: "Blood Panel Analysis",
    desc: "CBC, metabolic panels, HbA1c — flagged and explained in plain language.",
    tag: "Labs",
  },
  {
    icon: "🧠",
    title: "Neuro-Cognitive Score",
    desc: "Identify cognitive load indicators and neurological anomaly signals.",
    tag: "Neuro",
  },
  {
    icon: "💊",
    title: "Medication Review",
    desc: "Cross-reference prescribed drugs and recommended supplements.",
    tag: "Pharma",
  },
  {
    icon: "📈",
    title: "Longevity Estimate",
    desc: "AI-computed life expectancy delta based on current health trajectory.",
    tag: "Forecast",
  },
];

export default function Home() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = uploading
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!/^\+?[\d\s\-]{8,}$/.test(phone)) e.phone = "Valid phone number required";
    if (!file) e.file = "Upload a PDF report";
    return e;
  };

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

  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
    setErrors((e) => ({ ...e, file: undefined }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const pdfText = await parsePDF(file);
      const res = await fetch("http://localhost:3001/api/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), text: pdfText }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const result = await res.json();
      sessionStorage.setItem("vitalscan_result", JSON.stringify(result));
      sessionStorage.setItem("vitalscan_patient", JSON.stringify({ name: name.trim(), phone: phone.trim() }));
      router.push(`/patient/${result.id}`);
    } catch (err) {
      setErrors({ submit: err.message });
      setLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setStep(1);
    setName("");
    setPhone("");
    setFile(null);
    setErrors({});
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#080c10] text-slate-100 font-['Sora',sans-serif] overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px,transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/8 blur-[120px]" />

      <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 text-sm">♥</span>
          </div>
          <span className="font-bold tracking-tight text-white">
            Own<span className="text-emerald-400">Health</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs text-slate-500 tracking-widest uppercase">
          <a href="#services" className="hover:text-slate-300 transition-colors">Services</a>
          <a href="#about" className="hover:text-slate-300 transition-colors">About</a>
          <a href="#faq" className="hover:text-slate-300 transition-colors">FAQ</a>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs font-bold tracking-widest uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/20"
        >
          Get Analysis →
        </button>
      </nav>

      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs text-emerald-400 tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI-Powered Health Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.05] text-white mb-6">
          Your medical records,<br />
          <span className="text-emerald-400">decoded instantly.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
          Upload any lab report or clinical summary. Our AI extracts, scores, and interprets your health data in seconds.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25"
        >
          <span>Upload Your Report</span>
          <span className="text-lg">→</span>
        </button>
        <p className="text-xs text-slate-600 mt-4 tracking-wider">PDF format · Instant results · Not a medical diagnosis</p>
      </section>

      <div className="relative z-10 border-y border-white/5 bg-white/[0.02] py-6">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-3 gap-6 text-center">
          {[["12K+", "Reports Analyzed"], ["98%", "Extraction Accuracy"], ["< 10s", "Avg Analysis Time"]].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">{val}</p>
              <p className="text-xs text-slate-500 mt-1 tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <section id="services" className="relative z-10 max-w-5xl mx-auto px-8 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase mb-2">What We Analyze</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Six core services</h2>
          </div>
          <p className="text-xs text-slate-600 max-w-xs text-right hidden md:block">
            All powered by Claude AI with structured medical context extraction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-500/30 hover:bg-slate-900 transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-mono text-[9px] tracking-widest uppercase text-slate-600 border border-slate-700 rounded px-2 py-1 group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-colors">
                  {s.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent" />
          <p className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase mb-4">Ready to start?</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Upload your PDF and get results in seconds
          </h2>
          <p className="text-slate-400 text-sm mb-8">Enter your name and phone number, upload your medical PDF, and we'll do the rest.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20"
          >
            Start Free Analysis →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-8 text-center">
        <p className="text-xs text-slate-600 tracking-wider">
          © 2025 VitalScan · AI Analysis · Not a substitute for professional medical advice
        </p>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={resetModal} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
            <button
              onClick={resetModal}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <p className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase mb-1">Step 01</p>
            <h2 className="text-xl font-bold text-white mb-6">Patient Details & Report</h2>

            <div className="mb-4">
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">Full Name</label>
              <input
                className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors ${
                  errors.name ? "border-red-500/60" : "border-slate-700"
                }`}
                placeholder="e.g. Arjun Sharma"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(p => ({...p, name: undefined})); }}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">Phone Number</label>
              <input
                className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors ${
                  errors.phone ? "border-red-500/60" : "border-slate-700"
                }`}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors(p => ({...p, phone: undefined})); }}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">Medical PDF</label>
              <label
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-colors ${
                  dragOver
                    ? "border-emerald-400 bg-emerald-500/5"
                    : errors.file
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-slate-700 hover:border-slate-600 bg-slate-800/40"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <span className="text-2xl">{file ? "✅" : "📋"}</span>
                {file ? (
                  <p className="text-xs text-emerald-400 font-mono">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-400">
                      <span className="text-emerald-400 font-semibold">Drop PDF</span> or click to browse
                    </p>
                    <p className="text-xs text-slate-600">Lab results, clinical summaries, reports</p>
                  </>
                )}
              </label>
              {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
            </div>

            {errors.submit && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 font-mono text-xs">
                ✕ {errors.submit}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm tracking-widest uppercase py-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Analysing…
                </>
              ) : (
                "Run Analysis →"
              )}
            </button>
            <p className="text-center text-[10px] text-slate-600 mt-3 tracking-wider">Your data is processed securely and not stored beyond analysis.</p>
          </div>
        </div>
      )}
    </main>
  );
}