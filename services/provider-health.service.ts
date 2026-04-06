import { callAI } from "./ai-gateway.service";

export interface ProviderStatus {
  provider: string;
  status: 'alive' | 'failed';
  latency: number;
  error?: string;
}

export class ProviderHealthService {
  /**
   * Pings each provider with a minimal request to check availability and latency.
   */
  static async testAllProviders(): Promise<ProviderStatus[]> {
    const providers: Array<'together' | 'openrouter' | 'google' | 'openai'> = [
      'google',
      'together',
      'openai',
      'openrouter'
    ];

    const results = await Promise.all(
      providers.map(async (p) => {
        const start = Date.now();
        try {
          // Minimal "ping" prompt
          await callAI({ 
            provider: p, 
            prompt: "ping", 
          });
          
          return {
            provider: p,
            status: 'alive' as const,
            latency: Date.now() - start
          };
        } catch (err: any) {
          return {
            provider: p,
            status: 'failed' as const,
            latency: Date.now() - start,
            error: err.message
          };
        }
      })
    );

    return results;
  }

  static async testSingle(provider: any): Promise<ProviderStatus> {
    const start = Date.now();
    try {
      await callAI({ provider, prompt: "ping" });
      return {
        provider,
        status: 'alive',
        latency: Date.now() - start
      };
    } catch (err: any) {
      return {
        provider,
        status: 'failed',
        latency: Date.now() - start,
        error: err.message
      };
    }
  }
}
