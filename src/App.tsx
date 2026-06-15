import React, { useState, useEffect, useRef } from "react";
import { 
  Globe, 
  Sparkles, 
  ArrowUpRight, 
  Github,
  Camera,
  Split,
  BookOpen
} from "lucide-react";
import { BrowserMode, SavedBookmark } from "./types";
import BrowserToolbar from "./components/BrowserToolbar";
import InspectorPanel from "./components/InspectorPanel";
import SnapshotCompare from "./components/SnapshotCompare";

// Import custom services
import { useBrowserMode } from "./services/useBrowserMode";
import { useSnapshots } from "./services/useSnapshots";
import { useBrowserToolbarState } from "./services/useBrowserToolbarState";

// Pre-seeded popular sample web presets
const INITIAL_PRESETS: SavedBookmark[] = [
  {
    id: "preset-hn",
    title: "Hacker News",
    url: "https://news.ycombinator.com",
    createdDate: "2026-06-14"
  },
  {
    id: "preset-wiki",
    title: "Wikipedia Main Page",
    url: "https://en.wikipedia.org/wiki/Main_Page",
    createdDate: "2026-06-14"
  },
  {
    id: "preset-stripe",
    title: "Stripe UI Landing",
    url: "https://stripe.com",
    createdDate: "2026-06-14"
  },
  {
    id: "preset-github",
    title: "GitHub Portal",
    url: "https://github.com",
    createdDate: "2026-06-14"
  }
];

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 1. Browser mode management and synthesizers logic service
  const browserMode = useBrowserMode();

  // 2. Toolbar & Navigation state management service
  const navigation = useBrowserToolbarState({
    mode: browserMode.mode,
    setMode: browserMode.setMode,
    triggerAiEmulation: browserMode.triggerAiEmulation,
    triggerReadability: browserMode.triggerReadability,
    setAiEmulation: browserMode.setAiEmulation,
    setReadabilityData: browserMode.setReadabilityData,
    iframeRef
  });

  // 3. Captures & Visual snapshots history comparison service
  const snapshotService = useSnapshots();

  // 4. Stealth Shield and UA control states
  const [shieldCanvas, setShieldCanvas] = useState<boolean>(() => {
    return localStorage.getItem("shield_canvas") !== "false";
  });
  const [shieldWebRTC, setShieldWebRTC] = useState<boolean>(() => {
    return localStorage.getItem("shield_webrtc") !== "false";
  });
  const [shieldAudio, setShieldAudio] = useState<boolean>(() => {
    return localStorage.getItem("shield_audio") !== "false";
  });
  const [shieldWebdriver, setShieldWebdriver] = useState<boolean>(() => {
    return localStorage.getItem("shield_webdriver") !== "false";
  });
  const [activeUserAgent, setActiveUserAgent] = useState<string>(() => {
    return localStorage.getItem("active_user_agent") || "chrome-windows";
  });

  // Persistent storage for shield states
  useEffect(() => {
    localStorage.setItem("shield_canvas", String(shieldCanvas));
  }, [shieldCanvas]);

  useEffect(() => {
    localStorage.setItem("shield_webrtc", String(shieldWebRTC));
  }, [shieldWebRTC]);

  useEffect(() => {
    localStorage.setItem("shield_audio", String(shieldAudio));
  }, [shieldAudio]);

  useEffect(() => {
    localStorage.setItem("shield_webdriver", String(shieldWebdriver));
  }, [shieldWebdriver]);

  useEffect(() => {
    localStorage.setItem("active_user_agent", activeUserAgent);
  }, [activeUserAgent]);

  // Listen to postMessages from active sandboxed proxy iframes
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      // Safe dynamic relative link handling
      if (event.data && event.data.type === "BROWSER_NAVIGATE" && event.data.url) {
        navigation.handleNavigate(event.data.url);
      } else if (event.data && event.data.type === "TRIGGER_AI_EMULATION" && event.data.url) {
        browserMode.setMode(BrowserMode.AI_EMULATION);
        navigation.handleNavigate(event.data.url, BrowserMode.AI_EMULATION);
      }
    };

    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [navigation.historyStack, navigation.historyIndex, browserMode.mode, navigation.analysis]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* Top simulated Application branding bar */}
      {!navigation.isFullscreen && (
        <header className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Globe className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-100 font-display tracking-tight leading-none block font-semibold">Remote Browser Emulator</span>
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider font-semibold">AI CO-PILOT ACTIVE</span>
            </div>
          </div>

          {/* Live status indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
              <div className={`w-1.5 h-1.5 rounded-full ${navigation.isLoadingMetadata ? "bg-cyan-500 animate-ping" : "bg-emerald-500"}`} />
              <span className="text-[10px] font-mono text-slate-400">Engine Online</span>
            </div>
            
            <a
              href="https://github.com/Brian125bot/AI_Browse#"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:underline transition-colors font-medium"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Developer Space</span>
            </a>
          </div>
        </header>
      )}

      {/* Browser address tools */}
      <BrowserToolbar
        currentUrl={navigation.currentUrl}
        onNavigate={(u) => navigation.handleNavigate(u)}
        canGoBack={navigation.historyIndex > 0}
        canGoForward={navigation.historyIndex < navigation.historyStack.length - 1}
        onGoBack={navigation.handleGoBack}
        onGoForward={navigation.handleGoForward}
        onRefresh={navigation.handleRefresh}
        onGoHome={navigation.handleGoHome}
        mode={browserMode.mode}
        onModeChange={(newMode) => browserMode.handleModeChange(newMode, navigation.currentUrl, navigation.analysis)}
        viewportSize={navigation.viewportSize}
        onViewportChange={navigation.setViewportSize}
        isLoading={navigation.isLoadingMetadata || browserMode.isLoadingAi || browserMode.isLoadingReadability}
        onAddBookmark={navigation.handleAddBookmark}
        isBookmarked={navigation.isBookmarked}
        selectedModel={browserMode.selectedModel}
        onModelChange={browserMode.setSelectedModel}
        isFullscreen={navigation.isFullscreen}
        onToggleFullscreen={() => navigation.setIsFullscreen(!navigation.isFullscreen)}
      />

      {/* Primary Workspace: Viewport Area (Left) + Inspector Panel (Right) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Browser Viewport Simulation */}
        <div className={`flex-1 flex flex-col items-center justify-start bg-slate-950/40 overflow-y-auto pattern-slate transition-all ${
          navigation.isFullscreen ? "p-0" : "p-4 md:p-6"
        }`}>
          
          {/* Quick Sandbox Navigation Presets */}
          {navigation.historyIndex === 0 && navigation.currentUrl === "https://news.ycombinator.com" && (
            <div className="w-full max-w-4xl bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-xs font-mono text-cyan-400 tracking-wider uppercase font-semibold">Web Presets Laboratory</h4>
                <p className="text-slate-400 text-xs mt-0.5 font-sans leading-relaxed">Ready-made destinations to demo live sandbox parsing vs AI mockup synthesis.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {INITIAL_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigation.handleNavigate(p.url, BrowserMode.PROXY)}
                    className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer text-slate-300 transition-all hover:scale-102 flex items-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Viewport frame container size controllers */}
          {!navigation.isFullscreen && (
            <div className="w-full flex justify-between items-center max-w-5xl mb-2 text-slate-500 text-xs px-1 font-mono">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full shrink-0 animate-pulse" />
                <span>Emulated URL: <span className="text-cyan-400 font-bold">{navigation.currentUrl}</span></span>
              </div>
              <span>
                {navigation.viewportSize === "desktop" ? "Desktop (Fluid w-full)" : 
                 navigation.viewportSize === "tablet" ? "Tablet (Fixed 768px)" : "Mobile (Fixed 375px)"}
              </span>
            </div>
          )}

          {/* Simulated Outer Device Border */}
          <div 
            className={`bg-slate-900 shadow-2xl flex flex-col flex-1 transition-all duration-300 ${
              navigation.isFullscreen 
                ? "w-full h-full min-h-screen border-none rounded-none" 
                : "border border-slate-800 rounded-2xl min-h-[500px]" + (
                    navigation.viewportSize === "desktop" ? " w-full max-w-5xl" : 
                    navigation.viewportSize === "tablet" ? " w-[768px]" : " w-[375px]"
                  )
            }`}
          >
            {/* Top Toolbar Line */}
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
                <span className="font-semibold text-slate-400 truncate max-w-[150px] sm:max-w-[200px]" title={navigation.analysis?.title || navigation.currentUrl}>
                  {navigation.analysis?.title || navigation.currentUrl}
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[9px] sm:text-[10px] text-slate-400 bg-slate-900/80 border border-slate-800 px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                  {browserMode.mode === BrowserMode.PROXY ? "SANDBOX MODAL" : "AI SYNTHESISED"}
                </span>

                {/* Captured snapshot version controllers */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => snapshotService.handleCaptureSnapshot(navigation.currentUrl, navigation.analysis, navigation.viewportSize, browserMode.mode)}
                    disabled={snapshotService.isCapturing}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 disabled:opacity-50 font-sans font-bold text-[9px] sm:text-[10px] transition-all cursor-pointer select-none"
                    title="Capture current viewport snapshot container"
                  >
                    <Camera className="w-3 h-3 shrink-0" />
                    <span>{snapshotService.isCapturing ? "CAPTURING..." : "CAPTURE VIEWPORT"}</span>
                  </button>
                  {snapshotService.snapshots.length > 0 && (
                    <button
                      onClick={() => snapshotService.setIsCompareOpen(true)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-500 font-sans font-bold text-[9px] sm:text-[10px] transition-all cursor-pointer select-none"
                      title="Compare visual snapshot history versions"
                    >
                      <Split className="w-3 h-3 shrink-0" />
                      <span>COMPARE ({snapshotService.snapshots.length})</span>
                    </button>
                  )}
                </div>

                <span className="hidden sm:inline">Secure Sandbox: ON</span>
              </div>
            </div>

            {/* Simulated Frame Canvas viewport screen */}
            <div id="renderer-viewport-canvas" className="relative flex-1 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
              
              {/* Flash effect overlay */}
              {snapshotService.flashActive && (
                <div className="absolute inset-0 bg-white/70 z-50 pointer-events-none transition-all duration-350 animate-pulse" />
              )}

              {/* Loader overlay */}
              {(navigation.isLoadingMetadata || browserMode.isLoadingAi || browserMode.isLoadingReadability) && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 font-display">
                      {browserMode.isLoadingReadability 
                        ? "Purifying Content Layout" 
                        : browserMode.isLoadingAi 
                          ? "Generating AI Representation" 
                          : "Crawling Live Target Layout"}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                      {browserMode.isLoadingReadability
                        ? "Gemini text parser is stripping advertisements, cookies, side bars & structuring a gorgeous high-contrast read list..."
                        : browserMode.isLoadingAi 
                          ? "Gemini design modeling is analyzing visual grids, picking brand color ranges, and reconstructing code sheets..."
                          : "Contacting remote server headers, mapping direct hyper-links, and sanitizing document asset structures..."}
                    </p>
                  </div>
                </div>
              )}

              {/* RENDER MODE switcher VIEW */}
              {browserMode.mode === BrowserMode.PROXY ? (
                /* 1. Live Frame Proxy renderer */
                <iframe
                  ref={iframeRef}
                  src={`/api/proxy?url=${encodeURIComponent(navigation.currentUrl)}&shieldCanvas=${shieldCanvas}&shieldWebRTC=${shieldWebRTC}&shieldAudio=${shieldAudio}&shieldWebdriver=${shieldWebdriver}&userAgent=${activeUserAgent}`}
                  title="Web Browser Container Emulator sandbox"
                  className="w-full h-full border-none bg-white font-sans text-slate-900"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : browserMode.mode === BrowserMode.READABILITY ? (
                /* 3. Readability mode Purified display block */
                browserMode.readabilityData ? (
                  <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-10 font-sans">
                    <div className="max-w-3xl mx-auto space-y-6">
                      {/* Top Header stats */}
                      <div className="border-b border-gray-200 dark:border-slate-800 pb-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                            Clean Reader View
                          </span>
                          <span>•</span>
                          <span>{browserMode.readabilityData.wordCount || 0} words</span>
                          <span>•</span>
                          <span className="text-purple-500 font-semibold">{browserMode.readabilityData.readingTime || "3 min read"}</span>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-tight font-serif mt-1">
                          {browserMode.readabilityData.title}
                        </h1>
                        
                        {browserMode.readabilityData.byline && (
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2 italic font-sans text-purple-600 dark:text-purple-400">
                            {browserMode.readabilityData.byline}
                          </p>
                        )}
                      </div>
                      
                      {/* Purified custom rich text injection content body */}
                      <article 
                        className="max-w-none text-[15px] sm:text-base leading-relaxed font-serif space-y-4 tracking-normal text-slate-800 dark:text-slate-200
                          [&>p]:mb-4 [&>p]:leading-relaxed
                          [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-950 dark:[&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-2 [&>h2]:font-serif
                          [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2
                          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ul]:my-4
                          [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>ol]:my-4
                          [&>blockquote]:border-l-4 [&>blockquote]:border-purple-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-600 dark:[&>blockquote]:text-slate-400 [&>blockquote]:my-4"
                        dangerouslySetInnerHTML={{ __html: browserMode.readabilityData.content }}
                      />
                      
                      {/* Page source indicator */}
                      <div className="pt-8 border-t border-gray-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-500 font-mono text-center flex flex-col items-center justify-center gap-1.5">
                        <p>End of article content.</p>
                        <p className="truncate max-w-[90%]">
                          Source URL: <a href={browserMode.readabilityData.sourceUrl || navigation.currentUrl} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">{browserMode.readabilityData.sourceUrl || navigation.currentUrl}</a>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3 bg-slate-950 select-none animate-fade-in">
                    <BookOpen className="w-10 h-10 text-purple-400 animate-bounce" />
                    <h4 className="font-bold text-slate-200">Extract Distraction-Free Article Content</h4>
                    <p className="text-xs max-w-sm leading-relaxed text-slate-400">Strips helper sheets, cookie banners, advertisements, and navigation links. Yields a clean paper-like display.</p>
                    <button
                      onClick={() => browserMode.triggerReadability(navigation.currentUrl)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold py-2 px-5 rounded-xl text-xs text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Enable Reader View
                    </button>
                  </div>
                )
              ) : (
                /* 2. Gemini High-Fidelity Representation block */
                browserMode.aiEmulation ? (
                  <iframe
                    title="AI Simulated Visual Mockup"
                    srcDoc={browserMode.getAiMockSrcDoc()}
                    className="w-full h-full border-none bg-white text-slate-900 font-sans"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3 bg-slate-950 select-none">
                    <Sparkles className="w-10 h-10 text-cyan-400 animate-bounce" />
                    <h4 className="font-bold text-slate-200">Reconstruct Page in High Fidelity</h4>
                    <p className="text-xs max-w-sm leading-relaxed text-slate-400">Let the intelligence model scrape current details and code a premium Tailwind-driven visual representation of this site.</p>
                    <button
                      onClick={() => browserMode.triggerAiEmulation(navigation.currentUrl, navigation.analysis)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold py-2 px-5 rounded-xl text-xs text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Instruct AI Synthesis Now
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Page Inspector Details */}
        {!navigation.isFullscreen && (
          <aside className="hidden lg:block w-96 shrink-0 h-full border-l border-slate-800 shadow-xl bg-slate-900">
            <InspectorPanel
              analysis={navigation.analysis}
              aiEmulation={browserMode.aiEmulation}
              isLoadingAi={browserMode.isLoadingAi}
              onTriggerAiEmu={() => browserMode.triggerAiEmulation(navigation.currentUrl, navigation.analysis)}
              bookmarks={navigation.bookmarks}
              history={navigation.historyStack}
              onLoadBookmark={navigation.handleLoadBookmark}
              onClearHistory={navigation.handleClearHistory}
              snapshots={snapshotService.snapshots}
              onClearSnapshot={snapshotService.handleClearSnapshot}
              onOpenComparator={() => snapshotService.setIsCompareOpen(true)}
              onRefresh={navigation.handleRefresh}
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
          </aside>
        )}
      </div>

      {/* Visual compare view modal overlay */}
      {snapshotService.isCompareOpen && (
        <SnapshotCompare
          snapshots={snapshotService.snapshots}
          onClose={() => snapshotService.setIsCompareOpen(false)}
          onClearSnapshot={snapshotService.handleClearSnapshot}
        />
      )}
    </div>
  );
}
