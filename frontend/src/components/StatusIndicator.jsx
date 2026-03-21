import React, { useEffect, useState } from "react";

function Dot({ ok }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: ok ? "#10b981" : "#ef4444",
        animation: ok ? "pulse 2s infinite" : "none",
      }}
    />
  );
}

export default function StatusIndicator() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setHealth(data || {});
      })
      .catch(() => {
        if (!cancelled)
          setHealth({ groq: false, tavily: false, sapling: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {[
        { key: "groq", label: "Groq" },
        { key: "tavily", label: "Tavily" },
        { key: "sapling", label: "Sapling" },
      ].map((s) => (
        <div
          key={s.key}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          <Dot ok={health?.[s.key]} />
          <span
            className="status-label"
            style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
