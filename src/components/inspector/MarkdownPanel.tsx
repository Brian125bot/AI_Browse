import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { PageAnalysis } from "../../types";

interface MarkdownPanelProps {
  analysis: PageAnalysis | null;
}

export default function MarkdownPanel({ analysis }: MarkdownPanelProps) {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const handleCopyMarkdown = () => {
    if (analysis?.sampleText) {
      navigator.clipboard.writeText(analysis.sampleText);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    }
  };

  if (!analysis) {
    return (
      <div className="text-center py-12 text-slate-500 italic text-xs animate-fade-in font-sans">
        Empty plain text outline folder. Connect standard address node to scrap values.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-xs font-sans">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300">Cleaned Text & Markdown Scraper</span>
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
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
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs leading-relaxed max-h-96 overflow-y-auto font-mono text-slate-400 whitespace-pre-wrap select-all">
          {analysis.sampleText || "Empty body or scrapable plain text."}
        </div>
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-500">
          The PlainText is dynamically crawled, stripping raw script code chunks, query parameters, style sheets, and CSS blocks. Suitable for AI training prompts.
        </div>
      </div>
    </div>
  );
}
