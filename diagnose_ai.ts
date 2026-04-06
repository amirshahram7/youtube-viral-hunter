import { callAI } from "./services/ai-gateway.service";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function diagnose() {
  console.log("--- ARCANUM AI DIAGNOSTIC START ---");
  
  const providers = ['google', 'together', 'openai'];
  
  for (const provider of providers) {
    console.log(`Testing Provider: ${provider}...`);
    try {
      const start = Date.now();
      const res = await callAI(provider as any, "Hello, respond with 'OK'.");
      const duration = Date.now() - start;
      console.log(`✅ ${provider} SUCCESS: "${res.text.trim()}" (${duration}ms)`);
    } catch (err: any) {
      console.error(`❌ ${provider} FAILED: ${err.message}`);
    }
  }
  
  console.log("--- DIAGNOSTIC COMPLETE ---");
}

diagnose();
