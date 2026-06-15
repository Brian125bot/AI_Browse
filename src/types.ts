export enum BrowserMode {
  PROXY = "PROXY",
  AI_EMULATION = "AI_EMULATION"
}

export type ViewportSize = "desktop" | "tablet" | "mobile";

export interface PageHistoryItem {
  url: string;
  title: string;
  timestamp: string;
  mode: BrowserMode;
}

export interface HeadingItem {
  tag: string;
  text: string;
}

export interface LinkItem {
  text: string;
  href: string;
}

export interface PageAnalysis {
  title: string;
  metaDescription: string;
  headings: HeadingItem[];
  links: LinkItem[];
  images: string[];
  textLength: number;
  sampleText: string;
}

export interface AiEmulation {
  siteTitle: string;
  brandDescription: string;
  extractedBrandColors: string[];
  designReview: string;
  reconstructedCode: string;
}

export interface SavedBookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  createdDate: string;
}

export interface ViewportSnapshot {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  mode: BrowserMode;
  viewportSize: ViewportSize;
  imageData: string; // Base64 dataURL
}
