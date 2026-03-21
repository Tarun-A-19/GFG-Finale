import React from "react";

export default function SummaryMetrics({ summary }) {
  if (!summary) return null;

  const credibility = summary.credibility || "Unreliable";
  const score = summary.accuracy_score ?? 0;

  const credBadge = () => {
    if (score >= 75)
      return { background: "#f0fdf4", color: "#16a34a", border: "2px solid #86efac" };
    if (score >= 50)
      return { background: "#fffbeb", color: "#d97706", border: "2px solid #fcd34d" };
    if (score >= 25)
      return { background: "#fff7ed", color: "#ea580c", border: "2px solid #fdba74" };
    return { background: "#fef2f2", color: "#dc2626", border: "2px solid #fca5a5" };
  };

  const cards = [
    { value: `${score}%`, label: "ACCURACY", color: "#6366f1" },
    { value: summary.true, label: "TRUE", color: "#10b981" },
    { value: summary.false, label: "FALSE", color: "#ef4444" },
    { value: summary.unverifiable, label: "UNVERIFIABLE", color: "#94a3b8" },
  ];

  return (
    <section style={{ marginTop: 20, animation: "fadeUp 0.4s ease forwards" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.95)",
              borderRadius: 20,
              padding: "24px 20px",
              boxShadow: "0 4px 20px rgba(99,102,241,0.07)",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(99,102,241,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(99,102,241,0.07)";
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1,
                color: c.color,
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: 8,
              }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div
          style={{
            padding: "10px 32px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.03em",
            ...credBadge(),
          }}
        >
          {credibility}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          section > div:first-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
