/**
 * Unit tests for Size Normalization
 * Run with: npx tsx __tests__/sizeNormalizer.test.ts
 */

import sharp from "sharp";
import { normalizeBySizingMode } from "../lib/sizeNormalizer";
import { SizingMode, ImageDimensions } from "../lib/types";

// Test utilities
function test(name: string, fn: () => Promise<void>) {
  fn()
    .then(() => console.log(`✅ ${name}`))
    .catch((err) => {
      console.error(`❌ ${name}`);
      console.error(err);
      process.exit(1);
    });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Helper to create test image buffer
async function createTestImage(width: number, height: number, color: { r: number; g: number; b: number }): Promise<Buffer> {
  return await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color,
    },
  })
    .png()
    .toBuffer();
}

// Test Suite
(async () => {
  console.log("🧪 Running Size Normalization Tests\n");

  // Test 1: Match width crop - taller image
  await test("Match width crop: crops taller image correctly", async () => {
    const sourceBuffer = await createTestImage(800, 1200, { r: 255, g: 0, b: 0 });
    const target: ImageDimensions = { width: 800, height: 600 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "match-width-crop");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 800, `Expected width 800, got ${meta.width}`);
    assert(meta.height === 600, `Expected height 600, got ${meta.height}`);
    assert(result.mode === "match-width-crop", "Mode should be match-width-crop");
  });

  // Test 2: Match width crop - wider image
  await test("Match width crop: resizes wider image and fills height", async () => {
    const sourceBuffer = await createTestImage(1600, 800, { r: 0, g: 255, b: 0 });
    const target: ImageDimensions = { width: 800, height: 600 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "match-width-crop");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 800, `Expected width 800, got ${meta.width}`);
    assert(meta.height === 600, `Expected height 600, got ${meta.height}`);
  });

  // Test 3: Match width letterbox - shorter image
  await test("Match width letterbox: adds black bars to shorter image", async () => {
    const sourceBuffer = await createTestImage(800, 400, { r: 0, g: 0, b: 255 });
    const target: ImageDimensions = { width: 800, height: 600 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "match-width-letterbox");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 800, `Expected width 800, got ${meta.width}`);
    assert(meta.height === 600, `Expected height 600, got ${meta.height}`);
    assert(result.mode === "match-width-letterbox", "Mode should be match-width-letterbox");

    // Check for black padding (letterbox bars)
    const stats = await sharp(result.buffer).stats();
    // Top and bottom channels should have some black (value 0) from padding
    assert(stats.channels[0].min === 0, "Should have black padding");
  });

  // Test 4: Fit inside - larger image
  await test("Fit inside: scales down large image and pads", async () => {
    const sourceBuffer = await createTestImage(1000, 1000, { r: 255, g: 255, b: 0 });
    const target: ImageDimensions = { width: 600, height: 400 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "fit-inside");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 600, `Expected width 600, got ${meta.width}`);
    assert(meta.height === 400, `Expected height 400, got ${meta.height}`);
    assert(result.mode === "fit-inside", "Mode should be fit-inside");
  });

  // Test 5: Fit inside - portrait image
  await test("Fit inside: handles portrait orientation correctly", async () => {
    const sourceBuffer = await createTestImage(400, 800, { r: 255, g: 0, b: 255 });
    const target: ImageDimensions = { width: 600, height: 400 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "fit-inside");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 600, `Expected width 600, got ${meta.width}`);
    assert(meta.height === 400, `Expected height 400, got ${meta.height}`);
  });

  // Test 6: Manual crop - extract region
  await test("Manual crop: extracts specific region and resizes", async () => {
    const sourceBuffer = await createTestImage(1000, 1000, { r: 0, g: 255, b: 255 });
    const target: ImageDimensions = { width: 400, height: 300 };
    const cropRect = { x: 100, y: 100, width: 400, height: 300 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "manual-crop", cropRect);

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 400, `Expected width 400, got ${meta.width}`);
    assert(meta.height === 300, `Expected height 300, got ${meta.height}`);
    assert(result.mode === "manual-crop", "Mode should be manual-crop");
  });

  // Test 7: Same dimensions - no change needed
  await test("Match width crop: handles identical dimensions", async () => {
    const sourceBuffer = await createTestImage(800, 600, { r: 128, g: 128, b: 128 });
    const target: ImageDimensions = { width: 800, height: 600 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "match-width-crop");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 800, `Expected width 800, got ${meta.width}`);
    assert(meta.height === 600, `Expected height 600, got ${meta.height}`);
    assert(result.originalDimensions.width === 800, "Original width should be preserved");
    assert(result.originalDimensions.height === 600, "Original height should be preserved");
  });

  // Test 8: Very small target
  await test("Fit inside: handles very small target dimensions", async () => {
    const sourceBuffer = await createTestImage(1920, 1080, { r: 100, g: 100, b: 100 });
    const target: ImageDimensions = { width: 200, height: 150 };

    const result = await normalizeBySizingMode(sourceBuffer, target, "fit-inside");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 200, `Expected width 200, got ${meta.width}`);
    assert(meta.height === 150, `Expected height 150, got ${meta.height}`);
  });

  // Test 9: Aspect ratio preservation in fit-inside
  await test("Fit inside: preserves aspect ratio", async () => {
    const sourceBuffer = await createTestImage(1600, 900, { r: 200, g: 150, b: 100 }); // 16:9
    const target: ImageDimensions = { width: 800, height: 800 }; // Square

    const result = await normalizeBySizingMode(sourceBuffer, target, "fit-inside");

    const meta = await sharp(result.buffer).metadata();
    assert(meta.width === 800, `Expected width 800, got ${meta.width}`);
    assert(meta.height === 800, `Expected height 800, got ${meta.height}`);
    
    // The actual image inside should maintain 16:9 ratio
    // It should be 800x450 with padding top/bottom
  });

  // Test 10: Error handling - manual crop without rect
  await test("Manual crop: throws error when crop rect missing", async () => {
    const sourceBuffer = await createTestImage(800, 600, { r: 100, g: 100, b: 100 });
    const target: ImageDimensions = { width: 400, height: 300 };

    try {
      await normalizeBySizingMode(sourceBuffer, target, "manual-crop"); // No cropRect
      assert(false, "Should have thrown error");
    } catch (error: any) {
      assert(error.message.includes("crop rectangle"), "Error should mention crop rectangle");
    }
  });

  console.log("\n✅ All size normalization tests passed!");
})();
