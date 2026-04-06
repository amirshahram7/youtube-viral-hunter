'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCcw, Trash2, Filter, AlertCircle, Info, AlertTriangle, Search, Zap } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error';
  source: string;
  message: string;
  provider?: string;
  round?: number;
  latency?: number;
  error?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'healthy' | 'failed'>('idle');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/system/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setPingStatus('testing');
    try {
      const res = await fetch('/api/system/ping');
      const data = await res.json();
      if (data.success) {
        setPingStatus('healthy');
        fetchLogs();
      } else {
        setPingStatus('failed');
      }
    } catch (err) {
      setPingStatus('failed');
    }
    setTimeout(() => setPingStatus('idle'), 3000);
  };

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all system logs?')) return;
    try {
      await fetch('/api/system/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // 5-Minute Heartbeat
    const heartbeat = setInterval(async () => {
      await fetch('/api/system/ping');
    }, 5 * 60 * 1000);

    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 3000);
    }
    return () => {
      clearInterval(interval);
      clearInterval(heartbeat);
    };
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#050505] p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <Terminal size={24} className="text-purple-400 neon-text-purple" />
             <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
               SYSTEM <span className="purple-gradient-text">LOGS</span>
             </h1>
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em] ml-9">
            Real-time neural activity & failover trace
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={testConnection}
            disabled={pingStatus === 'testing'}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
              ${pingStatus === 'healthy' ? 'bg-emerald-500 text-white' : pingStatus === 'failed' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'}
            `}
          >
            <Zap size={14} className={pingStatus === 'testing' ? 'animate-pulse' : ''} />
            {pingStatus === 'testing' ? 'TESTING...' : pingStatus === 'healthy' ? 'SYSTEM HEALTHY' : pingStatus === 'failed' ? 'ERROR DETECTED' : 'TEST SERVER CONNECTION'}
          </button>

          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
              ${autoRefresh ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-white/40 border border-white/10'}
            `}
          >
            <RefreshCcw size={14} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? 'AUTO-SYNC ON' : 'AUTO-SYNC OFF'}
          </button>
          
          <button 
            onClick={clearLogs}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600/10 text-red-400 border border-red-500/30 hover:bg-red-600/20 text-[10px] font-black tracking-widest uppercase transition-all"
          >
            <Trash2 size={14} />
            CLEAR CONSOLE
          </button>
        </div>
      </header>

      {/* FILTERS */}
      <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 max-w-fit">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} icon={<Filter size={12} />} label="ALL" />
        <FilterBtn active={filter === 'info'} onClick={() => setFilter('info')} icon={<Info size={12} />} label="INFO" color="text-blue-400" />
        <FilterBtn active={filter === 'warn'} onClick={() => setFilter('warn')} icon={<AlertTriangle size={12} />} label="WARNINGS" color="text-yellow-400" />
        <FilterBtn active={filter === 'error'} onClick={() => setFilter('error')} icon={<AlertCircle size={12} />} label="ERRORS" color="text-red-400" />
      </div>

      {/* LOGS TABLE (CONSOLE STYLE) */}
      <div className="bg-[#080808] border border-white/5 rounded-[30px] overflow-hidden shadow-2xl">
        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between px-8">
           <div className="flex items-center gap-10 text-[10px] font-black tracking-widest text-white/20 uppercase">
              <span className="w-48">TIMESTAMP</span>
              <span className="w-24">SOURCE</span>
              <span>MESSAGE</span>
           </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar font-mono">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, i) => (
              <div key={i} className={`
                flex items-start gap-10 px-8 py-4 border-b border-white/[0.02] text-xs transition-colors
                ${log.type === 'error' ? 'bg-red-500/5 hover:bg-red-500/10' : log.type === 'warn' ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : 'hover:bg-white/[0.03]'}
              `}>
                <span className="w-48 shrink-0 text-white/30 tabular-nums">{new Date(log.timestamp).toLocaleString()}</span>
                <span className={`w-24 shrink-0 font-bold uppercase tracking-tighter
                   ${log.source === 'ai-gateway' ? 'text-purple-400' : log.source === 'round-engine' ? 'text-blue-400' : 'text-emerald-400'}
                `}>
                  {log.source}
                </span>
                <div className="flex-1 space-y-2">
                   <p className={`font-medium ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-white/70'}`}>
                     {log.message}
                   </p>
                   {log.provider && (
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 uppercase tracking-widest">
                          PROVIDER: {log.provider}
                        </span>
                        {log.latency && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-emerald-400 uppercase tracking-widest">
                            LATENCY: {log.latency}ms
                          </span>
                        )}
                     </div>
                   )}
                   {log.error && (
                     <p className="text-[10px] text-red-500/60 break-all bg-red-950/20 p-2 rounded-lg border border-red-500/10">
                        {log.error}
                     </p>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center space-y-4">
               <Search size={48} className="mx-auto text-white/5" />
               <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">Scanning for Activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, icon, label, color = "text-white" }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
        ${active ? 'bg-white/10 text-white shadow-lg' : `text-white/30 hover:text-white hover:bg-white/5`}
      `}
    >
      <span className={active ? color : ''}>{icon}</span>
      {label}
    </button>
  );
}
