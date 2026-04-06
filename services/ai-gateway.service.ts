/**
 * ARCANUM AI GATEWAY V62.2 (SMART FAILOVER PROTOCOL)
 * --------------------------------------------------
 * This engine handles prioritized routing and automatic fallbacks.
 * Priority: 1. OpenAI -> 2. Google -> 3. OpenRouter -> 4. Together
 */

import { LoggerService } from "./logger.service";

export interface AIRequest {
  prompt: string;
  mode?: 'fast' | 'balanced' | 'deep';
  provider?: string; // Optional: Force a specific provider
}

export interface AIResponse {
  text: string;
  provider: string;
  latency: number;
  fallbackCount: number;
}

const PRIORITY_LIST: Array<'openai' | 'google' | 'openrouter' | 'together'> = [
  'openai',
  'google',
  'openrouter',
  'together'
];

/**
 * Executes an AI request with automatic failover logic.
 * NEVER stops until success or exhaustive failure.
 */
export async function callAI({ prompt, mode = 'balanced', provider }: AIRequest): Promise<AIResponse> {
  const startTime = Date.now();
  let fallbackCount = 0;
  let lastError: string | null = null;

  // Use the provided list OR a user-forced single provider
  const sequence = provider ? [provider as any] : PRIORITY_LIST;

  for (const currentProvider of sequence) {
    const attemptStart = Date.now();
    LoggerService.info('ai-gateway', `Attemting ${currentProvider.toUpperCase()} (Attempt ${fallbackCount + 1})...`, { provider: currentProvider });

    try {
      const result = await attemptSingleCall(currentProvider, prompt, mode);
      const latency = Date.now() - attemptStart;
      
      LoggerService.info('ai-gateway', `${currentProvider.toUpperCase()} SUCCESS`, { 
        provider: currentProvider, 
        latency,
        round: fallbackCount + 1 
      });
      
      return {
        text: result,
        provider: currentProvider,
        latency: Date.now() - startTime,
        fallbackCount
      };

    } catch (error: any) {
      LoggerService.warn('ai-gateway', `${currentProvider.toUpperCase()} FAILED: ${error.message}`, { 
        provider: currentProvider,
        error: error.message 
      });
      lastError = error.message;
      fallbackCount++;
      // Continue to next provider in sequence
    }
  }

  LoggerService.error('ai-gateway', `CRITICAL FAILOVER EXHAUSTED: ${lastError}`);
  throw new Error(`CRITICAL: All AI providers failed. Last Error: ${lastError}`);
}

/**
 * Handles the actual HTTP communication for a single provider.
 */
async function attemptSingleCall(provider: string, prompt: string, mode: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for deep reasoning

  try {
    const config = getProviderConfig(provider, prompt, mode);
    
    const response = await fetch(config.url, {
      method: 'POST',
      headers: config.headers as Record<string, string>,
      body: JSON.stringify(config.body),
      signal: controller.signal
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return parseProviderResponse(provider, data);

  } catch (error: any) {
    if (error.name === 'AbortError') throw new Error(`Neural Timeout: Provider took more than 60s`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Configuration generator for each API provider.
 */
function getProviderConfig(provider: string, prompt: string, mode: string) {
  const commonHeaders = { 'Content-Type': 'application/json' };
  const getModel = (p: string, m: string) => {
    const models: Record<string, any> = {
      openai: m === 'deep' ? 'gpt-4o' : 'gpt-4o-mini',
      google: m === 'deep' ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
      together: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      openrouter: 'openai/gpt-4o-mini'
    };
    return models[p] || models.openai;
  };

  const selectedModel = getModel(provider, mode);

  switch (provider) {
    case 'google':
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        headers: commonHeaders,
        body: { contents: [{ parts: [{ text: prompt }] }] }
      };
    
    case 'openai':
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: { ...commonHeaders, 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: { model: selectedModel, messages: [{ role: 'user', content: prompt }] }
      };

    case 'together':
      return {
        url: 'https://api.together.xyz/v1/chat/completions',
        headers: { ...commonHeaders, 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}` },
        body: { model: selectedModel, messages: [{ role: 'user', content: prompt }] }
      };

    case 'openrouter':
    default:
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: { 
          ...commonHeaders, 
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'X-Title': 'ARCANUM AI'
        },
        body: { model: selectedModel, messages: [{ role: 'user', content: prompt }] }
      };
  }
}

/**
 * Standardizes API responses into a clean string.
 */
function parseProviderResponse(provider: string, data: any): string {
  if (provider === 'google') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}
