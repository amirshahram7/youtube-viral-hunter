'use client';
import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import { LayoutDashboard, History, FileText, Settings, MessageSquare, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = useI18n();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);
  const pathname = usePathname();
  const isRtl = locale === 'fa';

  // PHASE 3: USER HISTORY STATE
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/user/history?userId=anonymous');
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Refresh history every 30 seconds for live updates
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col premium-gradient overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Navigation & History */}
        <aside 
          className={`glass-neon border-y-0 border-x border-white/5 transition-all duration-500 overflow-hidden relative
            ${leftOpen ? 'w-64' : 'w-16'}`}
        >
          <div className="p-4 space-y-6">
            <nav className="space-y-4">
              <Link href="/">
                <NavItem icon={<LayoutDashboard size={20} />} label={t.nav?.home || 'Service Hub'} active={pathname === '/'} open={leftOpen} />
              </Link>
              <Link href="/decision">
                <NavItem icon={<Rocket size={20} />} label={t.nav?.roundtable || 'Strategic Roundtable'} active={pathname === '/decision'} open={leftOpen} />
              </Link>
              <NavItem icon={<FileText size={20} />} label={t.nav?.reports || 'Reports'} open={leftOpen} />
              <Link href="/management">
                <NavItem icon={<Settings size={20} />} label={t.nav?.settings || 'Control Room'} active={pathname === '/management'} open={leftOpen} />
              </Link>
            </nav>

            {/* PHASE 3: DYNAMIC TASK HISTORY */}
            {leftOpen && (
              <div className="pt-8 border-t border-white/5 animate-in fade-in duration-700">
                <div className="flex items-center justify-between px-3 mb-4">
                  <p className="text-[10px] uppercase font-black tracking-widest text-white/30">
                    {t.nav?.recent_tasks || 'Mission Vault'}
                  </p>
                  <History size={12} className="text-white/20" />
                </div>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar px-1">
                  {loadingHistory && history.length === 0 ? (
                    <div className="px-3 py-2 text-[10px] text-white/20 uppercase tracking-widest italic">Syncing Vault...</div>
                  ) : history.length > 0 ? (
                    history.map((task) => (
                      <Link key={task.id} href={`/decision?taskId=${task.id}`} className="block">
                        <div className="px-3 py-2.5 rounded-lg text-[11px] text-white/40 hover:text-purple-400 hover:bg-purple-500/5 cursor-pointer transition-all truncate border border-transparent hover:border-purple-500/20 group">
                          <span className="opacity-0 group-hover:opacity-100 mr-2 text-purple-500 transition-opacity">●</span>
                          {task.query.substring(0, 30)}...
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-[10px] text-white/10 uppercase tracking-widest">No strategic missions recorded</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setLeftOpen(!leftOpen)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full hover:bg-white/5 text-white/40"
          >
            {leftOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {children}
        </main>

        {/* RIGHT SIDEBAR: Live Activity / Chat (Contextual) */}
        <aside 
          className={`glass-neon border-y-0 border-x border-white/5 transition-all duration-500 overflow-hidden
            ${rightOpen ? 'w-72' : 'w-0'}`}
        >
          <div className="w-72 p-6 space-y-6">
            <header className="flex items-center gap-3 pb-4 border-b border-white/5">
              <MessageSquare size={18} className="text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 neon-text-purple">Live Activity</h3>
            </header>
            <div className="space-y-4">
              <p className="text-xs text-white/30 text-center py-10 italic">No active tool session</p>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}

function NavItem({ icon, label, active = false, open = true }: { icon: any, label: string, active?: boolean, open?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group
      ${active ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
    >
      <span className={active ? 'neon-text-purple' : ''}>{icon}</span>
      {open && <span className="text-sm font-medium tracking-wide">{label}</span>}
      {active && open && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
    </div>
  );
}
