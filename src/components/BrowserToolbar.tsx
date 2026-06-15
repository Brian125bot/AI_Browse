import React, { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Globe, 
  Sparkles, 
  ChevronDown,
  Bookmark,
  Search,
  BookOpen,
  Maximize2,
  Minimize2
} from "lucide-react";
import { BrowserMode, ViewportSize } from "../types";

interface BrowserToolbarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
  onGoHome: () => void;
  mode: BrowserMode;
  onModeChange: (mode: BrowserMode) => void;
  viewportSize: ViewportSize;
  onViewportChange: (size: ViewportSize) => void;
  isLoading: boolean;
  onAddBookmark: () => void;
  isBookmarked: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function BrowserToolbar({
  currentUrl,
  onNavigate,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onRefresh,
  onGoHome,
  mode,
  onModeChange,
  viewportSize,
  onViewportChange,
  isLoading,
  onAddBookmark,
  isBookmarked,
  selectedModel,
  onModelChange,
  isFullscreen,
  onToggleFullscreen
}: BrowserToolbarProps) {
  const [inputUrl, setInputUrl] = useState(currentUrl);

  React.useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  const isSearchQuery = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return false;
    if (trimmed.includes(" ")) return true;
    if (/^https?:\/\//i.test(trimmed)) return false;
    if (!trimmed.includes(".")) return true;
    const urlPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}(:\d+)?(\/.*)?$/;
    return !urlPattern.test(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onNavigate(inputUrl.trim());
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-md">
      {/* simulated OS controls & Nav History navigation */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* simulated mac OS bullets */}
        <div className="hidden lg:flex gap-1.5 mr-1">
          <div className="w-3 h-3 rounded-full bg-rose-500/90" />
          <div className="w-3 h-3 rounded-full bg-amber-500/90" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-md transition-colors ${
              canGoBack 
                ? "text-slate-200 hover:bg-slate-700/80" 
                : "text-slate-600 cursor-not-allowed"
            }`}
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-md transition-colors ${
              canGoForward 
                ? "text-slate-200 hover:bg-slate-700/80" 
                : "text-slate-600 cursor-not-allowed"
            }`}
            title="Go Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md text-slate-200 hover:bg-slate-700/80 transition-colors"
            title="Refresh Page"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={onGoHome}
            className="p-1.5 rounded-md text-slate-200 hover:bg-slate-700/80 transition-colors"
            title="Dashboard Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* emulation resolution select panel */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
          <button
            onClick={() => onViewportChange("desktop")}
            className={`p-1.5 rounded-md transition-all ${
              viewportSize === "desktop"
                ? "bg-cyan-500 text-slate-950 font-medium scale-105"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
            title="Desktop View (Full Width)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewportChange("tablet")}
            className={`p-1.5 rounded-md transition-all ${
              viewportSize === "tablet"
                ? "bg-cyan-500 text-slate-950 font-medium scale-105"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewportChange("mobile")}
            className={`p-1.5 rounded-md transition-all ${
              viewportSize === "mobile"
                ? "bg-cyan-500 text-slate-950 font-medium scale-105"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />
          <button
            onClick={onToggleFullscreen}
            className={`p-1.5 rounded-md transition-all ${
              isFullscreen
                ? "bg-amber-500 text-slate-950 font-medium scale-105 animate-pulse"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
            title={isFullscreen ? "Minimize Reader view" : "Maximize Full Screen Reader"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Address Bar */}
      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-2xl px-1">
        <div className="relative flex items-center justify-between bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus-within:border-cyan-500 rounded-lg shadow-inner transition-colors">
          <div className="flex items-center pl-3 pr-2 text-slate-500">
            {isSearchQuery(inputUrl) ? (
              <Search className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 py-1.5 text-sm focus:outline-none focus:ring-0 font-mono select-all"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL to browse or search query (e.g. climate change)"
          />
          <div className="flex items-center pr-1.5 gap-1.5">
            <button
              type="button"
              onClick={onAddBookmark}
              className={`p-1.5 rounded-md transition-colors ${
                isBookmarked 
                  ? "text-amber-400" 
                  : "text-slate-500 hover:text-slate-200"
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
            >
              <Bookmark className="w-4 h-4 fill-current text-current" />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-semibold px-3 py-1 rounded-md text-xs transition-all active:scale-95"
            >
              {isSearchQuery(inputUrl) ? "Search" : "Go"}
            </button>
          </div>
        </div>
      </form>

      {/* Emulation Engine Modes */}
      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl w-full md:w-auto justify-center">
        <select 
             value={selectedModel}
             onChange={(e) => onModelChange(e.target.value)}
             className="bg-slate-900 text-slate-300 text-[10px] py-1 px-1.5 rounded-lg border border-slate-700 outline-none hover:border-slate-600 cursor-pointer"
           >
             <option value="gemini-3.1-flash-lite">Gemini 3.1 flash lite</option>
             <option value="gemini-2.5-flash">Gemini 2.5 flash</option>
             <option value="gemini-3.5-flash">Gemini 3.5 flash</option>
        </select>
        <button
          onClick={() => onModeChange(BrowserMode.PROXY)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === BrowserMode.PROXY
              ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Live Sandbox
        </button>

        <button
          onClick={() => onModeChange(BrowserMode.AI_EMULATION)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === BrowserMode.AI_EMULATION
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          AI Emulation
        </button>

        <button
          onClick={() => onModeChange(BrowserMode.READABILITY)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === BrowserMode.READABILITY
              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Readability Mode (distraction-free clean reading view)"
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          Readability
        </button>
      </div>
    </div>
  );
}
