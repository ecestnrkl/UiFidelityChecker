import sharp from "sharp";

/**
 * Normalize two images to the same dimensions for comparison
 * Resizes both to match the smaller image's dimensions
 * Also downscales if images are very large for performance
 */
export async function normalizeImages(
  image1Buffer: Buffer,
  image2Buffer: Buffer
): Promise<{ buffer1: Buffer; buffer2: Buffer; width: number; height: number }> {
  
  // Get metadata
  const meta1 = await sharp(image1Buffer).metadata();
  const meta2 = await sharp(image2Buffer).metadata();

  if (!meta1.width || !meta1.height || !meta2.width || !meta2.height) {
    throw new Error("Could not read image dimensions");
  }

  // Determine target dimensions (use smaller image)
  let targetWidth = Math.min(meta1.width, meta2.width);
  let targetHeight = Math.min(meta1.height, meta2.height);

  // Downscale if very large (max 2000px width)
  const MAX_WIDTH = 2000;
  if (targetWidth > MAX_WIDTH) {
    const scale = MAX_WIDTH / targetWidth;
    targetWidth = MAX_WIDTH;
    targetHeight = Math.round(targetHeight * scale);
  }

  console.log(`🔄 Normalizing images to ${targetWidth}x${targetHeight}`);

  // Resize both images
  const buffer1 = await sharp(image1Buffer)
    .resize(targetWidth, targetHeight, { fit: "fill" })
    .png()
    .toBuffer();

  const buffer2 = await sharp(image2Buffer)
    .resize(targetWidth, targetHeight, { fit: "fill" })
    .png()
    .toBuffer();

  return { buffer1, buffer2, width: targetWidth, height: targetHeight };
}

/**
 * Convert base64 data URL to buffer
 */
export function base64ToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

/**
 * Convert buffer to base64 data URL
 */
export function bufferToBase64(buffer: Buffer, mimeType: string = "image/png"): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

/**
 * Get raw pixel data from image buffer
 */
export async function getRawPixelData(buffer: Buffer): Promise<{
  data: Buffer;
  width: number;
  height: number;
}> {
  const image = sharp(buffer);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
  };
}
