# ARCANUM AI GATEWAY ARCHITECTURE (V62.3)

The AI Gateway is the critical neural routing layer of Arcanum AI. It ensures 100% mission uptime by managing a prioritized chain of AI providers with automatic failover.

---

## 🧬 FAILOVER PRIORITY CHAIN

Arcanum follows a strict hierarchy for neural calls. If a provider fails (Error, Timeout, or Invalid Response), the gateway automatically attempts the next provider in the list.

| Priority | Provider | Region | Default Model | Speed/Cost Focus |
|:---|:---|:---|:---|:---|
| 1 | **OpenAI** | Direct API | `gpt-4o-mini` | High Precision / Standard Cost |
| 2 | **Google** | Cloud Studio | `gemini-1.5-flash` | Extreme Speed / Low Cost |
| 3 | **OpenRouter** | Aggregator | `openai/gpt-4o-mini` | High Availability / Flexible |
| 4 | **Together AI**| Cluster | `Llama-3.3-70B-Instruct-Turbo` | Large Model Power / Distributed |

---

## 🛠 MODEL MAPPINGS (STANDARDIZED)

To ensure stability, each provider uses a specific, validated model ID format.

### 1. OpenAI (Direct)
- **Fast / Balanced**: `gpt-4o-mini`
- **Deep / Strategic**: `gpt-4o`

### 2. Google Gemini (Direct)
- **Fast / Balanced**: `gemini-1.5-flash`
- **Deep / Strategic**: `gemini-1.5-pro`

### 3. OpenRouter (Unified Mapping)
- **Standard**: `openai/gpt-4o-mini` (Ensures maximum compatibility with ChatGPT logic)

### 4. Together AI (Open-Source Cluster)
- **Standard**: `meta-llama/Llama-3.3-70B-Instruct-Turbo`

---

## ⚡ FAILOVER LOGIC & TIMEOUTS

- **Strict Timeout**: Each attempt is capped at **10,000ms (10 seconds)** using `AbortController`.
- **Automatic Recovery**: On failure/timeout, the `fallbackCount` is incremented, and the next provider in the `PRIORITY_LIST` is called.
- **Final Failure**: If all 4 providers fail, a `CRITICAL: All AI providers failed` error is returned to the Mission Engine.

---

## 🛰 EXAMPLE INTEGRATION

### Request Object
```json
{
  "prompt": "Synthesize local UAE market trends...",
  "mode": "balanced"
}
```

### Response Object (Standardized)
```json
{
  "text": "The analysis reveals...",
  "provider": "google",
  "latency": 2400,
  "fallbackCount": 1
}
```

---

## 🛡 SECURITY & LOGGING
- **API Keys**: Stored in `.env.local` to prevent leaked exposure.
- **Trace Logs**: Each attempt is logged in the server console for real-time diagnostic auditing.

---
**Status: STABLE | Version: 62.3 | Last Audit: 2026-04-06**
