import React from 'react';
import { Loader2, Zap, Copy, CheckCircle, Flame, Target } from 'lucide-react';

export interface AgentOutput {
  agent: string;
  role: string;
  content: string;
  provider: string;
}

interface RoundCardProps {
  title: string;
  description: string;
  index: number;
  status?: 'pending' | 'thinking' | 'completed';
  outputs?: AgentOutput[];
}

const RoundCard: React.FC<RoundCardProps> = ({ title, description, index, status = 'pending', outputs = [] }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`relative group p-1 transition-all duration-1000 w-full ${status === 'thinking' ? 'animate-pulse' : ''}`}>
      {/* SHADOW GLOW */}
      <div className={`absolute inset-0 rounded-[40px] blur-3xl opacity-5 transition-opacity duration-700
        ${status === 'thinking' ? 'bg-purple-500 opacity-20' : 'bg-blue-500'}
        ${status === 'completed' ? 'bg-emerald-500 opacity-10' : ''}
      `} />

      <div className={`relative p-10 rounded-[40px] glass-neon border-2 transition-all duration-700
        rounded-tl-[80px] rounded-br-[80px] rounded-tr-none rounded-bl-none
        ${status === 'thinking' ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5'}
        ${status === 'completed' ? 'border-emerald-500/20' : ''}
        group-hover:border-purple-500/30
      `}>
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${status === 'thinking' ? 'bg-purple-400 animate-ping' : status === 'completed' ? 'bg-emerald-400' : 'bg-white/10'}`} />
                 <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
                   {index < 3 ? `DEBATE PHASE 0${index + 1}` : 'FINAL SYNTHESIS'}
                 </span>
              </div>
              <h3 className={`text-3xl font-black italic tracking-tighter uppercase ${status === 'thinking' ? 'text-purple-400' : 'text-white'}`}>
                {title}
              </h3>
           </div>

           {status === 'thinking' && (
             <div className="flex items-center gap-3 py-3 px-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
               <Loader2 className="animate-spin text-purple-400" size={16} />
               <span className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-black italic">Neural Conflict Active...</span>
             </div>
           )}
        </header>

        {/* DEBATE AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {outputs.length > 0 ? (
            outputs.map((out, idx) => (
              <div key={idx} className={`space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-${idx * 200}`}>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-xl ${idx === 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                          {idx === 0 ? <Target size={14} /> : <Flame size={14} />}
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{out.agent}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">{out.role}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleCopy(out.content, idx)}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/20 hover:text-white transition-all"
                    >
                      {copiedIndex === idx ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                 </div>

                 <div className={`p-8 rounded-[30px] border text-sm leading-loose font-medium
                    ${index === 3 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200/90' : 'bg-black/40 border-white/10 text-white/80'}
                 `}>
                    {out.content.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('#') ? 'text-purple-400 font-bold mb-4 mt-6 text-base tracking-tight' : 'mb-4'}>
                        {line}
                      </p>
                    ))}
                 </div>
              </div>
            ))
          ) : status === 'pending' ? (
            <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] text-[10px] text-white/10 uppercase tracking-[1em]">
              War Room Awaiting Sequence
            </div>
          ) : (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-white/5 rounded-full w-1/4 animate-pulse" />
      <div className="h-24 bg-white/5 rounded-[30px] w-full animate-pulse" />
    </div>
  );
}

export default RoundCard;
