"use client";

import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import type { GeneratedAsset } from "@/lib/types";
import { getAssetMeta } from "@/lib/types";

interface Props {
  asset: GeneratedAsset;
  onDelete: (id: string) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all font-grotesk"
      style={{
        border: "1px solid #1E1E45",
        background: copied ? "rgba(0,229,192,0.1)" : "rgba(255,255,255,0.03)",
        color: copied ? "#00E5C0" : "#8888BB",
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function AssetCard({ asset, onDelete }: Props) {
  const meta = getAssetMeta(asset.type);
  return (
    <div
      className="rounded-xl overflow-hidden mb-3 animate-slide-in"
      style={{ background: "#13132E", border: "1px solid #1E1E45" }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: `${meta.color}12`,
          borderBottom: `1px solid ${meta.color}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px]">{meta.emoji}</span>
          <span
            className="text-[10px] font-grotesk font-bold uppercase tracking-wider"
            style={{ color: meta.color }}
          >
            {asset.type}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton text={asset.content} />
          <button
            onClick={() => onDelete(asset.id)}
            className="p-1 rounded-md transition-all"
            style={{ color: "#3A3A6A" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FF4D94")}
            onMouseLeave={e => (e.currentTarget.style.color = "#3A3A6A")}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {/* Content */}
      <div
        className="px-3 py-3 text-[13px] leading-relaxed whitespace-pre-wrap break-words"
        style={{ color: "#E8E8FF" }}
      >
        {asset.content}
      </div>
      {/* Timestamp */}
      <div className="px-3 pb-2 text-[10px]" style={{ color: "#3A3A6A" }}>
        {new Date(asset.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}
