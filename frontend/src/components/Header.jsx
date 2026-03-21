import React from "react";
import StatusIndicator from "./StatusIndicator.jsx";

export default function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(167,139,250,0.2)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: 20,
            color: "#1a1a2e",
          }}
        >
          FactGuard
        </span>
        <span
          style={{
            background: "linear-gradient(135deg,#6366f1,#a78bfa)",
            color: "#ffffff",
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 999,
            marginLeft: 8,
            fontWeight: 700,
          }}
        >
          AI
        </span>
      </div>
      <StatusIndicator />
    </header>
  );
}
