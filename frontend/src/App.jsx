import React from "react";
import Header from "./components/Header.jsx";
import InputPanel from "./components/InputPanel.jsx";
import PipelineProgress from "./components/PipelineProgress.jsx";
import ClaimCard from "./components/ClaimCard.jsx";
import SummaryMetrics from "./components/SummaryMetrics.jsx";
import AiDetectBadge from "./components/AiDetectBadge.jsx";
import { useFactCheck } from "./hooks/useFactCheck.js";

export default function App() {
  const {
    startFactCheck,
    stages,
    claims,
    aiScore,
    summary,
    isRunning,
    error,
  } = useFactCheck();

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Header />

      <main
        style={{
          maxWidth: 840,
          margin: "0 auto",
          padding: "80px 16px 60px",
        }}
      >
        <InputPanel onRun={startFactCheck} isRunning={isRunning} />

        {(isRunning || claims.length > 0) && (
          <PipelineProgress stages={stages} />
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              borderRadius: 14,
              border: "1.5px solid #fca5a5",
              background: "#fef2f2",
              padding: "12px 16px",
              fontSize: 14,
              color: "#dc2626",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {summary && <SummaryMetrics summary={summary} />}
        {aiScore !== null && aiScore !== undefined && (
          <AiDetectBadge aiScore={aiScore} />
        )}

        {claims.map((c, i) => (
          <ClaimCard key={c.id} claim={c} index={i} />
        ))}
      </main>
    </div>
  );
}
