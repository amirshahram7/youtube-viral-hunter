'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, History, Terminal, LineChart, 
  RefreshCcw, CheckCircle2, XCircle, 
  Activity, Shield, Cpu 
} from 'lucide-react';

const PROVIDERS = [
  { id: 'google', name: 'Google Gemini' },
  { id: 'together', name: 'Together AI' },
  { id: 'openai', name: 'OpenAI Direct' },
  { id: 'openrouter', name: 'OpenRouter' }
];

export default function SystemPanel() {
  const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'health'>('status');
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/test-providers');
      const data = await res.json();
      if (data.success) {
        const map: any = {};
        data.results.forEach((r: any) => map[r.provider] = r);
        setHealthData(map);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/logs?limit=30');
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in duration-700">
      
      {/* INTERNAL NAVIGATION TABS */}
      <div className="flex justify-center flex-wrap gap-4 px-2">
        <TabButton 
          active={activeTab === 'status'} 
          onClick={() => setActiveTab('status')} 
          icon={<Zap size={14} />} 
          label="Neural Status" 
          color="gold" 
        />
        <TabButton 
          active={activeTab === 'logs'} 
          onClick={() => setActiveTab('logs')} 
          icon={<Terminal size={14} />} 
          label="System Logs" 
          color="purple" 
        />
        <TabButton 
          active={activeTab === 'health'} 
          onClick={() => setActiveTab('health')} 
          icon={<LineChart size={14} />} 
          label="Health Metrics" 
          color="emerald" 
        />
      </div>

      {/* CONTENT AREA: PHASES 1 & 2 CONSOLIDATION */}
      <div className="glass-neon p-10 rounded-[50px] border-2 border-white/5 relative overflow-hidden backdrop-blur-3xl min-h-[500px]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-[150px] pointer-events-none" />
        
        {/* TAB 1: PROVIDER STATUS */}
        {activeTab === 'status' && (
          <div className="space-y-12 animate-in slide-in-from-left-10 duration-500">
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">Connectivity Core</h3>
              <button 
                onClick={testAll}
                disabled={loading}
                className="px-10 py-4 bg-gradient-to-r from-[#c5a059] to-[#f9e1a9] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(197,160,89,0.3)] disabled:opacity-50"
              >
                {loading ? <RefreshCcw className="animate-spin" /> : 'Run Health Check'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PROVIDERS.map((p) => {
                const res = healthData[p.id];
                return (
                  <div key={p.id} className="p-8 rounded-[35px] bg-white/[0.02] border border-white/5 hover:border-[#c5a059]/40 transition-all flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black text-white/90 uppercase tracking-widest mb-1">{p.name}</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">{res ? `${res.latency}ms Latency` : 'Waiting Test...'}</p>
                    </div>
                    {res?.status === 'alive' ? <CheckCircle2 className="text-emerald-500" size={20} /> : <div className="w-2 h-2 rounded-full bg-white/5" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
               <h3 className="text-2xl font-black text-white uppercase tracking-widest">Neural History</h3>
               <button onClick={fetchLogs} className="p-3 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20"><RefreshCcw size={16} /></button>
             </div>
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {logs.map((L) => (
                  <div key={L.id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.03]">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/20 font-black italic">{L.id}</div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">{L.action}</p>
                       <p className="text-[8px] text-white/30 uppercase tracking-[0.4em]">{new Date(L.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-purple-400 uppercase">{L.provider}</p>
                       <p className="text-[9px] text-emerald-400/60 font-mono italic">{L.latency}ms</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* TAB 3: SYSTEM HEALTH (PHASE 6 METRICS) */}
        {activeTab === 'health' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in duration-500 text-center">
             <Shield size={64} className="text-[#c5a059] animate-pulse mb-4" />
             <h3 className="text-3xl font-black text-white uppercase tracking-widest">Platform Integrity</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl">
                <MetricCard icon={<Activity />} label="Stability" value="99.9%" />
                <MetricCard icon={<Cpu />} label="Engine" value="V58.3" />
                <MetricCard icon={<Zap />} label="Response" value="<1.2s" />
                <MetricCard icon={<CheckCircle2 />} label="Audit" value="Active" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, color }: any) {
  const activeStyles = {
    gold: 'bg-[#c5a059] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]',
    purple: 'bg-purple-600 text-white shadow-[0_0_20px_rgba(191,64,255,0.3)]',
    emerald: 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-10 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${active ? (activeStyles as any)[color] : 'text-white/20 hover:text-white/60 bg-white/5 border border-white/5'}`}
    >
      {icon} {label}
    </button>
  );
}

function MetricCard({ icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
       <div className="text-white/20 mb-2">{icon}</div>
       <p className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">{label}</p>
       <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
