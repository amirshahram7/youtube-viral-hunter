'use client';

import React from 'react';
import { useI18n } from '../../components/I18nProvider';
import { Activity } from 'lucide-react';
import SystemPanel from '../../components/Management/SystemPanel';

export default function ManagementPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center py-12 px-8 min-h-screen">
      {/* Platform Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="flex items-center justify-center gap-3 text-[#c5a059] mb-2">
          <Activity size={24} className="neon-text-gold animate-pulse" />
          <span className="text-[11px] font-black tracking-[0.6em] uppercase text-[#c5a059]">System Operational Control</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight">
          ARCANUM <span className="gold-gradient-text">MANAGEMENT</span>
        </h1>
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">
          Authorized Protocol v58.4 — Centralized Infrastructure
        </p>
      </div>

      {/* MODULAR SYSTEM PANEL (PHASE 6) */}
      <SystemPanel />
      
      <div className="mt-20 pt-10 border-t border-white/5 w-full max-w-4xl text-center">
         <p className="text-[9px] text-white/10 uppercase tracking-[0.6em]">
            Arcanum Strategic AI Network • Encryption Level: Supreme
         </p>
      </div>
    </div>
  );
}
