import { NextResponse } from 'next/server';
import { PromptBuilderService } from '../../../services/prompt-builder.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea, originalIdea } = body;

    if (!idea && !originalIdea) {
      return NextResponse.json({ error: 'Concept is required' }, { status: 400 });
    }

    const result = await PromptBuilderService.buildPrompt(body);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
