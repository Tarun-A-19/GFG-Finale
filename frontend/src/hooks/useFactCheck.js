import { useCallback, useEffect, useRef, useState } from "react";

const initialStages = {
  scraping: "waiting",
  extracting: "waiting",
  searching: "waiting",
  verifying: "waiting",
};

function stageStateFromSse(status) {
  if (status === "done") return "done";
  if (status === "loading") return "loading";
  return "waiting";
}

export function useFactCheck() {
  const [stages, setStages] = useState(initialStages);
  const [claims, setClaims] = useState([]);
  const [aiScore, setAiScore] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const startFactCheck = useCallback(
    (input, type) => {
      if (!input || !type) return;

      // Close previous stream if any.
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setError(null);
      setIsRunning(true);
      setSummary(null);
      setAiScore(null);
      setClaims([]);
      setStages(initialStages);

      const url = `/api/factcheck?input=${encodeURIComponent(input)}&type=${encodeURIComponent(
        type
      )}`;

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        let payload = null;
        try {
          payload = JSON.parse(e.data);
        } catch {
          return;
        }

        const { stage, status } = payload || {};
        if (stage === "scraping") {
          setStages((prev) => ({
            ...prev,
            scraping: stageStateFromSse(status),
          }));
        } else if (stage === "extracting") {
          setStages((prev) => ({
            ...prev,
            extracting: stageStateFromSse(status),
          }));
          if (status === "done" && Array.isArray(payload.claims)) {
            setClaims(payload.claims);
          }
        } else if (stage === "searching") {
          setStages((prev) => ({
            ...prev,
            searching: stageStateFromSse(status),
          }));
        } else if (stage === "verifying") {
          setStages((prev) => ({
            ...prev,
            verifying: stageStateFromSse(status),
          }));
          if (status === "done" && payload.claim_result) {
            const cr = payload.claim_result;
            setClaims((prev) => {
              const idx = prev.findIndex((c) => c.id === cr.id);
              if (idx === -1) return [...prev, cr];
              const next = [...prev];
              next[idx] = { ...next[idx], ...cr };
              return next;
            });
          }
        } else if (stage === "ai_detection") {
          if (status === "done") setAiScore(payload.ai_score);
        } else if (stage === "complete") {
          if (status === "done") {
            setSummary(payload.summary);
            setIsRunning(false);
            es.close();
            eventSourceRef.current = null;
          }
        }
      };

      es.onerror = () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        setError("Fact check stream failed. Please try again.");
        setIsRunning(false);
      };
    },
    [setIsRunning]
  );

  return {
    startFactCheck,
    stages,
    claims,
    aiScore,
    summary,
    isRunning,
    error,
  };
}

