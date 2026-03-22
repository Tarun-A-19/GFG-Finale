import React, { useRef } from "react";
import html2canvas from "html2canvas";

export default function ShareCard({ summary, inputText, aiScore, forwardedRef }) {
  if (!summary) return null;

  return (
    <div 
      ref={forwardedRef}
      className="fixed top-[-9999px] left-[-9999px] w-[1080px] h-[1080px] flex flex-col p-16 font-sans border border-[#3d2a6e]"
      style={{ 
        backgroundColor: '#080810',
        backgroundImage: 'radial-gradient(rgba(124, 58, 237, 0.15) 2px, transparent 2px)', 
        backgroundSize: '48px 48px' 
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-16 bg-[#0f0f1a]/90 backdrop-blur-xl border border-[rgba(139,92,246,0.22)] shadow-[0_0_30px_rgba(124,58,237,0.1)] rounded-2xl p-8">
        <h1 className="text-5xl font-mono tracking-tighter text-[#f1f0ff]">Guard Terminal</h1>
        <div className="text-2xl font-mono uppercase tracking-widest text-[#a78bfa]">Fact-Check Report</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#0f0f1a]/80 backdrop-blur-2xl border border-[rgba(139,92,246,0.3)] shadow-[0_0_50px_rgba(124,58,237,0.15)] rounded-3xl p-12 flex flex-col justify-between relative overflow-hidden">
        <div>
          <h2 className="text-3xl font-mono tracking-widest text-[#9ca3af] mb-8 flex items-center gap-4">
             <span className="w-4 h-4 rounded-full bg-[#7c3aed]" />
             Analyzed Extract
          </h2>
          <p className="text-4xl font-medium leading-relaxed line-clamp-4 mb-12 text-[#f1f0ff]">
            "{inputText}"
          </p>
        </div>

        <div className="flex flex-col gap-6">
           <div className="flex gap-6">
              <div className="flex-1 bg-[rgba(20,184,166,0.1)] border border-[rgba(20,184,166,0.35)] rounded-2xl p-8 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                 <div className="text-xl font-mono tracking-widest text-[#2dd4bf] mb-2">Total Accuracy</div>
                 <div className="text-8xl font-black tracking-tighter text-[#f1f0ff]">{summary.accuracy_score}%</div>
              </div>
              <div className="flex-1 bg-[rgba(217,119,6,0.1)] border border-[rgba(217,119,6,0.35)] rounded-2xl p-8 shadow-[0_0_20px_rgba(217,119,6,0.1)]">
                 <div className="text-xl font-mono tracking-widest text-[#fbbf24] mb-2">Claims Verified</div>
                 <div className="text-8xl font-black tracking-tighter text-[#f1f0ff]">{summary.total}</div>
              </div>
           </div>
           
           <div className="bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.35)] rounded-2xl p-8 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <div className="text-xl font-mono tracking-widest text-[#a78bfa] mb-2">Source Credibility Index</div>
              <div className="text-5xl font-bold tracking-tight text-[#f1f0ff]">{summary.credibility}</div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 flex justify-between items-center bg-[#0a0a15] text-[#9ca3af] p-8 rounded-2xl border border-[rgba(139,92,246,0.12)]">
        <div className="text-2xl font-mono tracking-widest text-[#f1f0ff]">factguard.app</div>
        <div className="text-xl font-mono tracking-widest">AI-Powered Verification</div>
      </div>
    </div>
  );
}
