import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Layout, 
  FileText, 
  History as HistoryIcon,
  Globe,
  BookMarked,
  Camera,
  Trash2,
  Split,
  Database,
  Shield
} from "lucide-react";
import { PageAnalysis, AiEmulation, SavedBookmark, PageHistoryItem, BrowserMode, ViewportSnapshot } from "../types";

// Import modular sub-panels
import ShieldsPanel from "./inspector/ShieldsPanel";
import AiReviewPanel from "./inspector/AiReviewPanel";
import StructurePanel from "./inspector/StructurePanel";
import MarkdownPanel from "./inspector/MarkdownPanel";
import CacheDbPanel from "./inspector/CacheDbPanel";

interface InspectorPanelProps {
  analysis: PageAnalysis | null;
  aiEmulation: AiEmulation | null;
  isLoadingAi: boolean;
  onTriggerAiEmu: () => void;
  bookmarks: SavedBookmark[];
  history: PageHistoryItem[];
  onLoadBookmark: (url: string) => void;
  onClearHistory: () => void;
  snapshots: ViewportSnapshot[];
  onClearSnapshot: (id: string) => void;
  onOpenComparator: () => void;
  onRefresh?: () => void;
  
  // Stealth Shield and UA control states
  shieldCanvas: boolean;
  setShieldCanvas: (val: boolean) => void;
  shieldWebRTC: boolean;
  setShieldWebRTC: (val: boolean) => void;
  shieldAudio: boolean;
  setShieldAudio: (val: boolean) => void;
  shieldWebdriver: boolean;
  setShieldWebdriver: (val: boolean) => void;
  activeUserAgent: string;
  setActiveUserAgent: (val: string) => void;
}

type TabType = "ai-review" | "structure" | "markdown" | "bookmarks" | "cache" | "shields";

interface CacheItem {
  url: string;
  type: string;
  size: number;
  createdAt: number;
}

interface CacheStats {
  proxyCount: number;
  analyzeCount: number;
  aiEmuCount: number;
  list: CacheItem[];
}

