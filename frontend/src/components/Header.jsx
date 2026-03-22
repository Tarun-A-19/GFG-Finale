import React from "react";
import StatusIndicator from "./StatusIndicator.jsx";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#111] border-b-4 border-black dark:border-white z-50 px-4 md:px-8 flex items-center justify-between transition-colors duration-500">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-[#9333ea] text-white rounded-lg flex items-center justify-center font-black text-lg md:text-xl border-2 border-black dark:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_rgba(255,255,255,1)]">
          FG
        </div>
        <span className="font-black text-xl md:text-2xl tracking-tighter uppercase">FactGuard</span>
      </div>
      
      <StatusIndicator />
    </header>
  );
}
