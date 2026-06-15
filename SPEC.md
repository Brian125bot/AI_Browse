# Remote Browser Emulator - Source of Truth Specification

## 1. Project Overview & Vision
The **Remote Browser Emulator** is a locally-hosted, privacy-first application designed to fetch, analyze, and visually reconstruct external web pages using AI (Google Gemini). By acting as a proxy and intelligent renderer, it allows users to browse anonymously, bypassing direct local network requests to target servers, while interacting with high-fidelity functional mockups of the requested pages.

This specification outlines the roadmap for upgrading the tool from a basic prototype to a robust, locally-optimized, high-performance utility.

---

## 2. Core Upgrades & Feature Specifications

### 2.1. Feature: Advanced Stealth Proxy Engine (Privacy & Bypassing) - ✅ PARTIALLY IMPLEMENTED
**The "What":**
Currently, basic server-side `fetch` can be easily blocked by CDNs (Cloudflare, Akamai) or bot-protection scripts. We need a stealthier approach to ensure reliable page retrieval.

**The "How" (Implementation Status):**
*   **Header Rotation:** Maintain a pool of modern, randomized `User-Agent`, `Sec-CH-UA`, and `Accept-Language` headers. (Implemented)
*   **Cookie Jars:** Implement ephemeral cookie sessions per request to handle sites that require minimum cookie handshakes to render. (**Implemented:** Resolved as active, host-specific session cookie registries in memory, maintaining user state dynamically across pages and analyze nodes).
*   **Full Resource Tunneling:** Enforce full gateway routing of all sub-resource CSS, JavaScript, and illustrative source vectors strictly via `/api/proxy` to bypass context security policies. (Implemented)
*   **Upstream Gateways:** Supports routing crawler requests over defined HTTP Proxies (via `undici`'s `ProxyAgent` setting `UPSTREAM_HTTP_PROXY`). (Implemented)
*   **SSRF Protection Blocklist:** Actively audits requested URLs, blocking access requests directed at local address spaces or home networks. (Implemented)
*   **Dynamic Headless Browsing:** Integrate `puppeteer-core` with `puppeteer-extra-plugin-stealth` (or Playwright) alongside the standard Cheerio parser. (Planned)

**Definition of Done (Completion):**
*   The proxy successfully fetches heavily protected sites (e.g., Reddit, Twitter, Cloudflare-protected news sites) without returning 403 Forbidden or CAPTCHA blocks.
*   Stateful authentication handshakes and security loop mitigations are active on target crawl endpoints.

### 2.2. Feature: Serverless Memory & Database Caching Strategy
**The "What":**
Transition from unbounded flat-file caching to an auto-scaling, serverless-ready architectural model balancing speed and execution limits.

**The "How" (Implementation Status):**
*   **Current State - Serverless Bound Cache Engine:** The JSON cache manager `/src/server-db.ts` was fully upgraded with **automatic pruning limits** and environment-adaptive toggles:
    *   **Cloud Run Mode (Ephemeral):** Set to execute exclusively in Memory (automatically forces `true` in production mode). Prevents Out-Of-Memory container bloat on Virtual File Systems for Vercel/Cloud Run architectures. (Implemented)
    *   **TTL Eviction:** Clears items older than 24 Hours automatically during standard reads. (Implemented)
    *   **Capacity Eviction:** Restricts logs to 50 active items per endpoint segment, pruning eldest logs first. (Implemented)
*   **Stateful Proxy Cookies:**
    *   Currently runs using a fast `Map<string, string>` memory pattern mapping Domains to Cookies.
    *   **Cloud Hosting Recommendation:** Production hosting must enable **Session Affinity / Sticky Sessions** to maintain the proxy states horizontally.

**Definition of Done (Completion):**
*   Read/write operations for cached endpoints happen inside rapid memory boundaries, responding in < 5ms.
*   The system silently manages its item caps, and is entirely safe to deploy to auto-scaling containerized cloud architectures.

### 2.3. Feature: AI Engine Optimization (Gemini Processing)
**The "What":**
Optimize the text-to-UI and analysis generation using the most efficient models (e.g., Gemini Flash models) to ensure near-instantaneous rendering and low local API cost.

**The "How" (Implementation):**
*   **Model Selection:** Default to `gemini-2.5-flash` or `gemini-3.0-flash` for high-speed structural analysis. Use `gemini-pro` ONLY for deep, complex visual reconstructions.
*   **System Instructions:** Refine the prompt engineering. Instead of asking for full HTML reconstruction, ask Gemini to return a structured JSON mapping of the page (Headers, Nav, Main Content, Footer), which React will dynamically map into pre-built Tailwind structural components.
*   **Streaming Responses:** Implement Server-Sent Events (SSE) so the React UI paints the AI's analysis/emulation progressively rather than waiting for the entire generation to finish.

**Definition of Done (Completion):**
*   AI analysis begins displaying in the UI within 1 second of the prompt firing.
*   Tokens used per page are reduced by 40% due to tighter prompt constraints.

### 2.4. Feature: Multi-Tab & Workspace Routing (UI/UX)
**The "What":**
A true browser experience requires multiple tabs, back/forward navigation within the proxy, and bookmarking.

**The "How" (Implementation):**
*   **State Management:** Use React Context or Zustand to manage an array of `Tab` objects (`{ id, url, title, isLoading, localCacheId }`).
*   **Sandboxed iFrames:** Use multiple hidden/visible `<iframe>` elements to maintain the scroll state and DOM of background tabs.
*   **Interceptor:** Hook into the sandboxed DOM's `click` events to open external links as new simulated "tabs" within the React state rather than breaking out of the emulator.

**Definition of Done (Completion):**
*   Users can open multiple proxy pages simultaneously.
*   Switching between tabs is instantaneous and preserves scroll position and AI analysis state.

### 2.5. Feature: Export & "Save as Project" (Developer Tooling)
**The "What":**
Allow users to export the AI-reconstructed high-fidelity mockup to their local machine as a standalone, runnable micro-app.

**The "How" (Implementation):**
*   **ZIP Packaging:** Add an Express endpoint `/api/export` using the `archiver` package.
*   **Payload:** When invoked, the server bundles the `index.html`, generated `style.css`, and AI-extracted media assets into a `.zip` buffer and streams it to the client.

**Definition of Done (Completion):**
*   Clicking "Export Mockup" downloads a functional ZIP file. The extracted HTML file renders exactly as it did in the emulator viewport.

---

## 3. Recommended Implementation Phases

1.  **Phase 1: Foundation Swap (Days 1-2)**
    *   Replace `cache-db.json` with SQLite. Ensure the current app functions exactly as before, but backed by SQL.
2.  **Phase 2: The Stealth Layer (Days 3-4)**
    *   Upgrade the proxy `/api/proxy` to use robust header spoofing and dynamic HTML retrieval (handling SPAs).
3.  **Phase 3: AI & Speed (Days 5-6)**
    *   Refactor Gemini calls to use streaming (SSE). Migrate to the fastest available Flash model.
4.  **Phase 4: The Interface (Days 7-9)**
    *   Implement the Multi-tab layout in React. Connect history tracking to the new SQLite DB.
5.  **Phase 5: Polish & Export (Day 10)**
    *   Add the ZIP export functionality. Polish the UI for desktop-native feel.

---
*Generated by AI Studio - Source of Truth document for Remote Browser Emulator enhancements.*
