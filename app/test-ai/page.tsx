'use client';
import { useState } from 'react';

export default function TestAIPage() {
  const [provider, setProvider] = useState<'together' | 'openrouter' | 'google' | 'openai'>('together');
  const [prompt, setPrompt] = useState('سلام! وضعیت اتصال را بررسی کن.');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, prompt }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-cream-200 bg-clip-text text-transparent">
            پنل تست زیرساخت هوش مصنوعی
          </h1>
          <p className="text-white/50 mt-2">تست مستقیم درگاه‌های ARCANUM AI</p>
        </header>

        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6 backdrop-blur-xl">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40">انتخاب سرویس‌دهنده</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold-500/50 transition-colors"
            >
              <option value="together">Together AI (ارزان‌ترین)</option>
              <option value="openrouter">OpenRouter (فال‌بک)</option>
              <option value="google">Google Gemini (مستقیم)</option>
              <option value="openai">OpenAI ChatGPT (مستقیم)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40">متن پرامپت</label>
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold-500/50 transition-colors resize-none"
            />
          </div>

          <button 
            onClick={handleTest}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              loading ? 'bg-white/20 animate-pulse' : 'bg-gradient-to-r from-[#c5a059] to-[#8a6e3d] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? 'در حال دریافت پاسخ...' : 'ارسال درخواست تست'}
          </button>
        </div>

        {result && (
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-gold-400 font-bold mb-4">نتیجه تست:</h3>
            {result.error ? (
              <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">{result.error}</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                  {result.text}
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="bg-white/5 px-3 py-1 rounded-full text-white/60">Provider: {result.provider}</span>
                  <span className="bg-white/5 px-3 py-1 rounded-full text-white/60">Latency: {result.latency}ms</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
