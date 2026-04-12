"use client";

import Image from "next/image";
import { useState } from "react";
import { Zap } from "lucide-react";

function PhantomButton() {
  const [connected, setConnected] = useState(false);
  return (
    <button
      onClick={() => setConnected(v => !v)}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold font-grotesk transition-all duration-200"
      style={{
        background: connected ? "rgba(147,51,234,0.15)" : "rgba(147,51,234,0.08)",
        border: `1px solid ${connected ? "rgba(147,51,234,0.6)" : "rgba(147,51,234,0.25)"}`,
        color: connected ? "#c084fc" : "#9333ea",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 128 128" fill="currentColor">
        <path d="M64 0C28.65 0 0 28.65 0 64s28.65 64 64 64 64-28.65 64-64S99.35 0 64 0zm33.6 73.6H82.67a18.67 18.67 0 1 1 0-19.2H97.6a1.6 1.6 0 0 1 0 3.2H82.67a15.47 15.47 0 1 0 0 12.8H97.6a1.6 1.6 0 0 1 0 3.2z"/>
      </svg>
      {connected ? "GhxK...4mPz" : "Connect Phantom"}
    </button>
  );
}

function XButton() {
  const [connected, setConnected] = useState(false);
  return (
    <button
      onClick={() => setConnected(v => !v)}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold font-grotesk transition-all duration-200"
      style={{
        background: connected ? "rgba(29,161,242,0.15)" : "rgba(29,161,242,0.08)",
        border: `1px solid ${connected ? "rgba(29,161,242,0.6)" : "rgba(29,161,242,0.25)"}`,
        color: connected ? "#60c4fa" : "#1DA1F2",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      {connected ? "@yourproject" : "Connect X"}
    </button>
  );
}

export function Header() {
  return (
    <header
      className="h-14 flex items-center justify-between px-5 flex-shrink-0 glass"
      style={{ borderBottom: "1px solid #1E1E45", position: "sticky", top: 0, zIndex: 50 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden" style={{ boxShadow: "0 0 14px rgba(0,229,192,0.4)" }}>
          <Image src="/logo.jpg" alt="SparkForge" fill className="object-cover" priority />
        </div>
        <div>
          <div className="font-grotesk font-bold text-[17px] text-brand-grad leading-tight">
            SparkForge
          </div>
          <div className="text-[10px] font-grotesk tracking-wider" style={{ color: "#8888BB" }}>
            AI MARKETING COPILOT
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-6">
        {["Features", "Templates", "Docs", "Pricing"].map(n => (
          <a key={n} href="#" className="text-[13px] font-grotesk transition-colors duration-150"
            style={{ color: "#8888BB" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E8E8FF")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8888BB")}>
            {n}
          </a>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 mr-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "#00E5C0", boxShadow: "0 0 6px #00E5C0" }} />
          <span className="text-[11px] font-grotesk" style={{ color: "#00E5C0" }}>Solana</span>
        </div>
        <PhantomButton />
        <XButton />
        <a href="https://github.com" target="_blank" rel="noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-grotesk transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1E1E45", color: "#8888BB" }}>
          <Zap size={12} />
          Hackathon Build
        </a>
      </div>
    </header>
  );
}
