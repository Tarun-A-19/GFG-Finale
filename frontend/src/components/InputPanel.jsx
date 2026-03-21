import React, { useMemo, useState } from "react";

export default function InputPanel({ onRun, isRunning }) {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const canSubmit = useMemo(() => {
    if (isRunning) return false;
    if (tab === "text") return text.trim().length > 0;
    return url.trim().length > 0;
  }, [isRunning, tab, text, url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (tab === "text") onRun(text, "text");
    else onRun(url, "url");
  };

  const Spinner = () => (
    <div
      style={{
        width: 18,
        height: 18,
        border: "2.5px solid rgba(255,255,255,0.3)",
        borderTopColor: "#ffffff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        marginRight: 8,
      }}
    />
  );

  const focusStyle = {
    borderColor: "#a78bfa",
    boxShadow: "0 0 0 4px rgba(167,139,250,0.12)",
    outline: "none",
    background: "#ffffff",
  };

  const blurStyle = {
    borderColor: "#e8e6ff",
    boxShadow: "none",
    background: "#f8f7ff",
  };

  return (
    <section
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.9)",
        borderRadius: 24,
        padding: 32,
        boxShadow:
          "0 8px 40px rgba(99,102,241,0.08), 0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Tab switcher */}
      <div
        style={{
          display: "inline-flex",
          background: "#f1f0ff",
          borderRadius: 14,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {["text", "url"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "#ffffff" : "transparent",
              color: tab === t ? "#6366f1" : "#94a3b8",
              borderRadius: 10,
              padding: "8px 20px",
              fontWeight: tab === t ? 600 : 500,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
              boxShadow:
                tab === t ? "0 2px 8px rgba(99,102,241,0.15)" : "none",
            }}
          >
            {t === "text" ? "Paste Text" : "Enter URL"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {tab === "text" ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the content you want to verify..."
            style={{
              width: "100%",
              minHeight: 160,
              background: "#f8f7ff",
              border: "1.5px solid #e8e6ff",
              borderRadius: 14,
              padding: 16,
              fontSize: 14,
              color: "#1a1a2e",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
              lineHeight: 1.6,
            }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
          />
        ) : (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            style={{
              width: "100%",
              height: 50,
              background: "#f8f7ff",
              border: "1.5px solid #e8e6ff",
              borderRadius: 14,
              padding: "0 16px",
              fontSize: 14,
              color: "#1a1a2e",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
            }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
          />
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: "100%",
            height: 54,
            marginTop: 16,
            background: "#1a1a2e",
            border: "none",
            borderRadius: 14,
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            letterSpacing: "0.02em",
            transition: "all 0.25s ease",
            opacity: canSubmit ? 1 : 0.45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (canSubmit) {
              e.currentTarget.style.background = "#2d2b55";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(26,26,46,0.25)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1a1a2e";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseDown={(e) => {
            if (canSubmit) e.currentTarget.style.transform = "translateY(0)";
          }}
          onMouseUp={(e) => {
            if (canSubmit) e.currentTarget.style.transform = "translateY(-2px)";
          }}
        >
          {isRunning && <Spinner />}
          {isRunning ? "Analyzing..." : "Run Fact Check"}
        </button>
      </form>
    </section>
  );
}
