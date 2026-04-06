import { callAI } from "./ai-gateway.service";

export interface PromptBuildRequest {
  idea?: string;
  mode?: 'quick' | 'advanced';
  location?: string;
  budget?: string;
  goal?: string;
  experience?: string;
  timeline?: string;
  originalIdea?: string;
}

export class PromptBuilderService {
  /**
   * Transforms a simple idea or a multi-step interview into a high-end structured AI prompt.
   */
  static async buildPrompt(request: PromptBuildRequest) {
    if (request.location || request.budget || request.goal) {
      return this.architectFinalPrompt(request);
    }
    
    if (request.mode === 'quick') {
      return this.executeQuickExpansion(request.idea || '');
    } else {
      return this.initiateAdvancedInterview(request.idea || '');
    }
  }

  private static async architectFinalPrompt(req: PromptBuildRequest) {
    const architectPrompt = `
      You are the ARCANUM MASTER ARCHITECT.
      The user has provided strategic bounds for a mission:
      - CONCEPT: "${req.originalIdea || req.idea}"
      - LOCATION: "${req.location}"
      - BUDGET/SCALE: "${req.budget}"
      - PRIMARY GOAL: "${req.goal}"
      - TIMELINE: "${req.timeline}"
      
      TASK:
      Create a SUPREME, PROFESSIONAL STRATEGIC PROMPT for the Arcanum Roundtable.
      
      REQUIREMENTS:
      1. Define a world-class expert persona.
      2. Ensure the prompt forces the AI to respect the budget and location context.
      3. Use structured reasoning and step-by-step tactical logic.
      4. The output must be optimized for multi-agent roundtable analysis.
      
      Language: Match the input (Persian if inputs are Persian, English otherwise).
      Output ONLY the final expanded prompt.
    `;

    const res = await callAI({ provider: 'openai', prompt: architectPrompt, mode: 'deep' });
    return {
      type: 'final_prompt',
      content: res.text,
      provider: res.provider
    };
  }

  private static async executeQuickExpansion(idea: string) {
    const metaPrompt = `
      Expand this idea into a PROFESSIONAL, HIGH-END strategy prompt for ARCANUM AI.
      IDEA: "${idea}"
      Output ONLY the final prompt.
    `;

    const res = await callAI({ provider: 'google', prompt: metaPrompt, mode: 'balanced' });
    return { 
      type: 'final_prompt',
      content: res.text,
      provider: res.provider
    };
  }

  private static async initiateAdvancedInterview(idea: string) {
     // Legacy logic, but kept for compatibility
     const res = await callAI({ provider: 'openai', prompt: `Ask 3 strategic questions about: ${idea}`, mode: 'balanced' });
     return { type: 'interview', questions: [res.text], provider: res.provider };
  }
}
