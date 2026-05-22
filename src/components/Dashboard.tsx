import React, { useState } from 'react';
import { Play, Bookmark, MoreVertical, Trash2, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutTemplate } from '../types';

interface DashboardProps {
  key?: React.Key;
  onStartWorkout: (template?: WorkoutTemplate) => void;
  hasActiveWorkout: boolean;
  onResumeWorkout: () => void;
  templates?: WorkoutTemplate[];
  onDeleteTemplate?: (id: string) => void;
}

export function Dashboard({ onStartWorkout, hasActiveWorkout, onResumeWorkout, templates = [], onDeleteTemplate }: DashboardProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative flex flex-col min-h-screen pb-24 overflow-y-auto"
    >
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" 
          alt="Gym" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center mt-20 px-6">
        {hasActiveWorkout ? (
          <>
            <div className="w-24 h-24 rounded-full bg-black border-2 border-neon flex items-center justify-center text-neon shadow-[0_0_20px_rgba(57,255,20,0.2)] mb-8">
              <Play fill="currentColor" size={40} className="ml-2" />
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-md">
              MASZ AKTYWNY TRENING
            </h1>
            <p className="text-neutral-300 font-medium text-sm mb-10 px-4 leading-relaxed drop-shadow-md">
              Zakończ lub kontynuuj obecną sesję, zanim rozpoczniesz nową.
            </p>
            
            <button 
              onClick={onResumeWorkout}
              className="w-full bg-neon text-black font-bold uppercase tracking-wider text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.4)]"
            >
              <Play fill="currentColor" size={16} /> Wróć do treningu
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-black border-[3px] border-[#050505] flex items-center justify-center text-neon mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Play fill="currentColor" size={40} className="ml-2" />
            </div>
            
            <h1 className="text-[28px] font-black text-white tracking-widest uppercase mb-4 drop-shadow-md">
              ZACZNIJ SESJĘ
            </h1>
            <p className="text-neutral-300 font-medium text-sm mb-12 px-6 leading-relaxed drop-shadow-md">
              Zapisuj swoje serie, powtórzenia oraz progres
            </p>
            
            <button 
              onClick={() => onStartWorkout()}
              className="w-full bg-[#99f225] hover:bg-neon text-black font-black uppercase tracking-widest text-sm py-4 rounded-[14px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(153,242,37,0.3)] mb-8"
            >
              <Play fill="currentColor" size={16} /> Rozpocznij trening
            </button>

            {templates.length > 0 && (
              <div className="w-full mt-4 text-left">
                <h3 className="font-bold text-neutral-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Bookmark size={14} className="text-neon" /> Szablony
                </h3>
                <div className="space-y-3">
                  {templates.map(template => (
                    <div key={template.id} className="relative">
                      <button
                        onClick={() => onStartWorkout(template)}
                        className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-transform text-left"
                      >
                        <div>
                          <div className="font-bold text-white mb-1.5">{template.name}</div>
                          <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-neutral-500">
                            <span className="flex items-center gap-1 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                              <Dumbbell size={10} /> {template.exercises.length} ćwiczeń
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Play className="text-neutral-500 group-hover:text-neon transition-colors" size={18} />
                        </div>
                      </button>
                      <button
                        onClick={(e) => toggleMenu(e, template.id)}
                        className="absolute right-0 top-0 bottom-0 px-3 text-neutral-500 hover:text-white transition-colors flex items-center justify-center opacity-70 hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>

                      <AnimatePresence>
                        {activeMenuId === template.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-8 top-4 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 origin-top-right min-w-[120px]"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onDeleteTemplate) onDeleteTemplate(template.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Usuń
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