export default function InspectorPanel({
  analysis,
  aiEmulation,
  isLoadingAi,
  onTriggerAiEmu,
  bookmarks,
  history,
  onLoadBookmark,
  onClearHistory,
  snapshots,
  onClearSnapshot,
  onOpenComparator,
  onRefresh,
  shieldCanvas,
  setShieldCanvas,
  shieldWebRTC,
  setShieldWebRTC,
  shieldAudio,
  setShieldAudio,
  shieldWebdriver,
  setShieldWebdriver,
  activeUserAgent,
  setActiveUserAgent
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("shields");
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const fetchCacheStats = async () => {
    try {
      const res = await fetch("/api/cache/stats");
      if (res.ok) {
        const data = await res.json();
        setCacheStats(data);
      }
    } catch (e) {
      console.warn("Error loading cache stats:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "cache") {
      fetchCacheStats();
      setConfirmWipe(false);
    }
  }, [activeTab, analysis, aiEmulation]);

  const handleDeleteCache = async (url: string, rawType: string) => {
    let type: "proxy" | "analyze" | "aiEmu" = "proxy";
    if (rawType === "Structural Scan") type = "analyze";
    if (rawType === "AI Emulated Page") type = "aiEmu";

    const uniqueKey = `${url}-${rawType}`;
    setDeletingKey(uniqueKey);
    try {
      const res = await fetch("/api/cache/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type })
      });
      if (res.ok) {
        await fetchCacheStats();
      }
    } catch (e) {
      console.warn("Failed to delete entry:", e);
    } finally {
      setDeletingKey(null);
    }
  };

  const handleClearAllCache = async () => {
    setIsClearingAll(true);
    try {
      const res = await fetch("/api/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        await fetchCacheStats();
        setConfirmWipe(false);
      }
    } catch (e) {
      console.warn("Failed to clear database cache:", e);
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="bg-slate-900 border-l border-slate-800 flex flex-col h-full text-slate-300 font-sans">
      {/* Tabs list menu */}
      <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-slate-800 text-[10px] sm:text-xs font-semibold bg-slate-950/50 select-none">
        <button
          onClick={() => setActiveTab("shields")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "shields"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          title="Privacy Shields & Anti-Fingerprinting Controls"
        >
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Shields</span>
        </button>

        <button
          onClick={() => setActiveTab("ai-review")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "ai-review"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>AI Review</span>
        </button>

        <button
          onClick={() => setActiveTab("structure")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "structure"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layout className="w-4 h-4 shrink-0" />
          <span>Structure</span>
        </button>

        <button
          onClick={() => setActiveTab("markdown")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "markdown"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Markdown</span>
        </button>

        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "bookmarks"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookMarked className="w-4 h-4 shrink-0" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => setActiveTab("cache")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "cache"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          title="Simple JSON File Database Cache manager"
        >
          <Database className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Cache DB</span>
        </button>
      </div>

      {/* Pane view container space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "shields" && (
          <ShieldsPanel
            shieldCanvas={shieldCanvas}
            setShieldCanvas={setShieldCanvas}
            shieldWebRTC={shieldWebRTC}
            setShieldWebRTC={setShieldWebRTC}
            shieldAudio={shieldAudio}
            setShieldAudio={setShieldAudio}
            shieldWebdriver={shieldWebdriver}
            setShieldWebdriver={setShieldWebdriver}
            activeUserAgent={activeUserAgent}
            setActiveUserAgent={setActiveUserAgent}
          />
        )}

        {activeTab === "ai-review" && (
          <AiReviewPanel
            aiEmulation={aiEmulation}
            isLoadingAi={isLoadingAi}
            onTriggerAiEmu={onTriggerAiEmu}
          />
        )}

        {activeTab === "structure" && (
          <StructurePanel analysis={analysis} />
        )}

        {activeTab === "markdown" && (
          <MarkdownPanel analysis={analysis} />
        )}

        {activeTab === "bookmarks" && (
          <div className="space-y-5 animate-fade-in text-xs">
            {/* Bookmarks Section */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 select-none">
                <BookMarked className="w-4 h-4 text-amber-400 shrink-0" />
                <span>My Bookmarked Emulations ({bookmarks.length})</span>
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {bookmarks.length > 0 ? (
                  bookmarks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onLoadBookmark(b.url)}
                      className="w-full text-left bg-slate-950/40 hover:bg-slate-950/90 border border-slate-800 hover:border-slate-700/80 p-2.5 rounded-xl transition-all cursor-pointer flex gap-2 items-center text-xs group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold">
                        {b.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-200 block truncate leading-snug">{b.title}</span>
                        <span className="font-mono text-[10px] text-slate-500 truncate block leading-none">{b.url}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-4 text-center select-none">Empty favorites list. Tap the Bookmark icon next to URL address bar.</p>
                )}
              </div>
            </div>

            {/* Viewport Capture Snapshots list */}
            <div className="space-y-3 pt-3 border-t border-slate-800/60">
              <div className="flex items-center justify-between select-none">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Captured Snapshots ({snapshots.length})</span>
                </span>
                {snapshots.length > 0 && (
                  <button
                    onClick={onOpenComparator}
                    className="text-[10px] bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-bold px-2 py-0.5 rounded border border-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Split className="w-3 h-3" />
                    <span>Compare Layouts</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {snapshots.length > 0 ? (
                  snapshots.map((s) => (
                    <div
                      key={s.id}
                      className="group relative bg-slate-950/40 hover:bg-slate-900 border border-slate-800 p-2 rounded-xl transition-all flex items-center gap-2.5 text-xs"
                    >
                      {/* Thumbnail wrapper */}
                      <div className="w-12 h-10 rounded bg-slate-900 overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
                        <img 
                          src={s.imageData} 
                          alt={s.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 text-left">
                        <span className="font-semibold text-slate-200 block truncate leading-tight" title={s.title}>
                          {s.title}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500 truncate block leading-none select-all" title={s.url}>
                          {s.url}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="bg-slate-900 border border-slate-800 px-1 rounded text-[8px] font-mono text-cyan-400 font-bold uppercase shrink-0">
                            {s.viewportSize}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 truncate">
                            {s.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Hover action delete button */}
                      <button
                        onClick={() => onClearSnapshot(s.id)}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-rose-500/15 hover:border-rose-500/25 text-slate-400 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-2 text-center select-none">No snapshots stored yet. Click "Capture Viewport" above to take native emulator snaps.</p>
                )}
              </div>
            </div>

            {/* Browser timeline history registry entries */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between select-none">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <HistoryIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Timeline Logging Registry</span>
                </span>
                {history.length > 0 && (
                  <button 
                    onClick={onClearHistory}
                    className="text-[10px] text-slate-500 hover:text-red-400 font-semibold cursor-pointer"
                  >
                    Reset Logs
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.length > 0 ? (
                  history.map((h, idx) => (
                    <button
                      key={idx}
                      onClick={() => onLoadBookmark(h.url)}
                      className="w-full text-left bg-slate-950/40 hover:bg-slate-950/90 border border-slate-880 p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <div className={`p-1.5 rounded-md ${
                        h.mode === BrowserMode.AI_EMULATION 
                          ? "bg-purple-500/10 text-purple-400" 
                          : "bg-cyan-500/10 text-cyan-400"
                      } shrink-0`}>
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-1 text-left">
                        <span className="font-medium text-slate-300 truncate block leading-tight">{h.title}</span>
                        <span className="font-mono text-[9px] text-slate-500 truncate block leading-none">{h.url}</span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 block shrink-0">{h.timestamp}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-4 text-center select-none">No recent navigation records.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cache" && (
          <CacheDbPanel
            cacheStats={cacheStats}
            deletingKey={deletingKey}
            confirmWipe={confirmWipe}
            setConfirmWipe={setConfirmWipe}
            isClearingAll={isClearingAll}
            onRefresh={onRefresh}
            onDeleteCache={handleDeleteCache}
            onClearAllCache={handleClearAllCache}
          />
        )}
      </div>
    </div>
  );
}
