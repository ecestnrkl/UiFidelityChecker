import { MismatchCategory, Priority, BoundingBox } from "./types";

interface RegionStats {
  bbox: BoundingBox;
  pixelCount: number;
  avgIntensity: number;
  aspectRatio: number;
  area: number;
}

/**
 * Categorize a mismatch region using geometric and visual heuristics
 */
export function categorizeMismatch(stats: RegionStats): MismatchCategory {
  const { bbox, aspectRatio, area } = stats;

  // Typography heuristic: Text-like aspect ratios (wide rectangles)
  // Typical text elements are 3:1 to 10:1 width:height
  const isTextLike = aspectRatio > 3 && aspectRatio < 15 && area < 10000;
  
  if (isTextLike) {
    return "typography";
  }

  // Spacing heuristic: Thin horizontal or vertical strips
  // Common in layout shifts (margins, padding changes)
  const isThinHorizontal = bbox.height < 20 && bbox.width > 100;
  const isThinVertical = bbox.width < 20 && bbox.height > 100;
  
  if (isThinHorizontal || isThinVertical) {
    return "spacing";
  }

  // Component state heuristic: Square-ish regions (buttons, icons, form elements)
  const isSquarish = aspectRatio > 0.5 && aspectRatio < 2;
  const isMediumSized = area > 1000 && area < 30000;
  
  if (isSquarish && isMediumSized) {
    return "component-state";
  }

  // Color heuristic: Large regions (background colors, fills)
  const isLargeArea = area > 20000;
  
  if (isLargeArea) {
    return "color";
  }

  // Default to color for remaining cases
  return "color";
}

/**
 * Assign priority based on area and intensity
 */
export function assignPriority(bbox: BoundingBox, avgIntensity: number): Priority {
  const area = bbox.width * bbox.height;
  const intensityRatio = avgIntensity / 255;

  // High priority: Large visible differences
  if (area > 5000 || intensityRatio > 0.5) {
    return "high";
  }

  // Medium priority: Moderate differences
  if (area > 1000 || intensityRatio > 0.3) {
    return "medium";
  }

  // Low priority: Small differences
  return "low";
}

/**
 * Generate human-readable title for mismatch
 */
export function generateTitle(category: MismatchCategory, index: number): string {
  const titles: Record<MismatchCategory, string> = {
    color: `Color mismatch #${index}`,
    typography: `Text difference #${index}`,
    spacing: `Layout spacing issue #${index}`,
    "component-state": `Component state mismatch #${index}`,
  };

  return titles[category];
}

/**
 * Generate explanation for mismatch
 */
export function generateExplanation(
  category: MismatchCategory,
  bbox: BoundingBox,
  priority: Priority
): string {
  const position = `at position (${bbox.x}, ${bbox.y})`;
  const size = `${bbox.width}×${bbox.height}px`;

  const explanations: Record<MismatchCategory, string> = {
    color: `A ${priority} priority color difference was detected ${position}, covering an area of ${size}. This may indicate a background color, border color, or fill color mismatch.`,
    
    typography: `A text-related difference was found ${position} (${size}). This could be due to font changes, text color, size, weight, or content differences.`,
    
    spacing: `A layout spacing discrepancy was detected ${position} (${size}). This suggests padding, margin, or alignment differences between design and implementation.`,
    
    "component-state": `A component appears differently ${position} (${size}). This might indicate a state mismatch such as hover/active/disabled states, or visibility differences.`,
  };

  return explanations[category];
}

/**
 * Generate suggested fix
 */
export function generateSuggestedFix(category: MismatchCategory, bbox: BoundingBox): string {
  const suggestions: Record<MismatchCategory, string> = {
    color: `Verify the color values match the design spec. Check background colors, borders, and fills in the region around x:${bbox.x}, y:${bbox.y}.`,
    
    typography: `Review font properties (family, size, weight, color, line-height) in the text element near x:${bbox.x}, y:${bbox.y}. Ensure text content matches design.`,
    
    spacing: `Inspect padding, margin, and positioning values near x:${bbox.x}, y:${bbox.y}. Use browser DevTools to compare computed values against design specifications.`,
    
    "component-state": `Check the component state at x:${bbox.x}, y:${bbox.y}. Verify hover, active, focus, disabled, or selected states match the design mockup.`,
  };

  return suggestions[category];
}
