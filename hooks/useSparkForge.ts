"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Project, GeneratedAsset, ChatMessage } from "@/lib/types";
import { parseAssetsFromText } from "@/lib/prompts";

interface Workspace {
  project: Project & { id: string };
  messages: ChatMessage[];
  assets: GeneratedAsset[];
}

const makeId = () => Math.random().toString(36).slice(2, 9);

const WELCOME: ChatMessage = {
  role: "assistant",
  text: "gm ser 👋 I'm **SparkForge** — your AI Marketing Co-Founder for Solana.\n\nTell me about your project and I'll help you ship killer marketing. Set up your **Project Memory** in the left panel for hyper-personalized generations, or just describe your idea and let's cook 🔥\n\nI can generate tweets, Pump.fun descriptions, mascots, launch announcements, tokenomics narratives, Discord blasts, and much more.",
  assets: [],
  timestamp: Date.now(),
};

function newWorkspace(): Workspace {
  return {
    project: { id: makeId(), name: "", ticker: "", description: "", vibe: "", audience: "", stage: "", website: "", twitter: "" },
    messages: [{ ...WELCOME, timestamp: Date.now() }],
    assets: [],
  };
}

export function useSparkForge() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sparkforge-workspaces");
      const savedId = localStorage.getItem("sparkforge-activeId");
      if (saved) {
        const parsed = JSON.parse(saved) as Workspace[];
        if (parsed.length > 0) {
          setWorkspaces(parsed);
          setActiveId(savedId && parsed.find(w => w.project.id === savedId) ? savedId : parsed[0].project.id);
          setHydrated(true);
          return;
        }
      }
    } catch {}
    const ws = newWorkspace();
    setWorkspaces([ws]);
    setActiveId(ws.project.id);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || workspaces.length === 0) return;
    try {
      localStorage.setItem("sparkforge-workspaces", JSON.stringify(workspaces));
      localStorage.setItem("sparkforge-activeId", activeId);
    } catch {}
  }, [workspaces, activeId, hydrated]);

  const activeWorkspace = workspaces.find(w => w.project.id === activeId) ?? workspaces[0];

  const createProject = useCallback(() => {
    const ws = newWorkspace();
    setWorkspaces(prev => [...prev, ws]);
    setActiveId(ws.project.id);
  }, []);

  const switchProject = useCallback((id: string) => setActiveId(id), []);

  const deleteProject = useCallback((id: string) => {
    setWorkspaces(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(w => w.project.id !== id);
      setActiveId(next[0].project.id);
      return next;
    });
  }, []);

  const saveProject = useCallback((project: Project) => {
    setWorkspaces(prev => prev.map(w =>
      w.project.id === activeId ? { ...w, project: { ...project, id: w.project.id } } : w
    ));
  }, [activeId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", text: text.trim(), assets: [], timestamp: Date.now() };
    setWorkspaces(prev => prev.map(w =>
      w.project.id === activeId ? { ...w, messages: [...w.messages, userMsg] } : w
    ));
    setLoading(true);
    setStreamBuffer("");

    const currentWs = workspaces.find(w => w.project.id === activeId);
    const history = [...(currentWs?.messages ?? []), userMsg].map(m => ({
      role: m.role,
      content: m.role === "assistant"
        ? m.text + (m.assets?.length > 0 ? "\n\n" + m.assets.map(a => `[ASSET: ${a.type}]\n${a.content}\n[/ASSET]`).join("\n\n") : "")
        : m.text,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, project: currentWs?.project }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("API error");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamBuffer(full);
      }

      const { assets, cleanText } = parseAssetsFromText(full);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        text: cleanText || (assets.length > 0 ? "" : "Something went wrong ser. Try again."),
        assets,
        timestamp: Date.now(),
      };

      setWorkspaces(prev => prev.map(w =>
        w.project.id === activeId
          ? { ...w, messages: [...w.messages, assistantMsg], assets: [...assets, ...w.assets] }
          : w
      ));
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setWorkspaces(prev => prev.map(w =>
          w.project.id === activeId
            ? { ...w, messages: [...w.messages, { role: "assistant", text: "Network error ser 😔 Check your connection and try again.", assets: [], timestamp: Date.now() }] }
            : w
        ));
      }
    } finally {
      setLoading(false);
      setStreamBuffer("");
    }
  }, [loading, activeId, workspaces]);

  const deleteAsset = useCallback((id: string) => {
    setWorkspaces(prev => prev.map(w =>
      w.project.id === activeId ? { ...w, assets: w.assets.filter(a => a.id !== id) } : w
    ));
  }, [activeId]);

  const clearAssets = useCallback(() => {
    setWorkspaces(prev => prev.map(w =>
      w.project.id === activeId ? { ...w, assets: [] } : w
    ));
  }, [activeId]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setStreamBuffer("");
  }, []);

  return {
    workspaces, activeId, activeWorkspace,
    loading, streamBuffer, hydrated,
    createProject, switchProject, deleteProject, saveProject,
    sendMessage, deleteAsset, clearAssets, stopGeneration,
  };
        }
