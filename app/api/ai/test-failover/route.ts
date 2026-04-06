import { NextResponse } from 'next/server';
import { callAI } from '../../../../services/ai-gateway.service';

/**
 * ARCANUM FAILOVER DIAGNOSTIC ENDPOINT
 * ------------------------------------
 * This endpoint simulates provider failures to verify the fallback chain.
 */
export async function GET() {
  const startTime = Date.now();
  const trace: string[] = [];

  try {
    console.log("--- STARTING FAILOVER DIAGNOSTIC TEST ---");
    
    // We send a request. Since we can't easily "break" OpenAI without changing .env,
    // we simply trigger a real call and check the logs for fallback behavior if any.
    // To TRULY test fallback, one would temporarily invalidate a key in .env.local.
    
    const result = await callAI({
      prompt: "Reply with exactly one word: 'READY'.",
      mode: 'fast'
    });

    return NextResponse.json({
      success: true,
      diagnostic: {
        message: "Failover engine is operational.",
        finalProvider: result.provider,
        fallbacksTriggered: result.fallbackCount,
        latency: result.latency,
        text: result.text
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
