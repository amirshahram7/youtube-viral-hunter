import { NextResponse } from 'next/server';
import { RoundEngineService } from '../../../../services/round-engine.service';
import db from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../../../../services/logger.service';

export async function POST(req: Request) {
  try {
    const { prompt, userId, config } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const currentUserId = userId || 'anonymous';
    const defaultConfig = { scale: 'SME', agents: 3, rounds: 4, mode: 'balanced' };
    const finalConfig = { ...defaultConfig, ...config };

    // 1. Execute the full multi-agent sequence with Moderator
    const results = await RoundEngineService.executeFullSequence(prompt, finalConfig);

    // 2. PHASE 3: PERSISTENT USER HISTORY
    // Generate a unique ID for the task
    const taskId = uuidv4();
    const finalDecision = results[results.length - 1].output;

    const stmt = db.prepare(`
      INSERT INTO tasks (id, userId, query, rounds_json, final_decision)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      taskId,
      currentUserId,
      prompt,
      JSON.stringify(results),
      finalDecision
    );

    // 3. LOG COMPLETION (Phase 2 integration)
    await LoggerService.log({
      action: 'MISSION_SAVED',
      userId: currentUserId,
      input: prompt,
      provider: 'vault'
    });

    return NextResponse.json({
      success: true,
      taskId,
      data: results
    });

  } catch (error: any) {
    console.error('ROUND_ENGINE_EXECUTION_ERROR:', error);
    return NextResponse.json({ 
      error: 'Mission Execution Failed', 
      details: error.message || 'Unknown neural failure'
    }, { status: 500 });
  }
}
