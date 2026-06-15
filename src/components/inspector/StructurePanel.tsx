import React from "react";
import { FileText, Link2, Image as ImageIcon } from "lucide-react";
import { PageAnalysis } from "../../types";

interface StructurePanelProps {
  analysis: PageAnalysis | null;
}

export default function StructurePanel({ analysis }: StructurePanelProps) {
  if (!analysis) {
    return (
      <div className="text-center py-12 text-slate-500 italic text-xs animate-fade-in font-sans">
        Enter a target URL and navigate to pull direct DOM structure.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-xs font-sans">
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
              <div key={i} className="flex gap-2 items-start bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                  h.tag === "H1" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                  h.tag === "H2" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                  "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                }`}>{h.tag}</span>
                <span className="text-xs text-slate-400 leading-tight block">{h.text}</span>
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
              <div key={i} className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-300 font-medium block leading-tight truncate">{lnk.text}</span>
                <span className="text-[10px] font-mono text-cyan-500 bg-slate-900 border border-slate-800/50 px-1 py-0.5 rounded truncate block">{lnk.href}</span>
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
          <h4 className="text-xs font-semibold text-slate-300">Static Images Extracted</h4>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {analysis.images.length > 0 ? (
            analysis.images.map((img, i) => (
              <div key={i} className="flex gap-2 items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-[10px] font-mono">
                <ImageIcon className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="text-slate-400 truncate flex-1 block">{img}</span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-500 italic py-2 text-center">No image sources identified.</p>
          )}
        </div>
      </div>
    </div>
  );
}
