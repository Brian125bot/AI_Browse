import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BrowserToolbar from '@/components/BrowserToolbar';

describe('BrowserToolbar Component', () => {
  const defaultProps = {
    currentUrl: 'https://example.com',
    onNavigate: vi.fn(),
    canGoBack: true,
    canGoForward: false,
    onGoBack: vi.fn(),
    onGoForward: vi.fn(),
    onRefresh: vi.fn(),
    onGoHome: vi.fn(),
    mode: 'PROXY' as any,
    onModeChange: vi.fn(),
    viewportSize: 'desktop' as any,
    onViewportChange: vi.fn(),
    isExpanded: true,
    onToggleExpand: vi.fn(),
    isLoading: false,
    onAddBookmark: vi.fn(),
    isBookmarked: false,
    selectedModel: 'gemini-2.5-flash',
    onModelChange: vi.fn(),
    isFullscreen: false,
    onToggleFullscreen: vi.fn()
  };

  it('renders correctly with default props', () => {
    render(<BrowserToolbar {...defaultProps} />);

    // Check url input
    const input = screen.getByDisplayValue('https://example.com');
    expect(input).toBeInTheDocument();
  });

  it('handles navigation correctly', () => {
    render(<BrowserToolbar {...defaultProps} />);

    const input = screen.getByDisplayValue('https://example.com');
    fireEvent.change(input, { target: { value: 'test.com' } });

    // Find the form and submit it
    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(defaultProps.onNavigate).toHaveBeenCalled();
  });

  it('handles back button click', () => {
    render(<BrowserToolbar {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    // The first button should be back button (arrow-left icon)
    fireEvent.click(buttons[0]);

    expect(defaultProps.onGoBack).toHaveBeenCalled();
  });
});
