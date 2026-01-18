import { BoundingBox } from "./types";

interface Region {
  bbox: BoundingBox;
  pixelCount: number;
  avgIntensity: number;
}

/**
 * Extract connected mismatch regions from diff data
 * Uses flood-fill to find connected components
 */
export function extractMismatchRegions(
  diffData: Buffer,
  width: number,
  height: number,
  maxRegions: number = 10
): Region[] {
  console.log(`🎯 Extracting mismatch regions from diff data`);

  const visited = new Array(width * height).fill(false);
  const regions: Region[] = [];

  // Helper to check if pixel is a mismatch (red channel high)
  const isMismatch = (x: number, y: number): boolean => {
    const idx = (y * width + x) * 4;
    const red = diffData[idx];
    const green = diffData[idx + 1];
    const blue = diffData[idx + 2];
    // Check if pixel is highlighted in diff (red > 200)
    return red > 200 && green < 100;
  };

  // Flood fill to find connected component
  const floodFill = (startX: number, startY: number): Region | null => {
    const queue: [number, number][] = [[startX, startY]];
    const pixels: [number, number][] = [];
    
    let minX = startX;
    let maxX = startX;
    let minY = startY;
    let maxY = startY;
    let intensitySum = 0;

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const idx = y * width + x;

      if (visited[idx] || !isMismatch(x, y)) continue;

      visited[idx] = true;
      pixels.push([x, y]);

      // Update bounding box
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // Get intensity
      const pixelIdx = idx * 4;
      intensitySum += diffData[pixelIdx]; // Red channel

      // Check 4-connected neighbors
      if (x > 0) queue.push([x - 1, y]);
      if (x < width - 1) queue.push([x + 1, y]);
      if (y > 0) queue.push([x, y - 1]);
      if (y < height - 1) queue.push([x, y + 1]);
    }

    if (pixels.length < 100) return null; // Filter tiny regions (noise)

    const bbox: BoundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };

    return {
      bbox,
      pixelCount: pixels.length,
      avgIntensity: intensitySum / pixels.length,
    };
  };

  // Scan for regions
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && isMismatch(x, y)) {
        const region = floodFill(x, y);
        if (region) {
          regions.push(region);
        }
      }
    }
  }

  // Sort by relevance (area × intensity)
  regions.sort((a, b) => {
    const scoreA = a.bbox.width * a.bbox.height * (a.avgIntensity / 255);
    const scoreB = b.bbox.width * b.bbox.height * (b.avgIntensity / 255);
    return scoreB - scoreA;
  });

  // Take top N regions
  const topRegions = regions.slice(0, maxRegions);

  console.log(`✅ Found ${topRegions.length} significant mismatch regions`);

  return topRegions;
}

/**
 * Calculate region statistics for categorization
 */
export async function analyzeRegion(
  img1Buffer: Buffer,
  img2Buffer: Buffer,
  bbox: BoundingBox,
  width: number,
  height: number
): Promise<{
  colorDiff: number;
  edgeDensityDiff: number;
  aspectRatio: number;
  area: number;
}> {
  // Extract region from both images
  // This is a simplified version - in production you'd use Sharp to extract crops
  
  const area = bbox.width * bbox.height;
  const aspectRatio = bbox.width / bbox.height;

  // Simplified heuristics based on region geometry
  // In a full implementation, you'd analyze actual pixel data in the region
  
  return {
    colorDiff: 0, // Placeholder - would calculate LAB color difference
    edgeDensityDiff: 0, // Placeholder - would use edge detection
    aspectRatio,
    area,
  };
}
