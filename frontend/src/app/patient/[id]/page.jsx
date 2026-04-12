"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loaded, setLoaded] = useState(false);

  
  useEffect(() => {
    const raw = sessionStorage.getItem("vitalscan_result");
    const pat = sessionStorage.getItem("vitalscan_patient");

    if (raw) {
      const parsed = JSON.parse(raw);
      setResult(parsed);
      setPatient(pat ? JSON.parse(pat) : null);
      setLoaded(true);
    } else {
      fetch(`http://10.55.0.250:3001/api/record/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setResult({
            id: data.id,
            data: data.analysis
          });
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }
  }, [id]);

  if (!loaded) return <LoadingScreen />;
  if (!result) return <NotFound onBack={() => router.push("/")} />;
  
  const d = result?.data;

  const phone = patient?.phone || "+919870148723";

  const message = encodeURIComponent(
    `Hello, I'm contacting regarding a health report.\n\nPatient: ${patient?.name || "Unknown"}\nScore: ${d?.score}/100\n\nPlease assist.`
  );
  const score = d?.score ?? 0;
  const scoreColor = score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  const barBg = score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-red-400";
  const scoreLabel = score >= 75 ? "Excellent" : score >= 50 ? "Moderate" : "Needs Attention";

  return (
    <main className="min-h-screen bg-[#080c10] text-slate-100 font-['Sora',sans-serif]">
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px,transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-600/8 blur-[120px]" />

      <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 text-sm">♥</span>
          </div>
          <span className="font-bold tracking-tight text-white">
            Own<span className="text-emerald-400">Health</span>
          </span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors tracking-widest uppercase flex items-center gap-2"
        >
          ← New Analysis
        </button>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">

        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase mb-2">Patient Record · #{result.id}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {patient?.name ?? d?.name ?? "Patient"}
            </h1>
            {patient?.phone && (
              <p className="text-sm text-slate-500 mt-1 font-mono">{patient.phone}</p>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 tracking-widest uppercase font-mono">Analysis Complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 relative overflow-hidden">
            <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px]"
              style={{ backgroundColor: `${scoreColor}15` }} />
            <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-4">Overall Health Score</p>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-7xl font-extrabold tracking-tighter leading-none" style={{ color: scoreColor }}>
                {d?.score ?? "—"}
              </span>
              <span className="text-slate-600 font-mono text-sm mb-2">/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${barBg}`}
                style={{ width: `${d?.score ?? 0}%` }}
              />
            </div>
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: scoreColor }}>
              {scoreLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-4">Life Expectancy</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-7xl font-extrabold tracking-tighter leading-none text-white">
                {d?.life_expectancy ?? "—"}
              </span>
              <span className="text-slate-600 font-mono text-sm mb-2">yrs</span>
            </div>
            <p className="text-xs text-slate-600 font-mono tracking-wider">AI estimated based on current health</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[["Low Risk", "🟢"], ["Medium", "🟡"], ["High", "🔴"]].map(([l, e]) => (
                <div key={l} className="rounded-lg bg-slate-800 py-2">
                  <div className="text-sm">{e}</div>
                  <div className="text-[9px] text-slate-600 font-mono tracking-wider uppercase mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {d?.data?.anomalies?.length > 0 && (
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 mb-4">
            <p className="font-mono text-[10px] tracking-widest text-orange-400 uppercase mb-3">
              ⚠️ Anomalies Detected ({d.data.anomalies.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {d.data.anomalies.map((t, i) => (
                <span key={i} className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 font-mono text-xs text-orange-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TagCard
            emoji="🏃"
            title="Lifestyle Indicators"
            items={d?.data?.lifestyle}
            tagClass="bg-slate-800 border-slate-700 text-slate-300"
          />
          <TagCard
            emoji="🩺"
            title="Current Health Markers"
            items={d?.data?.current_health}
            tagClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          />
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 mb-8">
    
   <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-800">
    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
    <p className="font-mono text-[10px] tracking-widest text-emerald-400 uppercase">
      Doctor Recommendation
    </p>
  </div>

  <div className="p-5">
    <p className="text-xs text-slate-400 leading-relaxed mb-5">
      Based on your health analysis, a consultation is recommended for further evaluation and personalized treatment.
    </p>

    <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3.5 mb-5">
      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <span className="text-emerald-400 text-base">🩺</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">General Physician</p>
        <p className="text-xs text-slate-500 mt-0.5">Initial consultation & medication guidance</p>
      </div>
      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider px-3 py-1 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Available
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <a
        href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wide transition-all"
      >
        💬 Chat doctor
      </a>
      
        <a
          href={`tel:${patient?.phone || "+919999999999"}`}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-xs font-mono tracking-wide transition-all"
        >
        📞 Call now
      </a>
    </div>
  </div>

  <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-800 bg-slate-900/60">
    <span className="text-slate-600 text-xs">ⓘ</span>
    <p className="text-[10px] text-slate-600 tracking-wide">
      AI recommendation only — not a substitute for professional medical advice.
    </p>
  </div>

</div>


        {d?.summary && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-8">
            <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3">📝 AI Summary</p>
            <p className="text-sm text-slate-300 leading-relaxed">{d.summary}</p>
          </div>
        )}

        <div className="text-center">
          <p className="font-mono text-[10px] text-slate-600 tracking-wider uppercase">
            Record ID: {result.id} · Generated by VitalScan AI · Not a medical diagnosis
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors tracking-widest uppercase font-mono"
          >
            ← Analyze Another Report
          </button>
        </div>
      </div>
      </div>
    </main>
  );
}

function TagCard({ emoji, title, items, tagClass }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3">
        {emoji} {title}
      </p>
      {items?.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((t, i) => (
            <span key={i} className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${tagClass}`}>
              {t}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-600 font-mono">None noted</p>
      )}
    </div>
  );
}

function MedCard({ emoji, title, items, dot }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3">
        {emoji} {title}
      </p>
      {items?.length ? (
        <ul className="space-y-2.5">
          {items.map((v, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-slate-300 border-b border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-600 font-mono">None recommended</p>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin w-8 h-8 text-emerald-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="font-mono text-xs text-slate-500 tracking-widest uppercase">Loading patient data…</p>
      </div>
    </div>
  );
}

function NotFound({ onBack }) {
  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center text-center px-6">
      <div>
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-xl font-bold text-white mb-2">Record not found</h1>
        <p className="text-slate-500 text-sm mb-6">This analysis record doesn't exist or has expired.</p>
        <button onClick={onBack} className="text-emerald-400 text-xs tracking-widest uppercase font-mono hover:text-emerald-300">
          ← Go back home
        </button>
      </div>
    </div>
  );
}