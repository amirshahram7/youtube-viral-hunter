import { NextResponse } from "next/server";
import { LoggerService } from "@/services/logger.service";

export async function GET() {
  try {
    // Log the heartbeat
    LoggerService.info('system', 'SYSTEM HEARTBEAT: HEALTHY', {
      latency: 0,
      source: 'api'
    });

    return NextResponse.json({
      success: true,
      status: 'HEALTHY',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    LoggerService.error('system', `HEALTH CHECK FAILED: ${error.message}`);
    return NextResponse.json({
      success: false,
      status: 'CRITICAL',
      error: error.message
    }, { status: 500 });
  }
}
