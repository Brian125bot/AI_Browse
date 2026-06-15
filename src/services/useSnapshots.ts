import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { ViewportSnapshot, BrowserMode, ViewportSize, PageAnalysis } from "../types";
import { drawOfflineSnapshot } from "../utils/snapshotDrawer";

export function useSnapshots() {
  // Snapshot version history comparison state
  const [snapshots, setSnapshots] = useState<ViewportSnapshot[]>(() => {
    const saved = localStorage.getItem("emulator_snapshots");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // Persistent storage for snapshots
  useEffect(() => {
    localStorage.setItem("emulator_snapshots", JSON.stringify(snapshots));
  }, [snapshots]);

  const handleCaptureSnapshot = async (
    currentUrl: string,
    analysis: PageAnalysis | null,
    viewportSize: ViewportSize,
    mode: BrowserMode
  ) => {
    setIsCapturing(true);
    setFlashActive(true);
    setTimeout(() => {
      setFlashActive(false);
    }, 450);

    try {
      const containerElement = document.getElementById("renderer-viewport-canvas");
      if (!containerElement) {
        throw new Error("Viewport canvas container not found.");
      }

      // Capture options
      const options = {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#020617",
        scale: 1, // keep dimensions reasonable
        logging: false
      };

      let canvas;
      try {
        canvas = await html2canvas(containerElement, options);
      } catch (canvasErr) {
        console.warn("Direct canvas render hit CORS/Taint security borders, executing metadata outline renderer fallback.", canvasErr);
      }

      let dataUrl = canvas ? canvas.toDataURL("image/png") : "";

      // Robust CORS / Cross-Origin check fallback:
      // If the content is in PROXY mode, the canvas is likely rendered without the outer iframe pixels due to cross-origin policies.
      // We'll overlay a highly styled, readable summary of what's shown so that snapshots always preserve high fidelity information!
      if (mode === BrowserMode.PROXY || !dataUrl || dataUrl.length < 5000) {
        dataUrl = await drawOfflineSnapshot(currentUrl, analysis, viewportSize, mode);
      }

      // Log timestamp
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + now.toLocaleDateString([], { month: "short", day: "numeric" });

      // Build viewport snapshot item
      const newSnapshot: ViewportSnapshot = {
        id: "snapshot-" + Date.now(),
        url: currentUrl,
        title: analysis?.title || new URL(currentUrl).hostname,
        timestamp: timeStr,
        mode: mode,
        viewportSize: viewportSize,
        imageData: dataUrl
      };

      setSnapshots(prev => [newSnapshot, ...prev]);

      // Pop state notification
      const notification = document.createElement("div");
      notification.className = "fixed bottom-6 right-6 bg-slate-900 border border-cyan-500/35 text-cyan-400 font-sans font-semibold text-xs py-2.5 px-4 rounded-xl shadow-2xl z-50 animate-fade-in flex items-center gap-2";
      notification.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Snapshot captured! Comparison matches updated.</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500");
        setTimeout(() => notification.remove(), 500);
      }, 3000);

    } catch (err: any) {
      console.error("Snapshot capture error:", err.message);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClearSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  };

  return {
    snapshots,
    setSnapshots,
    isCapturing,
    isCompareOpen,
    setIsCompareOpen,
    flashActive,
    handleCaptureSnapshot,
    handleClearSnapshot
  };
}
