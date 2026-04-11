"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:3001/api/latest-reports";

const AVATAR_COLORS = [
  { bg: "bg-blue-500/10 text-blue-400" },
  { bg: "bg-emerald-500/10 text-emerald-400" },
  { bg: "bg-purple-500/10 text-purple-400" },
  { bg: "bg-amber-500/10 text-amber-400" },
  { bg: "bg-rose-500/10 text-rose-400" },
];

function avatarColor(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length].bg;
}

function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function scoreColor(s) {
  if (s >= 75) return "text-emerald-400";
  if (s >= 50) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(s) {
  if (s >= 75) return "bg-emerald-400";
  if (s >= 50) return "bg-amber-400";
  return "bg-red-400";
}

function badgeBg(s) {
  if (s >= 75) return "bg-emerald-500/10 text-emerald-400";
  if (s >= 50) return "bg-amber-500/10 text-amber-400";
  return "bg-red-500/10 text-red-400";
}

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function Tags({ items, className = "" }) {
  if (!items?.length) return <p className="text-xs text-slate-600">None</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${className}`}>{t}</span>
      ))}
    </div>
  );
}

function PatientCard({ report }) {
  const [open, setOpen] = useState(false);
  const a = report.analysis || {};
  const score = a.score ?? 0;
  const anomalies = a.data?.anomalies || [];
  const lifestyle = a.data?.lifestyle || [];
  const current = a.data?.current_health || [];
  const vitamins = a.medicine?.vitamins || [];
  const drugs = a.medicine?.drugs || [];
  const phone = report.phone || "";

  return (
    <div className={`rounded-2xl border bg-slate-900 overflow-hidden transition-all ${open ? "border-slate-600" : "border-slate-800"}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(report.name)}`}>
          {initials(report.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{report.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{phone ? `${phone} · ` : ""}{timeAgo(report.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-mono ${badgeBg(score)}`}>{score}/100</span>
          {anomalies.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono">
              {anomalies.length} anomal{anomalies.length > 1 ? "ies" : "y"}
            </span>
          )}
        </div>
        <span className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-slate-800 px-5 py-5">
          {/* Score + Life Expectancy */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Health score</p>
              <p className={`text-4xl font-extrabold tracking-tighter ${scoreColor(score)}`}>{score}</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${scoreBg(score)} transition-all duration-700`} style={{ width: `${score}%` }} />
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Life expectancy</p>
              <p className="text-4xl font-extrabold tracking-tighter text-white">
                {a.life_expectancy ?? "—"}<span className="text-sm text-slate-500 font-normal"> yrs</span>
              </p>
            </div>
          </div>

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <div className="mb-4">
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Anomalies</p>
              <Tags items={anomalies} className="border-amber-500/30 bg-amber-500/10 text-amber-300" />
            </div>
          )}

          {/* Current health + Lifestyle */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Current health</p>
              <Tags items={current} className="border-slate-700 text-slate-400" />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Lifestyle</p>
              <Tags items={lifestyle} className="border-slate-700 text-slate-400" />
            </div>
          </div>

          {/* Vitamins + Medications */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Vitamins</p>
              <Tags items={vitamins} className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400" />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Medications</p>
              <Tags items={drugs} className="border-slate-700 text-slate-400" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            {phone && (
              
                <a href={`tel:${phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono hover:bg-emerald-500/20 transition-colors"
              >
                📞 Call
              </a>
            )}
            <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono hover:bg-blue-500/20 transition-colors">
              💬 Chat
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono hover:bg-slate-700 transition-colors">
              📝 Draft note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((d) => { setReports(d.reports || []); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = reports.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    const s = r.analysis?.score ?? 0;
    const anomalies = r.analysis?.data?.anomalies || [];
    if (filter === "low" && s >= 50) return false;
    if (filter === "anom" && !anomalies.length) return false;
    return true;
  });

  const scores = reports.map((r) => r.analysis?.score ?? 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : "—";
  const alerts = reports.filter((r) => (r.analysis?.score ?? 0) < 50 || (r.analysis?.data?.anomalies || []).length > 0).length;

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "low", label: "Low score" },
    { key: "anom", label: "Has anomalies" },
  ];

  return (
    <main className="min-h-screen bg-[#080c10] text-slate-100 font-['Sora',sans-serif]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#94a3b8 1px,transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 text-sm">♥</span>
          </div>
          <span className="font-bold tracking-tight text-white">Vital<span className="text-emerald-400">Scan</span></span>
          <span className="text-xs text-slate-600 font-mono ml-2">/ Doctor View</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase mb-2">Doctor Dashboard</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Patient Records</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[["Total patients", reports.length], ["Need attention", alerts], ["Avg score", avgScore]].map(([label, val]) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-2xl font-extrabold text-white">{loading ? "—" : val}</p>
              <p className="text-xs text-slate-500 mt-1 font-mono tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <input
            className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
            placeholder="Search by patient name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs px-4 py-2.5 rounded-xl border font-mono transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-xs font-mono">
            ✕ {error} — make sure the API server is running on localhost:3001
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-slate-500 font-mono text-xs tracking-widest uppercase">
            <svg className="animate-spin w-6 h-6 text-emerald-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Loading patients…
          </div>
        )}

        {/* Records */}
        {!loading && (
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <p className="text-center py-16 text-slate-600 text-sm">No patients match your filters.</p>
            ) : (
              filtered.map((r) => <PatientCard key={r.id} report={r} />)
            )}
          </div>
        )}
      </div>
    </main>
  );
}