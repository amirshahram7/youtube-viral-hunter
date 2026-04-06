import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/services/ai-gateway.service";

// 👇 تست OpenRouter با GET
export async function GET() {
  try {
    const result = await callAI({
      provider: "openrouter",
      prompt: "Say OK",
      model: "openai/gpt-4o-mini"
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 👇 تست POST هم OpenRouter
export async function POST(req: NextRequest) {
  try {
    const result = await callAI({
      provider: "openrouter",
      prompt: "Say OK",
      model: "openai/gpt-4o-mini"
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}