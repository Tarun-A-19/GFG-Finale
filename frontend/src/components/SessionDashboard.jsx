import React, { useState } from "react";

export default function SessionDashboard({ history, setHistory }) {
  const [expanded, setExpanded] = useState(false);

  const clearHistory = () => {
    localStorage.removeItem("factguard_history");
    setHistory([]);
    setExpanded(false);
  };

  if (!history || history.length === 0) return null;

  const totalChecks = history.length;
  const avgAccuracy = Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalChecks) || 0;
  const totalVerified = history.reduce((acc, h) => acc + h.claimCount, 0) || 0;

  return (
    <div className="w-full glass-panel rounded-2xl md:rounded-[2rem] mb-8 overflow-hidden transition-all duration-300 relative z-20">
      
      {/* Header Toggle */}
      <div 
        className={`p-4 md:p-6 flex justify-between items-center cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors ${expanded ? "border-b border-[var(--border-subtle)]" : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl opacity-80">📊</span>
          <h2 className="text-sm md:text-lg font-mono tracking-widest text-[var(--text-primary)]">
            Session Stats
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--purple-bright)]">
          {expanded ? "Collapse ▲" : `${totalChecks} Checks ▼`}
        </span>
      </div>

      {/* Expanded Content */}
      <div 
        className={`transition-all duration-500 ease-in-out ${expanded ? "max-h-[1000px] opacity-100 p-4 md:p-6" : "max-h-0 opacity-0 p-0 overflow-hidden"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">Live Statistics</h3>
          <button onClick={clearHistory} className="text-[10px] md:text-xs font-mono tracking-widest text-[var(--false-text)] hover:text-white transition-colors">
            Clear History
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl p-4">
            <div className="text-[10px] font-mono tracking-widest text-[var(--text-secondary)] mb-1">Total Checks</div>
            <div className="text-2xl font-black tracking-tighter text-[var(--text-primary)]">{totalChecks}</div>
          </div>
          <div className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl p-4">
            <div className="text-[10px] font-mono tracking-widest text-[var(--text-secondary)] mb-1">Avg Accuracy</div>
            <div className="text-2xl font-black tracking-tighter text-[var(--purple-bright)]">{avgAccuracy}%</div>
          </div>
          <div className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl p-4">
            <div className="text-[10px] font-mono tracking-widest text-[var(--text-secondary)] mb-1">Claims Verified</div>
            <div className="text-2xl font-black tracking-tighter text-[var(--true-text)]">{totalVerified}</div>
          </div>
        </div>

        {/* History List */}
        <div>
          <h3 className="font-mono text-[10px] tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-subtle)] pb-2 flex items-center justify-between">
            <span>Recent Checks</span>
          </h3>
          <ul className="space-y-3">
            {history.slice(0, 5).map(h => (
              <li key={h.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl hover:border-[var(--purple-mid)] transition-colors">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest mb-1">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  <span className="text-xs font-medium truncate text-[var(--text-primary)]">{h.inputPreview}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span 
                     className={`px-2 py-1 rounded border font-mono text-[10px] font-bold tracking-widest text-[var(--bg-base)]`}
                     style={{ 
                       background: h.accuracy >= 75 ? 'var(--true-text)' : h.accuracy >= 50 ? 'var(--partial-text)' : 'var(--false-text)',
                       borderColor: 'transparent'
                     }}
                  >
                    {h.accuracy}% ACC
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-secondary)] w-24 text-right">
                    {h.credibility}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
