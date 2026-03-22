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
    <div className="w-5 h-5 border-[3px] border-[var(--text-secondary)] border-t-white rounded-full animate-[spin_0.8s_linear_infinite]" />
  );

  return (
    <div className="glass-panel rounded-[2rem] p-6 md:p-10 transition-all duration-500 relative z-20">
      
      {/* Tab switcher */}
      <div className="flex bg-[var(--bg-elevated)] p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-[var(--border-default)] w-max mb-6">
        {["text", "url"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium text-xs md:text-sm tracking-wide transition-all ${
              tab === t
                ? "bg-[var(--purple-mid)] border border-[var(--purple-bright)] text-white shadow-[0_0_15px_var(--purple-glow)]"
                : "bg-transparent border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t === "text" ? "Paste Text" : "Enter URL"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {tab === "text" ? (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the statement or article here to begin AI forensics..."
              className="w-full min-h-[160px] bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl md:rounded-2xl px-5 md:px-6 py-5 font-mono text-sm md:text-md text-[var(--text-primary)] outline-none focus:border-[var(--purple-mid)] focus:shadow-[0_0_20px_var(--purple-glow)] transition-all resize-y placeholder-[var(--text-muted)]"
            />
          </div>
        ) : (
          <div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl md:rounded-2xl px-5 md:px-6 font-mono text-sm md:text-md text-[var(--text-primary)] outline-none focus:border-[var(--purple-mid)] focus:shadow-[0_0_20px_var(--purple-glow)] transition-all placeholder-[var(--text-muted)]"
            />
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-8 h-12 flex items-center justify-center gap-3 rounded-xl font-bold text-sm tracking-wide border transition-all duration-300 ${
              canSubmit
                ? "bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)] cursor-not-allowed"
            }`}
          >
            {isRunning && <Spinner />}
            {isRunning ? "Running Forensics..." : "Run Fact Check"}
          </button>
        </div>
      </form>
    </div>
  );
}
