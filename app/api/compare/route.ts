import { NextRequest, NextResponse } from "next/server";
import { base64ToBuffer, bufferToBase64, normalizeImages } from "@/lib/imageProcessor";
import { generateDiff } from "@/lib/diffGenerator";
import { extractMismatchRegions } from "@/lib/regionExtractor";
import {
  categorizeMismatch,
  assignPriority,
  generateTitle,
  generateExplanation,
  generateSuggestedFix,
} from "@/lib/categorizer";
import { ComparisonResult, Mismatch } from "@/lib/types";

export const maxDuration = 60; // 60 second timeout for processing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designImage, implementationImage, screenName, platform } = body;

    if (!designImage || !implementationImage) {
      return NextResponse.json(
        { error: "Both design and implementation images are required" },
        { status: 400 }
      );
    }

    console.log("🚀 Starting comparison pipeline...");

    // Step 1: Convert base64 to buffers
    const designBuffer = base64ToBuffer(designImage);
    const implBuffer = base64ToBuffer(implementationImage);

    // Step 2: Normalize images
    const { buffer1, buffer2, width, height } = await normalizeImages(
      designBuffer,
      implBuffer
    );

    // Step 3: Generate diff
    const { diffBuffer, similarity, diffData, diffPixels } = await generateDiff(
      buffer1,
      buffer2,
      width,
      height
    );

    // Handle case when images are identical or very similar
    if (similarity > 99.5) {
      console.log("✅ Images are nearly identical");
      return NextResponse.json({
        diffImageUrl: bufferToBase64(diffBuffer),
        similarity,
        mismatches: [],
        metadata: {
          screenName,
          platform,
          comparedAt: new Date().toISOString(),
        },
      } as ComparisonResult);
    }

    // Step 4: Extract mismatch regions
    const regions = extractMismatchRegions(diffData, width, height, 10);

    // Step 5: Categorize and build mismatch objects
    const mismatches: Mismatch[] = regions.map((region, idx) => {
      const aspectRatio = region.bbox.width / region.bbox.height;
      const area = region.bbox.width * region.bbox.height;

      const category = categorizeMismatch({
        bbox: region.bbox,
        pixelCount: region.pixelCount,
        avgIntensity: region.avgIntensity,
        aspectRatio,
        area,
      });

      const priority = assignPriority(region.bbox, region.avgIntensity);

      return {
        id: `mismatch-${idx + 1}`,
        title: generateTitle(category, idx + 1),
        category,
        priority,
        explanation: generateExplanation(category, region.bbox, priority),
        suggestedFix: generateSuggestedFix(category, region.bbox),
        bbox: region.bbox,
      };
    });

    // Sort by priority (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    mismatches.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    console.log(`✅ Comparison complete: ${mismatches.length} mismatches found`);

    const result: ComparisonResult = {
      diffImageUrl: bufferToBase64(diffBuffer),
      similarity,
      mismatches,
      metadata: {
        screenName,
        platform,
        comparedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("❌ Comparison error:", error);

    // Handle specific error cases
    if (error.message?.includes("dimensions")) {
      return NextResponse.json(
        { error: "Could not process images. Please ensure they are valid image files." },
        { status: 400 }
      );
    }

    if (error.message?.includes("memory") || error.message?.includes("heap")) {
      return NextResponse.json(
        { error: "Images are too large to process. Please use smaller images (max ~4000px)." },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to compare images" },
      { status: 500 }
    );
  }
}
