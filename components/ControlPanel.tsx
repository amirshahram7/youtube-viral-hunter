'use client';

import React from 'react';
import { 
  Zap, Users, Layers, Activity, 
  ChevronRight, AlertTriangle, Info,
  TrendingDown, TrendingUp, Sparkles
} from 'lucide-react';

export type ArcanumScale = 'MICRO' | 'SMALL' | 'SME' | 'LARGE' | 'GLOBAL';
export type ArcanumMode = 'fast' | 'balanced' | 'deep';

interface ControlPanelProps {
  scale: ArcanumScale;
  onScaleChange: (s: ArcanumScale) => void;
  agents: number;
  onAgentsChange: (a: number) => void;
  rounds: number;
  onRoundsChange: (r: number) => void;
  mode: ArcanumMode;
  onModeChange: (m: ArcanumMode) => void;
  isLoading?: boolean;
}

const SCALE_INFO = {
  MICRO: { label: 'Micro-Venture', budget: '< $1K', desc: 'Solo/Lean focused', color: 'text-emerald-400' },
  SMALL: { label: 'Small Business', budget: '$1K - $10K', desc: 'Growth & local scaling', color: 'text-blue-400' },
  SME: { label: 'Mid-Market SME', budget: '$10K - $100K', desc: 'Professional operations', color: 'text-purple-400' },
  LARGE: { label: 'Enterprise', budget: '$100K+', desc: 'Complex infrastructure', color: 'text-amber-400' },
  GLOBAL: { label: 'Global Conglomerate', budget: 'No Limit', desc: 'International regulatory focus', color: 'text-red-400' },
};

const MODES = {
  fast: { label: 'Fast', desc: 'Speed & Efficiency (GPT-4o Mini)', cost: '~$0.05', icon: <TrendingDown size={14} /> },
  balanced: { label: 'Balanced', desc: 'Optimal Quality/Cost', cost: '~$0.50', icon: <Activity size={14} /> },
  deep: { label: 'Deep Neural', desc: 'Max Accuracy (Pro Models)', cost: '~$2.00', icon: <TrendingUp size={14} /> },
};

export default function ControlPanel({
  scale, onScaleChange,
  agents, onAgentsChange,
  rounds, onRoundsChange,
  mode, onModeChange,
  isLoading
}: ControlPanelProps) {

  const estimatedCost = () => {
    const base = mode === 'fast' ? 0.05 : mode === 'balanced' ? 0.5 : 2.0;
    const factor = (agents / 3) * (rounds / 4);
    return (base * factor).toFixed(2);
  };

  const isMismatch = (scale === 'MICRO' && mode === 'deep') || (scale === 'GLOBAL' && mode === 'fast');

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
      <div className="glass-neon p-8 md:p-12 rounded-[50px] border-2 border-white/5 relative overflow-hidden backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
        
        {/* Background Accents */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-400/5 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* LEFT: SCALE & SELECTION */}
          <div className="lg:col-span-4 space-y-8">
            <header className="space-y-1">
               <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">
                  <Sparkles size={12} />
                  Tactical Config
               </div>
               <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Mission Bounds</h3>
            </header>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                 <ChevronRight size={12} /> Select Project Scale
              </p>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(SCALE_INFO) as ArcanumScale[]).map((s) => (
                  <button
                    key={s}
                    disabled={isLoading}
                    onClick={() => onScaleChange(s)}
                    className={`p-4 rounded-2xl border transition-all text-left group ${scale === s ? 'bg-purple-600/10 border-purple-500/50 shadow-[0_0_30px_rgba(191,64,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${scale === s ? 'text-white' : 'text-white/40'}`}>{SCALE_INFO[s].label}</span>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-lg bg-black/40 ${SCALE_INFO[s].color}`}>{SCALE_INFO[s].budget}</span>
                    </div>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider">{SCALE_INFO[s].desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: AGENTS / ROUNDS / MODE */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-10 lg:pl-12 lg:border-l border-white/5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* AGENTS */}
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Users size={14} className="text-purple-400" /> Neural Agents
                    </label>
                    <span className="text-2xl font-black text-white italic">{agents}</span>
                 </div>
                 <div className="relative pt-1">
                    <input 
                      type="range" min="1" max="7" step="2"
                      value={agents}
                      onChange={(e) => onAgentsChange(Number(e.target.value))}
                      disabled={isLoading}
                      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between mt-2 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                       <span>1 Agent</span>
                       <span>3</span>
                       <span>5</span>
                       <span>7 Agents</span>
                    </div>
                 </div>
                 <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[9px] text-purple-400/80 uppercase tracking-widest flex items-center gap-3">
                    <Info size={14} className="flex-shrink-0" />
                    <span>Higher agent count increases diversity of analysis but takes longer.</span>
                 </div>
               </div>

               {/* ROUNDS */}
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Layers size={14} className="text-purple-400" /> Strategic Rounds
                    </label>
                    <span className="text-2xl font-black text-white italic">{rounds}</span>
                 </div>
                 <div className="relative pt-1">
                    <input 
                      type="range" min="1" max="4" step="1"
                      value={rounds}
                      onChange={(e) => onRoundsChange(Number(e.target.value))}
                      disabled={isLoading}
                      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between mt-2 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                       <span>Analysis</span>
                       <span>Critique</span>
                       <span>Refine</span>
                       <span>Verdict</span>
                    </div>
                 </div>
               </div>
            </div>

            {/* MODE TOGGLE */}
            <div className="space-y-6 pt-6 border-t border-white/5">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                   <Activity size={14} className="text-purple-400" /> Execution Mode
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {(Object.keys(MODES) as ArcanumMode[]).map((m) => (
                     <button
                        key={m}
                        disabled={isLoading}
                        onClick={() => onModeChange(m)}
                        className={`p-4 rounded-[25px] border transition-all flex items-center gap-4 ${mode === m ? 'bg-white/10 border-purple-500/40' : 'bg-white/5 border-white/5 hover:border-white/20 opacity-40'}`}
                     >
                        <div className={`p-3 rounded-full ${mode === m ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/40'}`}>
                           {MODES[m].icon}
                        </div>
                        <div className="text-left">
                           <p className="text-[11px] font-black text-white uppercase tracking-widest">{MODES[m].label}</p>
                           <p className="text-[8px] text-white/20 uppercase tracking-wider">{MODES[m].cost}/call</p>
                        </div>
                     </button>
                   ))}
                </div>
            </div>

            {/* SMART UX: COST & WARNINGS */}
            <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-[35px] bg-black/40 border border-white/5 border-b-purple-500/20">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(191,64,255,0.1)]">
                     <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-purple-400/60 uppercase tracking-[0.3em] mb-1">Estimated Mission Cost</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">${estimatedCost()}</p>
                  </div>
               </div>

               {isMismatch && (
                 <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse">
                    <AlertTriangle size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                       Config Warning: Potential Scale Mismatch
                    </span>
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
