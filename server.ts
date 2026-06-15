import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { cacheDb } from "./src/server-db";

dotenv.config();

let fetchDispatcher: any = undefined;
if (process.env.UPSTREAM_HTTP_PROXY) {
  import("undici").then(({ ProxyAgent }) => {
    fetchDispatcher = new ProxyAgent(process.env.UPSTREAM_HTTP_PROXY as string);
    console.log(`Using upstream HTTP proxy: ${process.env.UPSTREAM_HTTP_PROXY}`);
  }).catch(err => {
    console.warn("Could not load undici for upstream proxying.", err);
  });
}

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI Emulation mode will operate with a fallback.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper functions for Search SERP Generation
function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "www.google.com";
  }
}

function getPathFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) return "";
    return " › " + pathParts.join(" › ");
  } catch {
    return "";
  }
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function parseGoogleUrl(urlStr: string): { isGoogle: boolean; isSearch: boolean; query: string } {
  let cleanUrl = (urlStr || "").trim();
  if (!cleanUrl) {
    return { isGoogle: false, isSearch: false, query: "" };
  }
  
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = "https://" + cleanUrl;
  }

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    const isGoogle = hostname === "google.com" || 
                     hostname.endsWith(".google.com") || 
                     hostname === "google.co.uk" || 
                     hostname.endsWith(".google.co.uk") ||
                     hostname === "google.ca" ||
                     hostname.endsWith(".google.ca") ||
                     hostname === "google.de" ||
                     hostname.endsWith(".google.de") ||
                     hostname === "google.fr" ||
                     hostname.endsWith(".google.fr");
                     
    if (!isGoogle) {
      return { isGoogle: false, isSearch: false, query: "" };
    }
    
    const isSearch = urlObj.pathname.toLowerCase().includes("/search") || urlObj.searchParams.has("q");
    const query = urlObj.searchParams.get("q") || "Google Search";
    
    return { isGoogle, isSearch, query };
  } catch (err) {
    const lower = cleanUrl.toLowerCase();
    const isGoogle = lower.includes("google.com") || lower.includes("google.co.uk") || lower.includes("google.ca") || lower.includes("google.de");
    const isSearch = lower.includes("/search") || lower.includes("?q=") || lower.includes("&q=");
    
    let query = "Google Search";
    if (isSearch) {
      const qIndex = lower.indexOf("q=");
      if (qIndex !== -1) {
        const afterQ = cleanUrl.substring(qIndex + 2);
        const ampIndex = afterQ.indexOf("&");
        const rawQuery = ampIndex !== -1 ? afterQ.substring(0, ampIndex) : afterQ;
        try {
          query = decodeURIComponent(rawQuery);
        } catch {
          query = rawQuery;
        }
      }
    }
    return { isGoogle, isSearch, query };
  }
}

