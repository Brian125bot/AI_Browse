import React from "react";
import { Database, RefreshCw, Trash2 } from "lucide-react";

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

interface CacheDbPanelProps {
  cacheStats: CacheStats | null;
  deletingKey: string | null;
  confirmWipe: boolean;
  setConfirmWipe: (val: boolean) => void;
  isClearingAll: boolean;
  onRefresh?: () => void;
  onDeleteCache: (url: string, rawType: string) => void;
  onClearAllCache: () => void;
}

export default function CacheDbPanel({
  cacheStats,
  deletingKey,
  confirmWipe,
  setConfirmWipe,
  isClearingAll,
  onRefresh,
  onDeleteCache,
  onClearAllCache
}: CacheDbPanelProps) {
  return (
    <div className="space-y-4 animate-fade-in text-xs font-sans">
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
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
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
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block uppercase">HTML COPIES</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">{cacheStats.proxyCount}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block uppercase">SCAN RUNS</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">{cacheStats.analyzeCount}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block uppercase">AI MOCKUPS</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">{cacheStats.aiEmuCount}</span>
          </div>
        </div>
      ) : (
        <div className="h-12 bg-slate-950/40 animate-pulse rounded-lg border border-slate-800" />
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
                  className="p-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-[11px]"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-mono text-cyan-400 block truncate text-left" title={item.url}>
                      {item.url}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-slate-500">
                      <span className="text-slate-400 bg-slate-900 px-1 rounded border border-slate-800 uppercase">
                        {item.type}
                      </span>
                      <span>•</span>
                      <span>{(item.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteCache(item.url, item.type)}
                    disabled={isDeleting}
                    className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 disabled:opacity-50 cursor-pointer"
                    title="Evict file from DB cache"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 italic text-[11px]">
              No active records present in local database.
            </div>
          )}
        </div>
      </div>

      {/* Delete/Wipe entire cache confirmation panel */}
      {cacheStats && cacheStats.list.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          {!confirmWipe ? (
            <button
              onClick={() => setConfirmWipe(true)}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-455 font-bold py-2 rounded-xl text-[11px] transition-all cursor-pointer block text-center"
            >
              WIPE LOCAL DATABASE CACHE
            </button>
          ) : (
            <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/20 space-y-2.5">
              <p className="text-[10px] text-rose-400 font-medium">
                Are you absolutely sure you want to delete all cache file indices? This cannot be undone and will trigger active network downloads for future crawls.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onClearAllCache}
                  disabled={isClearingAll}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-1.5 rounded-lg text-[10px] cursor-pointer disabled:opacity-50"
                >
                  {isClearingAll ? "Wiping..." : "CONFIRM FULL WIPE"}
                </button>
                <button
                  onClick={() => setConfirmWipe(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 rounded-lg text-[10px] cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
