'use client';
import React from 'react';
import { useI18n } from './I18nProvider';
import { ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';

const Header: React.FC = () => {
  const { locale, setLocale, t, isRTL } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'fa' : 'en');
  };

  return (
    <header className="sticky top-0 z-[60] w-full border-b border-white/5 glass-neon px-8 py-3 flex items-center justify-between">
      {/* Platform Meta (Logo & Version) */}
      <Link href="/" className="flex items-center gap-6 group cursor-pointer">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-widest purple-gradient-text uppercase group-hover:scale-105 transition-transform">
            {t.header.logo}
          </h1>
          <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase mt-0.5">
            {t.header.version}
          </span>
        </div>

        {/* Operational Badge */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
            {t.header.status_text}: <span className="text-emerald-400 neon-text-purple ml-1">{t.header.status}</span>
          </p>
        </div>
      </Link>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* MANAGEMENT ROOM: Link to /management */}
        <Link href="/management">
          <button className="flex items-center gap-2.5 px-5 py-2 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/40 hover:border-[#c5a059] transition-all group shadow-[0_0_15px_rgba(197,160,89,0.1)]">
            <Cpu size={16} className="text-[#c5a059] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
              {t.header.management}
            </span>
          </button>
        </Link>

        {/* Language Toggle */}
        <div className="h-6 w-px bg-white/10 mx-2" />
        
        <button
          onClick={toggleLanguage}
          className="px-4 py-1.5 text-xs font-black rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10"
        >
          {t.header.lang_toggle}
        </button>
      </div>
    </header>
  );
};

export default Header;