export function generateGoogleHomepage(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Google</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          background-color: #202124;
          color: #e8eaed;
          font-family: 'Google Sans', BlinkMacSystemFont, Roboto, Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .g-blue { color: #4285F4; }
        .g-red { color: #EA4335; }
        .g-yellow { color: #FBBC05; }
        .g-green { color: #34A853; }
      </style>
    </head>
    <body class="bg-[#202124] text-[#e8eaed] flex flex-col justify-between min-h-screen">
      <!-- Top Navigation Header -->
      <header class="flex justify-end items-center gap-4 p-4 text-xs font-sans text-slate-300">
        <a href="https://mail.google.com" target="_blank" class="hover:underline">Gmail</a>
        <a href="https://www.google.com/imghp" target="_blank" class="hover:underline">Images</a>
        <div class="p-1.5 hover:bg-slate-800 rounded-full cursor-pointer lg:block hidden" title="Google apps">
          <svg class="w-5 h-5 text-slate-300 fill-current" viewBox="0 0 24 24">
            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
        <button class="bg-[#8ab4f8] hover:bg-[#9cc1f9] text-[#202124] font-bold px-4 py-1.5 rounded text-xs transition-colors">Sign in</button>
      </header>

      <!-- Main Center Area -->
      <main class="flex-1 flex flex-col items-center justify-center -translate-y-12 px-4">
        <!-- Logotype -->
        <div class="logo-text text-6xl sm:text-7xl font-sans font-bold select-none tracking-tight mb-8">
          <span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span>
        </div>

        <!-- Search Form -->
        <form onsubmit="handleLocalSearch(event)" class="w-full max-w-[584px] space-y-6">
          <div class="relative group flex items-center bg-[#202124] hover:bg-[#303134] focus-within:bg-[#303134] border border-[#5f6368] hover:border-transparent rounded-[24px] h-[46px] px-4 transition-all shadow-md focus-within:shadow-lg">
            <span class="text-slate-400 mr-3 text-sm">🔍</span>
            <input id="search-input-box" class="flex-1 bg-transparent border-none text-[#e8eaed] outline-none text-[16px] placeholder-slate-500" type="text" placeholder="Search Google..." autocomplete="off" autofocus />
            <span class="text-slate-400 cursor-pointer hover:text-slate-200 text-xs font-bold leading-none px-2" title="Search by voice">🎙����</span>
            <span class="text-slate-400 cursor-pointer hover:text-slate-200 text-xs font-bold leading-none px-1" title="Search by image">📷</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center gap-3">
            <button type="submit" class="bg-[#303134] hover:bg-[#3c4043] border border-transparent hover:border-slate-700 text-[#e8eaed] text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow">Google Search</button>
            <button type="button" onclick="handleLucky()" class="bg-[#303134] hover:bg-[#3c4043] border border-transparent hover:border-slate-700 text-[#e8eaed] text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow">I'm Feeling Lucky</button>
          </div>

          <!-- Translation info -->
          <div class="text-center text-xs text-slate-400 mt-2">
            <span>Google offered in: </span>
            <span class="text-[#8ab4f8] hover:underline cursor-pointer ml-1" onclick="document.getElementById('search-input-box').focus()">Español</span>
            <span class="text-[#8ab4f8] hover:underline cursor-pointer ml-2" onclick="document.getElementById('search-input-box').focus()">Français</span>
            <span class="text-[#8ab4f8] hover:underline cursor-pointer ml-2" onclick="document.getElementById('search-input-box').focus()">Deutsch</span>
            <span class="text-[#8ab4f8] hover:underline cursor-pointer ml-2" onclick="document.getElementById('search-input-box').focus()">中文</span>
          </div>
        </form>
      </main>

      <!-- Google Footer Section Layout -->
      <footer class="bg-[#171717] border-t border-slate-800 text-xs text-slate-400 font-sans">
        <div class="px-6 py-3 border-b border-slate-800 text-slate-400">
          <span>United States</span>
        </div>
        <div class="px-6 py-3 flex flex-wrap justify-between gap-y-3">
          <div class="flex flex-wrap gap-x-6">
            <a href="https://about.google" target="_blank" class="hover:underline">About</a>
            <a href="https://ads.google.com" target="_blank" class="hover:underline">Advertising</a>
            <a href="https://business.google.com" target="_blank" class="hover:underline">Business</a>
            <a href="https://google.com/search/howsearchworks" target="_blank" class="hover:underline">How Search works</a>
          </div>
          <div class="flex flex-wrap gap-x-6">
            <a href="https://policies.google.com/privacy" target="_blank" class="hover:underline">Privacy</a>
            <a href="https://policies.google.com/terms" target="_blank" class="hover:underline">Terms</a>
            <span class="hover:underline cursor-pointer">Settings</span>
          </div>
        </div>
      </footer>

      <script>
        function handleLocalSearch(event) {
          event.preventDefault();
          const query = document.getElementById('search-input-box').value.trim();
          if (query) {
            window.parent.postMessage({ 
              type: 'BROWSER_NAVIGATE', 
              url: 'https://www.google.com/search?q=' + encodeURIComponent(query) 
            }, '*');
          }
        }

        function handleLucky() {
          const queries = ["climate change", "hacker news", "open source ai", "space exploration", "quantum computing"];
          const randomQuery = queries[Math.floor(Math.random() * queries.length)];
          document.getElementById('search-input-box').value = randomQuery;
          window.parent.postMessage({ 
            type: 'BROWSER_NAVIGATE', 
            url: 'https://www.google.com/search?q=' + encodeURIComponent(randomQuery) 
          }, '*');
        }

        (function() {
          document.addEventListener('click', function(e) {
            const a = e.target.closest('a');
            if (a) {
              const href = a.getAttribute('href') || a.href;
              if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:') && !href.startsWith('#')) {
                e.preventDefault();
                var targetUrl = href;
                try {
                  targetUrl = new URL(href, window.location.href).href;
                } catch(err) {}
                window.parent.postMessage({ type: 'BROWSER_NAVIGATE', url: targetUrl }, '*');
              }
            }
          }, true);
        })();
      </script>
    </body>
    </html>
  `;
}

async function fetchGeminiSearchResults(model: string, query: string) {
  const ai = getAiClient();
  const prompt = `
    You are a realistic Google Search scraper assistant.
    Synthesize high-quality, relevant search results for the user's specific query: "${query}".
    
    You must output a stable JSON object matching this schema:
    {
      "featuredSnippet": {
        "title": "A perfect quick answer title",
        "snippet": "A rich concise 2-3 sentence answer directly summarizing the answer to the query.",
        "url": "https://example-source-link.com"
      },
      "results": [
        { "title": "Result Title 1", "snippet": "Result description snippet explaining some details.", "url": "https://..." },
        { "title": "Result Title 2", "snippet": "Result description snippet...", "url": "https://..." },
        { "title": "Result Title 3", "snippet": "Result description snippet...", "url": "https://..." },
        { "title": "Result Title 4", "snippet": "Result description snippet...", "url": "https://..." },
        { "title": "Result Title 5", "snippet": "Result description snippet...", "url": "https://..." }
      ],
      "peopleAlsoAsk": [
        { "q": "Question 1?", "a": "Quick answer detail." },
        { "q": "Question 2?", "a": "Quick answer detail." }
      ],
      "knowledgePanel": {
        "title": "Entity Title (if relevant, e.g. React, Apple, Elon Musk)",
        "subtitle": "Short entity description/type",
        "description": "An encyclopedic overview summary.",
        "details": {
          "Discovered/Founded": "...",
          "Key Persons/CEO": "..."
        }
      }
    }
    
    Make the results highly relevant to the query "${query}" using authentic, functional, actual domain URLs (like wikipedia.org, github.com, official docs sites, tech blogs, etc.) that the user can explore inside our browser emulator. Do not use placeholder text. Ensure JSON output is valid.
  `;

  try {
    if (!apiKey || apiKey === "MOCK_KEY") {
      throw new Error("No real API key present. Trigger fallback.");
    }

    const rawResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            featuredSnippet: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                snippet: { type: Type.STRING },
                url: { type: Type.STRING }
              }
            },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["title", "snippet", "url"]
              }
            },
            peopleAlsoAsk: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  a: { type: Type.STRING }
                },
                required: ["q", "a"]
              }
            },
            knowledgePanel: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                description: { type: Type.STRING },
                details: { type: Type.OBJECT }
              }
            }
          },
          required: ["results", "peopleAlsoAsk"]
        }
      }
    });

    return JSON.parse(rawResponse.text);
  } catch (err) {
    console.warn("Fallback search results loaded due to:", err);
    // Build a beautiful local fallback search dataset based on the query words
    const cleanQuery = query.replace(/[^\w\s-]/g, "").trim();
    const formattedQuery = cleanQuery || "Query";
    return {
      featuredSnippet: {
        title: `Overview of ${formattedQuery}`,
        snippet: `This is a high-fidelity browser emulated search card summarizing details for "${formattedQuery}". Discover resources, references, and relative pages for detailed index matching.`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedQuery)}`
      },
      results: [
        {
          title: `${formattedQuery} - Wikipedia`,
          snippet: `Find historical details, academic references, structure layouts, and core developments related to ${formattedQuery} on the free encyclopedia project.`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedQuery)}`
        },
        {
          title: `Official Documentation on ${formattedQuery}`,
          snippet: `Access interactive tutorials, reference libraries, release notes, and community forums. Review quick setups and deep structural patterns.`,
          url: `https://github.com/topics/${encodeURIComponent(formattedQuery.toLowerCase())}`
        },
        {
          title: `Getting Started with ${formattedQuery}: A Comprehensive Guide`,
          snippet: `An in-depth article analyzing modern frameworks, troubleshooting tips, design choices, and benchmark comparisons with examples.`,
          url: `https://medium.com/search?q=${encodeURIComponent(formattedQuery)}`
        },
        {
          title: `Top Projects tagged with #${formattedQuery.toLowerCase()}`,
          snippet: `Browse open-source resources, sample codebases, deployment sheets, and configuration logs built around ${formattedQuery} by developers worldwide.`,
          url: `https://github.com/search?q=${encodeURIComponent(formattedQuery)}`
        },
        {
          title: `Latest News and Updates for ${formattedQuery}`,
          snippet: `Stay updated on trending conversations, technical reviews, conference announcements, and expert panels exploring the limits of ${formattedQuery}.`,
          url: `https://news.ycombinator.com/from?site=github.com`
        }
      ],
      peopleAlsoAsk: [
        {
          q: `What is the primary role of ${formattedQuery}?`,
          a: `The role of ${formattedQuery} is characterized by dynamic adaptability, high structural coordination, and streamlined system interfaces tailored for performance and accessibility.`
        },
        {
          q: `How do I install or configure ${formattedQuery}?`,
          a: `Configuration depends on environmental constraints. Most implementations suggest package setups via npm, direct downloads, or compiling configuration properties locally.`
        }
      ],
      knowledgePanel: {
        title: formattedQuery,
        subtitle: "Information Topic",
        description: `Comprehensive collection of records, statistics, and references analyzing "${formattedQuery}" as a modern computational or sociocultural subject representation.`,
        details: {
          "Source": "AI Sandbox Indexing",
          "Indexed On": new Date().toLocaleDateString(),
          "Reliability": "High Fidelity Simulation"
        }
      }
    };
  }
}

