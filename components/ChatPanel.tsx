"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, Square } from "lucide-react";
import type { ChatMessage, GeneratedAsset } from "@/lib/types";
import { QUICK_PROMPTS, getAssetMeta } from "@/lib/types";
import { parseAssetsFromText } from "@/lib/prompts";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  streamBuffer: string;
  onSend: (text: string) => void;
  onStop: () => void;
  projectName: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="copy-float text-[10px] px-2 py-1 rounded-md transition-all"
      style={{ border: "1px solid #1E1E45", background: "#13132E", color: copied ? "#00E5C0" : "#8888BB" }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function MsgBubble({ msg }: { msg: ChatMessage }) {
  const isAssistant = msg.role === "assistant";
  const { assets, cleanText } = isAssistant ? parseAssetsFromText(msg.text + (msg.assets?.length ? "\n" + msg.assets.map(a => `[ASSET: ${a.type}]\n${a.content}\n[/ASSET]`).join("\n") : "")) : { cleanText: msg.text, assets: [] as GeneratedAsset[] };
  const displayText = isAssistant ? cleanText : msg.text;
  const displayAssets = isAssistant ? msg.assets : [];

  return (
    <div
      className={`flex gap-3 mb-5 animate-slide-in ${isAssistant ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      {isAssistant ? (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden" style={{ boxShadow: "0 0 10px rgba(0,229,192,0.25)" }}>
          <Image src="/logo.jpg" alt="SparkForge" width={32} height={32} className="object-cover w-full h-full" />
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: "rgba(123,44,191,0.25)", border: "1px solid rgba(123,44,191,0.4)" }}>
          👤
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-[78%]">
        {/* Main text bubble */}
        {displayText && (
          <div
            className="relative msg-bubble group px-4 py-3 text-[14px] leading-relaxed rounded-2xl"
            style={{
              background: isAssistant ? "#13132E" : "linear-gradient(135deg, rgba(123,44,191,0.25), rgba(255,77,148,0.15))",
              border: `1px solid ${isAssistant ? "#1E1E45" : "rgba(123,44,191,0.35)"}`,
              borderRadius: isAssistant ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
              color: "#E8E8FF",
            }}
          >
            <div
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{
                __html: displayText
                  .replace(/\*\*(.+?)\*\*/g, `<strong style="color:#00E5C0">$1</strong>`)
                  .replace(/`([^`]+)`/g, `<code style="background:rgba(0,229,192,0.1);color:#00E5C0;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px">$1</code>`)
                  .replace(/\n/g, '<br>')
              }}
            />
            {isAssistant && (
              <div className="absolute top-2 right-2">
                <CopyBtn text={displayText} />
              </div>
            )}
          </div>
        )}

        {/* Asset badges */}
        {displayAssets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayAssets.map(a => {
              const meta = getAssetMeta(a.type);
              return (
                <div key={a.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-grotesk"
                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25`, color: meta.color }}>
                  {meta.emoji} {a.type}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPanel({ messages, loading, streamBuffer, onSend, onStop, projectName }: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamBuffer]);

  const send = () => { if (input.trim() && !loading) { onSend(input); setInput(""); } };
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {messages.map((msg, i) => <MsgBubble key={i} msg={msg} />)}

        {/* Streaming indicator */}
        {loading && streamBuffer && (
          <div className="flex gap-3 mb-5 animate-slide-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden" style={{ boxShadow: "0 0 10px rgba(0,229,192,0.25)" }}>
              <Image src="/logo.jpg" alt="SparkForge" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <div className="max-w-[78%] px-4 py-3 text-[14px] leading-relaxed rounded-xl"
              style={{ background: "#13132E", border: "1px solid #1E1E45", color: "#E8E8FF", borderRadius: "4px 14px 14px 14px" }}>
              <div className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: streamBuffer.replace(/\[ASSET:[^\]]+\][\s\S]*?\[\/ASSET\]/g, "").replace(/\*\*(.+?)\*\*/g, `<strong style="color:#00E5C0">$1</strong>`).replace(/\n/g, "<br>") }} />
            </div>
          </div>
        )}

        {/* Typing dots */}
        {loading && !streamBuffer && (
          <div className="flex gap-3 mb-5 animate-slide-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/logo.jpg" alt="SparkForge" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <div className="px-4 py-3.5 rounded-xl flex items-center gap-1.5"
              style={{ background: "#13132E", border: "1px solid #1E1E45", borderRadius: "4px 14px 14px 14px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="typing-dot w-2 h-2 rounded-full"
                  style={{ background: "linear-gradient(135deg, #00E5C0, #7B2CBF)" }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-6 pb-3 flex gap-2 flex-wrap">
        {QUICK_PROMPTS.slice(0, 5).map(q => (
          <button key={q.label} onClick={() => onSend(q.prompt)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full text-[12px] font-grotesk transition-all whitespace-nowrap"
            style={{ border: "1px solid #1E1E45", background: "rgba(255,255,255,0.02)", color: "#8888BB" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,192,0.4)"; e.currentTarget.style.color = "#E8E8FF"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E1E45"; e.currentTarget.style.color = "#8888BB"; }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="px-6 pb-5" style={{ borderTop: "1px solid #1E1E45", paddingTop: "12px" }}>
        <div
          className="flex gap-3 items-end rounded-2xl p-3 transition-all"
          style={{ background: "#13132E", border: "1px solid #1E1E45" }}
          onFocus={e => e.currentTarget.style.borderColor = "rgba(123,44,191,0.5)"}
          onBlur={e => e.currentTarget.style.borderColor = "#1E1E45"}
        >
          <div className="text-lg pb-0.5 flex-shrink-0">⚡</div>
          <textarea
            ref={taRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKey}
            rows={1}
            placeholder={`Ask SparkForge${projectName ? ` about ${projectName}` : ""} — tweets, Pump.fun copy, mascots, announcements…`}
            className="flex-1 bg-transparent resize-none text-[14px] leading-relaxed placeholder:text-[#3A3A6A] focus:outline-none"
            style={{ color: "#E8E8FF", maxHeight: "120px", fontFamily: "inherit" }}
          />
          <button
            onClick={loading ? onStop : send}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: (input.trim() || loading) ? "linear-gradient(135deg, #00E5C0, #7B2CBF)" : "#1E1E45",
              boxShadow: (input.trim() || loading) ? "0 0 12px rgba(0,229,192,0.3)" : "none",
            }}
          >
            {loading ? <Square size={14} fill="white" color="white" /> : <Send size={14} color="white" />}
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: "#3A3A6A" }}>
          SparkForge is Solana-native · Not financial advice · Built for early builders
        </p>
      </div>
    </main>
  );
}
