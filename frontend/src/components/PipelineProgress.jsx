import React from "react";

const steps = [
  { key: "scraping", label: "SCRAPING" },
  { key: "extracting", label: "EXTRACTING" },
  { key: "searching", label: "SEARCHING" },
  { key: "verifying", label: "VERIFYING" },
];

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M5 12l5 5L20 7"></path>
  </svg>
);

export default function PipelineProgress({ stages }) {
  const statusFor = (key) => stages?.[key] || "waiting";

  const circleStyle = (status) => {
    if (status === "done") {
      return "bg-[var(--purple-mid)] border-transparent text-white shadow-[0_0_15px_var(--purple-glow)]";
    }
    if (status === "loading") {
      return "bg-[var(--bg-elevated)] border-[var(--border-strong)] text-[var(--text-primary)] shadow-[0_0_15px_var(--purple-glow)]";
    }
    if (status === "retrying") {
      return "bg-[rgba(251,191,36,0.1)] border-[#fbbf24] text-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.2)]";
    }
    return "bg-transparent border-[var(--border-default)] text-[var(--text-muted)]";
  };

  const labelColor = (status) => {
    if (status === "done") return "text-[var(--purple-bright)]";
    if (status === "loading") return "text-[var(--text-primary)]";
    if (status === "retrying") return "text-[#fbbf24]";
    return "text-[var(--text-muted)]";
  };

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 mt-6">
      <div className="flex justify-between items-center relative z-10 w-full overflow-x-auto pb-2">
        {steps.map((s, idx) => {
          const status = statusFor(s.key);
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-3 shrink-0 px-2 min-w-[70px]">
                {/* Circle */}
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border flex items-center justify-center relative transition-all duration-300 ${circleStyle(status)}`}
                >
                  {status === "loading" && (
                    <div className="w-5 h-5 border-[3px] border-[var(--text-secondary)] border-t-[var(--text-primary)] rounded-full animate-[spin_1s_linear_infinite]" />
                  )}
                  {status === "done" && <Check />}
                  {status === "retrying" && <span className="text-xl">🔄</span>}
                </div>
                {/* Label */}
                <span className={`text-[9px] md:text-xs font-mono uppercase tracking-widest flex flex-col items-center gap-1 ${labelColor(status)}`}>
                  {s.label}
                  {status === "retrying" && (
                     <span className="text-[9px] text-[#fbbf24] tracking-widest font-bold">DEEPENING...</span>
                  )}
                </span>
              </div>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 md:h-1.5 rounded-full mx-1 md:mx-4 mb-8 transition-all duration-500`}
                  style={{
                    backgroundColor: statusFor(steps[idx].key) === "done" 
                        ? "var(--purple-mid)" 
                        : "var(--border-subtle)",
                    boxShadow: statusFor(steps[idx].key) === "done" 
                        ? "0 0 10px var(--purple-glow)" 
                        : "none"
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
