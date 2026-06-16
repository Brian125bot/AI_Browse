import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InspectorPanel from '@/components/InspectorPanel';

describe('InspectorPanel Component', () => {
  const defaultProps = {
    analysis: null,
    aiEmulation: null,
    isLoadingAi: false,
    onTriggerAiEmu: vi.fn(),
    bookmarks: [],
    history: [],
    onLoadBookmark: vi.fn(),
    onClearHistory: vi.fn(),
    snapshots: [],
    onClearSnapshot: vi.fn(),
    onOpenComparator: vi.fn(),
    shieldCanvas: "block" as any,
    setShieldCanvas: vi.fn(),
    shieldWebRTC: "block" as any,
    setShieldWebRTC: vi.fn(),
    shieldWebGL: "block" as any,
    setShieldWebGL: vi.fn(),
    shieldFonts: "block" as any,
    setShieldFonts: vi.fn(),
    shieldAudio: "block" as any,
    setShieldAudio: vi.fn(),
    shieldWebdriver: "block" as any,
    setShieldWebdriver: vi.fn(),
    activeUserAgent: "default" as any,
    setActiveUserAgent: vi.fn(),
  };

  it('renders correctly with default props', () => {
    render(<InspectorPanel {...defaultProps} />);

    // Check if the panel is rendered
    expect(screen.getByText('Shields')).toBeInTheDocument();
  });

  it('changes tabs correctly', async () => {
    render(<InspectorPanel {...defaultProps} />);

    // Click on Database tab
    const dbTabButton = screen.getByText('Cache DB').closest('button');

    await act(async () => {
      fireEvent.click(dbTabButton!);
    });

    // DB tab content should be visible
    expect(screen.getByText(/Database Engine Status/i)).toBeInTheDocument();
  });
});
