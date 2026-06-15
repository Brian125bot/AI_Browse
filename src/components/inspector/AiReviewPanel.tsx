import React, { useState } from "react";
import { Sparkles, Globe, Copy, Check, Terminal } from "lucide-react";
import { AiEmulation } from "../../types";

interface AiReviewPanelProps {
  aiEmulation: AiEmulation | null;
  isLoadingAi: boolean;
  onTriggerAiEmu: () => void;
}

export default function AiReviewPanel({
  aiEmulation,
  isLoadingAi,
  onTriggerAiEmu
}: AiReviewPanelProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (aiEmulation?.reconstructedCode) {
      navigator.clipboard.writeText(aiEmulation.reconstructedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
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
            <h3 className="text-sm font-bold text-slate-100 font-display">{aiEmulation.siteTitle}</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">{aiEmulation.brandDescription}</p>

            {/* Brand colors list */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5 font-semibold">Detected Color Palette</span>
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
            <p className="text-slate-400 text-xs leading-normal">Run a high-fidelity AI Emulation session to critique style patterns, extract palettes, and rebuild custom Tailwind code views.</p>
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
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block font-semibold">Expert Design Critique</span>
            <p className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-line">{aiEmulation.designReview}</p>
          </div>

          {/* Code viewport container */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-mono font-semibold text-slate-400">Reconstructed Code (HTML/Tailwind)</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded text-slate-450 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="p-3 text-[10px] font-mono text-slate-500 overflow-x-auto max-h-48 whitespace-pre-wrap select-all leading-normal">
              {aiEmulation.reconstructedCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