async function generateGoogleSearchResultsPage(model: string, query: string): Promise<string> {
  const data = await fetchGeminiSearchResults(model, query);
  
  const searchBarValue = query.replace(/"/g, '&quot;');
  
  // Generate results HTML
  const resultsHtml = data.results.map((r: any) => `
    <div class="search-result-card">
      <div class="breadcrumb-trail">
        <span class="url-domain">${getDomainFromUrl(r.url)}</span>
        <span class="url-path">${getPathFromUrl(r.url)}</span>
      </div>
      <h3 class="result-title">
        <a href="${r.url}">${escapeHtml(r.title)}</a>
      </h3>
      <p class="result-snippet">${escapeHtml(r.snippet)}</p>
    </div>
  `).join("");

  // People also ask accordions
  const peopleAskHtml = (data.peopleAlsoAsk || []).map((p: any, i: number) => `
    <div class="accordion-item" onclick="toggleAccordion('acc-${i}')">
      <div class="accordion-header">
        <span>${escapeHtml(p.q)}</span>
        <span class="arrow font-mono">▼</span>
      </div>
      <div id="acc-${i}" class="accordion-content hidden">
        <p>${escapeHtml(p.a)}</p>
      </div>
    </div>
  `).join("");

  // Featured snippet check
  const featuredHtml = data.featuredSnippet ? `
    <div class="featured-snippet-container">
      <div class="snippet-content">
        <p class="snippet-text">"${escapeHtml(data.featuredSnippet.snippet)}"</p>
        <div class="snippet-source">
          <span class="about text-slate-400 text-xs block mb-1">About featured snippets</span>
          <a class="source-link" href="${data.featuredSnippet.url}">
            <div class="breadcrumb-trail">
              <span class="url-domain">${getDomainFromUrl(data.featuredSnippet.url)}</span>
            </div>
            <span class="source-title font-bold">${escapeHtml(data.featuredSnippet.title)}</span>
          </a>
        </div>
      </div>
    </div>
  ` : "";

  // Knowledge panel check
  const panelHtml = data.knowledgePanel ? `
    <div class="knowledge-panel">
      <h2 class="panel-title">${escapeHtml(data.knowledgePanel.title)}</h2>
      <p class="panel-subtitle">${escapeHtml(data.knowledgePanel.subtitle)}</p>
      <div class="panel-image-mock border border-slate-800 rounded my-3 flex items-center justify-center p-4 bg-slate-900/35 text-center font-bold text-xs text-cyan-400 select-none">
        🌐 ${escapeHtml(data.knowledgePanel.title).toUpperCase()} OVERVIEW
      </div>
      <p class="panel-description">${escapeHtml(data.knowledgePanel.description)}</p>
      <hr class="border-slate-800 my-3">
      <div class="panel-details space-y-2">
        ${Object.entries(data.knowledgePanel.details || {}).map(([k, v]) => `
          <div class="text-xs">
            <strong class="text-slate-300 font-medium">${escapeHtml(k)}: </strong>
            <span class="text-slate-400">${escapeHtml(String(v))}</span>
          </div>
        `).join("")}
      </div>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(query)} - Google Search</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          background-color: #202124;
          color: #e8eaed;
          font-family: 'Google Sans', BlinkMacSystemFont, Roboto, Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        
        .header-top {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #3c4043;
          position: sticky;
          top: 0;
          background-color: #202124;
          z-index: 50;
        }

        .logo-text {
          font-weight: bold;
          font-size: 24px;
          margin-right: 24px;
          user-select: none;
        }

        .g-blue { color: #4285F4; }
        .g-red { color: #EA4335; }
        .g-yellow { color: #FBBC05; }
        .g-green { color: #34A853; }

        .search-box-container {
          flex: 1;
          max-width: 690px;
          position: relative;
        }

        .search-box {
          background-color: #303134;
          border: 1px solid transparent;
          border-radius: 24px;
          color: #e8eaed;
          display: flex;
          align-items: center;
          padding: 0 16px 0 20px;
          height: 44px;
          width: 100%;
          box-shadow: 0 1px 6px rgba(32,33,36,0.28);
          font-size: 16px;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: #e8eaed;
          outline: none;
          width: 100%;
          padding: 0;
          font-size: 15px;
        }

        .navigation-tabs {
          display: flex;
          gap: 20px;
          border-bottom: 1px solid #3c4043;
          padding: 0 24px 0 180px;
          font-size: 14px;
          color: #969ba1;
        }

        .tab-item {
          padding: 12px 10px;
          cursor: pointer;
          position: relative;
        }

        .tab-item.active {
          color: #8ab4f8;
          font-weight: 500;
        }

        .tab-item.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #8ab4f8;
          border-radius: 3px 3px 0 0;
        }

        .main-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px 60px 180px;
          display: flex;
          gap: 60px;
        }

        @media (max-width: 1024px) {
          .main-layout {
            padding-left: 24px;
            flex-direction: column;
            gap: 24px;
          }
          .navigation-tabs {
            padding-left: 24px;
          }
        }

        .search-results-section {
          flex: 1;
          max-width: 652px;
        }

        .search-stats {
          color: #9aa0a6;
          font-size: 14px;
          margin-bottom: 22px;
        }

        .search-result-card {
          margin-bottom: 30px;
        }

        .breadcrumb-trail {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #bdc1c6;
          margin-bottom: 4px;
        }

        .url-domain {
          color: #dadce0;
          font-weight: 400;
        }

        .url-path {
          color: #9aa0a6;
          margin-left: 4px;
        }

        .result-title {
          font-size: 20px;
          line-height: 1.3;
          font-weight: normal;
          margin: 0 0 4px 0;
        }

        .result-title a {
          color: #8ab4f8;
          text-decoration: none;
        }

        .result-title a:hover {
          text-decoration: underline;
        }

        .result-snippet {
          font-size: 14px;
          line-height: 1.58;
          color: #bdc1c6;
          margin: 0;
        }

        /* Featured Snippet styling */
        .featured-snippet-container {
          background-color: #303134;
          border: 1px solid #3c4043;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .snippet-text {
          font-size: 18px;
          line-height: 1.5;
          color: #e8eaed;
          margin: 0 0 16px 0;
        }

        .source-link {
          text-decoration: none;
          color: #8ab4f8;
        }

        .source-link:hover .source-title {
          text-decoration: underline;
        }

        /* "People also ask" structure */
        .paa-container {
          border: 1px solid #3c4043;
          border-radius: 8px;
          margin-bottom: 30px;
          overflow: hidden;
        }

        .paa-title {
          font-size: 20px;
          padding: 16px 20px 8px 20px;
          margin: 0;
          font-weight: normal;
        }

        .accordion-item {
          border-top: 1px solid #3c4043;
          cursor: pointer;
        }

        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          font-size: 15px;
          color: #e8eaed;
        }

        .accordion-header:hover {
          background-color: #303134;
        }

        .accordion-content {
          padding: 16px 20px;
          background-color: #2b2c2f;
          border-top: 1px solid #3c4043;
          font-size: 14px;
          line-height: 1.5;
          color: #bdc1c6;
        }

        .accordion-content p {
          margin: 0;
        }

        /* Side Knowledge Panel */
        .knowledge-panel-section {
          width: 368px;
          shrink: 0;
        }

        @media (max-width: 1024px) {
          .knowledge-panel-section {
            width: 100%;
            max-width: 652px;
          }
        }

        .knowledge-panel {
          border: 1px solid #3c4043;
          border-radius: 8px;
          padding: 20px;
          background-color: #202124;
        }

        .panel-title {
          font-size: 24px;
          margin: 0 0 4px 0;
          font-weight: normal;
        }

        .panel-subtitle {
          color: #9aa0a6;
          font-size: 14px;
          margin: 0 0 16px 0;
        }

        .panel-description {
          font-size: 14px;
          line-height: 1.58;
          color: #bdc1c6;
          margin: 0;
        }

        /* Pagination & footer */
        .pagination-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 40px;
          padding: 20px 0;
          border-top: 1px solid #3c4043;
        }

        .logo-font {
          font-size: 32px;
          letter-spacing: -1px;
          font-weight: bold;
          user-select: none;
        }

        .footer-banner {
          font-family: monospace;
          background: #171717;
          border-top: 1px solid #333333;
          padding: 12px 24px;
          font-size: 11px;
          color: #888888;
          text-align: center;
          margin-top: 40px;
        }

        .hidden {
          display: none !important;
        }
      </style>
      <script>
        function toggleAccordion(id) {
          const content = document.getElementById(id);
          const arrow = content.previousElementSibling.querySelector('.arrow');
          if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            arrow.textContent = '▲';
            arrow.style.color = '#8ab4f8';
          } else {
            content.classList.add('hidden');
            arrow.textContent = '▼';
            arrow.style.color = '';
          }
        }

        function handleLocalSearch(event) {
          event.preventDefault();
          const query = document.getElementById('search-input-box').value.trim();
          if (query) {
            window.parent.postMessage({ 
              type: 'BROWSER_NAVIGATE', 
              url: 'https://www.google.com/search?q=' + encodeURIComponent(query) 
            }, '*');
          }
        }
      </script>
    </head>
    <body>
      <!-- Top banner headers search tool -->
      <header class="header-top">
        <div class="logo-text">
          <span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span>
        </div>
        <div class="search-box-container">
          <form onsubmit="handleLocalSearch(event)">
            <div class="search-box">
              <input id="search-input-box" type="text" value="${searchBarValue}" placeholder="Search Google..."/>
              <button type="submit" class="text-sky-400 p-1 hover:text-sky-300 font-bold text-sm">🔍</button>
            </div>
          </form>
        </div>
      </header>

      <!-- Navigation filter pills -->
      <div class="navigation-tabs">
        <div class="tab-item active">All</div>
        <div class="tab-item">Images</div>
        <div class="tab-item font-medium">News</div>
        <div class="tab-item">Videos</div>
        <div class="tab-item">Maps</div>
        <div class="tab-item font-medium">Shopping</div>
      </div>

      <!-- Main core SERP container -->
      <main class="main-layout">
        <!-- Main left organic search result stack -->
        <div class="search-results-section">
          <div class="search-stats">About 1,450,000 results (0.24 seconds)</div>
          
          <!-- Optional featured highlight box -->
          ${featuredHtml}

          <!-- People also ask Accordions list -->
          <div class="paa-container">
            <h2 class="paa-title">People also ask</h2>
            ${peopleAskHtml}
          </div>

          <!-- Direct organic lists -->
          <div class="space-y-6">
            ${resultsHtml}
          </div>

          <!-- Bottom decoration logo -->
          <div class="pagination-container">
            <span class="logo-font">
              <span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-yellow">o</span><span class="g-yellow">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span>
            </span>
            <span class="text-slate-400 text-xs mt-2">Page 1 of search indexed records</span>
          </div>
        </div>

        <!-- Right Side sidebar knowledge panel details -->
        <div class="knowledge-panel-section">
          ${panelHtml}
        </div>
      </main>

      <footer class="footer-banner">
        <span>INTERACTIVE CORE GOOGLE-INDEX EMULATED CHANNELS</span>
      </footer>

      <script>
        // Inject Interceptor Script after body loads
        (function() {
          document.addEventListener('click', function(e) {
            const a = e.target.closest('a');
            if (a) {
              const href = a.getAttribute('href') || a.href;
              if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:') && !href.startsWith('#')) {
                e.preventDefault();
                var targetUrl = href;
                try {
                  targetUrl = new URL(href, window.location.href).href;
                } catch(err) {}
                window.parent.postMessage({ type: 'BROWSER_NAVIGATE', url: targetUrl }, '*');
              }
            }
          }, true);
        })();
      </script>
    </body>
    </html>
  `;
}

// Persistent in-memory session cookie jar per hostname
const domainCookies = new Map<string, string>();

// SSRF blocklist regex
const isLocalNetwork = (host: string) => {
  return /^(localhost|127\.\d+\.\d+\.\d+|::1|169\.254\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+|fc00::|fd00::)/.test(host);
};

// 1. Fetch & Proxy Web Page
app.get("/api/proxy", async (req, res) => {
  const urlParam = req.query.url as string;
  if (!urlParam) {
    return res.status(400).send("Missing target URL parameter.");
  }

  let targetUrl = urlParam;
  const bypassCache = req.query.reload === "true";

  // Dynamic privacy shield configurations from client
  const shieldCanvas = req.query.shieldCanvas !== "false";
  const shieldWebRTC = req.query.shieldWebRTC !== "false";
  const shieldAudio = req.query.shieldAudio !== "false";
  const shieldWebdriver = req.query.shieldWebdriver !== "false";
  const userAgentKey = (req.query.userAgent as string) || "chrome-windows";

  const UA_MAP: Record<string, string> = {
    "chrome-windows": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "safari-mac": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
    "firefox-linux": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "edge-windows": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
  };

  const selectedUserAgent = UA_MAP[userAgentKey] || UA_MAP["chrome-windows"];

  // Handle universal Google Interception (search + homepage) case-insensitively
  const googleData = parseGoogleUrl(targetUrl);
  if (googleData.isGoogle) {
    try {
      if (googleData.isSearch) {
        if (!bypassCache) {
          const cachedHtml = await cacheDb.getProxy(targetUrl);
          if (cachedHtml) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("X-Cache", "HIT");
            return res.send(cachedHtml);
          }
        }

        const modelParam = (req.query.model as string) || "gemini-3.5-flash";
        const searchResultsHtml = await generateGoogleSearchResultsPage(modelParam, googleData.query);
        await cacheDb.setProxy(targetUrl, searchResultsHtml);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Cache", "MISS");
        return res.send(searchResultsHtml);
      } else {
        if (!bypassCache) {
          const cachedHtml = await cacheDb.getProxy(targetUrl);
          if (cachedHtml) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("X-Cache", "HIT");
            return res.send(cachedHtml);
          }
        }

        const homepageHtml = generateGoogleHomepage();
        await cacheDb.setProxy(targetUrl, homepageHtml);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Cache", "MISS");
        return res.send(homepageHtml);
      }
    } catch (err: any) {
      console.error("Google universal interception failure:", err.message);
    }
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "http://" + targetUrl;
  }

  let requestUrl;
  try {
    requestUrl = new URL(targetUrl);
    if (isLocalNetwork(requestUrl.hostname)) {
      return res.status(403).send("Forbidden local network access.");
    }
  } catch {
    return res.status(400).send("Invalid target URL provided.");
  }
  const hostname = requestUrl.hostname;

  if (!bypassCache) {
    const cachedHtml = await cacheDb.getProxy(targetUrl);
    if (cachedHtml) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Cache", "HIT");
      return res.send(cachedHtml);
    }
  }

  try {
    const response = await fetch(targetUrl, {
      dispatcher: fetchDispatcher,
      headers: {
        "User-Agent": selectedUserAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": domainCookies.get(hostname) || "",
        "Sec-Fetch-Mode": "navigate"
      },
      signal: AbortSignal.timeout(10000) // 10s timeout
    } as any);

    if (!response.ok) {
      throw new Error(`Target server responded with status ${response.status}`);
    }

    const setCookies = response.headers.get("set-cookie");
    if (setCookies) {
      domainCookies.set(hostname, setCookies);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType && !contentType.includes("text/html")) {
      res.set("Content-Type", contentType);
      const arrayBuffer = await response.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Resolve relative assets
    const resolveUrl = (rel: string) => {
      try {
        return new URL(rel, targetUrl).href;
      } catch {
        return rel;
      }
    };

    // Proxy resources strictly through the proxy server
    const proxyUrlStr = (rel: string) => {
      try {
        const absolute = new URL(rel, targetUrl).href;
        return `/api/proxy?url=${encodeURIComponent(absolute)}&userAgent=${userAgentKey}`;
      } catch {
        return rel;
      }
    };

    // Rewrite Href - point to absolute URL so interceptor can catch it
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        $(el).attr("href", resolveUrl(href));
      }
    });

    // Rewrite Image src & srcset - strictly tunnel via proxy
    $("img, picture source, iframe").each((i, el) => {
      const src = $(el).attr("src");
      if (src) $(el).attr("src", proxyUrlStr(src));
      const srcset = $(el).attr("srcset");
      if (srcset) {
        try {
          const rewrittenSrcset = srcset.split(",").map(part => {
            const parts = part.trim().split(/\s+/);
            if (parts[0]) {
              parts[0] = proxyUrlStr(parts[0]);
            }
            return parts.join(" ");
          }).join(", ");
          $(el).attr("srcset", rewrittenSrcset);
        } catch (e) {
          // Ignore srcset parsing failures
        }
      }
    });

    // Rewrite link stylesheet
    $("link").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        $(el).attr("href", proxyUrlStr(href));
      }
    });

    // Rewrite script src
    $("script").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        $(el).attr("src", proxyUrlStr(src));
      }
    });

    // Inject Interceptor Script before body loads
    let interceptorScript = `
      <script>
        (function() {
    `;

    if (shieldCanvas) {
      interceptorScript += `
          // 1. HTML5 Canvas Anti-Fingerprinting Setup
          try {
            if (!window.__canvas_noise_active__) {
              window.__canvas_noise_active__ = true;

              const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
              const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
              const originalToBlob = HTMLCanvasElement.prototype.toBlob;

              CanvasRenderingContext2D.prototype.getImageData = function(x, y, width, height) {
                const result = originalGetImageData.apply(this, arguments);
                const data = result.data;
                // Add extremely subtle LSB noise to active (not fully transparent) pixels
                for (let i = 0; i < data.length; i += 4) {
                  if (data[i + 3] > 0) {
                    const noiseR = Math.random() > 0.5 ? 1 : -1;
                    const noiseG = Math.random() > 0.5 ? 1 : -1;
                    const noiseB = Math.random() > 0.5 ? 1 : -1;

                    data[i] = Math.max(0, Math.min(255, data[i] + noiseR));
                    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noiseG));
                    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noiseB));
                  }
                }
                return result;
              };

              HTMLCanvasElement.prototype.toDataURL = function() {
                const width = this.width;
                const height = this.height;
                if (width === 0 || height === 0) {
                  return originalToDataURL.apply(this, arguments);
                }
                try {
                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = width;
                  tempCanvas.height = height;
                  const tempCtx = tempCanvas.getContext('2d');
                  if (tempCtx) {
                    tempCtx.drawImage(this, 0, 0);
                    const imgData = tempCtx.getImageData(0, 0, width, height);
                    tempCtx.putImageData(imgData, 0, 0);
                    return originalToDataURL.apply(tempCanvas, arguments);
                  }
                } catch (e) {}
                return originalToDataURL.apply(this, arguments);
              };

              HTMLCanvasElement.prototype.toBlob = function() {
                const width = this.width;
                const height = this.height;
                if (width === 0 || height === 0) {
                  return originalToBlob.apply(this, arguments);
                }
                try {
                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = width;
                  tempCanvas.height = height;
                  const tempCtx = tempCanvas.getContext('2d');
                  if (tempCtx) {
                    tempCtx.drawImage(this, 0, 0);
                    const imgData = tempCtx.getImageData(0, 0, width, height);
                    tempCtx.putImageData(imgData, 0, 0);
                    return originalToBlob.apply(tempCanvas, arguments);
                  }
                } catch (e) {}
                return originalToBlob.apply(this, arguments);
              };
            }
          } catch (e) {
            console.warn("[Stealth Option] Canvas noise injection failed:", e);
          }
      `;
    }

    if (shieldWebRTC) {
      interceptorScript += `
          // 2. Disable WebRTC to block local and public IP leakage bypassing proxy
          try {
            window.RTCPeerConnection = undefined;
            window.webkitRTCPeerConnection = undefined;
            Object.defineProperty(window, 'RTCPeerConnection', { value: undefined, configurable: false, writable: false });
            Object.defineProperty(window, 'webkitRTCPeerConnection', { value: undefined, configurable: false, writable: false });
          } catch (e) {}
      `;
    }

    if (shieldAudio) {
      interceptorScript += `
          // 3. Web Audio API Anti-Fingerprinting Jitter
          try {
            if (window.AudioBuffer) {
              const originalGetChannelData = AudioBuffer.prototype.getChannelData;
              AudioBuffer.prototype.getChannelData = function(channel) {
                const data = originalGetChannelData.apply(this, arguments);
                for (let i = 0; i < data.length; i += 100) {
                  data[i] += (Math.random() - 0.5) * 1e-7;
                }
                return data;
              };
            }
            if (window.AnalyserNode) {
              const originalGetByteFrequencyData = AnalyserNode.prototype.getByteFrequencyData;
              AnalyserNode.prototype.getByteFrequencyData = function(array) {
                originalGetByteFrequencyData.apply(this, arguments);
                for (let i = 0; i < array.length; i++) {
                  if (array[i] > 0) {
                    array[i] = Math.max(0, Math.min(255, array[i] + (Math.random() > 0.5 ? 1 : -1)));
                  }
                }
              };
            }
          } catch (e) {}
      `;
    }

    if (shieldWebdriver) {
      interceptorScript += `
          // 4. Overriding Webdriver & Normalizing Common Fingerprints
          try {
            Object.defineProperty(navigator, 'webdriver', {
              get: () => false,
              configurable: true
            });
            const standardScreen = { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24, pixelDepth: 24 };
            for (const prop in standardScreen) {
              Object.defineProperty(Screen.prototype, prop, {
                get: () => standardScreen[prop],
                configurable: true
              });
            }
          } catch (e) {}
      `;
    }

    interceptorScript += `
          // Monitor link clicks
          document.addEventListener('click', function(e) {
            const a = e.target.closest('a');
            if (a) {
              const href = a.getAttribute('href') || a.href;
              if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:') && !href.startsWith('#')) {
                e.preventDefault();
                // Send absolute URL back to parent browser emulator
                var targetUrl = href;
                try {
                  targetUrl = new URL(href, window.location.href).href;
                } catch(err) {}
                window.parent.postMessage({ type: 'BROWSER_NAVIGATE', url: targetUrl }, '*');
              }
            }
          }, true);

          // Monitor form submissions
          document.addEventListener('submit', function(e) {
            e.preventDefault();
            const form = e.target;
            const action = form.getAttribute('action') || '';
            var targetUrl = action;
            try {
              targetUrl = new URL(action, window.location.href).href;
            } catch(err) {}

            const formData = new FormData(form);
            const params = new URLSearchParams();
            for (const [key, val] of formData.entries()) {
              if (typeof val === 'string') {
                params.append(key, val);
              }
            }

            const method = (form.method || 'GET').toUpperCase();
            if (method === 'GET' && params.toString()) {
              const urlObj = new URL(targetUrl);
              urlObj.search = params.toString();
              targetUrl = urlObj.href;
            }

            window.parent.postMessage({ type: 'BROWSER_NAVIGATE', url: targetUrl }, '*');
          }, true);
        })();
      </script>
    `;

    $("head").prepend(interceptorScript);

    // Return rewritten HTML
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Cache", "MISS");
    const finalHtml = $.html();
    await cacheDb.setProxy(targetUrl, finalHtml);
    res.send(finalHtml);

  } catch (error: any) {
    console.error("Proxy error for URL:", targetUrl, error.message);
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              padding: 40px; 
              color: #f3f4f6; 
              background: #0f172a; 
              line-height: 1.6; 
              text-align: center; 
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 80vh;
              margin: 0;
            }
            .card { 
              max-width: 580px; 
              background: #1e293b; 
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); 
              border: 1px solid #334155; 
            }
            h2 { color: #f43f5e; margin-top: 0; font-size: 24px; font-weight: 700; margin-bottom: 16px; }
            p { margin-bottom: 24px; color: #94a3b8; font-size: 15px; }
            .badge-url {
              font-family: monospace;
              background: #0f172a;
              color: #38bdf8;
              padding: 6px 12px;
              border-radius: 6px;
              word-break: break-all;
              font-size: 13px;
              display: inline-block;
              margin-bottom: 24px;
              border: 1px solid #1e293b;
            }
            button { 
              background: #0ea5e9; 
              color: #fff; 
              border: none; 
              padding: 12px 24px; 
              font-size: 15px; 
              border-radius: 8px; 
              cursor: pointer; 
              font-weight: 600; 
              transition: all 0.2s; 
              box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
            }
            button:hover { 
              background: #0284c7; 
              transform: translateY(-1px);
              box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
            }
            button:active {
              transform: translateY(1px);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Connection Restriction Avoided</h2>
            <p>Direct CORS fetch is restricted or blocked by target host policies (e.g., Cloudflare security shield or frame-busting protection).</p>
            <div class="badge-url">${targetUrl}</div>
            <p>Fear not! We have a dedicated built-in <strong>High-Fidelity AI Reconstruction</strong>. Try triggering the AI emulation below.</p>
            <button onclick="window.parent.postMessage({ type: 'TRIGGER_AI_EMULATION', url: '${targetUrl}' }, '*')">Run High-Fidelity AI Emulation</button>
          </div>
        </body>
      </html>
    `);
  }
});

// 2. Extracted Structural Analysis endpoint
app.post("/api/analyze", async (req, res) => {
  const { url, reload } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing URL." });
  }

  let targetUrl = url;
  const bypassCache = reload === true;

  // Intercept Google queries case-insensitively for analyzing
  const googleData = parseGoogleUrl(targetUrl);
  if (googleData.isGoogle) {
    try {
      if (!bypassCache) {
        const cached = await cacheDb.getAnalyze(targetUrl);
        if (cached) {
          return res.json(cached);
        }
      }

      const result = googleData.isSearch
        ? {
            title: `${googleData.query} - Google Search`,
            metaDescription: `Interactive browser emulated search listings matching your live custom query: "${googleData.query}".`,
            headings: [
              { tag: "H1", text: "Google" },
              { tag: "H2", text: "Search Results" },
              { tag: "H3", text: `${googleData.query} organic links` }
            ],
            links: [
              { text: "About Google", href: "https://www.google.com/about" }
            ],
            images: [],
            textLength: 1000,
            sampleText: `Search results page for "${googleData.query}". Click on links and headings to explore emulated resources dynamically.`
          }
        : {
            title: "Google",
            metaDescription: "Search the world's information, including webpages, images, videos and more.",
            headings: [
              { tag: "H1", text: "Google" }
            ],
            links: [
              { text: "About", href: "https://about.google/" },
              { text: "Store", href: "https://store.google.com/" },
              { text: "Gmail", href: "https://mail.google.com" },
              { text: "Images", href: "https://www.google.com/imghp" }
            ],
            images: [],
            textLength: 500,
            sampleText: "Search Google or type a URL. Interactive browser emulated Google Homepage."
          };

      await cacheDb.setAnalyze(targetUrl, result);
      return res.json(result);
    } catch (e: any) {
      console.warn("Analysis Google interception issue:", e.message);
    }
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "http://" + targetUrl;
  }

  try {
    const requestUrl = new URL(targetUrl);
    if (isLocalNetwork(requestUrl.hostname)) {
      return res.status(403).json({ error: "Forbidden local network access." });
    }
  } catch {
    return res.status(400).json({ error: "Invalid target URL provided." });
  }

  if (!bypassCache) {
    const cached = await cacheDb.getAnalyze(targetUrl);
    if (cached) {
      return res.json(cached);
    }
  }

  try {
    const fetchRes = await fetch(targetUrl, {
      dispatcher: fetchDispatcher,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cookie": domainCookies.get(new URL(targetUrl).hostname) || ""
      },
      signal: AbortSignal.timeout(8000)
    } as any);
    
    const setCookies = fetchRes.headers.get("set-cookie");
    if (setCookies) {
      domainCookies.set(new URL(targetUrl).hostname, setCookies);
    }

    const html = await fetchRes.text();
    const $ = cheerio.load(html);

    // Extract basic properties
    const title = $("title").text().trim() || new URL(targetUrl).hostname;
    const metaDesc = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "No page description metadata found.";
    
    // Extract Headings
    const headings: { tag: string, text: string }[] = [];
    $("h1, h2, h3").each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({
          tag: el.name.toUpperCase(),
          text: text.slice(0, 100)
        });
      }
    });

    // Links list
    const links: { text: string; href: string }[] = [];
    $("a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      if (text && href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        links.push({
          text: text.slice(0, 80),
          href: href
        });
      }
    });

    // Images list
    const images: string[] = [];
    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (src) images.push(src);
    });

    // Rendered text structure
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const result = {
      title,
      metaDescription: metaDesc,
      headings: headings.slice(0, 40),
      links: links.slice(0, 50),
      images: images.slice(0, 30),
      textLength: bodyText.length,
      sampleText: bodyText.slice(0, 4000)
    };
    await cacheDb.setAnalyze(targetUrl, result);
    return res.json(result);

  } catch (err: any) {
    console.error("Analysis target failed:", err.message);
    const hostname = new URL(targetUrl).hostname;
    return res.json({
      title: hostname,
      metaDescription: "The page metadata could not be fetched. We will perform AI Emulation based on the site domain identity and typical layout characteristics.",
      headings: [],
      links: [],
      images: [],
      textLength: 0,
      sampleText: `Host: ${hostname}. Visited URL: ${targetUrl}. Connection shielded.`
    });
  }
});

// 3. AI High-Fidelity webpage Emulation using Gemini
app.post("/api/ai-emu", async (req, res) => {
  const { url, sampledText, metadata, reload, model = "gemini-3.5-flash" } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  let requestUrl;
  try {
    requestUrl = new URL(url);
    if (isLocalNetwork(requestUrl.hostname)) {
      return res.status(403).json({ error: "Forbidden local network access." });
    }
  } catch {
    return res.status(400).json({ error: "Invalid focus URL provided." });
  }

  const bypassCache = reload === true;

  // Intercept Google queries case-insensitively for AI Emulation
  const googleData = parseGoogleUrl(url);
  if (googleData.isGoogle) {
    try {
      if (!bypassCache) {
        const cached = await cacheDb.getAiEmu(url);
        if (cached) {
          return res.json(cached);
        }
      }

      const result = googleData.isSearch
        ? {
            siteTitle: `${googleData.query} - Google Search`,
            brandDescription: "Classic Google minimal layout optimized for rapid indexing and high readability standards.",
            extractedBrandColors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
            designReview: "Constructed an authentic response matrix matching modern search patterns, complete with a sticky header toolbar, query parameters, people-also-ask accordions, organic link items, and a side panel card.",
            reconstructedCode: await generateGoogleSearchResultsPage(model, googleData.query)
          }
        : {
            siteTitle: "Google",
            brandDescription: "The world's most famous and minimal landing portal. Pure white/dark negative space centered around the high-contrast colorful word mark logotype, simple input capsule with mic & image search icons, search & feeling-lucky buttons, and multi-column clean footer layouts.",
            extractedBrandColors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
            designReview: "Produced pristine, high-fidelity replica centering the brand's primary signposts exactly. The mockup features fully interactive inline localized query triggering and translation anchors.",
            reconstructedCode: generateGoogleHomepage()
          };

      await cacheDb.setAiEmu(url, result);
      return res.json(result);
    } catch (e: any) {
      console.warn("AI Emu Google interception problem:", e.message);
    }
  }

  if (!bypassCache) {
    const cached = await cacheDb.getAiEmu(url);
    if (cached) {
      return res.json(cached);
    }
  }

  const hostname = new URL(url).hostname;
  const ai = getAiClient();

  const prompt = `
    You are an expert Frontend Engineer and UI/UX Designer.
    Your task is to generate a comprehensive, highly realistic, custom-styled single-page HTML mockup code representation that emulates the given target page URL: "${url}".
    
    Target domain details:
    - Hostname: ${hostname}
    - URL: ${url}
    ${metadata ? `- Metadata collected: ${JSON.stringify(metadata)}` : ""}
    ${sampledText ? `- Scraped content draft: ${sampledText.slice(0, 2500)}` : ""}

    Generate an emulation using modern standard HTML paired with custom Tailwind CSS utility classes. Since the page may be loaded dynamically, please integrate actual functional representations of the brand's aesthetic (including layout structure, navigation bars, visual hero sections, feature grids, list items, dynamic cards, standard footers, sidebars, interactive dialog mockups, and fully populated descriptive tables).
    
    Design Guidelines:
    - Recreate the core vibe of this brand (e.g., if it is Wikipedia: academic, neat, gray, blue text, double columns; if Hacker News: tech-classic, orange banner, neat list numbering, clean sans-serif/mono layout; if Stripe/SaaS: ultra-modern dark/light neon gradients, luxury typography tracking, cards, interactive toggle flows; if a news source: heavy grid layout, bold editorial display headings, media cards).
    - Exclude external script files or arbitrary iframes, but include standard inline SVG icons (from Lucide / standard SVGs) for visual elements. Let the CSS use standard imported Google Fonts if necessary.
    - Keep all text highly readable and humanly natural. No generic filler "Lorem Ipsum" — use real, descriptive content related to the specific website subject.
    - Provide realistic clickable mock controls with visual interactive hints.
    
    You must respond strictly with a valid JSON object matching this schema:
    {
      "siteTitle": "Visual page title",
      "brandDescription": "Brief analysis of the brand vibe",
      "extractedBrandColors": ["#HEX1", "#HEX2", "and others..."],
      "designReview": "Short explanation of the aesthetic, grid alignments, visual metrics, typography pairings, and key components designed into your code.",
      "reconstructedCode": "The full complete HTML/Tailwind block. Start with a structured wrapper <div class='...'> and include complete visual UI details. Use Tailwind CSS v4 class properties. Ensure everything is self-contained. Integrate interactive classes like hover:scale-102 etc. to make it feel deeply premium."
    }
    
    Do not wrap the JSON output in markdown ticks except the standard JSON formatting if required, but make sure to return exact JSON parseable data.
  `;

  try {
    const rawResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            siteTitle: { type: Type.STRING },
            brandDescription: { type: Type.STRING },
            extractedBrandColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            designReview: { type: Type.STRING },
            reconstructedCode: { type: Type.STRING }
          },
          required: ["siteTitle", "brandDescription", "extractedBrandColors", "designReview", "reconstructedCode"]
        }
      }
    });

    const responseText = rawResponse.text;
    const parsedData = JSON.parse(responseText);
    await cacheDb.setAiEmu(url, parsedData);
    res.json(parsedData);

  } catch (error: any) {
    console.error("AI Emulation generation error:", error.message);
    res.status(500).json({
      error: "AI Emulation failed",
      message: error.message,
      fallback: {
        siteTitle: hostname,
        brandDescription: "Classic layout emulation",
        extractedBrandColors: ["#3b82f6", "#1f2937"],
        designReview: "Fallback basic template generated due to connection restrictions.",
        reconstructedCode: `
          <div class="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
            <header class="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-slate-800">
              <span class="text-2xl font-bold font-mono tracking-tight text-indigo-600">${hostname}</span>
              <nav class="space-x-4"><a href="#" class="text-sm font-medium text-indigo-600 dark:text-indigo-400">Home</a></nav>
            </header>
            <main class="py-12 max-w-4xl mx-auto text-center">
              <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">AI Emulated Mockup</h1>
              <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">This is a smart fallback representation of ${hostname}. Visual server response timed out.</p>
              <div class="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
                <h3 class="text-xl font-bold mb-2 text-indigo-600">Site Metadata</h3>
                <p class="text-sm">We prepared a direct emulation of this coordinate block. Ensure to verify standard web protocol formats.</p>
              </div>
            </main>
          </div>
        `
      }
    });
  }
});

// 3.5. Readability extraction using Gemini and Cheerio pre-cleaning
app.post("/api/readability", async (req, res) => {
  const { url, model = "gemini-3.5-flash" } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  let targetUrl = url;
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "http://" + targetUrl;
  }

  const cacheKey = "readability:" + targetUrl;
  try {
    const cached = await cacheDb.getAiEmu(cacheKey);
    if (cached) {
      return res.json(cached);
    }
  } catch (e) {
    console.warn("Readability cache read failed:", e);
  }

  try {
    const fetchRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(8000)
    });

    const html = await fetchRes.text();
    const $ = cheerio.load(html);

    // Initial clean targeting common noise tags
    $("script, style, iframe, noscript, svg, footer, header, nav, aside, .ads, .sidebar, #comments, .comments, .menu").remove();

    const pageTitle = $("title").text().trim() || $("h1").first().text().trim() || new URL(targetUrl).hostname;
    
    // Grab main text block sample for Gemini text extraction
    const rawParagraphs: string[] = [];
    $("p, article, section, h1, h2, h3, h4, li").each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) {
        rawParagraphs.push(text);
      }
    });

    const bodySampleText = rawParagraphs.join("\n\n").slice(0, 10000) || $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);

    const prompt = `
      You are an expert Article Readability Purifier.
      Analyze the scraped text content below from the website URL: ${targetUrl}.
      
      Tasks:
      1. Sift through the content to identify the main article title, author (or publication source byline), and the central reading body.
      2. Reconstruct ONLY the core article body text into clean, accessible, high-contrast typography HTML format using standard tags like:
         <p>, <h2>, <h3>, <ul>, <ol>, <strong>, <em>, <blockquote>.
      3. CRITICAL: Do NOT include any navigation headers, sidebars, social sharing panels, footer menus, newsletters, ads, comment sections, or general header bar widgets. It should feel like a premium, clean book page view or a high-contrast Instapaper/Pocket article.
      4. Compute a reliable word count and estimate the reading time (use ~200 words per minute).
      
      Text Data Sample:
      ${bodySampleText}

      Return your response STRICTLY as a valid JSON object matching this schema structure:
      {
        "title": "Determined Core Article Title",
        "byline": "Determined Author/Publisher Byline (or null)",
        "content": "<p>Main paragraph content here...</p><h2>Subheading</h2><p>Additional paragraph...</p>",
        "wordCount": 1150,
        "readingTime": "6 min read",
        "sourceUrl": "${targetUrl}"
      }
      
      Note: Return ONLY raw JSON, with no markdown code block wrapped around the JSON (no wrap like \`\`\`json).
    `;

    const ai = getAiClient();
    const rawResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = rawResponse.text;
    const readabilityResult = JSON.parse(responseText || "{}");

    await cacheDb.setAiEmu(cacheKey, readabilityResult);
    return res.json(readabilityResult);

  } catch (error: any) {
    console.error("Readability generation failed:", error);
    // Simple heuristic fallback if Gemini fails or fetch blocks
    const fallbackTitle = new URL(targetUrl).hostname;
    const fallbackResult = {
      title: fallbackTitle,
      byline: "Web Scraper Fallback",
      content: `
        <p class="text-amber-500 font-semibold font-mono">Notice: We couldn't perform full AI Readability cleanup on this host due to server restrictions or timeout.</p>
        <p>The system was able to connect but could not safely structure the content with high-accuracy. Try reloading or selecting a larger Gemini model in the toolbar.</p>
        <p>Target URL: <a href="${targetUrl}" class="text-cyan-500 underline" target="_blank">${targetUrl}</a></p>
      `,
      wordCount: 100,
      readingTime: "1 min read",
      sourceUrl: targetUrl
    };
    return res.json(fallbackResult);
  }
});

// 4. Cache management endpoints
app.get("/api/cache/stats", async (req, res) => {
  try {
    const stats = await cacheDb.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cache/delete", async (req, res) => {
  const { url, type } = req.body;
  try {
    await cacheDb.deleteEntry(url, type);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cache/clear", async (req, res) => {
  try {
    await cacheDb.clearAll();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite & Static file mapping
async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      try {
        const vite = await createViteServer({
          // Skip vite.config.ts entirely — its server.hmr block would override
          // our setting below and cause Vite to try binding port 24678 again.
          configFile: false,
          plugins: [react(), tailwindcss()],
          resolve: {
            alias: { "@": path.join(process.cwd(), ".") },
          },
          server: {
            middlewareMode: true,
            // Disable Vite's standalone HMR WebSocket server.
            // Express already owns the port; Vite must not try to bind 24678.
            hmr: false,
            watch: {},
          },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } catch (viteError) {
        console.warn("Vite initialization failed, using static fallback:", viteError);
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
          res.sendFile(path.join(distPath, "index.html"), (err) => {
            if (err) res.status(500).send("Server error - Vite and dist unavailable");
          });
        });
      }
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const HOST = process.env.LISTEN_ALL === "true" || process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

    await listenOnAvailablePort(app, PORT, HOST);
  } catch (err) {
    console.error("Fatal error during server initialization:", err);
    process.exit(1);
  }
}

function listenOnAvailablePort(
  expressApp: express.Application,
  port: number,
  host: string,
  attempt = 0
): Promise<void> {
  const MAX_ATTEMPTS = 10;
  return new Promise<void>((resolve, reject) => {
    const server = expressApp.listen(port, host, () => {
      console.log(`Server running on http://${host}:${port}`);
      resolve();
    });
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && attempt < MAX_ATTEMPTS) {
        const nextPort = port + 1;
        console.warn(`Port ${port} in use, trying ${nextPort}...`);
        server.close();
        listenOnAvailablePort(expressApp, nextPort, host, attempt + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
