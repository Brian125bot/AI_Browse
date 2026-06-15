import React from "react";
import { Shield } from "lucide-react";

interface ShieldsPanelProps {
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

export default function ShieldsPanel({
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
}: ShieldsPanelProps) {
  return (
    <div className="space-y-4 animate-fade-in text-xs font-sans">
      {/* Header branding block */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold">Anonymity & Stealth Shields</span>
          <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">STEALTH ACTIVE</span>
        </div>
        <h3 className="text-sm font-bold text-slate-100 font-display">Client Spoofing Configuration</h3>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Spoof browser parameters, WebRTC leaks, canvas data, and audio graphs dynamically on direct HTTP proxy fetches.
        </p>
      </div>

      {/* Individual Switches list */}
      <div className="space-y-3">
        {/* Canvas Shield */}
        <div className="p-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${shieldCanvas ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
              <span className="font-bold text-slate-200">HTML5 Canvas Spoofing</span>
            </div>
            <button
              onClick={() => setShieldCanvas(!shieldCanvas)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                shieldCanvas ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  shieldCanvas ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Injects sub-visual random LSB noise into getImageData, toDataURL, and toBlob calls to block canvas hash matches.
          </p>
        </div>

        {/* WebRTC Shield */}
        <div className="p-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${shieldWebRTC ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
              <span className="font-bold text-slate-200">WebRTC Protection (Local IP Leak)</span>
            </div>
            <button
              onClick={() => setShieldWebRTC(!shieldWebRTC)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                shieldWebRTC ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  shieldWebRTC ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Disables standard RTCPeerConnection functions in sandbox script contexts to block WebRTC IP leak sweeps.
          </p>
        </div>

        {/* Audio Jitter Shield */}
        <div className="p-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${shieldAudio ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
              <span className="font-bold text-slate-200">Web Audio Graph Spoofing</span>
            </div>
            <button
              onClick={() => setShieldAudio(!shieldAudio)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                shieldAudio ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  shieldAudio ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Injects micro-frequency noise jitter into the AnalyserNode and AudioBuffer data to disrupt audio-acoustic browser mapping.
          </p>
        </div>

        {/* WebDriver/Screen override Shield */}
        <div className="p-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${shieldWebdriver ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
              <span className="font-bold text-slate-200">Automation Flags Masking</span>
            </div>
            <button
              onClick={() => setShieldWebdriver(!shieldWebdriver)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                shieldWebdriver ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  shieldWebdriver ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Redefines `navigator.webdriver` to false and normalizes screen dimensions to mask automated browser tags / scraping signatures.
          </p>
        </div>
      </div>

      {/* User-Agent Identity Selection */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-550 block">User-Agent Profile Rotation</span>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-colors text-slate-200">
            <input
              type="radio"
              name="ua-profile-panel"
              checked={activeUserAgent === "chrome-windows"}
              onChange={() => setActiveUserAgent("chrome-windows")}
              className="accent-cyan-400 focus:ring-0 cursor-pointer shrink-0"
            />
            <div>
              <span className="font-bold block">Google Chrome</span>
              <span className="text-[10px] text-slate-500 font-mono">Windows • v120</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-colors text-slate-200">
            <input
              type="radio"
              name="ua-profile-panel"
              checked={activeUserAgent === "safari-mac"}
              onChange={() => setActiveUserAgent("safari-mac")}
              className="accent-cyan-400 focus:ring-0 cursor-pointer shrink-0"
            />
            <div>
              <span className="font-bold block">Apple Safari</span>
              <span className="text-[10px] text-slate-500 font-mono">macOS • Mojave / Sonoma</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-colors text-slate-200">
            <input
              type="radio"
              name="ua-profile-panel"
              checked={activeUserAgent === "firefox-linux"}
              onChange={() => setActiveUserAgent("firefox-linux")}
              className="accent-cyan-400 focus:ring-0 cursor-pointer shrink-0"
            />
            <div>
              <span className="font-bold block">Mozilla Firefox</span>
              <span className="text-[10px] text-slate-500 font-mono">Linux • x86_x64</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-colors text-slate-200">
            <input
              type="radio"
              name="ua-profile-panel"
              checked={activeUserAgent === "edge-windows"}
              onChange={() => setActiveUserAgent("edge-windows")}
              className="accent-cyan-400 focus:ring-0 cursor-pointer shrink-0"
            />
            <div>
              <span className="font-bold block">Microsoft Edge</span>
              <span className="text-[10px] text-slate-500 font-mono">Windows • Chromium Core</span>
            </div>
          </label>
        </div>

        {/* Monospace direct header code view */}
        <div className="pt-2">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block mb-1">Injected User-Agent String</span>
          <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] font-mono text-slate-400 select-all leading-normal break-all">
            {activeUserAgent === "chrome-windows" && "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
            {activeUserAgent === "safari-mac" && "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15"}
            {activeUserAgent === "firefox-linux" && "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"}
            {activeUserAgent === "edge-windows" && "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"}
          </div>
        </div>
      </div>
    </div>
  );
}
