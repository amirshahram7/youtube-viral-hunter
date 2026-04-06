import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anonymous';

    const stmt = db.prepare(`
      SELECT id, query, final_decision, timestamp 
      FROM tasks 
      WHERE userId = ? 
      ORDER BY timestamp DESC
      LIMIT 20
    `);

    const results = stmt.all(userId);

    return NextResponse.json({
      success: true,
      history: results
    });

  } catch (error: any) {
    console.error('FETCH_HISTORY_ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
