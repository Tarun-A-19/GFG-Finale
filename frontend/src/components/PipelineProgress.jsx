import React from "react";

const steps = [
  { key: "scraping", label: "SCRAPING" },
  { key: "extracting", label: "EXTRACTING" },
  { key: "searching", label: "SEARCHING" },
  { key: "verifying", label: "VERIFYING" },
];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path
      d="M7.7 14.2L3.7 10.2L5.1 8.8L7.7 11.4L14.9 4.2L16.3 5.6L7.7 14.2Z"
      fill="white"
    />
  </svg>
);

export default function PipelineProgress({ stages }) {
  const statusFor = (key) => stages?.[key] || "waiting";

  const circleStyle = (status) => {
    if (status === "done") {
      return {
        background: "linear-gradient(135deg, #6366f1, #a78bfa)",
        border: "none",
      };
    }
    if (status === "loading") {
      return {
        background: "#ffffff",
        border: "2px solid #a78bfa",
      };
    }
    return {
      background: "#f1f0ff",
      border: "2px solid #e8e6ff",
    };
  };

  const labelColor = (status) => {
    if (status === "done") return "#6366f1";
    if (status === "loading") return "#a78bfa";
    return "#c4c0e8";
  };

  return (
    <div
      style={{
        marginTop: 20,
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.9)",
        borderRadius: 20,
        padding: "24px 28px",
        boxShadow: "0 4px 20px rgba(99,102,241,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {steps.map((s, idx) => {
          const status = statusFor(s.key);
          return (
            <React.Fragment key={s.key}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  flex: "0 0 auto",
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    ...circleStyle(status),
                  }}
                >
                  {status === "loading" && (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          inset: -6,
                          borderRadius: "50%",
                          border: "2px solid #a78bfa",
                          opacity: 0.4,
                          animation: "ripple 1.2s ease-out infinite",
                        }}
                      />
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid #e8e6ff",
                          borderTopColor: "#6366f1",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    </>
                  )}
                  {status === "done" && <Check />}
                </div>
                {/* Label */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: labelColor(status),
                  }}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    margin: "0 8px",
                    marginBottom: 24,
                    background:
                      statusFor(steps[idx].key) === "done"
                        ? "linear-gradient(90deg, #6366f1, #a78bfa)"
                        : "#e8e6ff",
                    transition: "background 0.6s ease",
                    borderRadius: 1,
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
