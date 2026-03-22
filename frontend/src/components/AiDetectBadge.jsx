import React, { useMemo } from "react";

export default function AiDetectBadge({ aiScore }) {
  const percent = useMemo(() => {
    const p = Math.round((aiScore || 0) * 100);
    return Math.max(0, Math.min(100, p));
  }, [aiScore]);

  // Use mission 1 styling gradients based on standard logic
  const getStyleObj = () => {
    if (percent < 30) return { bar: "var(--true-bar)", glow: "var(--true-glow)", text: "var(--true-text)" }; // Low AI: good
    if (percent <= 70) return { bar: "var(--partial-bar)", glow: "var(--partial-glow)", text: "var(--partial-text)" }; // Mid AI: caution
    return { bar: "var(--false-bar)", glow: "var(--false-glow)", text: "var(--false-text)" }; // High AI: danger
  };

  const styleObj = getStyleObj();

  return (
    <div className="glass-panel border-r-4 border-r-transparent hover:border-r-[var(--purple-mid)] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
      
      <div className="flex-1">
        <h3 className="font-mono text-sm tracking-widest mb-1 select-none text-[var(--text-primary)]">
          AI Generation Probability
        </h3>
        <p className="text-[10px] font-mono tracking-widest text-[var(--text-secondary)]">
          Higher scores indicate synthetic origin vs human origin
        </p>
      </div>

      <div className="flex items-center gap-4 border border-[var(--border-default)] p-2 rounded-xl bg-[var(--bg-elevated)] shadow-inner">
        <div className="w-32 md:w-48 h-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded overflow-hidden relative">
           <div 
             className="h-full rounded transition-all duration-1000 ease-out"
             style={{ width: `${percent}%`, background: styleObj.bar, boxShadow: `0 0 10px ${styleObj.glow}` }}
           />
        </div>
        <span className="font-mono text-lg w-14 text-right tracking-tight font-bold" style={{ color: styleObj.text }}>
          {percent}%
        </span>
      </div>

    </div>
  );
}
