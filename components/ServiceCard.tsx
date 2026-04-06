'use client';
import React from 'react';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  isLocked?: boolean;
  color?: 'purple' | 'cyan' | 'gold' | 'pink' | 'green' | 'blue' | 'orange' | 'red';
}

const NEON_COLORS = {
  purple: { main: '#bf40ff', glow: 'rgba(191, 64, 255, 0.8)', soft: 'rgba(191, 64, 255, 0.3)', idle: 'rgba(191, 64, 255, 0.35)' },
  cyan: { main: '#00f2ff', glow: 'rgba(0, 242, 255, 0.8)', soft: 'rgba(0, 242, 255, 0.3)', idle: 'rgba(0, 242, 255, 0.35)' },
  gold: { main: '#ffcc00', glow: 'rgba(255, 204, 0, 0.8)', soft: 'rgba(255, 204, 0, 0.3)', idle: 'rgba(255, 204, 0, 0.35)' },
  pink: { main: '#ff00ff', glow: 'rgba(255, 0, 255, 0.8)', soft: 'rgba(255, 0, 255, 0.3)', idle: 'rgba(255, 0, 255, 0.35)' },
  green: { main: '#39ff14', glow: 'rgba(57, 255, 20, 0.8)', soft: 'rgba(57, 255, 20, 0.3)', idle: 'rgba(57, 255, 20, 0.35)' },
  blue: { main: '#0066ff', glow: 'rgba(0, 102, 255, 0.8)', soft: 'rgba(0, 102, 255, 0.3)', idle: 'rgba(0, 102, 255, 0.35)' },
  orange: { main: '#ff6600', glow: 'rgba(255, 102, 0, 0.8)', soft: 'rgba(255, 102, 0, 0.3)', idle: 'rgba(255, 102, 0, 0.35)' },
  red: { main: '#ff0033', glow: 'rgba(255, 0, 51, 0.8)', soft: 'rgba(255, 0, 51, 0.3)', idle: 'rgba(255, 0, 51, 0.35)' },
};

export default function ServiceCard({ title, description, icon, href = '#', isLocked = false, color = 'purple' }: ServiceCardProps) {
  const neon = NEON_COLORS[color];

  return (
    <Link href={href} className="block no-underline">
      <div 
        className={`relative h-72 p-10 
          rounded-tl-[70px] rounded-br-[70px] rounded-tr-none rounded-bl-none
          flex flex-col items-center justify-center text-center gap-6 
          transition-all duration-700 group
          ${isLocked ? 'opacity-70 cursor-wait' : 'hover:scale-[1.04] active:scale-[0.98]'}
        `}
        style={{
          background: `rgba(13, 13, 20, 0.98)`,
          border: `2px solid`,
          // Idle state FIXED: 35% colored border for high visibility
          borderColor: neon.idle,
          boxShadow: `0 0 15px ${neon.idle}`,
        }}
      >
        {/* Full Neon Burst - HOVER */}
        <div 
          className="absolute inset-[-2px] rounded-tl-[70px] rounded-br-[70px] rounded-tr-none rounded-bl-none border-2 border-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
          style={{ 
            borderColor: neon.main,
            boxShadow: `
              0 0 40px ${neon.glow},
              0 0 80px ${neon.soft},
              inset 0 0 20px ${neon.soft}
            `
          }}
        />

        {/* Floating background particle */}
        <div 
          className="absolute w-24 h-24 blur-[60px] rounded-full pointer-events-none opacity-10 group-hover:opacity-30 transition-all duration-1000"
          style={{ background: neon.main, top: '20%', left: '25%' }}
        />

        {/* Icon with Vivid Neon */}
        <div 
          className="relative p-6 rounded-2xl transition-all duration-500 group-hover:scale-125 z-10"
          style={{ 
            background: `rgba(0,0,0,0.7)`,
            border: `1.5px solid ${neon.idle}`,
            color: neon.main,
            boxShadow: `0 0 15px ${neon.idle}`
          }}
        >
          <div className="transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
            {icon}
          </div>
        </div>

        <div className="space-y-4 z-10">
          <h3 
            className={`text-2xl font-black tracking-widest uppercase transition-all duration-500 text-white
              group-hover:scale-105
            `}
            style={{ 
              textShadow: `0 0 10px ${neon.idle}` 
            }}
          >
            {title}
          </h3>
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/40 group-hover:text-white transition-all duration-700 leading-relaxed max-w-[170px]">
            {description}
          </p>
        </div>

        {isLocked && (
          <div className="absolute top-8 right-10 text-[7px] font-black tracking-[0.5em] text-white/40 uppercase">
            Initializing
          </div>
        )}
      </div>
    </Link>
  );
}
