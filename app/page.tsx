"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useSparkForge } from "@/hooks/useSparkForge";
import { ProjectModal } from "@/components/ProjectModal";
import { AssetCard } from "@/components/AssetCard";
import { QUICK_PROMPTS, getAssetMeta } from "@/lib/types";
import type { ChatMessage } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────
const renderText = (t: string) => t
  .replace(/\*\*(.+?)\*\*/g, `<strong style="color:#00E5C0">$1</strong>`)
  .replace(/`([^`]+)`/g, `<code style="background:rgba(0,229,192,0.1);color:#00E5C0;padding:2px 5px;border-radius:4px;font-size:12px">$1</code>`);

// ── ChatUI — lives OUTSIDE Home so it never remounts ─────────────────────────
interface ChatUIProps {
  messages: ChatMessage[];
  loading: boolean;
  streamBuffer: string;
  onSend: (t: string) => void;
  onStop: () => void;
  projectName: string;
  activeColor: string;
  assetsCount: number;
  isMobile: boolean;
  onDrawerOpen: () => void;
  onEditProject: () => void;
  onAssetsTab: () => void;
}

const ChatUI = memo(function ChatUI({
  messages, loading, streamBuffer,
  onSend, onStop, projectName, activeColor,
  assetsCount, isMobile, onDrawerOpen, onEditProject, onAssetsTab,
}: ChatUIProps) {
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMsgCount = useRef(messages.length);

  // Track if user is at bottom
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }, []);

  // Scroll to bottom instantly (no animation) only when appropriate
  const scrollToBottom = useCallback((force = false) => {
    const el = scrollRef.current;
    if (!el) return;
    if (force || isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Scroll ONCE when a new message is added (user sends or AI response lands)
  useEffect(() => {
    if (messages.length !== prevMsgCount.current) {
      prevMsgCount.current = messages.length;
      scrollToBottom(true);
    }
  }, [messages.length, scrollToBottom]);

  // During streaming: only scroll if pinned to bottom, no smooth scroll
  useEffect(() => {
    if (loading && streamBuffer) {
      scrollToBottom(false);
    }
  }, [streamBuffer, loading, scrollToBottom]);

  const send = () => {
    if (input.trim() && !loading) {
      onSend(input);
      setInput("");
      if (taRef.current) taRef.current.style.height = "auto";
      isAtBottomRef.current = true;
      scrollToBottom(true);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E1E45", background: "#0F0F2E", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button onClick={onDrawerOpen} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #1E1E45", background: "transparent", color: "#8888BB", cursor: "pointer", fontSize: 16 }}>☰</button>
          )}
          <div style={{ width: 34, height: 34, borderRadius: 10, overflow: "hidden", boxShadow: "0 0 10px rgba(0,229,192,0.2)" }}>
            <img src="/logo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E8E8FF", fontFamily: "Space Grotesk, sans-serif" }}>
              {projectName || "SparkForge"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onEditProject} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1E1E45", background: "transparent", color: "#8888BB", cursor: "pointer", fontSize: 12, fontFamily: "Space Grotesk, sans-serif" }}>✏️ Edit</button>
          {isMobile && (
            <button onClick={onAssetsTab} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1E1E45", background: "transparent", color: "#8888BB", cursor: "pointer", fontSize: 12, fontFamily: "Space Grotesk, sans-serif" }}>
              🎨 {assetsCount}
            </button>
          )}
        </div>
      </div>

      {/* Messages — stable container, no remount */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{ flex: 1, overflowY: "auto", padding: "16px", overscrollBehavior: "contain" }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            {msg.role === "assistant" ? (
              <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden", flexShrink: 0, marginTop: 2 }}>
                <img src="/logo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2, background: "rgba(123,44,191,0.2)", border: "1px solid rgba(123,44,191,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
            )}
            <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", gap: 6 }}>
              {msg.text && (
                <div style={{ padding: "12px 14px", borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", background: msg.role === "user" ? "linear-gradient(135deg,rgba(123,44,191,0.25),rgba(255,77,148,0.15))" : "#13132E", border: `1px solid ${msg.role === "user" ? "rgba(123,44,191,0.3)" : "#1E1E45"}`, fontSize: 14, lineHeight: 1.65, color: "#E8E8FF" }}>
                  <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
                </div>
              )}
              {msg.assets?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {msg.assets.map(a => {
                    const m = getAssetMeta(a.type);
                    return (
                      <div key={a.id} style={{ padding: "3px 10px", borderRadius: 7, fontSize: 11, background: `${m.color}14`, border: `1px solid ${m.color}25`, color: m.color, fontFamily: "Space Grotesk, sans-serif" }}>
                        {m.emoji} {a.type}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing dots */}
        {loading && !streamBuffer && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <img src="/logo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "14px 18px", background: "#13132E", border: "1px solid #1E1E45", borderRadius: "4px 14px 14px 14px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#00E5C0,#7B2CBF)", animation: `pulse 1.2s ease ${j * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Streaming buffer */}
        {loading && streamBuffer && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <img src="/logo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ maxWidth: "80%", padding: "12px 14px", background: "#13132E", border: "1px solid #1E1E45", borderRadius: "4px 14px 14px 14px", fontSize: 14, lineHeight: 1.65, color: "#E8E8FF" }}>
              <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: renderText(streamBuffer.replace(/\[ASSET:[^\]]+\][\s\S]*?\[\/ASSET\]/g, "")) }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid #1E1E45", flexShrink: 0 }}>
        {QUICK_PROMPTS.slice(0, 4).map(q => (
          <button key={q.label} onClick={() => onSend(q.prompt)}
            style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #1E1E45", background: "rgba(255,255,255,0.02)", color: "#8888BB", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "8px 16px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "#13132E", border: "1px solid #1E1E45", borderRadius: 14, padding: "10px 12px" }}>
          <span style={{ fontSize: 18, flexShrink: 0, paddingBottom: 2 }}>⚡</span>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
            onKeyDown={handleKey}
            rows={1}
            placeholder={`Ask SparkForge${projectName ? ` about ${projectName}` : ""}…`}
            style={{ flex: 1, background: "transparent", border: "none", color: "#E8E8FF", fontSize: 14, lineHeight: 1.5, resize: "none", fontFamily: "inherit", maxHeight: 100, outline: "none" }}
          />
          <button onClick={loading ? onStop : send} style={{ width: 36, height: 36, borderRadius: 10, border: "none", flexShrink: 0, background: (input.trim() || loading) ? "linear-gradient(135deg,#00E5C0,#7B2CBF)" : "#1E1E45", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loading
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            }
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: "#2a2a5a", marginTop: 6 }}>
          SparkForge is Solana-native · Not financial advice · Built for early builders
        </p>
      </div>
    </div>
  );
});

// ── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const {
    workspaces, activeId, activeWorkspace,
    loading, streamBuffer, hydrated,
    createProject, switchProject, deleteProject, saveProject,
    sendMessage, deleteAsset, clearAssets, stopGeneration,
  } = useSparkForge();

  const [mobileTab, setMobileTab] = useState<"home" | "chat" | "assets" | "projects">("home");
  const [isMobile, setIsMobile] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!hydrated) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#0A0A1F", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 48 }}>⚡</div>
        <div style={{ color: "#8888BB", fontFamily: "Space Grotesk, sans-serif", fontSize: 15 }}>Loading SparkForge...</div>
      </div>
    );
  }

  const colors = ["#00E5C0", "#7B2CBF", "#FF4D94", "#1DA1F2", "#FFD700", "#FF6B35"];
  const activeColor = activeWorkspace ? colors[activeWorkspace.project.id.charCodeAt(0) % colors.length] : "#00E5C0";

  const AssetsUI = () => (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E1E45", background: "#0F0F2E", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 13, color: "#E8E8FF" }}>⚡ Assets</span>
        <div style={{ display: "flex", gap: 6 }}>
          {(activeWorkspace?.assets.length ?? 0) > 0 && (
            <button onClick={clearAssets} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid #1E1E45", background: "transparent", color: "#3A3A6A", fontSize: 11, cursor: "pointer" }}>Clear</button>
          )}
          <div style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: (activeWorkspace?.assets.length ?? 0) > 0 ? "rgba(0,229,192,0.12)" : "rgba(58,58,106,0.3)", color: (activeWorkspace?.assets.length ?? 0) > 0 ? "#00E5C0" : "#8888BB" }}>
            {activeWorkspace?.assets.length ?? 0}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
        {(activeWorkspace?.assets.length ?? 0) === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: 36, opacity: 0.25, marginBottom: 12 }}>🎨</div>
            <p style={{ color: "#8888BB", fontSize: 13, lineHeight: 1.6 }}>Your generated assets appear here</p>
          </div>
        ) : (
          activeWorkspace?.assets.map(a => <AssetCard key={a.id} asset={a} onDelete={deleteAsset} />)
        )}
      </div>
      {(activeWorkspace?.assets.length ?? 0) > 0 && (
        <div style={{ padding: "10px 12px", borderTop: "1px solid #1E1E45", flexShrink: 0 }}>
          <button onClick={() => navigator.clipboard.writeText(activeWorkspace!.assets.map(a => `=== ${a.type} ===\n${a.content}`).join("\n\n"))}
            style={{ width: "100%", padding: 10, borderRadius: 10, background: "linear-gradient(135deg,#00E5C0,#7B2CBF,#FF4D94)", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}>
            ↓ Copy All Assets
          </button>
        </div>
      )}
    </div>
  );

  const ProjectsUI = ({ onSelect }: { onSelect?: () => void }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0A0A1F" }}>
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #1E1E45", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden" }}>
            <img src="/logo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, background: "linear-gradient(90deg,#00E5C0,#7B2CBF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SparkForge
          </div>
        </div>
        <button onClick={() => { createProject(); onSelect?.(); }}
          style={{ width: "100%", padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,#00E5C0,#7B2CBF,#FF4D94)", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}>
          + New Project
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
        <div style={{ fontSize: 10, color: "#3A3A6A", textTransform: "uppercase", letterSpacing: "0.07em", padding: "6px 6px 8px", fontWeight: 600 }}>Your Projects</div>
        {workspaces.map(ws => {
          const isActive = ws.project.id === activeId;
          const color = colors[ws.project.id.charCodeAt(0) % colors.length];
          const hasName = !!ws.project.name;
          return (
            <div key={ws.project.id} onClick={() => { switchProject(ws.project.id); onSelect?.(); }}
              style={{ padding: "12px 10px", borderRadius: 12, marginBottom: 4, cursor: "pointer", background: isActive ? "rgba(0,229,192,0.08)" : "transparent", border: `1px solid ${isActive ? "rgba(0,229,192,0.25)" : "transparent"}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: hasName ? `${color}22` : "#1E1E45", border: `1px solid ${hasName ? `${color}44` : "#1E1E45"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: hasName ? color : "#3A3A6A", fontFamily: "Space Grotesk, sans-serif" }}>
                {hasName ? ws.project.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#E8E8FF" : "#8888BB", fontFamily: "Space Grotesk, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ws.project.name || "Unnamed Project"}
                </div>
                <div style={{ fontSize: 11, color: "#3A3A6A", display: "flex", gap: 6 }}>
                  {ws.project.ticker && <span style={{ color }}>${ws.project.ticker}</span>}
                  <span>{ws.assets.length} assets</span>
                </div>
              </div>
              {workspaces.length > 1 && isActive && (
                <button onClick={e => { e.stopPropagation(); deleteProject(ws.project.id); }}
                  style={{ padding: "3px 6px", border: "none", background: "transparent", color: "#3A3A6A", cursor: "pointer", fontSize: 14 }}>✕</button>
              )}
            </div>
          );
        })}
      </div>
      {activeWorkspace && (
        <div style={{ padding: "10px", borderTop: "1px solid #1E1E45", flexShrink: 0 }}>
          <button onClick={() => { setModalOpen(true); onSelect?.(); }}
            style={{ width: "100%", padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid #1E1E45", color: "#8888BB", fontSize: 12, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>
            ✏️ Edit Project Memory
          </button>
        </div>
      )}
    </div>
  );

  const chatProps: ChatUIProps = {
    messages: activeWorkspace?.messages ?? [],
    loading,
    streamBuffer,
    onSend: sendMessage,
    onStop: stopGeneration,
    projectName: activeWorkspace?.project.name ?? "",
    activeColor,
    assetsCount: activeWorkspace?.assets.length ?? 0,
    isMobile,
    onDrawerOpen: () => setDrawerOpen(true),
    onEditProject: () => setModalOpen(true),
    onAssetsTab: () => setMobileTab("assets"),
  };

  if (!isMobile) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", background: "#0A0A1F", overflow: "hidden" }}>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid #1E1E45", overflow: "hidden" }}>
          <ProjectsUI />
        </div>
        <ChatUI {...chatProps} />
        <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid #1E1E45", overflow: "hidden" }}>
          <AssetsUI />
        </div>
        {activeWorkspace && (
          <ProjectModal open={modalOpen} project={activeWorkspace.project} onSave={saveProject} onClose={() => setModalOpen(false)} />
        )}
      </div>
    );
  }

  const TABS = [
    { id: "home",     label: "Home",     icon: "🏠" },
    { id: "chat",     label: "Chat",     icon: "⚡" },
    { id: "assets",   label: "Assets",   icon: "🎨" },
    { id: "projects", label: "Projects", icon: "🚀" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#0A0A1F", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      {drawerOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div onClick={() => setDrawerOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(10,10,31,0.8)" }} />
          <div style={{ position: "relative", width: "75%", maxWidth: 280, height: "100%", background: "#0A0A1F", borderRight: "1px solid #1E1E45", zIndex: 10, overflow: "hidden" }}>
            <ProjectsUI onSelect={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {mobileTab === "home" && (
          <div style={{ height: "100%", overflow: "auto" }}>
            <div style={{ padding: "20px 20px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#E8E8FF", fontFamily: "Space Grotesk, sans-serif" }}>gm, builder 👋</div>
                  <div style={{ fontSize: 13, color: "#8888BB", marginTop: 2 }}>Your AI Marketing Co-Founder</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", boxShadow: "0 0 14px rgba(0,229,192,0.3)" }}>
                  <img src="/logo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </div>

            <div style={{ padding: "0 20px 16px" }}>
              {activeWorkspace?.project.name ? (
                <div style={{ background: `linear-gradient(135deg, ${activeColor}18, rgba(123,44,191,0.12))`, border: `1px solid ${activeColor}30`, borderRadius: 18, padding: 18 }}>
                  <div style={{ fontSize: 11, color: activeColor, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>Active Project</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#E8E8FF", fontFamily: "Space Grotesk, sans-serif", marginBottom: 4 }}>
                    {activeWorkspace.project.name}
                    {activeWorkspace.project.ticker && <span style={{ fontSize: 14, color: activeColor, marginLeft: 8 }}>${activeWorkspace.project.ticker}</span>}
                  </div>
                  {activeWorkspace.project.description && (
                    <div style={{ fontSize: 13, color: "#8888BB", lineHeight: 1.5, marginBottom: 14 }}>
                      {activeWorkspace.project.description.slice(0, 80)}{activeWorkspace.project.description.length > 80 ? "..." : ""}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setMobileTab("chat")} style={{ flex: 1, padding: "11px", borderRadius: 12, background: "linear-gradient(135deg,#00E5C0,#7B2CBF,#FF4D94)", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}>
                      ⚡ Start Creating
                    </button>
                    <button onClick={() => setModalOpen(true)} style={{ padding: "11px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid #1E1E45", color: "#8888BB", fontSize: 13, cursor: "pointer" }}>✏️</button>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#13132E", border: "1px dashed #1E1E45", borderRadius: 18, padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🚀</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E8FF", fontFamily: "Space Grotesk, sans-serif", marginBottom: 6 }}>Set up your first project</div>
                  <div style={{ fontSize: 13, color: "#8888BB", marginBottom: 16, lineHeight: 1.5 }}>SparkForge needs your project details to generate hyper-personalized marketing</div>
                  <button onClick={() => setModalOpen(true)} style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#00E5C0,#7B2CBF,#FF4D94)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}>
                    Setup Project →
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: "0 20px 16px" }}>
              <div style={{ fontSize: 12, color: "#3A3A6A", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, fontWeight: 600 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: "🐦", label: "Launch Tweet", prompt: "Write a viral launch tweet thread. Make it hype and Solana-native." },
                  { icon: "🚀", label: "Pump.fun Desc", prompt: "Write a Pump.fun description that drives FOMO and makes people ape in." },
                  { icon: "🦊", label: "Mascot Concept", prompt: "Design a full mascot concept with personality, backstory, visual description." },
                  { icon: "📣", label: "TG Blast", prompt: "Write a Telegram community announcement blast for our upcoming launch." },
                  { icon: "💎", label: "Brand Story", prompt: "Craft our brand origin story — emotional, authentic, Solana-native." },
                  { icon: "📊", label: "Tokenomics", prompt: "Write a tokenomics narrative that makes our distribution sound bullish." },
                ].map(q => (
                  <button key={q.label} onClick={() => { sendMessage(q.prompt); setMobileTab("chat"); }}
                    style={{ padding: "14px 12px", borderRadius: 14, cursor: "pointer", background: "#13132E", border: "1px solid #1E1E45", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, textAlign: "left" }}>
                    <span style={{ fontSize: 22 }}>{q.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8888BB", fontFamily: "Space Grotesk, sans-serif" }}>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeWorkspace && (
              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ fontSize: 12, color: "#3A3A6A", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, fontWeight: 600 }}>Stats</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "Assets", value: activeWorkspace.assets.length, color: "#00E5C0" },
                    { label: "Messages", value: Math.max(0, activeWorkspace.messages.length - 1), color: "#7B2CBF" },
                    { label: "Projects", value: workspaces.length, color: "#FF4D94" },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, padding: "14px 10px", borderRadius: 14, background: "#13132E", border: `1px solid ${s.color}20`, textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "Space Grotesk, sans-serif" }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#8888BB" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mobileTab === "chat" && <ChatUI {...chatProps} />}

        {mobileTab === "assets" && (
          <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <AssetsUI />
          </div>
        )}

        {mobileTab === "projects" && (
          <div style={{ height: "100%", overflow: "hidden" }}>
            <ProjectsUI onSelect={() => setMobileTab("chat")} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", borderTop: "1px solid #1E1E45", background: "#0A0A1F", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map(tab => {
          const isActive = mobileTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setMobileTab(tab.id as "home" | "chat" | "assets" | "projects")} style={{ flex: 1, padding: "12px 4px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "transparent", border: "none", borderTop: `2px solid ${isActive ? "#00E5C0" : "transparent"}`, cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span style={{ fontSize: 11, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: isActive ? "#00E5C0" : "#3A3A6A" }}>
                {tab.id === "assets" && (activeWorkspace?.assets.length ?? 0) > 0 ? `Assets (${activeWorkspace!.assets.length})` : tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeWorkspace && (
        <ProjectModal open={modalOpen} project={activeWorkspace.project} onSave={saveProject} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
      }
