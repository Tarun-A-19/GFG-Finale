import React, { useEffect, useState } from "react";

function Dot({ ok, labelName }) {
  const isOk = ok === true;
  const isErr = ok === false;
  // If undefined/null or not yet checked
  const isOffline = ok == null;

  let containerClass, textClass, dotClass, animClass;
  let statusText = "";

  if (isOk) {
    containerClass = "bg-[rgba(52,211,153,0.10)] border-[rgba(52,211,153,0.35)]";
    textClass = "text-[#34d399]";
    dotClass = "bg-[#34d399]";
    animClass = "animate-[livebeat_2s_ease-in-out_infinite]";
    statusText = "LIVE";
  } else if (isErr) {
    containerClass = "bg-[rgba(251,191,36,0.10)] border-[rgba(251,191,36,0.3)]";
    textClass = "text-[#fbbf24]";
    dotClass = "bg-[#fbbf24]";
    animClass = "";
    statusText = "ERROR";
  } else {
    containerClass = "bg-[rgba(107,114,128,0.10)] border-[rgba(107,114,128,0.3)]";
    textClass = "text-[#6b7280]";
    dotClass = "bg-[#6b7280]";
    animClass = "";
    statusText = "OFFLINE";
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-solid font-mono text-[11px] font-bold tracking-[0.08em] ${containerClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotClass} ${animClass}`} />
      <span className={`hidden md:inline-block ${textClass}`}>
        {labelName}: {statusText}
      </span>
    </div>
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
    <div className="flex items-center gap-2 md:gap-3">
      {[
        { key: "groq", label: "Groq" },
        { key: "tavily", label: "Tavily" },
        { key: "sapling", label: "Sapling" },
      ].map((s) => (
        <Dot key={s.key} ok={health?.[s.key]} labelName={s.label} />
      ))}
    </div>
  );
}
