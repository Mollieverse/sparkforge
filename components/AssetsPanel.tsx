"use client";

import { useState } from "react";
import { LayoutGrid, Download, Trash2 } from "lucide-react";
import type { GeneratedAsset } from "@/lib/types";
import { AssetCard } from "./AssetCard";

interface Props {
  assets: GeneratedAsset[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function AssetsPanel({ assets, onDelete, onClearAll }: Props) {
  const [filter, setFilter] = useState("All");

  const types = ["All", ...Array.from(new Set(assets.map(a => a.type)))];
  const filtered = filter === "All" ? assets : assets.filter(a => a.type === filter);

  const exportAll = () => {
    const text = assets.map(a => `=== ${a.type} ===\n${a.content}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <aside
      className="w-[310px] flex-shrink-0 flex flex-col overflow-hidden"
      style={{ borderLeft: "1px solid #1E1E45", background: "#0F0F2E" }}
    >
      {/* Header */}
      <div className="px-4 py-3.5" style={{ borderBottom: "1px solid #1E1E45" }}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <LayoutGrid size={14} style={{ color: "#8888BB" }} />
            <span className="font-grotesk font-semibold text-[13px]" style={{ color: "#E8E8FF" }}>
              Generated Assets
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {assets.length > 0 && (
              <>
                <button
                  onClick={exportAll}
                  title="Export all to clipboard"
                  className="p-1.5 rounded-md transition-all"
                  style={{ color: "#8888BB", border: "1px solid #1E1E45" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#00E5C0")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#8888BB")}
                >
                  <Download size={12} />
                </button>
                <button
                  onClick={onClearAll}
                  title="Clear all"
                  className="p-1.5 rounded-md transition-all"
                  style={{ color: "#8888BB", border: "1px solid #1E1E45" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#FF4D94")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#8888BB")}
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
            <div
              className="px-2 py-0.5 rounded-full text-[11px] font-grotesk font-bold"
              style={{
                background: assets.length > 0 ? "rgba(0,229,192,0.12)" : "rgba(58,58,106,0.3)",
                color: assets.length > 0 ? "#00E5C0" : "#8888BB",
              }}
            >
              {assets.length}
            </div>
          </div>
        </div>

        {/* Type filter chips */}
        {types.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="px-2.5 py-1 rounded-full text-[10px] font-grotesk transition-all"
                style={{
                  border: `1px solid ${filter === t ? "rgba(0,229,192,0.4)" : "#1E1E45"}`,
                  background: filter === t ? "rgba(0,229,192,0.1)" : "transparent",
                  color: filter === t ? "#00E5C0" : "#8888BB",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assets list */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>🎨</div>
            <p className="text-[12px] leading-relaxed mb-5" style={{ color: "#8888BB" }}>
              Your generated marketing assets will appear here
            </p>
            <div className="w-full flex flex-col gap-1.5">
              {["Twitter & X posts", "Pump.fun descriptions", "Mascot concepts", "Launch announcements", "Telegram blasts", "Tokenomics hooks"].map(t => (
                <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px]"
                  style={{ background: "#13132E", border: "1px solid #1E1E45", color: "#3A3A6A" }}>
                  <span style={{ color: "#8888BB" }}>✦</span> {t}
                </div>
              ))}
            </div>
          </div>
        ) : (
          filtered.map(asset => (
            <AssetCard key={asset.id} asset={asset} onDelete={onDelete} />
          ))
        )}
      </div>

      {/* Export footer */}
      {assets.length > 0 && (
        <div className="p-3" style={{ borderTop: "1px solid #1E1E45" }}>
          <button
            onClick={exportAll}
            className="w-full py-2.5 rounded-xl text-[12px] font-grotesk font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #00E5C0 0%, #7B2CBF 60%, #FF4D94 100%)",
              boxShadow: "0 0 16px rgba(0,229,192,0.15)",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(0,229,192,0.3)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 16px rgba(0,229,192,0.15)")}
          >
            <Download size={13} />
            Copy All Assets
          </button>
        </div>
      )}
    </aside>
  );
}
