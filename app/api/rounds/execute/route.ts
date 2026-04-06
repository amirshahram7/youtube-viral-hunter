import { NextRequest, NextResponse } from "next/server";
import { RoundEngineService } from "@/services/round-engine.service";

export async function POST(req: NextRequest) {
  try {
    const { prompt, config } = await req.json();

    console.log("ROUND INPUT:", prompt);

    const results = await RoundEngineService.executeFullSequence(
      prompt,
      config
    );

    console.log("ROUND RESULT:", results);

    return NextResponse.json({
      success: true,
      data: results || []
    });

  } catch (error: any) {
    console.log("ROUND ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Round execution failed"
      },
      { status: 500 }
    );
  }
}