import React from "react";
import Header from "./components/Header.jsx";
import InputPanel from "./components/InputPanel.jsx";
import PipelineProgress from "./components/PipelineProgress.jsx";
import ClaimCard from "./components/ClaimCard.jsx";
import SummaryMetrics from "./components/SummaryMetrics.jsx";
import AiDetectBadge from "./components/AiDetectBadge.jsx";
import SessionDashboard from "./components/SessionDashboard.jsx";
import TextHighlighter from "./components/TextHighlighter.jsx";
import ShareCard from "./components/ShareCard.jsx";
import { exportToPDF } from "./utils/exportReport.js";
import { useFactCheck } from "./hooks/useFactCheck.js";
import html2canvas from "html2canvas";

export default function App() {
  const {
    startFactCheck,
    stages,
    claims,
    aiScore,
    summary,
    isRunning,
    error,
    inputText,
  } = useFactCheck();

  const shareCardRef = React.useRef(null);

  const generateShareCard = async () => {
    if (!shareCardRef.current) return;
    try {
      const canvas = await html2canvas(shareCardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `factguard-share-${Date.now()}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Failed to generate share card", err);
    }
  };

  const [history, setHistory] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("factguard_history")) || [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    if (summary && !isRunning) {
      const newEntry = {
        id: Date.now(),
        timestamp: Date.now(),
        inputPreview: inputText.substring(0, 50) + (inputText.length > 50 ? "..." : ""),
        accuracy: summary.accuracy_score,
        claimCount: summary.total,
        credibility: summary.credibility
      };
      setHistory(prev => {
        const next = [newEntry, ...prev];
        localStorage.setItem("factguard_history", JSON.stringify(next));
        return next;
      });
    }
  }, [summary, isRunning]);

  return (
    <div className="min-h-screen relative font-sans flex flex-col pt-20">
      {/* Background radial glow */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[var(--purple-glow)] blur-[120px] rounded-full pointer-events-none z-0"></div>

      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 relative z-10 space-y-8 flex flex-col items-center">
        
        <SessionDashboard history={history} setHistory={setHistory} />

        <div className="text-center w-full max-w-2xl mx-auto mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#34d399] to-[#059669] shadow-[0_0_40px_rgba(52,211,153,0.3)] mb-8"></div>
          <h1 className="text-3xl md:text-5xl font-medium text-[var(--text-primary)] tracking-tight mb-2">
            Good evening, FactGuard
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-light">
            Can I verify anything for you today?
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <InputPanel onRun={startFactCheck} isRunning={isRunning} />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-8">
          {(isRunning || claims.length > 0) && (
            <PipelineProgress stages={stages} />
          )}

          {inputText && (
            <TextHighlighter originalText={inputText} claims={claims} />
          )}

          {error && (
            <div className="bg-[var(--false-bg)] text-[var(--false-text)] p-4 rounded-xl border border-[var(--false-border)] shadow-[0_0_15px_var(--false-glow)] text-sm font-mono flex items-center gap-3">
              <span>⚠️</span> {error}
            </div>
          )}

          {summary && <SummaryMetrics summary={summary} />}
          {aiScore !== null && aiScore !== undefined && (
            <AiDetectBadge aiScore={aiScore} />
          )}

          <ShareCard 
            summary={summary} 
            inputText={inputText} 
            aiScore={aiScore} 
            forwardedRef={shareCardRef} 
          />

          {claims.length > 0 && (
            <div className="pt-8">
              <h2 className="text-xl font-medium text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="text-[var(--text-label)]">⊞</span> Verification Results
              </h2>
              <div className="space-y-6 md:space-y-8">
                {Object.entries(claims.reduce((groups, claim) => {
                  const group = claim.entity_group || 'General'
                  if (!groups[group]) groups[group] = []
                  groups[group].push(claim)
                  return groups
                }, {})).map(([entityName, entityClaims]) => (
                  <div key={entityName} className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-[var(--border-subtle)] mb-4">
                      <h3 className="font-mono text-sm uppercase tracking-wider text-[var(--purple-bright)]">
                        Subject_Ref: {entityName}
                      </h3>
                      <span className="px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-mono text-[10px] rounded-md border border-[var(--border-default)]">
                        {entityClaims.length} Claim{entityClaims.length !== 1 && 's'}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {entityClaims.map((c, i) => (
                        <div key={c.id} id={`claim-card-${c.id}`}>
                          <ClaimCard claim={c} index={i} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-12 mb-8 border-t border-[var(--border-subtle)] pt-8">
                <button 
                  onClick={() => exportToPDF(claims, summary, aiScore, inputText)}
                  className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-full px-6 py-2.5 font-medium text-sm flex items-center gap-2 hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export PDF Report
                </button>
                <button 
                  onClick={generateShareCard}
                  className="bg-[var(--purple-mid)] text-white border border-[var(--purple-bright)] rounded-full px-6 py-2.5 font-medium text-sm flex items-center gap-2 hover:bg-[var(--purple-bright)] shadow-[0_0_15px_var(--purple-glow)] transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  Save Share Card
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
