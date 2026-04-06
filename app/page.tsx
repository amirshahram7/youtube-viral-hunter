'use client';

import React, { useState, useEffect } from 'react';
import { 
  Microscope, Brain, Rocket, FileEdit, Database, ScrollText, Video, Layers, TreeDeciduous, 
  Settings2, Save, GripVertical 
} from "lucide-react";
import { useI18n } from "../components/I18nProvider";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import ServiceCard from "../components/ServiceCard";
import { SortableServiceCard } from "../components/SortableServiceCard";

// Default initial services order
const INITIAL_SERVICES = [
  { id: 'research', titleKey: 'parallel', title: 'Parallel Research', desc: "360-degree subjects investigation", icon: <Microscope size={36} />, color: 'red' },
  { id: 'decision_maker', titleKey: 'decision_maker', title: 'Final Decision Maker', desc: "5-round protocol for orders", icon: <Brain size={36} />, color: 'green' },
  { id: 'roundtable', titleKey: 'roundtable', title: 'Strategic Roundtable', desc: "Advanced multi-round analysis", icon: <Rocket size={36} />, color: 'purple', href: '/decision' },
  { id: 'tool_hub', titleKey: 'tool_hub', title: 'Tool Hub', desc: "Centralized models access", icon: <FileEdit size={36} />, color: 'blue' },
  { id: 'archive', titleKey: 'archive', title: 'Secure Archive', desc: "Historical task history vault", icon: <Database size={36} />, color: 'blue' },
  { id: 'scripting', titleKey: 'scripting', title: 'Scripting Lab', desc: "Report generation engine", icon: <ScrollText size={36} />, color: 'orange' },
  { id: 'video', titleKey: 'video', title: 'Video Studio', desc: "Next-gen agency production", icon: <Video size={36} />, color: 'cyan' },
  { id: 'image', titleKey: 'image', title: 'Image World', desc: "Visual assets by Flux & Leonardo", icon: <Layers size={36} />, color: 'pink' },
];

export default function Home() {
  const { t } = useI18n();
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load saved order from localStorage if exists
  useEffect(() => {
    const savedOrder = localStorage.getItem('arcanum_service_order');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const reordered = orderIds.map((id: string) => 
          INITIAL_SERVICES.find(s => s.id === id)
        ).filter(Boolean);
        if (reordered.length === INITIAL_SERVICES.length) {
          setServices(reordered);
        }
      } catch (e) {
        console.error("Failed to load layout order", e);
      }
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // HYDRATION FIX: Only render DND on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Persist to localStorage
        localStorage.setItem('arcanum_service_order', JSON.stringify(newOrder.map(s => s.id)));
        return newOrder;
      });
    }
  }

  return (
    <div className="flex flex-col items-center py-12 px-8 min-h-screen relative overflow-hidden">
      
      {/* THE ARCANUM CORE (NEW PREMIUM LOGO) - CENTRAL NEURAL SOURCE */}
      <div className="relative mb-20 group cursor-pointer transition-transform duration-1000 hover:scale-110 active:scale-95">
        {/* Massive Purple Energy Aura (Enhanced) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[450px] w-[450px] bg-purple-600/30 blur-[180px] rounded-full animate-pulse mx-auto" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[250px] w-[250px] bg-purple-500/20 blur-[80px] rounded-full mx-auto" />
        
        {/* User-Provided Supreme Strategic Logo */}
        <div className="relative z-10 flex items-center justify-center p-4">
           <div className="relative group/logo">
             {/* Glowing frame for the image */}
             <div className="absolute -inset-4 bg-gradient-to-t from-purple-600/20 to-transparent blur-2xl opacity-40 group-hover/logo:opacity-80 transition-all duration-1000" />
             
             {/* NEW LOGO IMAGE - REDUCED SIZE */}
             <img 
               src="/logo.jpg" 
               alt="ARCANUM CORE" 
               className="w-48 h-auto md:w-64 rounded-[40px] drop-shadow-[0_0_40px_rgba(191,64,255,0.5)] group-hover/logo:drop-shadow-[0_0_70px_rgba(191,64,255,0.9)] transition-all duration-1000 transform group-hover:rotate-1"
             />
             
             {/* Energy Pulsing Dots */}
             <div className="absolute top-10 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300" />
             <div className="absolute bottom-10 left-10 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping delay-700" />
           </div>
        </div>
      </div>

      {/* Platform Banner - FULL PURPLE THEME */}
      <div className="text-center mb-16 space-y-4 relative z-20">
        <h2 className="text-[10px] font-black tracking-[1.5em] text-purple-400/40 uppercase">
          Autonomous Neural Source — <span className="text-emerald-400/80 neon-text-purple tracking-widest">CONNECTED</span>
        </h2>
        {/* ALL WORDS ARE NOW PURPLE NEON */}
        <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase italic leading-[1.2]">
          <span className="purple-gradient-text">SUPREME</span> <span className="purple-gradient-text">STRATEGIC</span> <span className="purple-gradient-text">INTERFACE</span>
        </h1>
      </div>

      {/* DRAG-AND-DROP CONTROLS */}
      <div className="w-full max-w-7xl flex justify-end mb-8 relative z-30">
        <button 
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest
            ${isEditMode 
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
              : 'glass border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}
        >
          {isEditMode ? <Save size={16} /> : <Settings2 size={16} />}
          <span>{isEditMode ? "Save Layout" : "Edit Layout"}</span>
        </button>
      </div>

      {/* Multicolored Neon Grid with DRAG SUPPORT */}
      <div className="max-w-7xl w-full pb-24 relative z-10">
        {!mounted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {services.map((service) => (
              <ServiceCard 
                 key={service.id}
                 title={t.nav?.[service.titleKey as keyof typeof t.nav] || service.title}
                 description={service.desc}
                 icon={service.icon}
                 color={service.color as any}
                 href={service.href}
              />
            ))}
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={services.map(s => s.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {services.map((service) => (
                  <SortableServiceCard 
                    key={service.id}
                    id={service.id}
                    title={t.nav?.[service.titleKey as keyof typeof t.nav] || service.title}
                    description={service.desc}
                    icon={service.icon}
                    color={service.color as any}
                    href={service.href}
                    disabled={!isEditMode}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
    </div>
  );
}
