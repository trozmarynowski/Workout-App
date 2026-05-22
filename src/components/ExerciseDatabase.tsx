import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, EXERCISES } from '../data';
import { Exercise } from '../types';
import { Search, X, ChevronDown, Plus } from 'lucide-react';

interface ExerciseDatabaseProps {
  onSelectExercise?: (exercise: Exercise) => void;
  selectionMode?: boolean;
  onCancel?: () => void;
}

export function ExerciseDatabase({ onSelectExercise, selectionMode = false, onCancel }: ExerciseDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES.map(c => c.name));

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSelect = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  // Group exercises by category
  const exercisesByCategory = CATEGORIES.map(cat => {
    const exercises = EXERCISES.filter(ex => 
      ex.muscleGroup === cat.name && 
      (searchQuery === '' || ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...cat, exercises };
  }).filter(cat => cat.exercises.length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`pb-24 pt-6 px-4 ${selectionMode ? 'min-h-screen bg-[#050505] z-50 fixed inset-0 overflow-y-auto' : ''}`}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          {selectionMode ? (
            <h1 className="text-2xl font-bold text-white tracking-tight">Wybierz ćwiczenie</h1>
          ) : (
            <h1 className="text-3xl font-bold text-white tracking-tight">Baza ćwiczeń</h1>
          )}
        </div>
        {selectionMode && onCancel && (
          <button onClick={onCancel} className="p-2 bg-neutral-900 rounded-full text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-neutral-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj ćwiczenia..."
          className="w-full pl-11 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {exercisesByCategory.length > 0 ? (
          exercisesByCategory.map(category => {
            const isExpanded = expandedCategories.includes(category.name) || searchQuery !== '';
            
            return (
              <div key={category.name} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between p-4 bg-neutral-900 hover:bg-neutral-800/80 transition-colors"
                >
                  <span className="font-bold text-white tracking-wider uppercase text-sm">{category.name}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-neutral-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        {category.exercises.map(ex => (
                          <div 
                            key={ex.id}
                            className="group relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-lg"
                          >
                            <div className="h-40 w-full relative">
                              {ex.image && (
                                <img 
                                  src={ex.image} 
                                  alt={ex.name} 
                                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" 
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                            </div>
                            
                            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                              <h3 className="text-lg font-bold text-white leading-tight mb-3 drop-shadow-md">{ex.name}</h3>
                              
                              <button
                                onClick={() => handleSelect(ex)}
                                className="w-full bg-neon/10 hover:bg-neon border border-neon/50 hover:border-neon text-neon hover:text-black font-bold uppercase tracking-wider text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(57,255,20,0.1)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                              >
                                {selectionMode ? <><Plus size={16} /> Dodaj do treningu</> : 'Wybierz'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center text-neutral-500 py-10 px-4">
            Brak wyników wyszukiwania dla "{searchQuery}".
          </div>
        )}
      </div>
    </motion.div>
  );
}
