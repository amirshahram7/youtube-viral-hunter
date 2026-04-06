'use client';

import React, { useState } from 'react';
import { useI18n } from './I18nProvider';
interface MainViewProps {
  onExecute?: (prompt: string) => void;
  isLoading?: boolean;
}

import { Send, Loader2, Sparkles, Wand2, RefreshCw, MapPin, DollarSign, Target, UserCheck, Timer, Rocket } from 'lucide-react';

const MainView: React.FC<MainViewProps> = ({ onExecute, isLoading = false }) => {
  const { t, isRTL } = useI18n();
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Architect States
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [timeline, setTimeline] = useState('');

  const handleStart = () => {
    if (!prompt.trim() || isLoading) return;
    if (onExecute) onExecute(prompt);
  };

  const handleBuildPrompt = async () => {
    if ((!prompt.trim() && !showAdvanced) || isBuilding) return;
    
    setIsBuilding(true);
    try {
      const architectData = showAdvanced ? {
        location, budget, goal, experience, timeline, originalIdea: prompt
      } : { idea: prompt, mode: 'quick' };

      const res = await fetch('/api/prompt-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(architectData),
      });
      
      const data = await res.json();
      if (data.success && data.data.content) {
        setPrompt(data.data.content);
        setShowAdvanced(false); // Close advanced view after building
      }
    } catch (err) {
      console.error("Architect failed", err);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto w-full px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 relative z-20">
      
      <div className="space-y-6">
        
        {/* ADVANCED ARCHITECT FLOW */}
        {showAdvanced ? (
          <div className="glass-neon p-12 rounded-[45px] border-2 border-purple-500/20 space-y-10 animate-in zoom-in duration-500">
             <header className="flex justify-between items-center">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">Prompt Architect V62</p>
                   <h4 className="text-2xl font-black text-white italic uppercase">Interactive Interview</h4>
                </div>
                <button onClick={() => setShowAdvanced(false)} className="text-white/20 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-white/5 rounded-xl">Cancel Architect</button>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-3">
                      <MapPin size={14} className="text-purple-400" /> Target Market Location
                   </label>
                   <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Dubai, London, Global..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white hover:border-purple-500/40 focus:border-purple-500 outline-none transition-all" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-3">
                      <DollarSign size={14} className="text-purple-400" /> Investment Budget
                   </label>
                   <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. $50,000 Total" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white hover:border-purple-500/40 focus:border-purple-500 outline-none transition-all" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-3">
                      <Target size={14} className="text-purple-400" /> Primary Strategic Goal
                   </label>
                   <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Market Entry / User Acquisition" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white hover:border-purple-500/40 focus:border-purple-500 outline-none transition-all" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-3">
                      <Timer size={14} className="text-purple-400" /> Execution Timeline
                   </label>
                   <input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 6 Months" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white hover:border-purple-500/40 focus:border-purple-500 outline-none transition-all" />
                </div>
             </div>

             <div className="pt-6 border-t border-white/10">
                <button 
                   onClick={handleBuildPrompt}
                   disabled={isBuilding}
                   className="w-full py-6 rounded-3xl bg-white text-black font-black text-[11px] uppercase tracking-[0.5em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                >
                   {isBuilding ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                   ARCHITECT FINAL PROMPT
                </button>
             </div>
          </div>
        ) : (
          /* STANDARD TEXTAREA with PURPLE NEON BORDER */
          <div className="relative group">
            <textarea
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={t.main?.placeholder || "Enter your strategic idea here..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading || isBuilding}
              className={`w-full h-72 glass-neon rounded-[50px] p-12 text-lg border border-purple-500/20 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/5 transition-all outline-none resize-none placeholder:text-white/10 text-white leading-relaxed ${isLoading || isBuilding ? 'opacity-50' : ''}`}
            />
            
            {/* FLOATING ACTION: SMART PROMPT BUILDER */}
            <div className={`absolute bottom-8 ${isRTL ? 'left-8' : 'right-8'} flex gap-3`}>
               <button 
                  onClick={() => setShowAdvanced(true)}
                  disabled={isLoading}
                  className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-black/60 border-2 border-purple-500/40 hover:bg-purple-600/20 text-[10px] font-black text-purple-400 uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group shadow-[0_0_30px_rgba(191,64,255,0.1)]"
               >
                  <Wand2 size={16} className="text-purple-400/60" />
                  <span>Launch Prompt Architect</span>
               </button>
            </div>
          </div>
        )}
        
        {!showAdvanced && (
          <div className="flex items-center gap-4 px-8 group">
            <input
              type="checkbox"
              id="uaeData"
              checked={true}
              disabled={isLoading || isBuilding}
              className="w-6 h-6 rounded-lg border-emerald-500/30 bg-emerald-500/10 text-emerald-500 focus:ring-emerald-400/30 transition-all cursor-pointer"
            />
            <label htmlFor="uaeData" className="text-[12px] font-black uppercase tracking-[0.4em] text-white/20 cursor-pointer group-hover:text-emerald-400/80 transition-all">
              {t.main?.use_uae_data || "INJECT LIVE GLOBAL MARKET CONTEXT"}
            </label>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
               Location Aware
            </div>
          </div>
        )}
      </div>

      {/* EXECUTE BUTTON: PURPLE NEON STYLE */}
      {!showAdvanced && (
        <div className="flex justify-center sm:justify-start">
          <button 
            onClick={handleStart}
            disabled={isLoading || isBuilding || !prompt.trim()}
            className={`px-24 py-8 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 text-white font-black text-[12px] uppercase tracking-[0.6em] rounded-[30px] hover:scale-[1.05] active:scale-[0.98] transition-all shadow-[0_0_60px_rgba(191,64,244,0.4)] hover:shadow-[0_0_80px_rgba(191,64,244,0.6)] border-t border-white/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center gap-6`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
            <span>{isLoading ? 'Processing Mission...' : (t.main?.start || 'Initiate Roundtable')}</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default MainView;
