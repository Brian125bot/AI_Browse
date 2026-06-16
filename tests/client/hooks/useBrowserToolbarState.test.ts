import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBrowserToolbarState } from '@/services/useBrowserToolbarState';

describe('useBrowserToolbarState', () => {
  const mockCallbacks = {
    mode: 'PROXY' as any,
    setMode: vi.fn(),
    triggerAiEmulation: vi.fn(),
    triggerReadability: vi.fn(),
    setAiEmulation: vi.fn(),
    setReadabilityData: vi.fn(),
    iframeRef: { current: null }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default states', async () => {
    const { result } = renderHook(() => useBrowserToolbarState(mockCallbacks));

    // Wait for initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.currentUrl).toBe('https://news.ycombinator.com');
    expect(result.current.historyIndex).toBe(0);
    expect(result.current.historyStack.length).toBe(1);
    expect(result.current.bookmarks.length).toBeGreaterThan(0); // Should have presets
  });

  it('should handle navigation correctly', async () => {
    const { result } = renderHook(() => useBrowserToolbarState(mockCallbacks));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      result.current.handleNavigate('https://example.com');
    });

    expect(result.current.currentUrl).toBe('https://example.com');
    expect(result.current.historyIndex).toBe(1);
    expect(result.current.historyStack.length).toBe(2);
    expect(mockCallbacks.setAiEmulation).toHaveBeenCalledWith(null);
  });

  it('should handle navigation back and forward', async () => {
    const { result } = renderHook(() => useBrowserToolbarState(mockCallbacks));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      result.current.handleNavigate('https://example1.com');
    });

    await act(async () => {
      result.current.handleNavigate('https://example2.com');
    });

    expect(result.current.currentUrl).toBe('https://example2.com');
    expect(result.current.historyIndex).toBe(2);

    await act(async () => {
      result.current.handleGoBack();
    });

    expect(result.current.currentUrl).toBe('https://example1.com');
    expect(result.current.historyIndex).toBe(1);

    await act(async () => {
      result.current.handleGoForward();
    });

    expect(result.current.currentUrl).toBe('https://example2.com');
    expect(result.current.historyIndex).toBe(2);
  });

  it('should handle bookmarks', async () => {
    const { result } = renderHook(() => useBrowserToolbarState(mockCallbacks));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      result.current.handleNavigate('https://testbookmark.com');
    });

    expect(result.current.isBookmarked).toBe(false);

    await act(async () => {
      result.current.handleAddBookmark();
    });

    expect(result.current.isBookmarked).toBe(true);
  });
});
