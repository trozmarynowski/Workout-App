import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, EXERCISES } from '../data';
import { Exercise, Workout, MuscleGroup } from '../types';
import { Search, X, ChevronDown, Plus, BarChart2, Calendar, Dumbbell } from 'lucide-react';
import { formatDate, generateId, isSetValid } from '../utils';

interface ExerciseDatabaseProps {
  onSelectExercise?: (exercise: Exercise) => void;
  selectionMode?: boolean;
  onCancel?: () => void;
  workouts?: Workout[];
}

export function ExerciseDatabase({ onSelectExercise, selectionMode = false, onCancel, workouts = [] }: ExerciseDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES.map(c => c.name));
  const [selectedStatsExercise, setSelectedStatsExercise] = useState<Exercise | null>(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState<MuscleGroup>('Klatka piersiowa');
  const [customImage, setCustomImage] = useState('');
  const [internalCustomExercises, setInternalCustomExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wt_custom_exercises');
      if (saved) {
        setInternalCustomExercises(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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

  const getExerciseHistoryInfo = (exerciseId: string) => {
    const sorted = [...workouts].sort((a, b) => b.startTime - a.startTime);
    let maxWeight = 0;
    let maxReps = 0;
    let maxVolume = 0;
    
    // Find last 5 workouts where this exercise was performed
    const recentWorkouts: { date: number; sets: any[]; volume: number }[] = [];
    
    sorted.forEach(w => {
      const we = w.exercises.find(e => e.exercise.id === exerciseId);
      if (we && we.sets.some(s => isSetValid(s))) {
        const completedSets = we.sets.filter(s => isSetValid(s));
        let vol = 0;
        completedSets.forEach(s => {
           const weight = Number(s.weight) || 0;
           const reps = Number(s.reps) || 0;
           vol += weight * reps;
           if (weight > maxWeight) maxWeight = weight;
           if (reps > maxReps) maxReps = reps;
        });
        if (vol > maxVolume) maxVolume = vol;
        
        if (recentWorkouts.length < 5) {
          recentWorkouts.push({
            date: w.startTime,
            sets: completedSets,
            volume: vol
          });
        }
      }
    });

    return { maxWeight, maxReps, maxVolume, recentWorkouts, totalTimes: sorted.filter(w => w.exercises.some(e => e.exercise.id === exerciseId && e.sets.some(s => isSetValid(s)))).length };
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newEx: Exercise = {
      id: generateId(),
      name: customName.trim(),
      muscleGroup: customMuscleGroup,
      image: customImage.trim() || undefined
    };
    
    const newCustom = [...internalCustomExercises, newEx];
    setInternalCustomExercises(newCustom);
    localStorage.setItem('wt_custom_exercises', JSON.stringify(newCustom));
    
    setCustomName('');
    setCustomImage('');
    setShowAddCustom(false);
  };

  const allExercises = [...EXERCISES, ...internalCustomExercises];

  // Group exercises by category
  const exercisesByCategory = CATEGORIES.map(cat => {
    const exercises = allExercises.filter(ex => 
      ex.muscleGroup === cat.name && 
      (searchQuery === '' || ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...cat, exercises };
  }).filter(cat => cat.exercises.length > 0);

  return (
    <>
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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAddCustom(true)}
              className="px-3 py-1.5 bg-neon/10 text-neon font-bold text-xs uppercase tracking-wider rounded-lg border border-neon/30 hover:bg-neon hover:text-black transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Własne
            </button>
            {selectionMode && onCancel && (
              <button onClick={onCancel} className="p-2 bg-neutral-900 rounded-full text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            )}
          </div>
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
                                  onClick={() => {
                                    if (selectionMode) {
                                      handleSelect(ex);
                                    } else {
                                      setSelectedStatsExercise(ex);
                                    }
                                  }}
                                  className="w-full bg-neon/10 hover:bg-neon border border-neon/50 hover:border-neon text-neon hover:text-black font-bold uppercase tracking-wider text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(57,255,20,0.1)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                                >
                                  {selectionMode ? <><Plus size={16} /> Dodaj do treningu</> : <><BarChart2 size={16}/> Statystyki</>}
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

      {/* Add Custom Exercise Modal */}
      <AnimatePresence>
        {showAddCustom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white">Nowe ćwiczenie</h2>
                <button 
                  onClick={() => setShowAddCustom(false)} 
                  className="p-1.5 bg-neutral-800 rounded-full text-neutral-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">Nazwa</label>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="np. Wyciskanie hantli siedząc"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">Partia mięśniowa</label>
                  <div className="relative">
                    <select
                      value={customMuscleGroup}
                      onChange={e => setCustomMuscleGroup(e.target.value as MuscleGroup)}
                      className="w-full appearance-none bg-neutral-950 border border-neutral-800 rounded-xl pl-4 pr-10 py-3 text-white focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all font-medium"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-500">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">Zdjecie/Miniaturka (URL, Opcjonalnie)</label>
                  <input 
                    type="text" 
                    value={customImage}
                    onChange={e => setCustomImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all text-sm"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-neutral-950/50 border-t border-neutral-800">
                <button
                  onClick={handleAddCustom}
                  disabled={!customName.trim()}
                  className="w-full bg-neon text-black font-bold uppercase tracking-wider py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#32e011] transition-colors"
                >
                  Dodaj
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Modal */}
      <AnimatePresence>
        {selectedStatsExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#050505] p-4 overflow-y-auto"
          >
            <div className="flex items-center justify-between mt-2 mb-6">
              <h2 className="text-2xl font-bold text-white pr-4 leading-tight">{selectedStatsExercise.name}</h2>
              <button 
                onClick={() => setSelectedStatsExercise(null)} 
                className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            {(() => {
              const stats = getExerciseHistoryInfo(selectedStatsExercise.id);
              if (stats.recentWorkouts.length === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 pb-20">
                    <Dumbbell size={48} className="mb-4 opacity-20" />
                    <p>Brak historii dla tego ćwiczenia.</p>
                    <p className="text-xs mt-2">Rozpocznij trening, aby zapisać wyniki!</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6 pb-10">
                  {/* PRs Section */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3 ml-1">Rekordy</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col">
                        <span className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Max Ciężar</span>
                        <span className="text-2xl font-bold text-white">{stats.maxWeight > 0 ? `${stats.maxWeight} kg` : '-'}</span>
                      </div>
                      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col">
                        <span className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Max Obj.</span>
                        <span className="text-2xl font-bold text-white">{stats.maxVolume > 0 ? `${stats.maxVolume} kg` : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* History Section */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3 ml-1">Historia ({stats.totalTimes}x)</h3>
                    <div className="space-y-3">
                      {stats.recentWorkouts.map((rw, i) => (
                        <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-800/50">
                            <span className="text-sm font-bold text-neon flex items-center gap-1.5"><Calendar size={14}/> {formatDate(rw.date)}</span>
                            <span className="text-xs text-neutral-400 font-mono">Obj: {rw.volume} kg</span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {rw.sets.map((s, idx) => (
                              <div key={idx} className="flex items-center text-sm font-mono text-neutral-300">
                                <span className="w-6 text-neutral-600 font-bold">{idx + 1}</span>
                                <span className="w-16">{s.weight || '0'} kg</span>
                                <span className="w-4 text-neutral-600 text-center">x</span>
                                <span className="w-16 text-right">{s.reps || '0'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
