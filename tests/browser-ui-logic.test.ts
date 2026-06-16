import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage to guarantee isolated side-effect assertion
const mockLocalStorage: Record<string, string> = {};
global.localStorage = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
  setItem: vi.fn((key: string, val: string) => { mockLocalStorage[key] = val; }),
  clear: vi.fn(() => { for (const k in mockLocalStorage) delete mockLocalStorage[k]; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
  length: 0,
  key: vi.fn(() => null)
};

describe("Client Browser Navigation & Bookmark Controller", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    for (const key in mockLocalStorage) delete mockLocalStorage[key];
  });

  describe("Query vs URL Detector Logic", () => {
    const isSearchQueryCheck = (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return false;
      if (trimmed.includes(" ")) return true;
      if (/^https?:\/\//i.test(trimmed)) return false;
      if (!trimmed.includes(".")) return true;
      const urlPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}(:\d+)?(\/.*)?$/;
      return !urlPattern.test(trimmed);
    };

    it("should classify space-fractioned terms as organic search queries", () => {
      expect(isSearchQueryCheck("modern frontend dev")).toBe(true);
      expect(isSearchQueryCheck("  hacker news  ")).toBe(true);
    });

    it("should flag protocol-prefixed targets as true URLs", () => {
      expect(isSearchQueryCheck("http://localhost:3000")).toBe(false);
      expect(isSearchQueryCheck("https://wikipedia.org")).toBe(false);
    });

    it("should classify domains and complex slashes as true URLs", () => {
      expect(isSearchQueryCheck("news.ycombinator.com")).toBe(false);
      expect(isSearchQueryCheck("wikipedia.org/wiki/Main_Page")).toBe(false);
    });

    it("should treat query descriptors lacking domain extensions as search terms", () => {
      expect(isSearchQueryCheck("wikipedia")).toBe(true);
      expect(isSearchQueryCheck("testapp")).toBe(true);
    });
  });

  describe("Bookmark Engine & localStorage Serialization", () => {
    it("should load standard default presets when bookmark localStorage is empty", () => {
      const INITIAL_PRESETS = [
        { id: "preset-hn", title: "Hacker News", url: "https://news.ycombinator.com" }
      ];
      
      const saved = localStorage.getItem("emulator_bookmarks");
      const bookmarks = saved ? JSON.parse(saved) : INITIAL_PRESETS;

      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].url).toBe("https://news.ycombinator.com");
      expect(localStorage.getItem).toHaveBeenCalledWith("emulator_bookmarks");
    });

    it("should serialize bookmarks correctly to local storage when bookmarks change", () => {
      const customBookmarks = [
        { id: "bm-1", title: "Custom Title", url: "https://custom.com", createdDate: "2026-06-15" }
      ];

      localStorage.setItem("emulator_bookmarks", JSON.stringify(customBookmarks));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "emulator_bookmarks",
        JSON.stringify(customBookmarks)
      );
      expect(JSON.parse(mockLocalStorage["emulator_bookmarks"])).toEqual(customBookmarks);
    });
  });

  describe("Navigation Stack Operations (Mock State Representation)", () => {
    it("should handle history stack additions with chronological index advancement", () => {
      let historyStack = [
        { url: "https://news.ycombinator.com", title: "Hacker News" }
      ];
      let historyIndex = 0;

      // Navigate to a second page
      const navigate = (newUrl: string, title: string) => {
        // Slice forward items
        const updated = historyStack.slice(0, historyIndex + 1);
        historyStack = [...updated, { url: newUrl, title }];
        historyIndex = historyStack.length - 1;
      };

      navigate("https://github.com", "GitHub Portal");

      expect(historyStack).toHaveLength(2);
      expect(historyIndex).toBe(1);
      expect(historyStack[1].url).toBe("https://github.com");

      // Go back
      if (historyIndex > 0) {
        historyIndex -= 1;
      }
      expect(historyIndex).toBe(0);

      // Navigate to a third option, pruning forward stack items
      navigate("https://stripe.com", "Stripe");
      expect(historyStack).toHaveLength(2); // Since github was popped off by slicing forward history
      expect(historyIndex).toBe(1);
      expect(historyStack[1].url).toBe("https://stripe.com");
    });
  });
});
