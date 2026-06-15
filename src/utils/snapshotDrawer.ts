import { BrowserMode, ViewportSize, PageAnalysis } from "../types";

/**
 * Draws a gorgeous high-fidelity representational mockup of the current webpage 
 * onto an offline canvas when CORS policies block direct iframe screenshot captures.
 * 
 * @param url The current emulated URL.
 * @param analysis The DOM scraper analysis data (metadata, headings, links, etc).
 * @param viewportSize The selected viewport device size mode ("desktop" | "tablet" | "mobile").
 * @param mode The selected browser display mode (PROXY, READABILITY, AI_EMULATION).
 * @returns A promise resolving to a Base64 data URL png image representation.
 */
export async function drawOfflineSnapshot(
  url: string,
  analysis: PageAnalysis | null,
  viewportSize: ViewportSize,
  mode: BrowserMode
): Promise<string> {
  const offlineCanvas = document.createElement("canvas");
  const ctx = offlineCanvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not construct 2D graphics rendering context.");
  }

  offlineCanvas.width = 800;
  offlineCanvas.height = 600;

  // Draw dark canvas gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, "#0b1329");
  grad.addColorStop(1, "#020617");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  // Draw outer technical layout borders
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 790, 590);

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.strokeRect(15, 15, 770, 570);

  // Draw simulated browser action bar
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(15, 15, 770, 50);

  // Mac OS styling control dots
  ctx.fillStyle = "#f43f5e"; // Red
  ctx.beginPath(); 
  ctx.arc(35, 40, 5, 0, Math.PI * 2); 
  ctx.fill();

  ctx.fillStyle = "#eab308"; // Amber
  ctx.beginPath(); 
  ctx.arc(50, 40, 5, 0, Math.PI * 2); 
  ctx.fill();

  ctx.fillStyle = "#22c55e"; // Green
  ctx.beginPath(); 
  ctx.arc(65, 40, 5, 0, Math.PI * 2); 
  ctx.fill();

  // Address bar frame
  ctx.fillStyle = "#020617";
  ctx.fillRect(95, 25, 580, 30);
  ctx.strokeStyle = "#475569";
  ctx.strokeRect(95, 25, 580, 30);

  // Write Address string text
  ctx.fillStyle = "#06b6d4";
  ctx.font = "11px monospace";
  ctx.fillText(url, 110, 44);

  // Header display title info
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(analysis?.title || new URL(url).hostname, 40, 120);

  // Metadata description block styling
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px system-ui, -apple-system, sans-serif";
  
  const rawDesc = analysis?.metaDescription || "Standard connection proxy bypass enabled. Active visual emulation loaded securely.";
  const words = rawDesc.split(" ");
  let line = "";
  let y = 155;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 700 && i > 0) {
      if (y < 230) { // Keep limits on the meta description box to avoid overflowing
        ctx.fillText(line, 40, y);
      }
      line = words[i] + " ";
      y += 20;
    } else {
      line = testLine;
    }
  }
  if (y < 230) {
    ctx.fillText(line, 40, y);
  }

  // Render simulated DOM audit analysis grid
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(40, 240, 720, 110);
  ctx.strokeStyle = "#1e293b";
  ctx.strokeRect(40, 240, 720, 110);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px monospace";
  ctx.fillText("DOM SCRAPER CORRELATION MATRIX", 60, 268);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillText(`HEADINGS ARCH: ${analysis?.headings.length || 0} parsed tags`, 60, 298);
  ctx.fillText(`OUTBOUND REFS: ${analysis?.links.length || 0} relative links`, 60, 322);
  ctx.fillText(`DEVICE MODE  : ${viewportSize.toUpperCase()}`, 420, 298);
  ctx.fillText(`PROXY CHANNEL: SECURE HANDSHAKE STATUS`, 420, 322);

  // Draw decorative card/bento layouts
  ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1;
  ctx.fillRect(40, 380, 220, 160);
  ctx.strokeRect(40, 380, 220, 160);

  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.strokeStyle = "#10b981";
  ctx.fillRect(290, 380, 220, 160);
  ctx.strokeRect(290, 380, 220, 160);

  ctx.fillStyle = "rgba(139, 92, 246, 0.15)";
  ctx.strokeStyle = "#8b5cf6";
  ctx.fillRect(540, 380, 220, 160);
  ctx.strokeRect(540, 380, 220, 160);

  // Card Content Title & text overlays
  ctx.fillStyle = "#3b82f6";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("Visual Grid Layout", 55, 415);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px system-ui";
  ctx.fillText("Structured components", 55, 440);
  ctx.fillText(`Images total: ${analysis?.images.length || 0}`, 55, 460);

  ctx.fillStyle = "#10b981";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("Page Content Scrape", 305, 415);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px system-ui";
  ctx.fillText("Extracted semantic text", 305, 440);
  ctx.fillText(`Length: ${analysis?.textLength || 0} chars`, 305, 460);

  ctx.fillStyle = "#8b5cf6";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("Brand Identity", 555, 415);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px system-ui";
  ctx.fillText("Model design tokens", 555, 440);
  ctx.fillText(`Format: Same-Origin Secure`, 555, 460);

  // Sub watermark title credit
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.font = "bold 14px monospace";
  ctx.fillText("REMOTE BROWSER EMULATION SECURE CO-PILOT LAYER", 210, 570);

  return offlineCanvas.toDataURL("image/png");
}
