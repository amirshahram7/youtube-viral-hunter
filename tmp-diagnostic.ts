import { callAI } from './services/ai-gateway.service';

/**
 * ARCANUM ALIGNMENT DIAGNOSTIC V62.3
 * ----------------------------------
 * Verifying that all providers (OpenAI, Google, OpenRouter, Together) 
 * are responding correctly with their updated model IDs.
 */
async function runSystemTest() {
  console.log("--- STARTING SYSTEM ALIGNMENT TEST V62.3 ---");
  
  const providers = ['openai', 'google', 'openrouter', 'together'] as const;
  
  for (const provider of providers) {
    console.log(`[Diagnostic] Probing ${provider.toUpperCase()}...`);
    const start = Date.now();
    try {
      // We force the provider to test direct connectivity
      const res = await callAI({ 
        provider, 
        prompt: "Say 'READY' if you hear me.",
        mode: 'fast' 
      });
      console.log(`[SUCCESS] ${provider.toUpperCase()} is online.`);
      console.log(`- Response: ${res.text}`);
      console.log(`- Model Used: ${res.provider}`);
      console.log(`- Latency: ${Date.now() - start}ms`);
    } catch (error: any) {
      console.error(`[FAILURE] ${provider.toUpperCase()} failed: ${error.message}`);
    }
    console.log("---");
  }
}

runSystemTest();
