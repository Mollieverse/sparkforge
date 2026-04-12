"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Zap } from "lucide-react";
import type { Project } from "@/lib/types";
import { VIBES, STAGES } from "@/lib/types";

interface Props {
  open: boolean;
  project: Project;
  onSave: (p: Project) => void;
  onClose: () => void;
}

export function ProjectModal({ open, project, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Project>(project);

  useEffect(() => { if (open) setDraft(project); }, [open, project]);

  if (!open) return null;

  const update = (k: keyof Project, v: string) => setDraft(p => ({ ...p, [k]: v }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,31,0.88)", backdropFilter: "blur(10px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl animate-slide-in"
        style={{ background: "#13132E", border: "1px solid #1E1E45" }}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4" style={{ background: "#13132E", borderBottom: "1px solid #1E1E45" }}>
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ boxShadow: "0 0 12px rgba(0,229,192,0.3)" }}>
              <Image src="/logo.jpg" alt="SparkForge" fill className="object-cover" />
            </div>
            <div>
              <div className="font-grotesk font-bold text-[15px]" style={{ color: "#E8E8FF" }}>Project Memory</div>
              <div className="text-[11px]" style={{ color: "#8888BB" }}>SparkForge remembers this across all generations</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "#8888BB" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E8E8FF")} onMouseLeave={e => (e.currentTarget.style.color = "#8888BB")}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 pt-5 flex flex-col gap-5">
          {/* Core fields */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "name" as const, label: "Project Name", placeholder: "e.g. MoonCat Protocol", icon: "🚀", full: false },
              { key: "ticker" as const, label: "Token Ticker", placeholder: "MCAT (no $)", icon: "🎯", full: false },
            ].map(f => (
              <div key={f.key} className={f.full ? "col-span-2" : ""}>
                <label className="block text-[11px] font-grotesk mb-1.5" style={{ color: "#8888BB" }}>
                  {f.icon} {f.label}
                </label>
                <input
                  value={draft[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-[13px] transition-colors"
                  style={{ background: "#0F0F2E", border: "1px solid #1E1E45", color: "#E8E8FF", outline: "none" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(123,44,191,0.6)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#1E1E45")}
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-grotesk mb-1.5" style={{ color: "#8888BB" }}>📝 Project Description</label>
            <textarea
              value={draft.description}
              onChange={e => update("description", e.target.value)}
              placeholder="What is your project? What problem does it solve? What makes it unique on Solana?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-[13px] resize-none transition-colors"
              style={{ background: "#0F0F2E", border: "1px solid #1E1E45", color: "#E8E8FF", outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(123,44,191,0.6)")}
              onBlur={e => (e.currentTarget.style.borderColor = "#1E1E45")}
            />
          </div>

          {/* Audience + Website row */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "audience" as const, label: "Target Audience", placeholder: "degens, NFT collectors…", icon: "👥" },
              { key: "twitter" as const, label: "Twitter Handle", placeholder: "yourproject (no @)", icon: "🐦" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-grotesk mb-1.5" style={{ color: "#8888BB" }}>{f.icon} {f.label}</label>
                <input
                  value={draft[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-[13px] transition-colors"
                  style={{ background: "#0F0F2E", border: "1px solid #1E1E45", color: "#E8E8FF", outline: "none" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(123,44,191,0.6)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#1E1E45")}
                />
              </div>
            ))}
          </div>

          {/* Brand Vibe */}
          <div>
            <label className="block text-[11px] font-grotesk mb-2" style={{ color: "#8888BB" }}>✨ Brand Vibe</label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(v => (
                <button
                  key={v}
                  onClick={() => update("vibe", draft.vibe === v ? "" : v)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-grotesk transition-all duration-150"
                  style={{
                    border: `1px solid ${draft.vibe === v ? "rgba(0,229,192,0.5)" : "#1E1E45"}`,
                    background: draft.vibe === v ? "rgba(0,229,192,0.12)" : "transparent",
                    color: draft.vibe === v ? "#00E5C0" : "#8888BB",
                  }}
                >{v}</button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-[11px] font-grotesk mb-2" style={{ color: "#8888BB" }}>📍 Project Stage</label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map(s => (
                <button
                  key={s}
                  onClick={() => update("stage", draft.stage === s ? "" : s)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-grotesk transition-all duration-150"
                  style={{
                    border: `1px solid ${draft.stage === s ? "rgba(255,77,148,0.5)" : "#1E1E45"}`,
                    background: draft.stage === s ? "rgba(255,77,148,0.12)" : "transparent",
                    color: draft.stage === s ? "#FF4D94" : "#8888BB",
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 pt-4 flex gap-3" style={{ background: "#13132E", borderTop: "1px solid #1E1E45" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-grotesk font-semibold transition-all"
            style={{ background: "transparent", border: "1px solid #1E1E45", color: "#8888BB" }}>
            Cancel
          </button>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="flex-[2] py-2.5 rounded-xl text-[13px] font-grotesk font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: "linear-gradient(135deg, #00E5C0 0%, #7B2CBF 60%, #FF4D94 100%)", boxShadow: "0 0 20px rgba(0,229,192,0.2)" }}
          >
            <Zap size={14} />
            Save to Memory
          </button>
        </div>
      </div>
    </div>
  );
}
