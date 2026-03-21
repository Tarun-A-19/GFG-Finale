import React, { useMemo } from "react";

export default function AiDetectBadge({ aiScore }) {
  const percent = useMemo(() => {
    const p = Math.round((aiScore || 0) * 100);
    return Math.max(0, Math.min(100, p));
  }, [aiScore]);

  const barGradient = useMemo(() => {
    if (percent < 30) return "linear-gradient(90deg, #10b981, #34d399)";
    if (percent <= 70) return "linear-gradient(90deg, #f59e0b, #fbbf24)";
    return "linear-gradient(90deg, #ef4444, #f87171)";
  }, [percent]);

  const color = useMemo(() => {
    if (percent < 30) return "#10b981";
    if (percent <= 70) return "#d97706";
    return "#ef4444";
  }, [percent]);

  return (
    <section
      style={{
        marginTop: 12,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.95)",
        borderRadius: 20,
        padding: "20px 24px",
        boxShadow: "0 4px 20px rgba(99,102,241,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
          AI-Generated Content Probability
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{percent}%</span>
      </div>

      <div
        style={{
          marginTop: 10,
          height: 8,
          borderRadius: 999,
          background: "#f1f0ff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            borderRadius: 999,
            background: barGradient,
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>

      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
        Higher scores suggest AI-generated content
      </div>
    </section>
  );
}
