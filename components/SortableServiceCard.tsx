'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ServiceCard from './ServiceCard';

interface SortableServiceCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  isLocked?: boolean;
  color?: 'purple' | 'cyan' | 'gold' | 'pink' | 'green' | 'blue' | 'orange' | 'red';
  disabled?: boolean;
}

export function SortableServiceCard(props: SortableServiceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: props.id,
    disabled: props.disabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
    cursor: props.disabled ? 'pointer' : 'grab',
    touchAction: 'none'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`transition-shadow ${isDragging ? 'shadow-[0_0_50px_rgba(191,64,255,0.4)]' : ''}`}
    >
      <ServiceCard 
        title={props.title}
        description={props.description}
        icon={props.icon}
        href={props.disabled ? props.href : undefined} // Disable link during drag
        isLocked={props.isLocked}
        color={props.color}
      />
    </div>
  );
}
