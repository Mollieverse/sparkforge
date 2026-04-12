"use client";

import { useState, useCallback, useRef } from "react";
import type { Project, GeneratedAsset, ChatMessage } from "@/lib/types";
import { parseAssetsFromText } from "@/lib/prompts";

const INITIAL_PROJECT: Project = {
  name: "", ticker: "", description: "", vibe: "", audience: "", stage: "", website: "", twitter: "",
};

const WELCOME: ChatMessage = {
  role: "assistant",
  text: "gm ser 👋 I'm **SparkForge** — your AI Marketing Co-Founder for Solana.\n\nTell me about your project and I'll help you ship killer marketing. Set up your **Project Memory** in the left panel for hyper-personalized generations, or just describe your idea and let's cook 🔥\n\nI can generate tweets, Pump.fun descriptions, mascots, launch announcements, tokenomics narratives, Discord blasts, and much more.",
  assets: [],
  timestamp: Date.now(),
};

export function useSparkForge() {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [allAssets, setAllAssets] = useState<GeneratedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", text: text.trim(), assets: [], timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStreamBuffer("");

    // Build history for API (exclude welcome message assets)
    const history = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.role === "assistant"
        ? m.text + (m.assets.length > 0
            ? "\n\n" + m.assets.map(a => `[ASSET: ${a.type}]\n${a.content}\n[/ASSET]`).join("\n\n")
            : "")
        : m.text,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, project }),
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

      setAllAssets(prev => [...assets, ...prev]);
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "Network error ser 😔 Check your connection and try again.",
          assets: [],
          timestamp: Date.now(),
        }]);
      }
    } finally {
      setLoading(false);
      setStreamBuffer("");
    }
  }, [messages, loading, project]);

  const deleteAsset = useCallback((id: string) => {
    setAllAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAssets = useCallback(() => setAllAssets([]), []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setStreamBuffer("");
  }, []);

  return {
    project, setProject,
    messages, allAssets,
    loading, streamBuffer,
    sendMessage, deleteAsset, clearAssets, stopGeneration,
  };
}
