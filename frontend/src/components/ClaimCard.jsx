import React, { useMemo, useState } from "react";
import CredibilityMeter from "./CredibilityMeter.jsx";

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "source";
  }
}

const getVerdictPrefix = (verdict) => {
  if (verdict === "TRUE") return "--true";
  if (verdict === "FALSE") return "--false";
  if (verdict === "PARTIALLY TRUE") return "--partial";
  return "--unverif";
};

export default function ClaimCard({ claim }) {
  const [expanded, setExpanded] = useState(false);

  const verdict = claim?.verdict || "UNVERIFIABLE";
  const confidence = typeof claim?.confidence === "number" ? claim.confidence : 0;
  const confidencePct = useMemo(() => Math.max(0, Math.min(100, Math.round(confidence * 100))), [confidence]);
  
  const prefix = getVerdictPrefix(verdict);

  const credData = claim?.credibility;
  const sources = credData?.sources || claim?.sources || [];
  const topSource = sources.length > 0 ? sources[0] : null;

  const tierColors = {
    gold: "bg-[#10b981]",
    silver: "bg-[#6366f1]",
    bronze: "bg-[#f59e0b]",
    poor: "bg-[#ef4444]"
  };

  if (!claim.verdict) {
    return (
      <div className="group flex flex-col p-4 md:p-8 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl md:rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]" />
        
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] md:text-sm font-black text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-1 rounded w-24 h-6 animate-pulse" />
          <div className="bg-[var(--bg-elevated)] border-2 border-dashed border-[var(--border-subtle)] rounded-full w-24 md:w-32 h-8 md:h-10 animate-pulse" />
        </div>
        
        <div className="text-lg md:text-2xl font-black text-white/20 mb-6">
          {claim.claim}
          <span className="inline-block w-2 h-6 ml-1 bg-white/40 animate-pulse" />
        </div>

        <div className="flex items-center gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 md:p-4 rounded-xl mt-auto">
           <div className="w-16 h-3 bg-gray-700 animate-pulse rounded" />
           <div className="flex-1 h-3 bg-gray-700 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  const cardStyle = {
    borderLeft: `3px solid var(${prefix}-border)`,
    backgroundColor: 'var(--bg-card)',
    ...(verdict === "UNVERIFIABLE" ? { backgroundImage: 'var(--unverif-stripe)' } : {})
  };

  const badgeStyle = {
    background: `var(${prefix}-bg)`,
    border: `1.5px solid var(${prefix}-border)`,
    color: `var(${prefix}-text)`,
    boxShadow: `0 0 12px var(${prefix}-glow)`,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em"
  };

  const barStyle = {
    background: `var(${prefix}-bar)`,
    boxShadow: `0 0 8px var(${prefix}-glow)`,
    width: `${confidencePct}%`,
    height: "100%"
  };

  return (
    <div 
      className="group flex flex-col p-4 md:p-8 border border-[var(--border-default)] rounded-2xl md:rounded-[2rem] transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-[var(--border-strong)] animate-[slideUp_0.4s_ease_forwards]"
      style={cardStyle}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-2">
           <span className="text-xs md:text-sm font-mono tracking-widest text-[var(--text-label)]">
             {claim?.id ? `Claim_ID: ${claim.id}` : "Analyzed_Claim"}
           </span>
           {claim.llm_sanity?.llm_checked && (
             <span className="text-[10px] text-[var(--purple-bright)] font-mono border border-[var(--purple-bright)] px-2 py-0.5 rounded-full" title="Verified by DeBERTa NLI + Consistency Check + LLM Cross-reference">
               ✓ Triple-verified
             </span>
           )}
        </div>
        <span className="px-3 py-1.5 rounded uppercase" style={badgeStyle}>
          {verdict}
        </span>
      </div>

      {/* Hallucination Shield */}
      {claim.hallucination_blocked && (
        <div className="mb-3 rounded-lg px-3 py-2 font-semibold text-[11px]"
             style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>
          🛡️ HALLUCINATION BLOCKED — AI was prevented from guessing. Evidence did not match the claim topic sufficiently.
        </div>
      )}

      {/* UNVERIFIABLE Notice */}
      {verdict === "UNVERIFIABLE" && !claim.hallucination_blocked && (
        <div className="mb-4 rounded-lg px-3 py-2 text-[11px] font-semibold tracking-wide border-solid border"
             style={{ background: 'var(--unverif-bg)', color: 'var(--unverif-text)', borderColor: 'var(--unverif-border)' }}>
          🔍 INSUFFICIENT EVIDENCE — This claim could not be confirmed or denied with available sources
        </div>
      )}

      {/* Retry Badges */}
      {claim.retry_attempted && (
        <div className="mb-2">
          {claim.retry_found_evidence ? (
            <span className="text-[var(--purple-bright)] text-[10px] font-mono border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 rounded">🔄 Deep search performed</span>
          ) : (
            <div className="italic text-[var(--unverif-text)] text-xs mb-2">
              ⚠️ TRULY UNVERIFIABLE — This claim could not be verified after 4 independent searches. It may be too specific, fictional, or based on private information.
            </div>
          )}
        </div>
      )}

      {/* Claim text */}
      <div className="text-lg md:text-2xl font-medium tracking-tight leading-snug mb-6 text-[var(--text-primary)]">
        {claim?.claim}
      </div>

      {/* Contradiction Banner */}
      {claim?.contradiction?.has_contradiction && (
        <div className="mb-6 rounded-lg p-3 border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-1.5 text-[var(--status-warn)]">
            <span>⚡</span> Sources disagree on this claim
          </div>
          <div className="text-[10px] uppercase font-bold text-[var(--status-warn)] tracking-wider mb-2">
            {claim.contradiction.summary}
          </div>
          <div className="flex flex-col gap-1.5 text-[10px] font-mono tracking-widest text-[var(--text-secondary)]">
            {claim.contradiction.supporting_sources?.map((s, idx) => (
              <div key={`supp-${idx}`} className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-online)] mt-0.5 shrink-0" />
                <span className="truncate">{s.title || getDomain(s.url) || s.url}</span>
              </div>
            ))}
            {claim.contradiction.contradicting_sources?.map((c, idx) => (
              <div key={`cont-${idx}`} className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--false-text)] mt-0.5 shrink-0" />
                <span className="truncate">{c.title || getDomain(c.url) || c.url}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence */}
      <div className="mb-4">
        <div className="flex items-center gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 md:p-4 rounded-xl">
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)] w-24 shrink-0">
            Confidence
          </span>
          <div className="flex-1 h-2 md:h-3 bg-[var(--bg-input)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div className="transition-all duration-1000 rounded-full" style={barStyle} />
          </div>
          <span className="text-sm md:text-base font-black tracking-tighter w-10 text-right text-[var(--text-primary)]">
            {confidencePct}%
          </span>
        </div>
        
        {/* Reasoning and Consistency */}
        <div className="mt-2 ml-1 flex flex-col gap-1">
          {claim.reasoning_summary && (
            <p className="text-[10px] md:text-[11px] text-[var(--text-muted)] font-mono tracking-[0.02em]">
              {claim.reasoning_summary}
            </p>
          )}
          {claim.consistency && !claim.consistency.consistent && (
            <div className="text-[var(--status-warn)] text-[10px] font-mono">
              ⚠️ CONFLICTING SIGNALS — {claim.consistency.agreement}
            </div>
          )}
        </div>
      </div>

      {/* Source Credibility */}
      {credData && (
        <div className="mb-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 md:p-4 rounded-xl mt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${tierColors[credData.overall_tier] || "bg-gray-400"} text-white bg-opacity-80`}>
              🛡️
            </span>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-secondary)]">
              {topSource && credData.overall_tier === "gold" ? `Verified by ${topSource.credibility?.domain || getDomain(topSource.url)}` : "Source Credibility Analysis"}
            </span>
          </div>
          <CredibilityMeter score={credData.average_score} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-4 border-t border-[var(--border-subtle)] transition-all">
        <div className="flex flex-wrap gap-2">
          {sources.slice(0, 3).map((s, idx) => (
            <a
              key={`${s.url || s.title || idx}`}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-md text-[10px] md:text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {s.credibility ? (
                <span className={`w-2 h-2 rounded-full ${tierColors[s.credibility.tier] || "bg-gray-400"}`} />
              ) : (
                <span className="text-[10px]">✓</span>
              )}
              {getDomain(s.url)}
            </a>
          ))}
          {sources.length > 3 && (
            <span className="px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-md text-[10px] font-mono text-[var(--text-muted)]">
              +{sources.length - 3} more
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`ml-auto px-4 py-2 border border-[var(--border-subtle)] hover:border-[var(--purple-bright)] rounded-lg font-mono text-[10px] md:text-xs tracking-widest transition-all ${
            expanded ? "bg-[var(--purple-mid)] text-white shadow-[0_0_10px_var(--purple-glow)]" : "bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {expanded ? "Hide Evidence ◭" : "Show Evidence ◮"}
        </button>
      </div>

      {/* Evidence panel */}
      {expanded && (
        <div className="mt-4 p-4 md:p-6 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-2xl animate-[fadeUp_0.2s_ease_forwards]">
          <h4 className="font-mono text-xs uppercase tracking-widest mb-4 border-b border-[var(--border-subtle)] pb-2 text-[var(--text-secondary)]">Investigative Trail</h4>
          {(!sources || sources.length === 0) && (
            <div className="text-xs font-mono tracking-widest text-[var(--false-text)] bg-[var(--false-bg)] p-3 rounded border border-[var(--false-border)]">
              [ERROR] Trace empty: no verifiable sources located.
            </div>
          )}
          <ul className="space-y-4">
            {sources.map((s, idx) => (
              <li key={`ev-${s.url || idx}`} className="group flex flex-col gap-1">
                <div className="text-xs md:text-sm font-medium tracking-tight text-[var(--text-primary)] leading-relaxed">
                  {s.title || "Untitled Document"}
                </div>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] break-all truncate flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    {s.url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
