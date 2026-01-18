// Type definitions for UI Fidelity Checker

export interface ViewportPreset {
  width: number;
  height: number;
  label: string;
}

export const VIEWPORT_PRESETS: Record<string, ViewportPreset> = {
  desktop: { width: 1440, height: 900, label: "Desktop (1440x900)" },
  mobile: { width: 390, height: 844, label: "Mobile (390x844)" },
};

export interface ComparisonRequest {
  designImage: string; // base64 data URL
  implementationImage?: string; // base64 data URL (if upload)
  implementationUrl?: string; // URL (if URL mode)
  viewport?: keyof typeof VIEWPORT_PRESETS;
  screenName?: string;
  platform?: "web" | "mobile";
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MismatchCategory = "color" | "typography" | "spacing" | "component-state";
export type Priority = "high" | "medium" | "low";

export interface Mismatch {
  id: string;
  title: string;
  category: MismatchCategory;
  priority: Priority;
  explanation: string;
  suggestedFix: string;
  bbox: BoundingBox;
}

export interface ComparisonResult {
  diffImageUrl: string; // base64 data URL
  similarity: number; // 0-100 percentage
  mismatches: Mismatch[];
  metadata: {
    screenName?: string;
    platform?: string;
    comparedAt: string;
  };
}

export interface MarkdownReport {
  content: string;
}

export interface JSONReport extends ComparisonResult {
  version: string;
}
