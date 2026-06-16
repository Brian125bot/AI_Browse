import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheDb } from '../../src/server-db';

// Mock fs to avoid writing to real disk during tests
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    default: {
      ...actual,
      promises: {
        readFile: vi.fn().mockResolvedValue('{"proxy":{},"analyze":{},"aiEmu":{}}'),
        writeFile: vi.fn().mockResolvedValue(undefined),
        access: vi.fn().mockResolvedValue(undefined),
      }
    },
    promises: {
      readFile: vi.fn().mockResolvedValue('{"proxy":{},"analyze":{},"aiEmu":{}}'),
      writeFile: vi.fn().mockResolvedValue(undefined),
      access: vi.fn().mockResolvedValue(undefined),
    }
  };
});

describe('SimpleDB (cacheDb)', () => {
  const originalEnv = process.env.EPHEMERAL_MODE;

  beforeEach(async () => {
    // Reset the internal state to simulate ephemeral mode for most tests
    process.env.EPHEMERAL_MODE = 'true';

    // Use clearAll to empty the DB before each test
    await cacheDb.clearAll();
  });

  afterEach(() => {
    process.env.EPHEMERAL_MODE = originalEnv;
    vi.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    await cacheDb.init();
    const stats = await cacheDb.getStats();
    expect(stats.proxyCount).toBe(0);
    expect(stats.analyzeCount).toBe(0);
    expect(stats.aiEmuCount).toBe(0);
  });

  it('should set and get a proxy cache entry', async () => {
    await cacheDb.init();
    await cacheDb.setProxy('https://example.com', 'test-data');

    const entry = await cacheDb.getProxy('https://example.com');
    expect(entry).toBeDefined();
    expect(entry).toBe('test-data');
  });

  it('should return null for non-existent proxy entry', async () => {
    await cacheDb.init();
    const entry = await cacheDb.getProxy('https://non-existent.com');
    expect(entry).toBeNull();
  });

  it('should clear all entries', async () => {
    await cacheDb.init();
    await cacheDb.setProxy('https://example.com', 'test-data');
    await cacheDb.setAnalyze('https://example.com', { data: 'test' });

    await cacheDb.clearAll();

    const stats = await cacheDb.getStats();
    expect(stats.proxyCount).toBe(0);
    expect(stats.analyzeCount).toBe(0);
  });

  it('should delete a specific entry', async () => {
    await cacheDb.init();
    await cacheDb.setProxy('https://example1.com', 'data1');
    await cacheDb.setProxy('https://example2.com', 'data2');

    await cacheDb.deleteEntry('https://example1.com', 'proxy');

    const entry1 = await cacheDb.getProxy('https://example1.com');
    const entry2 = await cacheDb.getProxy('https://example2.com');

    expect(entry1).toBeNull();
    expect(entry2).toBe('data2');
  });

  it('should provide correct stats', async () => {
    await cacheDb.init();
    await cacheDb.setProxy('url1', 'data1');
    await cacheDb.setProxy('url2', 'data2');
    await cacheDb.setAnalyze('url1', { some: 'data' });

    const stats = await cacheDb.getStats();

    expect(stats.proxyCount).toBe(2);
    expect(stats.analyzeCount).toBe(1);
    expect(stats.aiEmuCount).toBe(0);
    expect(stats.list.length).toBe(3);
  });
});
