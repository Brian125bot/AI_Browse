# 🌐 Remote Browser Emulator

[![GitHub stars](https://img.shields.io/badge/stars-★★★★★-blue.svg)](https://github.com/creetacticalgenius/remote-browser-emulator)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Powered By: Gemini](https://img.shields.io/badge/AI-Gemini%20API-orange.svg)](https://ai.google.dev/)
[![Stack: Express + Vite + React](https://img.shields.io/badge/stack-Express%20%2B%20Vite%20%2B%20React-darkblue.svg)](https://vite.dev)

A highly advanced, full-stack website sandbox, structural analyzer, and visual emulator. This application allows users to visit remote websites securely through a resilient Node.js proxy proxying bypass system, visualize them dynamically inside customizable sandboxed viewports, conduct detailed metadata scans, generate instant markdown code documents, capture workspace snapshots, and use Google's state-of-the-art **Gemini API** to reconstruct full-page high-fidelity design mockups with automated reviews.

---

## 📸 Core UI & Key Features

*   **⚡ Lossless Proxy Tunneling:** Safely fetch remote HTML targets, cleanly rewrite source asset paths dynamically using Cheerio, bypass strict CORS limitations, and enjoy a functional browsing experience.
*   **🔍 Interactive Google Sandbox:** Case-insensitive intercepting pipeline for universal Google domains. Includes an elegant, custom-designed dark/light themed Google Homepage replica and full search execution models with real-time "People Also Ask" matrices.
*   **🧠 Gemini-Powered Design Review & Reconstruction:** Connect directly with Google's `@google/genai` model to analyze fetched web-page content and build fully interactive high-fidelity replicas, detailing brand colors and structural elements.
*   **📐 Comprehensive Structural Scans:** Parse and audit target pages instantly, retrieving titles, SEO viewport settings, heading hierarchies (H1–H6), anchor lists, image resources, and text length breakdowns.
*   **📝 Live Markdown Reader:** Reorganize crawled source content into beautiful, pre-rendered Markdown format for developers, marketers, or copywriters to export instantly.
*   **📂 Multi-Viewport Comparator & Saved Bookmarks:** Save historical sessions with offline client-side storage, complete with customized snapshots across desktop, tablet, and mobile configurations.
*   **🗄️ Server-Side Cache Database Manager (`cache-db.json`):** Dedicated local JSON file database that registers all proxy crawlers, page scans, and Gemini AI emulation mockups. Provides real-time telemetry, selective entry deletion, and quick cache-bypass reloading.

---

## 🏗️ Technical Architecture Details

The system employs a tightly-coupled full-stack model to guarantee reliable scraping and sandbox security:

```
┌────────────────────────────────────────────────────────┐
│                   React Browser Client                 │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │ Sandbox Viewport │  │   Live Inspector Panel     │  │
│  │   (Raw PostMsg)  │  │ (Scan / AI / MD / Database)│  │
│  └────────▲─────────┘  └─────────────┬──────────────┘  │
└───────────┼──────────────────────────┼─────────────────┘
            │ Real-time Frame Feed     │ API Requests (Cache Actions / Live Crawls)
┌───────────┼──────────────────────────▼─────────────────┐
│           │            Express App / Server (Port 3000)│
│  ┌────────┴─────────┐  ┌────────────────────────────┐  │
│  │  Cheerio HTML    │  │  Google Gemini GenAI SDK  │  │
│  │  Rewrite Engine  │  │     (Model: gemini-2.5)    │  │
│  └────────▲─────────┘  └─────────────┬──────────────┘  │
│           │                          │                 │
│  ┌────────┴──────────────────────────▼──────────────┐  │
│  │        Server-Side Local Cache File             │  │
│  │               (cache-db.json)                    │  │
│  └────────────────────────▲─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │ Outbound Network Crawl
                     ┌──────▼──────┐
                     │ External Web│
                     └─────────────┘
```

### 1. The Scraping & Rewriting Pipeline
When a user requests a URL, the React client queries the backend's `/api/proxy?url=URL_HERE`. The Node.js proxy:
1.  Initiates a server-side `fetch` request using browser-centric user agent strings to prevent anti-robot triggers.
2.  Loads the returned markup into `cheerio` for surgical DOM manipulation:
    *   Rewrites all relative paths (CSS stylesheets, images, scripts, anchor tags) to their respective absolute representation computed from the original source host.
    *   Injects sandboxed messaging triggers to intercept anchor click events, preventing links from escaping the sandboxed viewport container.
    *   Overrides external forms to flow through sandbox proxies.
3.  Caches the modified markup to prevent redundant web requests.

### 2. Universal Google Interception Suite
Due to rigid anti-scraping and CAPTCHA algorithms on search engines, directly scraping `google.com` leads to `HTTP status 429 (Too Many Requests)` or blockages. 
This application circumvents blocks entirely via a customized **Google Emulation Engine**:
*   **Homepage Interceptor:** Requests to `https://google.com` or `https://www.google.com` bypass outbound networks entirely. The backend returns a beautiful, responsive, fully interactive custom Google Search homepage mock (light/dark adaptive) matching standard CSS specifications.
*   **Search Results Interceptor:** Standard search requests containing query parameters directly generate responsive, structured search-engine result mockup pages (SERPs). Users can perform actual queries, consult "People Also Ask" accordions, see side visual panels, or follow external links directly.

### 3. Server-Side Caching Database Engine (`cache-db.json`)
A key design pillar which tracks, parses, and persists remote data. By leveraging local server file systems:
*   Reduces standard network request latencies from several seconds down to **less than 10ms** on repeated requests.
*   Enables full CRUD capability on cached entities. The client's **Cache DB** panel displays total file size indices, exact creation timestamps, and raw document categories.
*   Allows force-bypass controls `?reload=true` for live updates.

---

## 📂 Project Repository Structure

```
.
├── server.ts              # Full-stack entry point (Express.js, Cheerio Engine, Gemini SDK)
├── cache-db.json          # Persistent file system JSON database storage
├── metadata.json          # Built application configuration & major capability guidelines
├── package.json           # Node scripts, build pipelines, and dependencies
├── vite.config.ts         # Vite bundler options, asset pathways, & plugins
├── src/
│   ├── main.tsx           # Client entry React hook up
│   ├── App.tsx            # Primary Application Shell & core layout workflows
│   ├── types.ts           # Shared TypeScript interfaces & types
│   ├── index.css          # Tailwind CSS global styling entry
│   └── components/
│       ├── BrowserToolbar.tsx    # Responsive viewport controls, search actions, URL bar
│       ├── InspectorPanel.tsx    # Multi-tab view (AI Reviews, Structural analysis, Database controls)
│       └── SnapshotCompare.tsx   # Side-by-side regression testing workspace
└── assets/                # Visual logo, designs, and supporting mock graphics
```

---

## 🛠️ Configuration & Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) (Version 18.0.0 or higher recommended)
*   [npm](https://www.npmjs.com/) (packaged with Node)

### Step 1: Clone and Enter the Directory
```bash
git clone https://github.com/creetacticalgenius/remote-browser-emulator.git
cd remote-browser-emulator
```

### Step 2: Set Environment Variables
The application implements Google Gemini API keys server-side for maximum client-side security. Create a `.env` file in the root directory:

```env
# Create .env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

*(Note: Refer to `.env.example` in the root repository for standard references.)*

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Launch Dev Server
```bash
npm run dev
```
The server will boot on port `3000`. Open `http://localhost:3000` in your browser.

### Step 5: Production Compilation & Deployment
The project bundles the entire TypeScript server code into single-file CommonJS assets inside the `dist/` folder via `esbuild` to support faster container cold starts:

```bash
# Compile client-side SPA & bundle production CJS server
npm run build

# Start the compiled production build
npm run start
```

---

## 🧪 Interactive API Reference

The backend server exposes clean corporate-grade endpoints to drive browser client capabilities:

| Endpoint | Method | Payload / Query | Description |
| :--- | :--- | :--- | :--- |
| `/api/proxy` | `GET` | `?url=URL&reload=true` | Downloads external web-markup, rewrites source paths, and routes response logic. |
| `/api/analyze` | `POST` | `{ url: "URL", reload: true }` | Scrapes headings, lists, links, image elements, and text volumes. |
| `/api/ai-emu` | `POST` | `{ url: "URL", sampledText: "...", metadata: {} }` | Queries Gemini server-side to generate design files & brand colors. |
| `/api/cache/stats` | `GET` | *None* | Accesses `cache-db.json` database telemetry, listing all indexed sizes & entries. |
| `/api/cache/delete` | `POST` | `{ url: "URL", type: "proxy/analyze/aiEmu" }` | Deletes a specic cache record. |
| `/api/cache/clear` | `POST` | *None* | Performs a complete database purge. |

---

## 🤝 Contributing

We welcome contributions of all sizes to help enrich the browser sandbox ecosystem!
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Project developed and engineered proudly as a full-stack high-fidelity remote utility. For inquiries, reach out via GitHub Issues.*
