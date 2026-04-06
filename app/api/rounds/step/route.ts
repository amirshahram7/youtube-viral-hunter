import { NextRequest, NextResponse } from "next/server";
import { RoundEngineService } from "@/services/round-engine.service";
import { LoggerService } from "@/services/logger.service";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { missionId, roundNumber, prompt, config, previousResults, commanderMessage } = body;

    if (!missionId) return NextResponse.json({ error: "missionId is required" }, { status: 400 });

    LoggerService.info('api', `POST /api/rounds/step - Mission ${missionId} Round ${roundNumber}`, { round: roundNumber });

    const result = await RoundEngineService.executeSingleStep(
      roundNumber,
      prompt,
      config,
      previousResults || [],
      commanderMessage
    );

    // PERSISTENCE LOGIC
    const updatedRounds = [...(previousResults || []), result];
    const roundsJson = JSON.stringify(updatedRounds);
    const finalDecision = result.round === config.rounds ? result.output : null;
    const userId = "anonymous";

    try {
      // Upsert into tasks table
      const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(missionId);
      
      if (!existing) {
        db.prepare(`
          INSERT INTO tasks (id, userId, query, rounds_json, final_decision) 
          VALUES (?, ?, ?, ?, ?)
        `).run(missionId, userId, prompt, roundsJson, finalDecision);
      } else {
        db.prepare(`
          UPDATE tasks SET rounds_json = ?, final_decision = ?, timestamp = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(roundsJson, finalDecision, missionId);
      }
    } catch (dbErr) {
      LoggerService.error('api', `Persistence Failure for Mission ${missionId}`, { error: (dbErr as any).message });
    }

    LoggerService.info('api', `Response Sent for Mission ${missionId} Round ${roundNumber}`, { round: roundNumber });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        missionId
      }
    });

  } catch (error: any) {
    LoggerService.error('api', `Unexpected API Error: ${error.message}`);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Round step execution failed"
      },
      { status: 500 }
    );
  }
}
