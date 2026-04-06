'use client';
import React, { useState, useEffect, useRef } from 'react';
import MainView from "../../components/MainView";
import RoundCard from "../../components/RoundCard";
import { useI18n } from "../../components/I18nProvider";
import { 
  Play, 
  RotateCcw, 
  Download, 
  Clock, 
  Shield, 
  Brain, 
  ChevronRight, 
  CheckCircle,
  Pause,
  XCircle,
  MessageSquare,
  Send,
  Zap,
  ArrowRight,
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  FileDown, 
  Rocket 
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PDFService } from '../../services/pdf.service';
import ControlPanel, { ArcanumScale, ArcanumMode } from '../../components/ControlPanel';

export default function DecisionPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [scale, setScale] = useState<ArcanumScale>('SME');
  const [agents, setAgents] = useState(3);
  const [rounds, setRounds] = useState(4);
  const [mode, setMode] = useState<ArcanumMode>('balanced');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundsData, setRoundsData] = useState<any[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isHistoric, setIsHistoric] = useState(false);
  
  // COMMANDER STATES
  const [missionId, setMissionId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [commanderMessage, setCommanderMessage] = useState('');
  const [currentExecutingRound, setCurrentExecutingRound] = useState(0);
  const [isMissionComplete, setIsMissionComplete] = useState(false);
  
  const [missionStartTime, setMissionStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer: any;
    if (loading && missionStartTime) {
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - missionStartTime) / 1000));
      }, 1000);
    } else if (!loading) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [loading, missionStartTime]);

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      loadHistoricTask(taskId);
      setIsHistoric(true);
      setMissionId(taskId);
    } else {
      setIsHistoric(false);
      // New Mission ID will be set on Execute
    }
  }, [searchParams]);

  const loadHistoricTask = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/task/${id}`);
      const data = await res.json();
      if (data.success) {
        setRoundsData(data.task?.rounds || []);
        setCurrentPrompt(data.task?.query || '');
        setIsMissionComplete(true);
      }
    } catch (err: any) {
      setError(`Failed to load mission: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ITERATIVE EXECUTION: Runs rounds one by one, pausing for commander input.
   */
  const handleExecute = async (prompt: string) => {
    const newMissionId = crypto.randomUUID();
    setMissionId(newMissionId);
    setLoading(true);
    setError(null);
    setRoundsData([]); 
    setCurrentPrompt(prompt);
    setMissionStartTime(Date.now());
    setElapsed(0);
    setIsPaused(false);
    setIsTerminated(false);
    setIsMissionComplete(false);
    
    router.push('/decision');

    let currentResults: any[] = [];

    for (let r = 1; r <= rounds; r++) {
      if (isTerminated) break;

      setCurrentExecutingRound(r);

      try {
        const response = await fetch('/api/rounds/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            missionId: newMissionId,
            roundNumber: r,
            prompt,
            config: { scale, agents, rounds, mode },
            previousResults: currentResults,
            commanderMessage: commanderMessage.trim() || undefined
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || 'Step execution failed');

        currentResults = [...currentResults, result.data];
        setRoundsData(currentResults);
        setCommanderMessage('');

        if (r < rounds) {
           if (isPaused) {
              while (isPaused) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (isTerminated) break;
              }
           } else {
             await new Promise(resolve => setTimeout(resolve, 2000));
           }
        }

        if (isTerminated) break;

      } catch (err: any) {
        setError(err.message);
        break;
      }
    }

    setLoading(false);
    setCurrentExecutingRound(0);
    if (!isTerminated && !error) setIsMissionComplete(true);
  };

  const exportPDF = () => {
    if (!roundsData || roundsData.length === 0) return;

    const pdfData = {
      query: currentPrompt,
      timestamp: new Date().toISOString(),
      config: { scale, agents, rounds, mode },
      rounds: roundsData.map(r => ({
        round: r.round,
        title: r.title,
        outputs: r.outputs,
        provider: r.outputs[0]?.provider || 'N/A'
      })),
      finalDecision: isMissionComplete ? roundsData[roundsData.length - 1].outputs[0]?.content : ''
    };
    
    PDFService.generateReport(pdfData);
  };

  const roundsInfo = [
    { title: t.rounds.r1_title, desc: t.rounds.r1_desc },
    { title: t.rounds.r2_title, desc: t.rounds.r2_desc },
    { title: t.rounds.r3_title, desc: t.rounds.r3_desc },
    { title: t.rounds.r4_title, desc: t.rounds.r4_desc },
  ];

  return (
    <div className="flex flex-col items-center py-12 px-8 min-h-full relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="text-center mb-10 space-y-3 z-10">
        <div className="flex items-center justify-center gap-6 text-purple-400 mb-2">
           <div className="flex items-center gap-3">
             <Rocket size={22} className="neon-text-purple animate-pulse" />
             <span className="text-[11px] font-black tracking-[0.6em] uppercase text-purple-400/80">
               {isHistoric ? 'Mission Archive' : 'Active Strategy Portal'} V60.3
             </span>
           </div>
           {(loading || isMissionComplete) && (
             <div className="bg-purple-600/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-purple-500/20">
                <Clock size={14} className="text-purple-400 animate-spin" />
                <span className="text-[10px] font-black text-white tabular-nums tracking-widest">{elapsed}s EXECUTION TIME</span>
             </div>
           )}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight">
          STRATEGIC <span className="purple-gradient-text">ROUNDTABLE</span>
        </h1>
      </div>

      {!isHistoric && !isMissionComplete && (
        <ControlPanel 
          scale={scale} onScaleChange={setScale}
          agents={agents} onAgentsChange={setAgents}
          rounds={rounds} onRoundsChange={setRounds}
          mode={mode} onModeChange={setMode}
          isLoading={loading}
        />
      )}

      {/* COMMANDER CONSOLE */}
      {loading && !isHistoric && (
        <div className="max-w-5xl w-full mb-12 p-1 rounded-[30px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="bg-[#050505] rounded-[28px] p-6 border border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-purple-400" />
                    <span className="text-xs font-black tracking-[0.3em] uppercase text-white/60">Commander Control Center</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${isPaused ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-purple-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-600/20'}`}
                    >
                      {isPaused ? 'RESUME MISSION' : 'PAUSE EXECUTION'}
                    </button>
                    <button 
                      onClick={() => setIsTerminated(true)}
                      className="px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 transition-all"
                    >
                      ABORT MISSION
                    </button>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 px-2">Commander Interjection (Optional)</label>
                 <textarea 
                   value={commanderMessage}
                   onChange={(e) => setCommanderMessage(e.target.value)}
                   placeholder="اینجا پیام خود را بنویسید... مدل بعدی این موضوع را در نظر خواهد گرفت."
                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/40 transition-all min-h-[100px]"
                 />
              </div>
           </div>
        </div>
      )}

      {/* FINAL SUCCESS BANNER */}
      {isMissionComplete && (
        <div className="max-w-5xl w-full mb-12 p-1 rounded-[30px] bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-emerald-500/30 animate-in fade-in zoom-in-95 duration-1000">
           <div className="bg-[#050505] rounded-[28px] p-10 border border-emerald-500/10 text-center space-y-4">
              <div className="flex justify-center mb-6">
                 <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <ShieldCheck size={48} className="text-emerald-400" />
                 </div>
              </div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-widest">
                MISSION SUCCESS: <span className="text-emerald-400">Strategic Decision Finalized</span>
              </h2>
              <p className="text-xs text-white/40 uppercase tracking-[0.4em] font-bold">
                The neural roundtable has reached a unanimous verdict. You may now export the strategic mandate.
              </p>
              <div className="flex justify-center pt-8">
                 <button 
                  onClick={exportPDF}
                  className="group flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black tracking-[0.3em] uppercase transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                 >
                   <FileDown size={20} className="group-hover:-translate-y-1 transition-transform" />
                   Download Executive Report
                 </button>
              </div>
           </div>
        </div>
      )}

      {!isMissionComplete && (
        <MainView onExecute={handleExecute} isLoading={loading} />
      )}

      {error && (
        <div className="max-w-5xl w-full mt-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-4 text-red-400">
          <AlertCircle size={24} />
          <div className="flex-1">
            <p className="font-bold text-xs">System Failure</p>
            <p className="text-xs opacity-80 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl w-full px-6 flex flex-col gap-12 mt-16 pb-24 relative z-10">
        {roundsInfo.slice(0, rounds).map((round, i) => {
          let status: 'pending' | 'thinking' | 'completed' = 'pending';
          let outputs = roundsData?.[i]?.outputs;

          if (loading && currentExecutingRound === i + 1) {
             status = 'thinking';
          } else if (i < roundsData.length) {
             status = 'completed';
          }

          return (
            <RoundCard key={i} index={i} title={round.title} description={round.desc} status={status} outputs={outputs} />
          );
        })}
      </div>
    </div>
  );
}