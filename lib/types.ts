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

// Ticket creation types
export type TicketFormat = "generic-markdown" | "github-markdown" | "jira-text" | "json";
export type TicketGranularity = "single-bundled" | "one-per-mismatch";
export type Severity = "critical" | "major" | "minor" | "trivial";
export type Environment = "local" | "staging" | "production";

export interface TicketConfig {
  format: TicketFormat;
  granularity: TicketGranularity;
  projectName?: string;
  screenName?: string;
  platform?: "web" | "mobile";
  environment?: Environment;
  assignee?: string;
  labels?: string[]; // comma-separated tags
  severityMapping?: {
    high: Severity;
    medium: Severity;
    low: Severity;
  };
}

export interface TicketData {
  title: string;
  content: string;
  filename: string;
  mimeType: string;
}

export interface TicketMetadata {
  screenName?: string;
  platform?: string;
  viewport?: string;
  timestamp: string;
  similarityMetric: number;
  environment?: string;
  projectName?: string;
  assignee?: string;
  labels?: string[];
}

export interface TicketFinding {
  id: string;
  title: string;
  category: MismatchCategory;
  priority: Priority;
  severity: Severity;
  explanation: string;
  suggestedFix: string;
  bbox: BoundingBox;
}

export interface StructuredTicket {
  metadata: TicketMetadata;
  findings: TicketFinding[];
  diffImageReference?: string;
}
