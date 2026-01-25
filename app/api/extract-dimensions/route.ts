import { NextRequest, NextResponse } from "next/server";
import { getImageDimensions } from "@/lib/dimensionExtractor";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    const dimensions = await getImageDimensions(image);

    return NextResponse.json(dimensions);
  } catch (error: any) {
    console.error("❌ Dimension extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract dimensions" },
      { status: 500 }
    );
  }
}
