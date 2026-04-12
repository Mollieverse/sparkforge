"use client";

import { Header } from "@/components/Header";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { AssetsPanel } from "@/components/AssetsPanel";
import { useSparkForge } from "@/hooks/useSparkForge";

export default function Home() {
  const {
    project, setProject,
    messages, allAssets,
    loading, streamBuffer,
    sendMessage, deleteAsset, clearAssets, stopGeneration,
  } = useSparkForge();

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#0A0A1F" }}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar project={project} onSave={setProject} />
        <ChatPanel
          messages={messages}
          loading={loading}
          streamBuffer={streamBuffer}
          onSend={sendMessage}
          onStop={stopGeneration}
          projectName={project.name}
        />
        <AssetsPanel
          assets={allAssets}
          onDelete={deleteAsset}
          onClearAll={clearAssets}
        />
      </div>
    </div>
  );
}
