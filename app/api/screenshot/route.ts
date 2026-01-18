import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { VIEWPORT_PRESETS } from "@/lib/types";

export const maxDuration = 30; // 30 second timeout

export async function POST(request: NextRequest) {
  try {
    const { url, viewport = "desktop" } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate viewport
    const viewportConfig = VIEWPORT_PRESETS[viewport as keyof typeof VIEWPORT_PRESETS];
    if (!viewportConfig) {
      return NextResponse.json(
        { error: "Invalid viewport preset" },
        { status: 400 }
      );
    }

    console.log(`📸 Capturing screenshot: ${url} at ${viewportConfig.label}`);

    // Launch browser
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: {
        width: viewportConfig.width,
        height: viewportConfig.height,
      },
      deviceScaleFactor: 1,
      // Disable animations for consistent screenshots
      reducedMotion: "reduce",
    });

    const page = await context.newPage();

    // Set timeout and navigate
    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 25000, // 25 second timeout
      });

      // Take screenshot
      const screenshotBuffer = await page.screenshot({
        fullPage: false, // Only visible viewport
        type: "png",
      });

      await browser.close();

      // Convert to base64
      const base64Image = `data:image/png;base64,${screenshotBuffer.toString("base64")}`;

      console.log(`✅ Screenshot captured successfully`);

      return NextResponse.json({
        image: base64Image,
        viewport: viewportConfig,
      });

    } catch (navigationError: any) {
      await browser.close();
      
      console.error("Navigation error:", navigationError.message);

      if (navigationError.message.includes("timeout")) {
        return NextResponse.json(
          { error: "Page load timeout. The URL took too long to respond." },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { error: "Could not reach the URL. Please check if it's accessible." },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("Screenshot error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture screenshot" },
      { status: 500 }
    );
  }
}
