import { ImageDimensions, ViewportMismatchWarning } from "./types";

const DEFAULT_WIDTH_THRESHOLD = 0.05; // 5% tolerance
const DEFAULT_ASPECT_THRESHOLD = 0.1; // 10% tolerance

/**
 * Detect if there's a likely viewport mismatch between two images
 * Returns warning with suggestions if mismatch detected
 */
export function detectViewportMismatch(
  designDimensions: ImageDimensions,
  implementationDimensions: ImageDimensions,
  isUrlMode: boolean = false,
  useDesignViewport: boolean = false
): ViewportMismatchWarning {
  const widthRatio = implementationDimensions.width / designDimensions.width;
  
  const designAspect = designDimensions.width / designDimensions.height;
  const implAspect = implementationDimensions.width / implementationDimensions.height;
  const aspectRatioDelta = Math.abs(designAspect - implAspect);

  // Check if width ratio is outside acceptable range
  const widthMismatch = widthRatio < (1 - DEFAULT_WIDTH_THRESHOLD) || widthRatio > (1 + DEFAULT_WIDTH_THRESHOLD);
  
  // Check if aspect ratio difference is significant
  const aspectMismatch = aspectRatioDelta > DEFAULT_ASPECT_THRESHOLD;

  if (widthMismatch || aspectMismatch) {
    let suggestion = "Viewport mismatch detected. ";

    if (isUrlMode && !useDesignViewport) {
      suggestion += "Enable 'Use design size as viewport' to capture screenshot at design dimensions. ";
    } else {
      suggestion += "Try switching the sizing mode to better handle the dimension difference. ";
    }

    if (aspectMismatch) {
      suggestion += "Aspect ratios differ significantly - consider 'Fit inside' mode.";
    }

    return {
      detected: true,
      widthRatio: Math.round(widthRatio * 100) / 100,
      aspectRatioDelta: Math.round(aspectRatioDelta * 100) / 100,
      suggestion,
    };
  }

  return { detected: false };
}

/**
 * Check if image dimensions are extremely large and need capping
 */
export function checkDimensionLimits(
  dimensions: ImageDimensions,
  maxWidth: number = 3000,
  maxHeight: number = 3000
): { needsCapping: boolean; suggestion?: string; cappedDimensions?: ImageDimensions } {
  if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
    const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height);
    const cappedDimensions: ImageDimensions = {
      width: Math.round(dimensions.width * scale),
      height: Math.round(dimensions.height * scale),
    };

    return {
      needsCapping: true,
      suggestion: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed safe limits. Will be capped to ${cappedDimensions.width}x${cappedDimensions.height} for comparison.`,
      cappedDimensions,
    };
  }

  return { needsCapping: false };
}
