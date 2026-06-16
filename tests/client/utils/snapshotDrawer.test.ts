import { BrowserMode } from "@/types";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawOfflineSnapshot } from '@/utils/snapshotDrawer';

describe('snapshotDrawer', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    vi.clearAllMocks();
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = {
      clearRect: vi.fn(),
      fillStyle: '',
      fillRect: vi.fn(),
      font: '',
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      clip: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      canvas: canvas,
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetY: 0,
      lineWidth: 1,
      strokeStyle: '',
      setLineDash: vi.fn(),
      strokeRect: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      arc: vi.fn(),
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        const c = { ...canvas } as any;
        c.getContext = vi.fn().mockReturnValue(ctx);
        c.toDataURL = vi.fn().mockReturnValue('data:image/png');
        return c;
      }
      return document.createElement(tagName);
    });
  });

  it('drawOfflineSnapshot should execute safely', async () => {
    const analysis = {
      title: 'Test Title',
      headings: [],
      links: [],
      images: [],
      paragraphs: [],
      theme: { primaryColor: '#000000', backgroundColor: '#ffffff', textColor: '#333333', fontFamilies: [] }
    };

    // Should not throw
    const url = await drawOfflineSnapshot('https://example.com', analysis as any, 'desktop', BrowserMode.PROXY);
    expect(url).toContain('data:image/png');
  });
});
