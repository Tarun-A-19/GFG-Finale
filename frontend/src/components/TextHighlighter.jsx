import React, { useState } from "react";

const HL_COLORS = {
  "TRUE": { bg: "var(--true-bg)", border: "var(--true-text)", badge: "bg-[var(--true-bg)] text-[var(--true-text)] border border-[var(--true-border)]" },
  "FALSE": { bg: "var(--false-bg)", border: "var(--false-text)", badge: "bg-[var(--false-bg)] text-[var(--false-text)] border border-[var(--false-border)]" },
  "PARTIALLY TRUE": { bg: "var(--partial-bg)", border: "var(--partial-text)", badge: "bg-[var(--partial-bg)] text-[var(--partial-text)] border border-[var(--partial-border)]" },
  "UNVERIFIABLE": { bg: "var(--unverif-bg)", border: "var(--unverif-text)", badge: "bg-[var(--unverif-bg)] text-[var(--unverif-text)] border border-[var(--unverif-border)]" }
};

export default function TextHighlighter({ originalText, claims }) {
  const [show, setShow] = useState(true);
  const [hoveredClaim, setHoveredClaim] = useState(null);

  if (!originalText) return null;

  const renderText = () => {
    if (!claims || claims.length === 0) {
      return <span className="text-[var(--text-primary)]">{originalText}</span>;
    }

    const sorted = [...claims]
      .filter(c => typeof c.start_offset === "number" && typeof c.end_offset === "number" && c.source_sentence)
      .sort((a, b) => a.start_offset - b.start_offset);

    if (sorted.length === 0) return <span className="text-[var(--text-primary)]">{originalText}</span>;

    const nodes = [];
    let lastIndex = 0;

    sorted.forEach((claim) => {
      if (claim.start_offset > lastIndex) {
        nodes.push(
          <span key={`plain-${lastIndex}`} className="text-[var(--text-muted)]">
            {originalText.substring(lastIndex, claim.start_offset)}
          </span>
        );
      }

      const textToHighlight = originalText.substring(claim.start_offset, claim.end_offset) || claim.source_sentence;
      const verdict = claim.verdict || "UNVERIFIABLE";
      const styleConfig = HL_COLORS[verdict] || HL_COLORS["UNVERIFIABLE"];
      
      const isUnverifiable = verdict === "UNVERIFIABLE";
      const overrideStyle = isUnverifiable 
        ? { backgroundImage: "var(--unverif-stripe)", backgroundColor: styleConfig.bg, borderLeft: `3px solid ${styleConfig.border}` } 
        : { backgroundColor: styleConfig.bg, borderLeft: `3px solid ${styleConfig.border}` };

      nodes.push(
        <mark
          key={`mark-${claim.id}`}
          className="relative group cursor-pointer transition-all duration-400 ease-in-out pl-1.5 py-0.5 mx-0.5 text-[var(--text-primary)]"
          style={overrideStyle}
          onMouseEnter={() => setHoveredClaim(claim)}
          onMouseLeave={() => setHoveredClaim(null)}
        >
          {textToHighlight}
          
          {/* Tooltip */}
          {hoveredClaim?.id === claim.id && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 bottom-[110%] z-50 w-max max-w-[280px] bg-[var(--bg-elevated)] p-4 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-[var(--border-strong)] animate-[fadeUp_0.15s_ease_out]"
            >
              <div className="flex justify-between items-center mb-3 gap-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest ${styleConfig.badge}`}>
                  {verdict}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] tracking-widest block text-right">
                  {Math.round((claim.confidence || 0) * 100)}% Conf
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden mb-3 border border-[var(--border-subtle)]">
                <div 
                  className={`h-full`} 
                  style={{ width: `${Math.round((claim.confidence || 0) * 100)}%`, background: `var(${verdict === 'TRUE' ? '--true' : verdict === 'FALSE' ? '--false' : verdict === 'PARTIALLY TRUE' ? '--partial' : '--unverif'}-bar)` }} 
                />
              </div>

              {claim.sources?.[0] && (
                <a 
                  href={claim.sources[0].url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="block text-[10px] font-mono tracking-wide text-[var(--text-muted)] hover:text-[var(--purple-bright)] truncate mb-3 transition-colors"
                >
                  🔗 {new URL(claim.sources[0].url || "https://source").hostname}
                </a>
              )}

              <button 
                onClick={() => {
                   document.getElementById(`claim-card-${claim.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
                }}
                className="text-[10px] font-mono tracking-widest text-[var(--purple-mid)] hover:text-[var(--purple-bright)] w-full text-left transition-colors"
              >
                View full analysis ↓
              </button>
            </div>
          )}
        </mark>
      );

      lastIndex = Math.max(lastIndex, claim.end_offset);
    });

    if (lastIndex < originalText.length) {
      nodes.push(
        <span key={`plain-${lastIndex}`} className="text-[var(--text-muted)]">
          {originalText.substring(lastIndex)}
        </span>
      );
    }

    return nodes;
  };

  return (
    <div className="glass-panel border-l-4 border-l-[var(--purple-mid)] rounded-2xl md:rounded-[2rem] p-6 md:p-8 transition-all relative">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h2 className="text-sm font-mono tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--purple-mid)]" /> Original Text Analysis
          </h2>
          <p className="text-[10px] font-mono tracking-widest text-[var(--text-muted)] mt-1 ml-3">
            Hover sentences to see fact-check results
          </p>
        </div>
        <button 
          onClick={() => setShow(!show)}
          className="text-[10px] md:text-xs font-mono tracking-widest border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all"
        >
          {show ? "Hide Analysis" : "Show Analysis"}
        </button>
      </div>

      {show && (
        <div className="text-sm md:text-md leading-relaxed md:leading-loose">
          {renderText()}
        </div>
      )}
    </div>
  );
}
