import { callAI } from "./ai-gateway.service";
import { LoggerService } from "./logger.service";

export interface AgentOutput {
  agent: string;
  role: string;
  content: string;
  provider: string;
}

export interface RoundResult {
  round: number;
  title: string;
  outputs: AgentOutput[];
  latency?: number;
  status: 'success' | 'failed';
  error?: string;
  commanderInstruction?: string;
}

export interface RoundConfig {
  scale: 'MICRO' | 'SMALL' | 'SME' | 'LARGE' | 'GLOBAL';
  agents: 1 | 3 | 5 | 7;
  rounds: number;
  mode: 'fast' | 'balanced' | 'deep';
  location?: string;
}

export class RoundEngineService {
  /**
   * Executes a multi-agent debate round with conflicting personas.
   */
  static async executeSingleStep(
    roundNum: number, 
    prompt: string, 
    config: RoundConfig, 
    previousResults: RoundResult[],
    commanderInput?: string
  ): Promise<RoundResult> {
    const roundStart = Date.now();
    const scaleContext = this.getScaleInstructions(config.scale);
    
    // BUILD DYNAMIC CONTEXT
    let context = `
      STRATEGIC WAR ROOM PROTOCOL V64.1
      PROJECT SCALE: ${config.scale} (${scaleContext})
      RULES: 
      1. Disagree with each other. Be specific. NO generic advice.
      2. STRICT NO-REPETITION: Do NOT repeat facts, data, or arguments already stated in previous rounds. 
      3. EVOLUTION: Focus only on building deeper layers of analysis or finding new flaws that weren't mentioned yet.
    `;

    previousResults.forEach(r => {
      if (r.status === 'success') {
        context += `\nROUND ${r.round} DEBATE SUMMARY: ${r.outputs.map(o => `${o.agent}: ${o.content.substring(0, 500)}`).join('\n')}`;
      }
    });

    if (commanderInput) {
      context += `\nCOMMANDER INTERJECTION: "${commanderInput}"`;
    }

    // NEW DEBATE STRUCTURE: EACH ROUND HAS 2 SPECIALIZED AGENTS
    const roundConfigs = [
      { 
        title: "Market Analysis Debate", 
        agents: [
          { name: "Analyst A", role: "Macro Economist", instruction: "Focus on stable growth, data-driven trends, and standard market validation. YOU MUST RESPOND IN PERFECT PERSIAN." },
          { name: "Analyst B", role: "Disruptive Futurist", instruction: "Focus on creative gaps, social impact, and extreme-case 'What If' scenarios. Disagree with Analyst A. YOU MUST RESPOND IN PERFECT PERSIAN." }
        ]
      },
      { 
        title: "Critical Attack Phase", 
        agents: [
          { name: "Critic A", role: "Legal & Compliance", instruction: "Find legal risks, fraud potential, and regulatory traps. Be extremely harsh. YOU MUST RESPOND IN PERFECT PERSIAN." },
          { name: "Critic B", role: "Scalability Architect", instruction: "Focus on operations, technical death-spirals, and resource limits. Reject weak ideas. YOU MUST RESPOND IN PERFECT PERSIAN." }
        ]
      },
      { 
        title: "Deployment Optimization", 
        agents: [
          { name: "Optimizer A", role: "Lean Specialist", instruction: "Focus on speed-to-market and extreme cost cutting. Disagree with any expensive plans. YOU MUST RESPOND IN PERFECT PERSIAN." },
          { name: "Optimizer B", role: "Revenue Strategist", instruction: "Focus on premium models, high-ticket sales, and long-term moat building. Challenge the Lean approach. YOU MUST RESPOND IN PERFECT PERSIAN." }
        ]
      },
      { 
        title: "Executive Moderator", 
        agents: [
          { name: "Moderator", role: "Supreme Decision Brain", instruction: "Analyze the debate. Remove weak arguments. Synthesize the conflicting opinions into a FINAL VERDICT. YOU MUST RESPOND IN PERFECT PERSIAN." }
        ]
      }
    ];

    const currentRound = roundConfigs[roundNum - 1];
    if (!currentRound) throw new Error(`Invalid Round: ${roundNum}`);

    LoggerService.info('round-engine', `Mission Round ${roundNum} START: ${currentRound.title}`, { round: roundNum });

    try {
      // EXECUTE ALL AGENTS IN PARALLEL (THE CONFLICT LAYER)
      const agentPromises = currentRound.agents.map(async (agent) => {
        const fullPrompt = `
          ${context}
          YOUR PERSONA: ${agent.name} (${agent.role})
          YOUR SPECIFIC INSTRUCTION: ${agent.instruction}
          ORIGINAL PROMPT: "${prompt}"
          TASK: Respond to the prompt and previous context from your unique perspective.
        `;

        const response = await callAI({ prompt: fullPrompt, mode: config.mode });
        
        return {
          agent: agent.name,
          role: agent.role,
          content: response.text,
          provider: response.provider
        } as AgentOutput;
      });

      const outputs = await Promise.all(agentPromises);
      const latency = Date.now() - roundStart;

      LoggerService.info('round-engine', `Round ${roundNum} SUCCESS with ${outputs.length} agents`, { round: roundNum, latency });

      return {
        round: roundNum,
        title: currentRound.title,
        outputs,
        latency,
        status: 'success',
        commanderInstruction: commanderInput
      };
    } catch (err: any) {
      LoggerService.error('round-engine', `Round ${roundNum} FAILED: ${err.message}`, { round: roundNum });
      return {
        round: roundNum,
        title: currentRound.title,
        outputs: [],
        latency: Date.now() - roundStart,
        status: 'failed',
        error: err.message
      };
    }
  }

  private static getScaleInstructions(scale: string): string {
    switch(scale) {
      case 'MICRO': return "Under $1,000 budget.";
      case 'SMALL': return "$1K - $10K budget.";
      case 'SME': return "Established SME scale.";
      case 'LARGE': return "Major enterprise complexity.";
      case 'GLOBAL': return "International cross-region complexity.";
      default: return "Standard business scale.";
    }
  }
}
