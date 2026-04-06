import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      SELECT * FROM tasks WHERE id = ?
    `);

    const task = stmt.get(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task: {
        ...task,
        rounds: JSON.parse(task.rounds_json)
      }
    });

  } catch (error: any) {
    console.error('FETCH_SINGLE_TASK_ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
