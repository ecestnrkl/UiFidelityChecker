import sharp from "sharp";
import { base64ToBuffer } from "./imageProcessor";
import { ImageDimensions } from "./types";

/**
 * Extract image dimensions from base64 data URL
 */
export async function getImageDimensions(base64Image: string): Promise<ImageDimensions> {
  try {
    const buffer = base64ToBuffer(base64Image);
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Could not extract image dimensions");
    }

    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error: any) {
    throw new Error(`Failed to extract dimensions: ${error.message}`);
  }
}

/**
 * Extract dimensions from buffer directly
 */
export async function getDimensionsFromBuffer(buffer: Buffer): Promise<ImageDimensions> {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Could not extract image dimensions from buffer");
    }

    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error: any) {
    throw new Error(`Failed to extract dimensions from buffer: ${error.message}`);
  }
}
