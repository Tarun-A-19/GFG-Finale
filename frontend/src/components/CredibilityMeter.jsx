import React from "react";

export default function CredibilityMeter({ score }) {
  const percentage = Math.max(0, Math.min(100, score || 0));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#94a3b8] dark:text-gray-400">
          Evidence Quality
        </span>
        <span className="text-[10px] md:text-xs font-black tracking-tighter">
          {percentage}/100
        </span>
      </div>
      <div className="relative w-full h-[6px] rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <div 
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)" }}
        />
        <div 
          className="absolute top-[-2px] bottom-[-2px] w-2 bg-black dark:bg-white rounded-full shadow-md border-2 border-white dark:border-black transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ left: `calc(${percentage}% - 4px)` }}
        />
      </div>
    </div>
  );
}
