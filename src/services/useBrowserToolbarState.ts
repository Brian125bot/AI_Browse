import React, { useState, useEffect } from "react";
import { BrowserMode, ViewportSize, PageHistoryItem, PageAnalysis, SavedBookmark, AiEmulation, ReadabilityData } from "../types";

const INITIAL_PRESETS: SavedBookmark[] = [
  {
    id: "preset-hn",
    title: "Hacker News",
    url: "https://news.ycombinator.com",
    createdDate: "2026-06-14"
  },
  {
    id: "preset-wiki",
    title: "Wikipedia Main Page",
    url: "https://en.wikipedia.org/wiki/Main_Page",
    createdDate: "2026-06-14"
  },
  {
    id: "preset-stripe",
    title: "Stripe UI Landing",
    url: "https://stripe.com",
    createdDate: "2026-06-14"
  },
  {
    id: "preset-github",
    title: "GitHub Portal",
    url: "https://github.com",
    createdDate: "2026-06-14"
  }
];

interface NavigationCallbacks {
  mode: BrowserMode;
  setMode: (mode: BrowserMode) => void;
  triggerAiEmulation: (url: string, analysis: PageAnalysis | null) => void;
  triggerReadability: (url: string) => void;
  setAiEmulation: (val: AiEmulation | null) => void;
  setReadabilityData: (val: ReadabilityData | null) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function useBrowserToolbarState({
  mode,
  setMode,
  triggerAiEmulation,
  triggerReadability,
  setAiEmulation,
  setReadabilityData,
  iframeRef
}: NavigationCallbacks) {
  // Navigation stack state
  const [historyStack, setHistoryStack] = useState<PageHistoryItem[]>([
    {
      url: "https://news.ycombinator.com",
      title: "Hacker News",
      timestamp: "10:27 AM",
      mode: BrowserMode.PROXY
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Content analytical states
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Bookmarks state (loads from localStorage)
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>(() => {
    const saved = localStorage.getItem("emulator_bookmarks");
    return saved ? JSON.parse(saved) : INITIAL_PRESETS;
  });

  const currentItem = historyStack[historyIndex];
  const currentUrl = currentItem ? currentItem.url : "https://news.ycombinator.com";

  // Persistent storage for bookmarks
  useEffect(() => {
    localStorage.setItem("emulator_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Fetch metadata details & analyze DOM on navigation
  const fetchMetadataAnalysis = async (url: string, indexOverride?: number) => {
    setIsLoadingMetadata(true);
    setErrorStatus(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error("Could not contact analytical services.");
      }

      const data = await response.json();
      setAnalysis(data);

      // Auto update history item title if default hostname was used
      let parsedHost = "";
      try {
        parsedHost = new URL(url).hostname;
      } catch (e) {}

      if (data.title && parsedHost) {
        setHistoryStack(prevStack => {
          const targetIndex = indexOverride !== undefined ? indexOverride : historyIndex;
          const currentItemText = prevStack[targetIndex];
          if (currentItemText && currentItemText.title === parsedHost) {
            const updateStack = [...prevStack];
            updateStack[targetIndex] = {
              ...updateStack[targetIndex],
              title: data.title
            };
            return updateStack;
          }
          return prevStack;
        });
      }
    } catch (err: any) {
      console.warn("Analysis failed:", err.message);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Main navigation action
  const handleNavigate = (url: string, targetMode: BrowserMode = mode) => {
    let cleanUrl = url.trim();

    // Check if this is a search query
    const isSearchQueryCheck = (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return false;
      if (trimmed.includes(" ")) return true;
      if (/^https?:\/\//i.test(trimmed)) return false;
      if (!trimmed.includes(".")) return true;
      const urlPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}(:\d+)?(\/.*)?$/;
      return !urlPattern.test(trimmed);
    };

    let titleText = "";
    if (isSearchQueryCheck(cleanUrl)) {
      const queryVal = cleanUrl;
      cleanUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanUrl)}`;
      titleText = `Search: ${queryVal}`;
    } else {
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = "https://" + cleanUrl;
      }
      try {
        const parsed = new URL(cleanUrl);
        if (parsed.hostname.includes("google.com") && parsed.searchParams.has("q")) {
          titleText = `Search: ${parsed.searchParams.get("q")}`;
        } else {
          titleText = parsed.hostname;
        }
      } catch (e) {
        cleanUrl = "https://news.ycombinator.com";
        titleText = "news.ycombinator.com";
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newHistoryItem: PageHistoryItem = {
      url: cleanUrl,
      title: titleText,
      timestamp: timeStr,
      mode: targetMode
    };

    // Strip forward history stack elements
    const updatedStack = historyStack.slice(0, historyIndex + 1);
    const finalStack = [...updatedStack, newHistoryItem];

    setHistoryStack(finalStack);
    const nextIndex = finalStack.length - 1;
    setHistoryIndex(nextIndex);
    setAiEmulation(null); // Clear previous AI emulations

    // Let state update then execute fetch
    fetchMetadataAnalysis(cleanUrl, nextIndex);

    // If navigated in AI mode automatically request code
    if (targetMode === BrowserMode.AI_EMULATION) {
      triggerAiEmulation(cleanUrl, null);
    } else if (targetMode === BrowserMode.READABILITY) {
      triggerReadability(cleanUrl);
    }
  };

  // Run initial page analyze
  useEffect(() => {
    fetchMetadataAnalysis(currentUrl, 0);
  }, []);

  // Handle History back/forward
  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const prevItem = historyStack[prevIdx];
      setMode(prevItem.mode);
      setAiEmulation(null);
      fetchMetadataAnalysis(prevItem.url, prevIdx);
      if (prevItem.mode === BrowserMode.AI_EMULATION) {
        triggerAiEmulation(prevItem.url, null);
      } else if (prevItem.mode === BrowserMode.READABILITY) {
        triggerReadability(prevItem.url);
      }
    }
  };

  const handleGoForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextItem = historyStack[nextIdx];
      setMode(nextItem.mode);
      setAiEmulation(null);
      fetchMetadataAnalysis(nextItem.url, nextIdx);
      if (nextItem.mode === BrowserMode.AI_EMULATION) {
        triggerAiEmulation(nextItem.url, null);
      } else if (nextItem.mode === BrowserMode.READABILITY) {
        triggerReadability(nextItem.url);
      }
    }
  };

  const handleRefresh = () => {
    fetchMetadataAnalysis(currentUrl, historyIndex);
    if (mode === BrowserMode.AI_EMULATION) {
      triggerAiEmulation(currentUrl, analysis);
    } else if (mode === BrowserMode.READABILITY) {
      triggerReadability(currentUrl);
    } else if (iframeRef.current) {
      iframeRef.current.src = `/api/proxy?url=${encodeURIComponent(currentUrl)}`;
    }
  };

  const handleGoHome = () => {
    handleNavigate("https://news.ycombinator.com", BrowserMode.PROXY);
    setMode(BrowserMode.PROXY);
  };

  // Bookmark Toggle
  const isBookmarked = bookmarks.some(b => b.url.toLowerCase() === currentUrl.toLowerCase());

  const handleAddBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(b => b.url.toLowerCase() !== currentUrl.toLowerCase()));
    } else {
      const hostname = new URL(currentUrl).hostname;
      const title = analysis?.title || hostname;
      const newB: SavedBookmark = {
        id: "bm-" + Date.now(),
        title: title,
        url: currentUrl,
        createdDate: new Date().toISOString().split("T")[0]
      };
      setBookmarks([...bookmarks, newB]);
    }
  };

  const handleLoadBookmark = (url: string) => {
    handleNavigate(url, BrowserMode.PROXY);
    setMode(BrowserMode.PROXY);
  };

  const handleClearHistory = () => {
    setHistoryStack([currentItem]);
    setHistoryIndex(0);
  };

  return {
    historyStack,
    setHistoryStack,
    historyIndex,
    setHistoryIndex,
    viewportSize,
    setViewportSize,
    isFullscreen,
    setIsFullscreen,
    analysis,
    setAnalysis,
    isLoadingMetadata,
    errorStatus,
    bookmarks,
    currentUrl,
    currentItem,
    isBookmarked,
    handleNavigate,
    handleGoBack,
    handleGoForward,
    handleRefresh,
    handleGoHome,
    handleAddBookmark,
    handleLoadBookmark,
    handleClearHistory
  };
}
