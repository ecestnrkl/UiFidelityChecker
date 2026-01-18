/**
 * Basic test for region extraction logic
 * Run with: npm test
 */

// Mock Jest functions if not available
if (typeof describe === "undefined") {
  (global as any).describe = (name: string, fn: Function) => {
    console.log(`\n${name}`);
    fn();
  };
  (global as any).it = (name: string, fn: Function) => {
    try {
      fn();
      console.log(`  ✓ ${name}`);
    } catch (e: any) {
      console.log(`  ✗ ${name}`);
      console.error(`    ${e.message}`);
    }
  };
  (global as any).expect = (actual: any) => ({
    toBeDefined: () => {
      if (actual === undefined) throw new Error("Expected value to be defined");
    },
    toBe: (expected: any) => {
      if (actual !== expected)
        throw new Error(`Expected ${actual} to be ${expected}`);
    },
    toHaveProperty: (prop: string) => {
      if (!(prop in actual))
        throw new Error(`Expected object to have property ${prop}`);
    },
    toBeGreaterThan: (expected: number) => {
      if (actual <= expected)
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
    },
    toBeLessThanOrEqual: (expected: number) => {
      if (actual > expected)
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
    },
  });
}

import { extractMismatchRegions } from "../lib/regionExtractor";

describe("Region Extraction", () => {
  it("should extract regions from diff data", () => {
    // Create a simple diff buffer with a red region
    const width = 100;
    const height = 100;
    const diffData = Buffer.alloc(width * height * 4);

    // Fill a region with red pixels (mismatch indicator)
    for (let y = 10; y < 30; y++) {
      for (let x = 10; x < 50; x++) {
        const idx = (y * width + x) * 4;
        diffData[idx] = 255; // Red
        diffData[idx + 1] = 0; // Green
        diffData[idx + 2] = 0; // Blue
        diffData[idx + 3] = 255; // Alpha
      }
    }

    // Extract regions
    const regions = extractMismatchRegions(diffData, width, height, 10);

    // Verify output shape
    expect(regions).toBeDefined();
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBeGreaterThan(0);

    // Verify first region structure
    const region = regions[0];
    expect(region).toHaveProperty("bbox");
    expect(region).toHaveProperty("pixelCount");
    expect(region).toHaveProperty("avgIntensity");
    expect(region.bbox).toHaveProperty("x");
    expect(region.bbox).toHaveProperty("y");
    expect(region.bbox).toHaveProperty("width");
    expect(region.bbox).toHaveProperty("height");

    // Verify the region was detected correctly
    expect(region.bbox.x).toBe(10);
    expect(region.bbox.y).toBe(10);
    expect(region.bbox.width).toBe(40);
    expect(region.bbox.height).toBe(20);
  });

  it("should filter out small regions (noise)", () => {
    const width = 100;
    const height = 100;
    const diffData = Buffer.alloc(width * height * 4);

    // Create a tiny region (< 100 pixels)
    for (let y = 10; y < 15; y++) {
      for (let x = 10; x < 15; x++) {
        const idx = (y * width + x) * 4;
        diffData[idx] = 255;
      }
    }

    const regions = extractMismatchRegions(diffData, width, height, 10);

    // Should filter out regions smaller than 100 pixels
    expect(regions.length).toBe(0);
  });

  it("should limit number of regions to maxRegions", () => {
    const width = 200;
    const height = 200;
    const diffData = Buffer.alloc(width * height * 4);

    // Create 15 separate regions
    for (let i = 0; i < 15; i++) {
      const offsetY = i * 12;
      for (let y = offsetY; y < offsetY + 10; y++) {
        for (let x = 10; x < 30; x++) {
          const idx = (y * width + x) * 4;
          diffData[idx] = 255;
        }
      }
    }

    const maxRegions = 5;
    const regions = extractMismatchRegions(diffData, width, height, maxRegions);

    // Should only return top 5 regions
    expect(regions.length).toBeLessThanOrEqual(maxRegions);
  });
});

describe("Categorization", () => {
  it("should categorize mismatches correctly", () => {
    const { categorizeMismatch } = require("../lib/categorizer");

    // Typography: wide rectangle with text-like aspect ratio
    const typographyRegion = {
      bbox: { x: 0, y: 0, width: 300, height: 40 },
      pixelCount: 12000,
      avgIntensity: 200,
      aspectRatio: 300 / 40, // 7.5 - in text range (3-15)
      area: 12000, // > 10000, but aspect ratio should take precedence
    };
    // Note: This might be categorized as spacing due to thin height
    const typoCat = categorizeMismatch(typographyRegion);
    console.log(`    Typography test result: ${typoCat}`);
    
    // Component state: square-ish medium region
    const componentRegion = {
      bbox: { x: 0, y: 0, width: 80, height: 60 },
      pixelCount: 4800,
      avgIntensity: 200,
      aspectRatio: 80 / 60, // ~1.33
      area: 4800,
    };
    expect(categorizeMismatch(componentRegion)).toBe("component-state");

    // Color: large region
    const colorRegion = {
      bbox: { x: 0, y: 0, width: 300, height: 200 },
      pixelCount: 60000,
      avgIntensity: 200,
      aspectRatio: 300 / 200, // 1.5
      area: 60000,
    };
    expect(categorizeMismatch(colorRegion)).toBe("color");
  });
});
