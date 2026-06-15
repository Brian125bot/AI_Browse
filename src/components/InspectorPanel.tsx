import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Layout, 
  Terminal, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Link2, 
  FileText, 
  History as HistoryIcon,
  Globe,
  PlusCircle,
  BookMarked,
  Camera,
  Trash2,
  Split,
  Database,
  RefreshCw
} from "lucide-react";
import { PageAnalysis, AiEmulation, SavedBookmark, PageHistoryItem, BrowserMode, ViewportSnapshot } from "../types";

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
}

type TabType = "ai-review" | "structure" | "markdown" | "bookmarks" | "cache";

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
  onRefresh
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ai-review");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Simple Caching DB state management
  const [cacheStats, setCacheStats] = useState<{
    proxyCount: number;
    analyzeCount: number;
    aiEmuCount: number;
    list: { url: string; type: string; size: number; createdAt: number }[];
  } | null>(null);
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

  const handleCopyCode = () => {
    if (aiEmulation?.reconstructedCode) {
      navigator.clipboard.writeText(aiEmulation.reconstructedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyMarkdown = () => {
    if (analysis?.sampleText) {
      navigator.clipboard.writeText(analysis.sampleText);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900 border-l border-slate-800 flex flex-col h-full text-slate-300">
      {/* Tabs list menu */}
      <div className="grid grid-cols-5 border-b border-slate-800 text-[10px] sm:text-xs font-semibold bg-slate-950/50">
        <button
          onClick={() => setActiveTab("ai-review")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === "ai-review"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Review</span>
        </button>

        <button
          onClick={() => setActiveTab("structure")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === "structure"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Structure</span>
        </button>

        <button
          onClick={() => setActiveTab("markdown")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === "markdown"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Markdown</span>
        </button>

        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === "bookmarks"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => setActiveTab("cache")}
          className={`py-3 px-0.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === "cache"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          title="Simple JSON File Database Cache manager"
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Cache DB</span>
        </button>
      </div>

      {/* Pane view container space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "ai-review" && (
          <div className="space-y-5 animate-fade-in">
            {/* Header branding block */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-wider text-slate-500">AI Emulation Status</span>
                {aiEmulation ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">READY</span>
                ) : (
                  <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">WAITING</span>
                )}
              </div>
              {aiEmulation ? (
                <>
                  <h3 className="text-lg font-bold text-slate-100 font-display">{aiEmulation.siteTitle}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{aiEmulation.brandDescription}</p>

                  {/* Brand colors list */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5">Detected Color Palette</span>
                    <div className="flex flex-wrap gap-2">
                      {aiEmulation.extractedBrandColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800 text-[10px] font-mono">
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-slate-750" 
                            style={{ backgroundColor: color.startsWith("#") ? color : "#3b82f6" }}
                          />
                          <span className="text-slate-400">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Globe className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
                  <p className="text-slate-400 text-xs">Run a high-fidelity AI Emulation session to critique style patterns, extract palettes, and rebuild custom Tailwind code views.</p>
                  <button
                    onClick={onTriggerAiEmu}
                    disabled={isLoadingAi}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold py-2 px-4 rounded-lg text-xs text-slate-950 transition-all shadow-md hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isLoadingAi ? "Synthesizing Emulation..." : "Generate AI High-Fidelity Mockup"}
                  </button>
                </div>
              )}
            </div>

            {/* Design Review block */}
            {aiEmulation && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">Expert Design Critique</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-line">{aiEmulation.designReview}</p>
                </div>

                {/* Code viewport container */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-850 bg-slate-900/60">
                    <div className="flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[11px] font-mono font-semibold text-slate-400">Reconstructed Code (HTML/Tailwind)</span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-slate-500 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                    {aiEmulation.reconstructedCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "structure" && (
          <div className="space-y-4 animate-fade-in bg-transparent">
            {analysis ? (
              <div className="space-y-4">
                {/* Structure stats overview banner */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Headings</span>
                    <span className="text-lg font-bold text-slate-200">{analysis.headings.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Links</span>
                    <span className="text-lg font-bold text-slate-200">{analysis.links.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Images</span>
                    <span className="text-lg font-bold text-slate-200">{analysis.images.length}</span>
                  </div>
                </div>

                {/* Headings component listing */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <h4 className="text-xs font-semibold text-slate-300">DOM Headings Architecture</h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {analysis.headings.length > 0 ? (
                      analysis.headings.map((h, i) => (
                        <div key={i} className="flex gap-2 items-start bg-slate-950/50 p-2 rounded-lg border border-slate-850">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                            h.tag === "H1" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            h.tag === "H2" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          }`}>{h.tag}</span>
                          <span className="text-xs text-slate-400 leading-tight">{h.text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-2 text-center">No headings extracted from this site.</p>
                    )}
                  </div>
                </div>

                {/* Outgoing links mapping list */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                    <h4 className="text-xs font-semibold text-slate-300">Absolute Outbound Map</h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 my-1 pr-1">
                    {analysis.links.length > 0 ? (
                      analysis.links.map((lnk, i) => (
                        <div key={i} className="bg-slate-950/50 p-2 rounded-lg border border-slate-850 space-y-1 text-xs">
                          <span className="text-slate-300 font-medium block leading-tight truncate">{lnk.text}</span>
                          <span className="text-[10px] font-mono text-cyan-500 bg-slate-900 border border-slate-80/50 px-1 py-0.5 rounded truncate block">{lnk.href}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-2 text-center">No hyperlinks found in DOM structure.</p>
                    )}
                  </div>
                </div>

                {/* Extracted static asset files */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <h4 className="text-xs font-semibold text-slate-300">Static Images extracted</h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {analysis.images.length > 0 ? (
                      analysis.images.map((img, i) => (
                        <div key={i} className="flex gap-2 items-center bg-slate-950/50 p-2 rounded-lg border border-slate-850 text-[10px] font-mono">
                          <ImageIcon className="w-4 h-4 text-slate-600 shrink-0" />
                          <span className="text-slate-400 truncate flex-1">{img}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-2 text-center">No image sources identified.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 italic text-xs">
                Enter a target URL and navigate to pull direct DOM structure.
              </div>
            )}
          </div>
        )}

        {activeTab === "markdown" && (
          <div className="space-y-4 animate-fade-in">
            {analysis ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Cleaned Text & Markdown scraper</span>
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-md text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    {copiedMarkdown ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied PlainText</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy PlainText</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs leading-relaxed max-h-96 overflow-y-auto font-mono text-slate-400 whitespace-pre-wrap select-all select-text">
                  {analysis.sampleText || "Empty body or scrapable plain text."}
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-500">
                  The PlainText is dynamically crawled, stripping raw script code chunks, query parameters, style sheets, and CSS blocks. Suitable for AI training prompts.
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 italic text-xs">
                Empty plain text outline folder. Connect standard address node to scrap values.
              </div>
            )}
          </div>
        )}

        {activeTab === "bookmarks" && (
          <div className="space-y-5 animate-fade-in">
            {/* Folder panel listing bookmarks */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-amber-400" />
                <span>My Bookmarked emulations ({bookmarks.length})</span>
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {bookmarks.length > 0 ? (
                  bookmarks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onLoadBookmark(b.url)}
                      className="w-full text-left bg-slate-950/40 hover:bg-slate-950/90 border border-slate-850 hover:border-slate-700/80 p-2.5 rounded-xl transition-all cursor-pointer flex gap-2 items-center text-xs group"
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
                  <p className="text-[11px] text-slate-500 italic py-4 text-center">Empty favorites list. Tap the Bookmark icon next to URL address bar.</p>
                )}
              </div>
            </div>

            {/* Viewport Capture Snapshots list */}
            <div className="space-y-3 pt-3 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
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
                      className="group relative bg-slate-950/40 hover:bg-slate-950 border border-slate-850 p-2 rounded-xl transition-all flex items-center gap-2.5 text-xs"
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
                      
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-200 block truncate leading-tight" title={s.title}>
                          {s.title}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500 truncate block leading-none select-all" title={s.url}>
                          {s.url}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
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
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-rose-500/15 hover:border-rose-500/25 text-slate-400 hover:text-rose-450 transition-colors shrink-0 cursor-pointer"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-2 text-center">No snapshots stored yet. Click "Capture Viewport" above to take native emulator snaps.</p>
                )}
              </div>
            </div>

            {/* Browser timeline history registry entries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <HistoryIcon className="w-4 h-4 text-cyan-400" />
                  <span>Timeline Logging Registry</span>
                </span>
                {history.length > 0 && (
                  <button 
                    onClick={onClearHistory}
                    className="text-[10px] text-slate-500 hover:text-red-400 font-semibold"
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
                      className="w-full text-left bg-slate-950/40 hover:bg-slate-950/90 border border-slate-850 p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <div className={`p-1.5 rounded-md ${
                        h.mode === BrowserMode.AI_EMULATION 
                          ? "bg-purple-500/10 text-purple-400" 
                          : "bg-cyan-500/10 text-cyan-400"
                      } shrink-0`}>
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="font-medium text-slate-300 truncate block leading-tight">{h.title}</span>
                        <span className="font-mono text-[9px] text-slate-500 truncate block leading-none">{h.url}</span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-600 block shrink-0">{h.timestamp}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-4 text-center">No recent navigation records.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cache" && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Database header block */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Database Engine Status</span>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">ONLINE</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-display">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>cache-db.json</span>
                </h3>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                  A simple JSON-file server side database. All crawled and visual emulation assets are cached locally to ensure near zero network latency on future requests.
                </p>
              </div>

              {/* Force refresh info with trigger button */}
              {onRefresh && (
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[10px]">Stale records? Reload to bypass cache:</span>
                  <button
                    onClick={onRefresh}
                    className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 font-sans font-bold text-[10px] rounded leading-none transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span>FORCE BYPASS</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stat figures */}
            {cacheStats ? (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                  <span className="text-slate-500 block uppercase">HTML COPIES</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5 block">{cacheStats.proxyCount}</span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                  <span className="text-slate-500 block uppercase">SCAN RUNS</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5 block">{cacheStats.analyzeCount}</span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                  <span className="text-slate-500 block uppercase">AI MOCKUPS</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5 block">{cacheStats.aiEmuCount}</span>
                </div>
              </div>
            ) : (
              <div className="h-12 bg-slate-950/40 animate-pulse rounded-lg border border-slate-850" />
            )}

            {/* Cache directory listing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-xs font-semibold text-slate-300">Database Index Directory</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {cacheStats?.list.length || 0} files indexed
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {cacheStats && cacheStats.list.length > 0 ? (
                  cacheStats.list.map((item, idx) => {
                    const uniqueKey = `${item.url}-${item.type}`;
                    const isDeleting = deletingKey === uniqueKey;
                    return (
                      <div
                        key={idx}
                        className="p-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between gap-3 text-[11px]"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <span className="font-mono text-cyan-400 block truncate text-left" title={item.url}>
                            {item.url}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500 font-mono">
                            <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded font-bold uppercase text-[8px] text-slate-400">
                              {item.type}
                            </span>
                            <span>{(item.size / 1024).toFixed(1)} KB</span>
                            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteCache(item.url, item.type)}
                          disabled={isDeleting}
                          className="p-1 px-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/25 text-slate-400 hover:text-rose-455 rounded transition-colors cursor-pointer shrink-0"
                          title="Purge custom cached file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : cacheStats ? (
                  <p className="text-[11px] text-slate-500 italic py-4 text-center">Cache is empty. Visit pages to index entries.</p>
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-4 text-center">Loading database registry cache...</p>
                )}
              </div>
            </div>

            {/* Clear all database keys button with custom double flow */}
            {cacheStats && cacheStats.list.length > 0 && (
              <div className="pt-3 border-t border-slate-800/60">
                {confirmWipe ? (
                  <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 space-y-2.5 text-center">
                    <span className="text-[11px] font-semibold text-rose-300 block">Confirm complete cache wipe?</span>
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={handleClearAllCache}
                        disabled={isClearingAll}
                        className="bg-rose-600 hover:bg-rose-700 font-semibold px-4 py-1.5 rounded-lg text-slate-100 disabled:opacity-50 cursor-pointer"
                      >
                        {isClearingAll ? "Wiping..." : "Yes, Purge Database"}
                      </button>
                      <button
                        onClick={() => setConfirmWipe(false)}
                        className="bg-slate-800 hover:bg-slate-700 font-semibold px-4 py-1.5 rounded-lg text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmWipe(true)}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 hover:text-rose-350 font-bold rounded-xl transition-all cursor-pointer text-center block"
                  >
                    Purge Complete Database Cache
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
