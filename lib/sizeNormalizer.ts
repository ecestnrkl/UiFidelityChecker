import sharp from "sharp";
import { SizingMode, ImageDimensions, BoundingBox } from "./types";

export interface NormalizationResult {
  buffer: Buffer;
  originalDimensions: ImageDimensions;
  targetDimensions: ImageDimensions;
  mode: SizingMode;
}

/**
 * Normalize image to target dimensions using specified sizing mode
 */
export async function normalizeBySizingMode(
  imageBuffer: Buffer,
  targetDimensions: ImageDimensions,
  mode: SizingMode,
  cropRect?: BoundingBox
): Promise<NormalizationResult> {
  const metadata = await sharp(imageBuffer).metadata();
  const originalDimensions: ImageDimensions = {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };

  console.log(`📐 Normalizing ${originalDimensions.width}x${originalDimensions.height} → ${targetDimensions.width}x${targetDimensions.height} (mode: ${mode})`);

  let normalizedBuffer: Buffer;

  switch (mode) {
    case "match-width-crop":
      normalizedBuffer = await matchWidthCrop(imageBuffer, targetDimensions, originalDimensions);
      break;

    case "match-width-letterbox":
      normalizedBuffer = await matchWidthLetterbox(imageBuffer, targetDimensions, originalDimensions);
      break;

    case "fit-inside":
      normalizedBuffer = await fitInside(imageBuffer, targetDimensions, originalDimensions);
      break;

    case "manual-crop":
      if (!cropRect) {
        throw new Error("Manual crop mode requires a crop rectangle");
      }
      normalizedBuffer = await manualCrop(imageBuffer, targetDimensions, cropRect);
      break;

    default:
      throw new Error(`Unknown sizing mode: ${mode}`);
  }

  return {
    buffer: normalizedBuffer,
    originalDimensions,
    targetDimensions,
    mode,
  };
}

/**
 * Mode 1: Match width, crop height
 * - Resize to target width
 * - Crop from top if taller, or clamp if shorter
 */
async function matchWidthCrop(
  buffer: Buffer,
  target: ImageDimensions,
  original: ImageDimensions
): Promise<Buffer> {
  // Calculate new height after width resize
  const scale = target.width / original.width;
  const scaledHeight = Math.round(original.height * scale);

  // Resize to target width
  let image = sharp(buffer).resize(target.width, scaledHeight, {
    fit: "fill",
    kernel: "lanczos3",
  });

  // Crop or extend to target height
  if (scaledHeight > target.height) {
    // Crop from center
    image = image.extract({
      left: 0,
      top: Math.round((scaledHeight - target.height) / 2),
      width: target.width,
      height: target.height,
    });
  } else if (scaledHeight < target.height) {
    // Extend with black background
    image = image.extend({
      top: 0,
      bottom: target.height - scaledHeight,
      left: 0,
      right: 0,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    });
  }

  return await image.png().toBuffer();
}

/**
 * Mode 2: Match width, letterbox
 * - Resize to target width
 * - Add black bars top/bottom to reach target height
 */
async function matchWidthLetterbox(
  buffer: Buffer,
  target: ImageDimensions,
  original: ImageDimensions
): Promise<Buffer> {
  // Calculate new height after width resize
  const scale = target.width / original.width;
  const scaledHeight = Math.round(original.height * scale);

  // Resize to target width
  let image = sharp(buffer).resize(target.width, scaledHeight, {
    fit: "fill",
    kernel: "lanczos3",
  });

  // Add letterbox bars if needed
  if (scaledHeight < target.height) {
    const padding = target.height - scaledHeight;
    const topPadding = Math.floor(padding / 2);
    const bottomPadding = Math.ceil(padding / 2);

    image = image.extend({
      top: topPadding,
      bottom: bottomPadding,
      left: 0,
      right: 0,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    });
  } else if (scaledHeight > target.height) {
    // Crop from center if somehow taller
    image = image.extract({
      left: 0,
      top: Math.round((scaledHeight - target.height) / 2),
      width: target.width,
      height: target.height,
    });
  }

  return await image.png().toBuffer();
}

/**
 * Mode 3: Fit inside
 * - Scale to fit entirely within target canvas
 * - Pad remaining space with black background
 */
async function fitInside(
  buffer: Buffer,
  target: ImageDimensions,
  original: ImageDimensions
): Promise<Buffer> {
  // Calculate scale to fit inside
  const scaleWidth = target.width / original.width;
  const scaleHeight = target.height / original.height;
  const scale = Math.min(scaleWidth, scaleHeight);

  const scaledWidth = Math.round(original.width * scale);
  const scaledHeight = Math.round(original.height * scale);

  // Resize with fit inside
  const resized = await sharp(buffer)
    .resize(scaledWidth, scaledHeight, {
      fit: "inside",
      kernel: "lanczos3",
    })
    .toBuffer();

  // Calculate padding
  const paddingLeft = Math.floor((target.width - scaledWidth) / 2);
  const paddingRight = Math.ceil((target.width - scaledWidth) / 2);
  const paddingTop = Math.floor((target.height - scaledHeight) / 2);
  const paddingBottom = Math.ceil((target.height - scaledHeight) / 2);

  // Add padding to reach target dimensions
  return await sharp(resized)
    .extend({
      top: paddingTop,
      bottom: paddingBottom,
      left: paddingLeft,
      right: paddingRight,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toBuffer();
}

/**
 * Mode 4: Manual crop
 * - Apply user-defined crop rectangle
 * - Then resize to target dimensions
 */
async function manualCrop(
  buffer: Buffer,
  target: ImageDimensions,
  cropRect: BoundingBox
): Promise<Buffer> {
  // Extract crop region
  const cropped = await sharp(buffer)
    .extract({
      left: cropRect.x,
      top: cropRect.y,
      width: cropRect.width,
      height: cropRect.height,
    })
    .toBuffer();

  // Resize to target dimensions
  return await sharp(cropped)
    .resize(target.width, target.height, {
      fit: "fill",
      kernel: "lanczos3",
    })
    .png()
    .toBuffer();
}
