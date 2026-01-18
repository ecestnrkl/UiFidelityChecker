import pixelmatch from "pixelmatch";
import sharp from "sharp";
import { getRawPixelData } from "./imageProcessor";

/**
 * Generate a diff image comparing two normalized images
 * Returns the diff image buffer and similarity metrics
 */
export async function generateDiff(
  buffer1: Buffer,
  buffer2: Buffer,
  width: number,
  height: number
): Promise<{
  diffBuffer: Buffer;
  diffPixels: number;
  totalPixels: number;
  similarity: number;
  diffData: Buffer;
}> {
  console.log(`🔍 Generating diff for ${width}x${height} images`);

  // Get raw pixel data
  const img1 = await getRawPixelData(buffer1);
  const img2 = await getRawPixelData(buffer2);

  // Create output buffer for diff image
  const diffData = Buffer.alloc(width * height * 4);

  // Run pixelmatch
  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diffData,
    width,
    height,
    {
      threshold: 0.1, // Sensitivity: 0 = strict, 1 = lenient
      alpha: 0.1,
      diffColor: [255, 0, 0], // Red for differences
      diffColorAlt: [255, 100, 100], // Light red for anti-aliasing differences
    }
  );

  const totalPixels = width * height;
  const similarity = Math.round((1 - diffPixels / totalPixels) * 100 * 100) / 100;

  console.log(`📊 Diff complete: ${diffPixels} pixels differ (${100 - similarity}% different)`);

  // Convert diff data back to PNG
  const diffBuffer = await sharp(diffData, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  return {
    diffBuffer,
    diffPixels,
    totalPixels,
    similarity,
    diffData,
  };
}

/**
 * Create a visual overlay showing both images with diff highlighted
 */
export async function createOverlayImage(
  originalBuffer: Buffer,
  diffBuffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  // Composite diff over original with transparency
  return await sharp(originalBuffer)
    .composite([
      {
        input: diffBuffer,
        blend: "over",
      },
    ])
    .png()
    .toBuffer();
}
