import { NextRequest, NextResponse } from "next/server";
import { base64ToBuffer, bufferToBase64 } from "@/lib/imageProcessor";
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
import { getDimensionsFromBuffer } from "@/lib/dimensionExtractor";
import { normalizeBySizingMode } from "@/lib/sizeNormalizer";
import { detectViewportMismatch, checkDimensionLimits } from "@/lib/viewportChecker";

export const maxDuration = 60; // 60 second timeout for processing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      designImage, 
      implementationImage, 
      screenName, 
      platform,
      sizingMode = "match-width-crop",
      designDimensions: providedDesignDims,
      screenshotViewport,
    } = body;

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

    // Step 2: Extract original dimensions
    const designDims = await getDimensionsFromBuffer(designBuffer);
    const implDims = await getDimensionsFromBuffer(implBuffer);
    
    console.log(`📏 Design: ${designDims.width}x${designDims.height}, Implementation: ${implDims.width}x${implDims.height}`);

    // Step 3: Check for dimension limits
    const designLimitCheck = checkDimensionLimits(designDims);
    if (designLimitCheck.needsCapping) {
      console.log(`⚠️  ${designLimitCheck.suggestion}`);
    }

    // Use provided or detected design dimensions as target
    const targetDimensions = designLimitCheck.needsCapping 
      ? designLimitCheck.cappedDimensions! 
      : designDims;

    // Step 4: Detect viewport mismatch
    const viewportWarning = detectViewportMismatch(
      targetDimensions,
      implDims,
      !!screenshotViewport,
      false // useDesignViewport flag (we'll determine from viewport match)
    );

    if (viewportWarning.detected) {
      console.log(`⚠️  Viewport mismatch: width ratio ${viewportWarning.widthRatio}, aspect delta ${viewportWarning.aspectRatioDelta}`);
    }

    // Step 5: Normalize both images using sizing mode
    const designNormalized = await normalizeBySizingMode(
      designBuffer,
      targetDimensions,
      sizingMode
    );

    const implNormalized = await normalizeBySizingMode(
      implBuffer,
      targetDimensions,
      sizingMode
    );

    console.log(`📐 Normalized to ${targetDimensions.width}x${targetDimensions.height} using ${sizingMode}`);

    // Step 6: Generate diff
    const { diffBuffer, similarity, diffData, diffPixels } = await generateDiff(
      designNormalized.buffer,
      implNormalized.buffer,
      targetDimensions.width,
      targetDimensions.height
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
          designDimensions: designDims,
          implementationDimensions: implDims,
          normalizationApplied: {
            sizingMode,
            targetDimensions,
          },
          screenshotViewport,
        },
        viewportWarning: viewportWarning.detected ? viewportWarning : undefined,
      } as ComparisonResult);
    }

    // Step 7: Extract mismatch regions
    const regions = extractMismatchRegions(diffData, targetDimensions.width, targetDimensions.height, 10);

    // Step 8: Categorize and build mismatch objects
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
        designDimensions: designDims,
        implementationDimensions: implDims,
        normalizationApplied: {
          sizingMode,
          targetDimensions,
        },
        screenshotViewport,
      },
      viewportWarning: viewportWarning.detected ? viewportWarning : undefined,
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
