import { NextResponse } from "next/server";
import { LoggerService } from "@/services/logger.service";

export async function GET() {
  try {
    const logs = LoggerService.getLogs();
    return NextResponse.json({
      success: true,
      logs
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    LoggerService.clear();
    return NextResponse.json({
      success: true,
      message: "Logs cleared"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
