import { promises as fs } from "fs";
import path from "path";

export interface CacheEntry<T> {
  key: string; // URL
  data: T;
  createdAt: number; // timestamp
}

export interface DatabaseSchema {
  proxy: Record<string, CacheEntry<string>>;
  analyze: Record<string, CacheEntry<any>>;
  aiEmu: Record<string, CacheEntry<any>>;
}

const DB_FILE = path.join(process.cwd(), "cache-db.json");

class SimpleDB {
  private data: DatabaseSchema = { proxy: {}, analyze: {}, aiEmu: {} };
  private initialized = false;
  private writePromise: Promise<void> = Promise.resolve();

  async init() {
    if (this.initialized) return;
    try {
      const exists = await fs.access(DB_FILE).then(() => true).catch(() => false);
      if (exists) {
        const raw = await fs.readFile(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        // Ensure structure is safe
        if (!this.data.proxy) this.data.proxy = {};
        if (!this.data.analyze) this.data.analyze = {};
        if (!this.data.aiEmu) this.data.aiEmu = {};
      } else {
        await this.save();
      }
    } catch (err) {
      console.warn("Failed to read database cache file, initializing blank schema:", err);
      this.data = { proxy: {}, analyze: {}, aiEmu: {} };
      try {
        await this.save();
      } catch (e) {}
    }
    this.initialized = true;
  }

  private async save() {
    this.writePromise = this.writePromise.then(async () => {
      try {
        await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
      } catch (err) {
        console.error("Failed to write to database cache file:", err);
      }
    });
    return this.writePromise;
  }

  async getProxy(url: string): Promise<string | null> {
    await this.init();
    const entry = this.data.proxy[url];
    if (entry) return entry.data;
    return null;
  }

  async setProxy(url: string, content: string): Promise<void> {
    await this.init();
    this.data.proxy[url] = {
      key: url,
      data: content,
      createdAt: Date.now()
    };
    await this.save();
  }

  async getAnalyze(url: string): Promise<any | null> {
    await this.init();
    const entry = this.data.analyze[url];
    if (entry) return entry.data;
    return null;
  }

  async setAnalyze(url: string, content: any): Promise<void> {
    await this.init();
    this.data.analyze[url] = {
      key: url,
      data: content,
      createdAt: Date.now()
    };
    await this.save();
  }

  async getAiEmu(url: string): Promise<any | null> {
    await this.init();
    const entry = this.data.aiEmu[url];
    if (entry) return entry.data;
    return null;
  }

  async setAiEmu(url: string, content: any): Promise<void> {
    await this.init();
    this.data.aiEmu[url] = {
      key: url,
      data: content,
      createdAt: Date.now()
    };
    await this.save();
  }

  async getStats() {
    await this.init();
    const list: any[] = [];
    
    for (const p of Object.values(this.data.proxy || {})) {
      list.push({ url: p.key, type: "Proxy Page HTML", size: p.data?.length || 0, createdAt: p.createdAt });
    }
    for (const a of Object.values(this.data.analyze || {})) {
      list.push({ url: a.key, type: "Structural Scan", size: JSON.stringify(a.data || {}).length, createdAt: a.createdAt });
    }
    for (const ae of Object.values(this.data.aiEmu || {})) {
      list.push({ url: ae.key, type: "AI Emulated Page", size: JSON.stringify(ae.data || {}).length, createdAt: ae.createdAt });
    }

    return {
      proxyCount: Object.keys(this.data.proxy || {}).length,
      analyzeCount: Object.keys(this.data.analyze || {}).length,
      aiEmuCount: Object.keys(this.data.aiEmu || {}).length,
      list: list.sort((a, b) => b.createdAt - a.createdAt)
    };
  }

  async deleteEntry(url: string, type: "proxy" | "analyze" | "aiEmu"): Promise<void> {
    await this.init();
    if (type === "proxy" && this.data.proxy) delete this.data.proxy[url];
    if (type === "analyze" && this.data.analyze) delete this.data.analyze[url];
    if (type === "aiEmu" && this.data.aiEmu) delete this.data.aiEmu[url];
    await this.save();
  }

  async clearAll(): Promise<void> {
    await this.init();
    this.data = { proxy: {}, analyze: {}, aiEmu: {} };
    await this.save();
  }
}

export const cacheDb = new SimpleDB();
