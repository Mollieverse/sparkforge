"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";
import { ProjectModal } from "./ProjectModal";

const SOL_LINKS = [
  { name: "Pump.fun",    url: "https://pump.fun",          color: "#FF6B35" },
  { name: "Raydium",     url: "https://raydium.io",         color: "#22D3EE" },
  { name: "Jupiter",     url: "https://jup.ag",             color: "#A855F7" },
  { name: "Birdeye",     url: "https://birdeye.so",         color: "#10B981" },
  { name: "Dexscreener", url: "https://dexscreener.com",    color: "#F59E0B" },
  { name: "Magic Eden",  url: "https://magiceden.io",       color: "#E42575" },
];

interface Props {
  project: Project;
  onSave: (p: Project) => void;
}

export function ProjectSidebar({ project, onSave }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const isFilled = !!(project.name || project.ticker);

  const fields = [
    { label: "Project",   val: project.name,                  icon: "🚀" },
    { label: "Ticker",    val: project.ticker ? `$${project.ticker}` : "", icon: "🎯" },
    { label: "Stage",     val: project.stage,                 icon: "📍" },
    { label: "Vibe",      val: project.vibe,                  icon: "✨" },
    { label: "Audience",  val: project.audience,              icon: "👥" },
  ].filter(f => f.val);

  return (
    <>
      <aside
        className="w-[268px] flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: "1px solid #1E1E45", background: "#0F0F2E" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #1E1E45" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: isFilled ? "#00E5C0" : "#3A3A6A",
                boxShadow: isFilled ? "0 0 6px #00E5C0" : "none",
                animation: isFilled ? "pulse 2s infinite" : "none",
              }}
            />
            <span className="font-grotesk font-semibold text-[13px]" style={{ color: "#E8E8FF" }}>
              Project Memory
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-grotesk transition-all"
            style={{ border: "1px solid #1E1E45", background: "transparent", color: "#8888BB" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#E8E8FF"; e.currentTarget.style.borderColor = "#3A3A6A"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8888BB"; e.currentTarget.style.borderColor = "#1E1E45"; }}
          >
            <Pencil size={11} />
            Edit
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isFilled ? (
            <div className="flex flex-col items-center text-center py-8">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-4 opacity-60" style={{ boxShadow: "0 0 20px rgba(0,229,192,0.2)" }}>
                <Image src="/logo.jpg" alt="SparkForge" fill className="object-cover" />
              </div>
              <p className="text-[12px] leading-relaxed mb-4" style={{ color: "#8888BB" }}>
                Set up your project memory so SparkForge creates hyper-personalized marketing
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 rounded-lg text-[12px] font-grotesk font-bold text-white"
                style={{ background: "linear-gradient(135deg, #00E5C0 0%, #7B2CBF 60%, #FF4D94 100%)" }}
              >
                Setup Project →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {fields.map(f => (
                <div key={f.label} className="rounded-lg p-3" style={{ background: "#13132E", border: "1px solid #1E1E45" }}>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8888BB" }}>{f.icon} {f.label}</div>
                  <div className="text-[13px] font-medium break-words" style={{ color: "#E8E8FF" }}>{f.val}</div>
                </div>
              ))}
              {project.description && (
                <div className="rounded-lg p-3" style={{ background: "#13132E", border: "1px solid #1E1E45" }}>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8888BB" }}>📝 About</div>
                  <div className="text-[12px] leading-relaxed break-words" style={{ color: "#8888BB" }}>{project.description}</div>
                </div>
              )}
            </div>
          )}

          {/* Ecosystem Links */}
          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#3A3A6A" }}>
              🔗 Solana Ecosystem
            </div>
            {SOL_LINKS.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg mb-1 group transition-all"
                style={{ border: "1px solid transparent" }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${link.color}10`;
                  e.currentTarget.style.borderColor = `${link.color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <span className="text-[12px] transition-colors" style={{ color: "#8888BB" }}>{link.name}</span>
                <ExternalLink size={11} style={{ color: link.color, opacity: 0.7 }} />
              </a>
            ))}
          </div>
        </div>
      </aside>

      <ProjectModal
        open={modalOpen}
        project={project}
        onSave={onSave}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
