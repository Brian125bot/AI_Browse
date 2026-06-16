import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock global fetch to handle relative URLs in tests
global.fetch = vi.fn((url: string | URL | globalThis.Request, options?: RequestInit) => {
  if (url.toString() === '/api/cache/stats') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ proxyCount: 0, analyzeCount: 0, aiEmuCount: 0, list: [] })
    } as Response);
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
});
