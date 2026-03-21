import React, { useMemo, useState } from "react";

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "source";
  }
}

const verdictConfig = {
  TRUE: {
    bg: "#f0fdf4",
    color: "#16a34a",
    border: "#86efac",
    bar: "#10b981",
  },
  FALSE: {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fca5a5",
    bar: "#ef4444",
  },
  "PARTIALLY TRUE": {
    bg: "#fffbeb",
    color: "#d97706",
    border: "#fcd34d",
    bar: "#f59e0b",
  },
  UNVERIFIABLE: {
    bg: "#f8fafc",
    color: "#94a3b8",
    border: "#e2e8f0",
    bar: "#94a3b8",
  },
};

export default function ClaimCard({ claim, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const verdict = claim?.verdict || "UNVERIFIABLE";
  const confidence =
    typeof claim?.confidence === "number" ? claim.confidence : 0;
  const confidencePct = useMemo(() => {
    return Math.max(0, Math.min(100, Math.round(confidence * 100)));
  }, [confidence]);

  const vc = verdictConfig[verdict] || verdictConfig.UNVERIFIABLE;
  const sources = claim?.sources || [];

  return (
    <article
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.95)",
        borderRadius: 20,
        padding: 24,
        marginTop: 12,
        boxShadow: "0 4px 16px rgba(99,102,241,0.06)",
        opacity: 0,
        animation: "slideUp 0.4s ease forwards",
        animationDelay: `${index * 0.06}s`,
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 8px 32px rgba(99,102,241,0.12)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(99,102,241,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Claim #{claim?.id}
        </span>
        <span
          style={{
            padding: "5px 14px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: vc.bg,
            color: vc.color,
            border: `1.5px solid ${vc.border}`,
          }}
        >
          {verdict}
        </span>
      </div>

      {/* Claim text */}
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.65,
          color: "#1a1a2e",
          fontWeight: 500,
          marginTop: 10,
        }}
      >
        {claim?.claim}
      </div>

      {/* Confidence */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Confidence</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: vc.color }}>
            {confidencePct}%
          </span>
        </div>
        <div
          style={{
            marginTop: 6,
            height: 5,
            borderRadius: 999,
            background: "#f1f0ff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${confidencePct}%`,
              borderRadius: 999,
              background: vc.bar,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>

      {/* Sources + Evidence toggle */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}
      >
        {sources.slice(0, 4).map((s, idx) => (
          <a
            key={`${s.url || s.title || idx}`}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#f8f7ff",
              border: "1px solid #e8e6ff",
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 500,
              color: "#6366f1",
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.15s",
              pointerEvents: s.url ? "auto" : "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#6366f1";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "#6366f1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f8f7ff";
              e.currentTarget.style.color = "#6366f1";
              e.currentTarget.style.borderColor = "#e8e6ff";
            }}
          >
            {getDomain(s.url)}
          </a>
        ))}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginLeft: "auto",
            background: expanded ? "#6366f1" : "#ffffff",
            border: "1.5px solid #e8e6ff",
            borderRadius: 8,
            padding: "5px 14px",
            fontSize: 11,
            fontWeight: 600,
            color: expanded ? "#ffffff" : "#6366f1",
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onMouseEnter={(e) => {
            if (!expanded) {
              e.currentTarget.style.background = "#6366f1";
              e.currentTarget.style.color = "#ffffff";
            }
          }}
          onMouseLeave={(e) => {
            if (!expanded) {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#6366f1";
            }
          }}
        >
          {expanded ? "Hide Evidence" : "Show Evidence"}
          <span
            style={{
              display: "inline-block",
              transition: "transform 0.2s",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▾
          </span>
        </button>
      </div>

      {/* Evidence panel */}
      {expanded && (
        <div
          style={{
            marginTop: 14,
            background: "#fafafe",
            borderRadius: 12,
            border: "1px solid #e8e6ff",
            padding: 16,
          }}
        >
          {(!sources || sources.length === 0) && (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              No sources available.
            </div>
          )}
          {sources.map((s, idx) => (
            <div key={`ev-${s.url || idx}`}>
              {idx > 0 && (
                <div
                  style={{
                    height: 1,
                    background: "#e8e6ff",
                    margin: "10px 0",
                  }}
                />
              )}
              <div
                style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}
              >
                {s.title || "Untitled"}
              </div>
              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 11,
                    color: "#6366f1",
                    textDecoration: "none",
                    marginTop: 2,
                    display: "block",
                  }}
                >
                  {s.url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
