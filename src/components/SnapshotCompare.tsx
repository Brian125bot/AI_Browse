import React, { useState } from "react";
import { 
  X, 
  Columns, 
  Split, 
  Trash2, 
  Calendar, 
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Sparkles,
  Globe,
  Info
} from "lucide-react";
import { ViewportSnapshot } from "../types";

interface SnapshotCompareProps {
  snapshots: ViewportSnapshot[];
  onClose: () => void;
  onClearSnapshot: (id: string) => void;
}

export default function SnapshotCompare({
  snapshots,
  onClose,
  onClearSnapshot
}: SnapshotCompareProps) {
  const [leftId, setLeftId] = useState<string>(snapshots[0]?.id || "");
  const [rightId, setRightId] = useState<string>(snapshots[1]?.id || snapshots[0]?.id || "");
  const [compareMode, setCompareMode] = useState<"side-by-side" | "overlay">("side-by-side");
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const leftSnapshot = snapshots.find(s => s.id === leftId);
  const rightSnapshot = snapshots.find(s => s.id === rightId);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  if (snapshots.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center text-slate-300">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md space-y-4">
          <Info className="w-12 h-12 text-cyan-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-100 font-display">No snapshots captured yet</h3>
          <p className="text-xs text-slate-400">Capture a snapshot of any viewport view using the camera capture icon first to trigger comparisons.</p>
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700/80 text-white font-semibold py-2 px-6 rounded-lg text-xs"
          >
            Close Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col overflow-hidden text-slate-300">
      {/* Top action header bar */}
      <header className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400">
            <Split className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200 font-display leading-tight">Visual Snapshot Comparator</h2>
            <p className="text-[10px] font-mono text-slate-500 leading-none">REAL-TIME PIXEL COMPARISON GRAPH</p>
          </div>
        </div>

        {/* View togglers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 p-1 rounded-xl">
            <button
              onClick={() => setCompareMode("side-by-side")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                compareMode === "side-by-side"
                  ? "bg-slate-800 text-cyan-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Side-by-Side
            </button>
            <button
              onClick={() => setCompareMode("overlay")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                compareMode === "overlay"
                  ? "bg-slate-800 text-cyan-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Interactive Swipe Slider
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-100 transition-all border border-slate-750"
            title="Exit Comparator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Snapshot picker panel */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-inner">
        {/* Left Side Snapshot selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-cyan-500 font-bold uppercase tracking-wider block">Viewport Version A (Left/Base)</label>
          <div className="flex gap-2">
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="bg-slate-950 border border-slate-755 text-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 flex-1"
            >
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.viewportSize.toUpperCase()}] {s.title} ({s.timestamp})
                </option>
              ))}
            </select>
            {leftSnapshot && (
              <button
                onClick={() => onClearSnapshot(leftSnapshot.id)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-450 hover:text-white transition-all shrink-0"
                title="Delete Snapshot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side Snapshot selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-cyan-500 font-bold uppercase tracking-wider block">Viewport Version B (Right/Overlay)</label>
          <div className="flex gap-2">
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="bg-slate-950 border border-slate-755 text-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 flex-1"
            >
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.viewportSize.toUpperCase()}] {s.title} ({s.timestamp})
                </option>
              ))}
            </select>
            {rightSnapshot && (
              <button
                onClick={() => onClearSnapshot(rightSnapshot.id)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-450 hover:text-white transition-all shrink-0"
                title="Delete Snapshot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main comparative presentation canvas */}
      <div className="flex-1 overflow-auto bg-slate-950 p-6 flex flex-col items-center justify-center">
        {leftSnapshot && rightSnapshot ? (
          compareMode === "side-by-side" ? (
            /* Side by side columns view */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
              {/* Left Screen card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-850 flex justify-between items-center text-xs font-mono text-slate-400">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    {leftSnapshot.mode === "AI_EMULATION" ? <Sparkles className="w-3.5 h-3.5 text-purple-400" /> : <Globe className="w-3.5 h-3.5" />}
                    VERSION A
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-500">
                    {leftSnapshot.viewportSize.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 border-b border-slate-850/60 bg-slate-900/60 space-y-1">
                  <h4 className="text-sm font-bold text-slate-200 truncate">{leftSnapshot.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="truncate flex-1 hover:text-cyan-400">{leftSnapshot.url}</span>
                    <span className="shrink-0">{leftSnapshot.timestamp}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-950/40 flex-1 flex items-center justify-center min-h-[350px]">
                  <div className="border border-slate-800 rounded-lg overflow-hidden shadow-inner max-w-full">
                    <img 
                      src={leftSnapshot.imageData} 
                      alt="Snapshot A" 
                      className="max-h-[500px] object-contain w-full select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Screen card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-850 flex justify-between items-center text-xs font-mono text-slate-400">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    {rightSnapshot.mode === "AI_EMULATION" ? <Sparkles className="w-3.5 h-3.5 text-purple-400" /> : <Globe className="w-3.5 h-3.5" />}
                    VERSION B
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-500">
                    {rightSnapshot.viewportSize.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 border-b border-slate-850/60 bg-slate-900/60 space-y-1">
                  <h4 className="text-sm font-bold text-slate-200 truncate">{rightSnapshot.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="truncate flex-1 hover:text-cyan-400">{rightSnapshot.url}</span>
                    <span className="shrink-0">{rightSnapshot.timestamp}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-950/40 flex-1 flex items-center justify-center min-h-[350px]">
                  <div className="border border-slate-800 rounded-lg overflow-hidden shadow-inner max-w-full">
                    <img 
                      src={rightSnapshot.imageData} 
                      alt="Snapshot B" 
                      className="max-h-[500px] object-contain w-full select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Immersive interactive sliding comparison view */
            <div className="w-full max-w-4xl space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-slate-400">
                  Drag the interactive percentage slider below to morph layouts
                </span>
              </div>

              {/* Slider wrapper container */}
              <div className="relative w-full aspect-[4/3] max-h-[550px] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-900 select-none">
                
                {/* Background (Version A - Left/Base) */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
                  <img
                    src={leftSnapshot.imageData}
                    alt="Left snapshot"
                    className="max-h-full max-w-full object-contain"
                  />
                  {/* Left Label */}
                  <div className="absolute left-4 top-4 bg-slate-950/85 backdrop-blur border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 font-bold z-10 flex items-center gap-1">
                    <span>A: {leftSnapshot.title} ({leftSnapshot.timestamp})</span>
                  </div>
                </div>

                {/* Foreground Overlay (Version B - Right) */}
                <div 
                  className="absolute inset-0 h-full overflow-hidden flex items-center justify-center p-4 z-20 pointer-events-none"
                  style={{ width: `${sliderPosition}%`, borderRight: "2px solid #06b6d4" }}
                >
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4" style={{ width: "100%", mixBlendMode: "normal" }}>
                    <img
                      src={rightSnapshot.imageData}
                      alt="Right snapshot"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  {/* Right Label */}
                  <div className="absolute right-4 top-4 bg-slate-950/85 backdrop-blur border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono text-pink-400 font-bold z-10 flex items-center gap-1">
                    <span>B: {rightSnapshot.title} ({rightSnapshot.timestamp})</span>
                  </div>
                </div>

                {/* Vertical handle line with range selector */}
                <div 
                  className="absolute top-0 bottom-0 z-30 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg font-bold border-2 border-slate-900 text-xs">
                    ↔
                  </div>
                </div>
              </div>

              {/* Slider Control range input bar */}
              <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-xl border border-slate-800 max-w-md mx-auto">
                <span className="text-xs font-mono font-bold text-cyan-400">A</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  className="flex-1 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-xs font-mono font-bold text-pink-400">B</span>
                <span className="text-xs font-mono text-slate-500 bg-slate-950/55 border border-slate-850 px-2 py-0.5 rounded">
                  {sliderPosition}%
                </span>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12 text-slate-500">
            Please configure valid left and right snapshots from selection boxes to render comparison canvas.
          </div>
        )}
      </div>
    </div>
  );
}
