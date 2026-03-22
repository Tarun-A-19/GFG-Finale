import React from "react";

export default function SummaryMetrics({ summary }) {
  if (!summary) return null;

  const score = summary.accuracy_score ?? 0;

  const getCredColor = () => {
    if (score >= 75) return { bg: "var(--true-bg)", text: "var(--true-text)", border: "var(--true-border)", glow: "var(--true-glow)" };
    if (score >= 50) return { bg: "var(--partial-bg)", text: "var(--partial-text)", border: "var(--partial-border)", glow: "var(--partial-glow)" };
    return { bg: "var(--false-bg)", text: "var(--false-text)", border: "var(--false-border)", glow: "var(--false-glow)" };
  };

  const credStyle = getCredColor();

  const cards = [
    { value: `${score}%`, label: "ACCURACY", color: "text-[var(--purple-bright)]" },
    { value: summary.true, label: "TRUE", color: "text-[var(--true-text)]" },
    { value: summary.false, label: "FALSE", color: "text-[var(--false-text)]" },
    { value: summary.unverifiable, label: "UNKNOWN", color: "text-[var(--text-muted)]" },
  ];

  return (
    <div className="mt-8 animate-[fadeUp_0.4s_ease_forwards]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="glass-panel rounded-2xl p-5 hover:border-[var(--border-strong)] transition-all duration-300"
          >
            <div className={`text-3xl md:text-5xl font-mono tracking-tighter mb-2 ${c.color}`}>
              {c.value}
            </div>
            <div className="text-[10px] md:text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <div 
           className="px-8 py-3 rounded-full border border-solid font-mono font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_var(--glow)]" 
           style={{ backgroundColor: credStyle.bg, borderColor: credStyle.border, color: credStyle.text, "--glow": credStyle.glow }}
        >
          OVERALL: {summary.credibility || "UNRELIABLE"}
        </div>
      </div>
    </div>
  );
}
