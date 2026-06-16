import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { promises as fs } from "fs";
import { SimpleDB } from "../src/server-db";

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    promises: {
      access: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

describe("SimpleDB Caching Engine", () => {
  let db: any;

  beforeEach(() => {
    vi.resetAllMocks();
    db = new SimpleDB();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization & Ephemeral vs Persistent Mode", () => {
    it("should initialize in ephemeral mode quickly and without disk calls", async () => {
      db.isEphemeral = true;
      await db.init();
      expect(db.initialized).toBe(true);
      expect(fs.access).not.toHaveBeenCalled();
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it("should initialize in persistent mode by reading existing cache-db.json file", async () => {
      db.isEphemeral = false;
      const initialData = {
        proxy: {
          "http://test.com": { key: "http://test.com", data: "Cached HTML", createdAt: Date.now() }
        },
        analyze: {},
        aiEmu: {}
      };

      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(initialData));

      await db.init();

      expect(db.initialized).toBe(true);
      expect(fs.access).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalled();
      const cached = await db.getProxy("http://test.com");
      expect(cached).toBe("Cached HTML");
    });

    it("should create a new cache-db.json file if one does not exist", async () => {
      db.isEphemeral = false;
      vi.mocked(fs.access).mockRejectedValue(new Error("File not found"));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await db.init();

      expect(db.initialized).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe("CRUD Transactions", () => {
    beforeEach(() => {
      db.isEphemeral = true;
    });

    it("should store and fetch Proxy entries correctly", async () => {
      const url = "https://example.com/item";
      const content = "<html><body>Hello Proxy</body></html>";

      await db.setProxy(url, content);
      const fetched = await db.getProxy(url);

      expect(fetched).toBe(content);
      expect(await db.getProxy("https://non-existent.com")).toBeNull();
    });

    it("should store and fetch Analyze items correctly", async () => {
      const url = "https://example.com/stats";
      const analysisData = {
        title: "Example Title",
        metaDescription: "Welcome to example",
        headings: [{ tag: "H1", text: "Welcome" }]
      };

      await db.setAnalyze(url, analysisData);
      const fetched = await db.getAnalyze(url);

      expect(fetched).toEqual(analysisData);
      expect(await db.getAnalyze("https://no-analysis.com")).toBeNull();
    });

    it("should store and fetch AI Emulation mockups correctly", async () => {
      const url = "https://example.com/ai";
      const emuData = {
        siteTitle: "AI Spec Title",
        brandDescription: "Warm orange hues",
        extractedBrandColors: ["#ff5500"],
        designReview: "Clean bento grids",
        reconstructedCode: "<div>Aesthetic</div>"
      };

      await db.setAiEmu(url, emuData);
      const fetched = await db.getAiEmu(url);

      expect(fetched).toEqual(emuData);
    });
  });

  describe("Eviction & Pruning Mechanisms", () => {
    beforeEach(() => {
      db.isEphemeral = true;
    });

    it("should enforce capacity bounds and prune the eldest records first", async () => {
      // Set small cap for simple unit testing
      db.maxEntriesPerType = 3;

      await db.setProxy("url-1", "HTML 1");
      await db.setProxy("url-2", "HTML 2");
      await db.setProxy("url-3", "HTML 3");

      // Artificially modify createdAt to guarantee chronological sorting
      db.data.proxy["url-1"].createdAt = Date.now() - 5000;
      db.data.proxy["url-2"].createdAt = Date.now() - 3000;
      db.data.proxy["url-3"].createdAt = Date.now() - 1000;

      // Add a 4th URL which should trigger eviction of the eldest (url-1)
      await db.setProxy("url-4", "HTML 4");

      expect(await db.getProxy("url-1")).toBeNull();
      expect(await db.getProxy("url-2")).toBe("HTML 2");
      expect(await db.getProxy("url-3")).toBe("HTML 3");
      expect(await db.getProxy("url-4")).toBe("HTML 4");
    });

    it("should prune records older than TTL (Time To Live)", async () => {
      // Set short TTL (e.g. 1 second)
      db.cacheTtlMs = 1000;

      await db.setProxy("valid-now", "Still active");
      await db.setProxy("expired-soon", "Will expire");

      // Back-date expired-soon
      db.data.proxy["expired-soon"].createdAt = Date.now() - 2000;

      // Upon retrieval or database activity, enforceLimits should wipe the expired key
      const fetchedActive = await db.getProxy("valid-now");
      const fetchedExpired = await db.getProxy("expired-soon");

      expect(fetchedActive).toBe("Still active");
      expect(fetchedExpired).toBeNull();
    });
  });

  describe("Database Metrics & Stats Operations", () => {
    beforeEach(() => {
      db.isEphemeral = true;
    });

    it("should return detailed database segment lists and aggregate metrics", async () => {
      await db.setProxy("proxy-1", "content-proxy");
      await db.setAnalyze("analyze-1", { textLength: 100 });
      await db.setAiEmu("aiemu-1", { siteTitle: "Aesthetic" });

      const stats = await db.getStats();

      expect(stats.proxyCount).toBe(1);
      expect(stats.analyzeCount).toBe(1);
      expect(stats.aiEmuCount).toBe(1);
      expect(stats.list).toHaveLength(3);

      // Verify structure of list mapping
      const proxyStat = stats.list.find((item: any) => item.url === "proxy-1");
      expect(proxyStat).toBeDefined();
      expect(proxyStat.type).toBe("Proxy Page HTML");
      expect(proxyStat.size).toBe("content-proxy".length);
    });

    it("should remove single entries individually via deleteEntry", async () => {
      await db.setProxy("delete-url", "html to vanish");
      expect(await db.getProxy("delete-url")).toBe("html to vanish");

      await db.deleteEntry("delete-url", "proxy");
      expect(await db.getProxy("delete-url")).toBeNull();
    });

    it("should clear the entire cache schema completely", async () => {
      await db.setProxy("url-x", "content-x");
      await db.setAnalyze("url-y", { text: "content-y" });

      await db.clearAll();
      const stats = await db.getStats();

      expect(stats.proxyCount).toBe(0);
      expect(stats.analyzeCount).toBe(0);
      expect(stats.list).toHaveLength(0);
    });
  });
});
