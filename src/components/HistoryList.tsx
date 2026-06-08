import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTime, formatDate, generateId, calculateProgression } from '../utils';
import { Workout, WorkoutExercise, WorkoutTemplate, Exercise } from '../types';
import { Calendar, Clock, ChevronRight, Dumbbell, History, Trash2, Search, Trophy, TrendingUp, TrendingDown, FileText, Check, Edit2, Activity, BookmarkPlus, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ExerciseDatabase } from './ExerciseDatabase';

interface HistoryListProps {
  key?: React.Key;
  workouts: Workout[];
  onDeleteWorkout: (id: string) => void;
  onUpdateWorkout: (workout: Workout) => void;
  onSaveTemplate?: (template: WorkoutTemplate) => void;
}

function getExerciseStats(allWorkouts: Workout[], workoutId: string, exerciseId: string) {
  const sorted = [...allWorkouts].sort((a, b) => a.startTime - b.startTime);
  const currentIdx = sorted.findIndex(w => w.id === workoutId);
  const currentWorkout = sorted[currentIdx];
  if (!currentWorkout) return null;

  const currentWe = currentWorkout.exercises.find(we => we.exercise.id === exerciseId);
  if (!currentWe) return null;

  let currentVolume = 0;
  let maxWeight = 0;
  let maxReps = 0;
  let maxVolume = 0;
  let prevMaxWeight = 0;
  let prevMaxReps = 0;
  let prevMaxVolume = 0;
  let previousWe: WorkoutExercise | null = null;
  let prevVolume = 0;

  // Calculate current volume
  currentWe.sets.filter(s => s.completed).forEach(s => {
    currentVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
  });

  // Calculate stats
  for (let i = 0; i <= currentIdx; i++) {
    const w = sorted[i];
    const we = w.exercises.find(e => e.exercise.id === exerciseId);
    if (!we) continue;

    const isCurrent = i === currentIdx;
    
    if (!isCurrent) {
      previousWe = we;
    }

    let vol = 0;
    we.sets.filter(s => s.completed).forEach(s => {
      const weight = Number(s.weight) || 0;
      const reps = Number(s.reps) || 0;
      
      if (weight > maxWeight) maxWeight = weight;
      if (reps > maxReps) maxReps = reps;
      vol += weight * reps;
      
      if (!isCurrent) {
        if (weight > prevMaxWeight) prevMaxWeight = weight;
        if (reps > prevMaxReps) prevMaxReps = reps;
      }
    });

    if (vol > maxVolume) maxVolume = vol;
    if (!isCurrent && vol > prevMaxVolume) prevMaxVolume = vol;
  }

  if (previousWe) {
    previousWe.sets.filter(s => s.completed).forEach(s => {
      prevVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
    });
  }

  return {
    currentVolume,
    prevVolume,
    volumeDiff: currentVolume - prevVolume,
    hasPrevWorkout: !!previousWe,
    previousWe,
    pr: {
      maxWeight,
      maxReps,
      maxVolume,
      isNewMaxWeight: maxWeight > prevMaxWeight && prevMaxWeight > 0,
      isNewMaxReps: maxReps > prevMaxReps && prevMaxReps > 0,
      isNewMaxVolume: maxVolume > prevMaxVolume && prevMaxVolume > 0,
    }
  };
}

export function HistoryList({ workouts, onDeleteWorkout, onUpdateWorkout, onSaveTemplate }: HistoryListProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingSets, setIsEditingSets] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [showSaveTemplatePrompt, setShowSaveTemplatePrompt] = useState(false);
  const [templateNameDraft, setTemplateNameDraft] = useState('');

  const [activeTab, setActiveTab] = useState<'history' | 'progress'>('history');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const allExercises = useMemo(() => {
    const exercisesMap = new Map<string, { id: string, name: string }>();
    workouts.forEach(w => {
      w.exercises.forEach(we => {
        if (we.sets.some(s => s.completed)) {
          exercisesMap.set(we.exercise.id, { id: we.exercise.id, name: we.exercise.name });
        }
      });
    });
    return Array.from(exercisesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts]);

  // Set default selected exercise
  React.useEffect(() => {
    if (!selectedExerciseId && allExercises.length > 0) {
      setSelectedExerciseId(allExercises[0].id);
    }
  }, [allExercises, selectedExerciseId]);

  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];
    
    const data: any[] = [];
    const chronoSorted = [...workouts].sort((a, b) => a.startTime - b.startTime);
    
    for (const w of chronoSorted) {
      const we = w.exercises.find(e => e.exercise.id === selectedExerciseId);
      if (we) {
        const completedSets = we.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const maxObjW = Math.max(...completedSets.map(s => Number(s.weight) || 0));
          const maxW = maxObjW === 0 ? null : maxObjW;
          
          let vol = 0;
          let maxReps = 0;
          completedSets.forEach(s => {
             const w = Number(s.weight) || 0;
             const r = Number(s.reps) || 0;
             vol += w * r;
             if (r > maxReps) maxReps = r;
          });

          const d = new Date(w.startTime);
          const dateStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}`;
          
          data.push({
            date: dateStr,
            fullDate: w.startTime,
            maxWeight: maxW,
            volume: vol,
            maxReps: maxReps
          });
        }
      }
    }
    return data;
  }, [workouts, selectedExerciseId]);

  const sortedWorkouts = [...workouts].sort((a, b) => b.startTime - a.startTime);
  
  const filteredWorkouts = sortedWorkouts.filter(workout => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const hasExercise = workout.exercises.some(we => 
        we.exercise.name.toLowerCase().includes(query)
      );
      if (!hasExercise) return false;
    }

    if (filterStartDate) {
      const startObj = new Date(filterStartDate);
      startObj.setHours(0, 0, 0, 0);
      if (workout.startTime < startObj.getTime()) return false;
    }

    if (filterEndDate) {
      const endObj = new Date(filterEndDate);
      endObj.setHours(23, 59, 59, 999);
      if (workout.startTime > endObj.getTime()) return false;
    }

    return true;
  });

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    if (!selectedWorkout) return;
    const updated = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map(s => {
              if (s.id === setId) {
                return { ...s, [field]: value };
              }
              return s;
            })
          };
        }
        return e;
      })
    };
    setSelectedWorkout(updated);
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
     if (!selectedWorkout) return;
     const updated = {
       ...selectedWorkout,
       exercises: selectedWorkout.exercises.map(e => {
         if (e.id === exerciseId) {
           return {
             ...e,
             sets: e.sets.filter(s => s.id !== setId)
           };
         }
         return e;
       })
     };
     setSelectedWorkout(updated);
  };

  const handleToggleSetCompleted = (exerciseId: string, setId: string) => {
    if (!selectedWorkout) return;
    const updated = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map(s => {
              if (s.id === setId) {
                return { ...s, completed: !s.completed };
              }
              return s;
            })
          };
        }
        return e;
      })
    };
    setSelectedWorkout(updated);
  };

  const handleAddSet = (exerciseId: string) => {
    if (!selectedWorkout) return;
    const updated = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(e => {
        if (e.id === exerciseId) {
          const lastSet = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [...e.sets, { id: generateId(), reps: lastSet?.reps || '', weight: lastSet?.weight || '', completed: false }]
          };
        }
        return e;
      })
    };
    setSelectedWorkout(updated);
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!selectedWorkout) return;
    const suggestion = calculateProgression(exercise.id, 0, workouts || [], selectedWorkout.id);
    const newExercise: WorkoutExercise = {
      id: generateId(),
      exercise,
      sets: [
        { 
          id: generateId(), 
          reps: suggestion ? suggestion.reps : '', 
          weight: suggestion ? suggestion.weight : '', 
          completed: true // auto complete assuming history items might be already done or let user tick it
        }
      ]
    };
    setSelectedWorkout({
      ...selectedWorkout,
      exercises: [...selectedWorkout.exercises, newExercise]
    });
    setShowAddExercise(false);
  };

  if (selectedWorkout) {
    return (
      <>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="pb-24 pt-6 px-4 relative"
      >
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Usuń trening</h3>
              <p className="text-neutral-400 text-sm mb-6">Czy na pewno chcesz trwale usunąć ten trening z historii? Tej operacji nie można cofnąć.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmDelete(null)}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={() => {
                    if (showConfirmDelete) {
                      onDeleteWorkout(showConfirmDelete);
                    }
                    setShowConfirmDelete(null);
                    setSelectedWorkout(null);
                    setIsEditingNotes(false);
                  }}
                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors border border-red-500/20"
                >
                  Usuń
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => {
              setSelectedWorkout(null);
              setIsEditingNotes(false);
              setShowSaveTemplatePrompt(false);
            }}
            className="text-neutral-400 font-medium text-sm flex items-center uppercase tracking-wider"
          >
            <ChevronRight className="rotate-180 mr-1" size={16} /> Wróć do listy
          </button>
          
          <div className="flex gap-2">
            {!isEditingSets ? (
              <button
                onClick={() => setIsEditingSets(true)}
                className="text-neutral-400 hover:text-white p-2 text-xs flex items-center gap-1 rounded-full bg-neutral-900 border border-neutral-800 transition-colors"
                title="Edytuj Trening"
              >
                <Edit2 size={16} />
              </button>
            ) : (
              <button
                onClick={() => {
                  onUpdateWorkout(selectedWorkout);
                  setIsEditingSets(false);
                }}
                className="bg-neon text-black hover:brightness-110 px-3 py-1 text-xs font-bold flex items-center gap-1 rounded-lg transition-colors"
              >
                <Check size={16} /> Zapisz
              </button>
            )}
            {onSaveTemplate && !isEditingSets && (
              <button
                onClick={() => {
                  setTemplateNameDraft(`Trening: ${formatDate(selectedWorkout.startTime)}`);
                  setShowSaveTemplatePrompt(true);
                }}
                className="text-neutral-400 hover:text-white p-2 text-xs flex items-center gap-1 rounded-full bg-neutral-900 border border-neutral-800 transition-colors"
                title="Zapisz jako szablon"
              >
                <BookmarkPlus size={16} />
              </button>
            )}
            {!isEditingSets && (
              <button
                onClick={() => setShowConfirmDelete(selectedWorkout.id)}
                className="text-red-500 hover:text-red-400 p-2 rounded-full bg-neutral-900 border border-neutral-800 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showSaveTemplatePrompt && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg">
                <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                  <BookmarkPlus size={18} className="text-neon" /> Nowy Szablon
                </h3>
                <p className="text-neutral-400 text-sm mb-4">Zapisz ten trening jako szablon, aby móc szybko wracać do tego samego planu z zapisanymi ciężarami i powtórzeniami.</p>
                <input
                  type="text"
                  value={templateNameDraft}
                  onChange={(e) => setTemplateNameDraft(e.target.value)}
                  placeholder="Nazwa szablonu..."
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon mb-4 font-bold"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowSaveTemplatePrompt(false)}
                    className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={() => {
                      if (templateNameDraft.trim() && onSaveTemplate) {
                        onSaveTemplate({
                          id: generateId(),
                          name: templateNameDraft.trim(),
                          exercises: selectedWorkout.exercises,
                        });
                        setShowSaveTemplatePrompt(false);
                      }
                    }}
                    className="px-4 py-2 text-sm font-bold bg-neon text-black rounded-lg hover:brightness-110 flex items-center gap-1 transition-all"
                  >
                    <Check size={16} /> Zapisz
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-white">Podsumowanie</h2>
        </div>
        <div className="flex items-center gap-4 text-neutral-400 text-sm mb-6 font-mono">
          <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(selectedWorkout.startTime)}</span>
          {selectedWorkout.duration && (
            <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(selectedWorkout.duration)}</span>
          )}
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <FileText size={18} className="text-neon" /> Notatki
            </h3>
            {!isEditingNotes && (
              <button
                onClick={() => {
                  setNotesDraft(selectedWorkout.notes || '');
                  setIsEditingNotes(true);
                }}
                className="text-neutral-400 hover:text-white flex items-center gap-1 text-sm bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit2 size={14} /> {selectedWorkout.notes ? 'Edytuj' : 'Dodaj notatkę'}
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Jak poszedł trening? Jakieś uwagi?"
                className="w-full bg-transparent text-white placeholder-neutral-500 focus:outline-none resize-none min-h-[100px] mb-3 text-sm leading-relaxed"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    const updated = { ...selectedWorkout, notes: notesDraft.trim() };
                    onUpdateWorkout(updated);
                    setSelectedWorkout(updated);
                    setIsEditingNotes(false);
                  }}
                  className="px-4 py-2 text-sm font-bold bg-neon text-black rounded-lg hover:brightness-110 flex items-center gap-1 transition-all"
                >
                  <Check size={16} /> Zapisz
                </button>
              </div>
            </div>
          ) : (
            selectedWorkout.notes && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4">
                <p className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed">{selectedWorkout.notes}</p>
              </div>
            )
          )}
        </div>

        <div className="space-y-6">
          {selectedWorkout.exercises.map((we) => {
            const completedSets = we.sets.filter(s => s.completed);
            if (completedSets.length === 0) return null;

            const stats = getExerciseStats(workouts, selectedWorkout.id, we.exercise.id);

            return (
              <div key={we.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neon shrink-0">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{we.exercise.name}</h3>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">{we.exercise.muscleGroup}</p>
                  </div>
                </div>

                {stats && (
                  <div className="mb-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col items-center justify-center text-center">
                      <span className="text-neutral-500 mb-1 uppercase tracking-wider">Objętość</span>
                      <span className="text-white font-bold text-lg">{stats.currentVolume} <span className="text-sm font-normal text-neutral-500">kg</span></span>
                      {stats.hasPrevWorkout && stats.volumeDiff !== 0 && (
                        <span className={`text-[10px] mt-1 flex items-center gap-1 ${stats.volumeDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats.volumeDiff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {stats.volumeDiff > 0 ? '+' : ''}{stats.volumeDiff} kg
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col items-center justify-center text-center">
                      <span className="text-neutral-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Trophy size={10} className="text-yellow-500" /> Rekordy</span>
                      <div className="text-neutral-400 leading-tight space-y-0.5">
                        {stats.pr.maxWeight > 0 && <div>Maks: <span className="text-white font-bold">{stats.pr.maxWeight}</span> kg {stats.pr.isNewMaxWeight && <span className="text-yellow-500">🔥</span>}</div>}
                        {stats.pr.maxReps > 0 && <div>Powt: <span className="text-white font-bold">{stats.pr.maxReps}</span> {stats.pr.isNewMaxReps && <span className="text-yellow-500">🔥</span>}</div>}
                        {stats.pr.maxVolume > 0 && <div>Objętość: <span className="text-white font-bold">{stats.pr.maxVolume}</span> kg {stats.pr.isNewMaxVolume && <span className="text-yellow-500">🔥</span>}</div>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-2">
                  <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-neutral-500 tracking-wider px-2">
                    <div className="col-span-2 text-center">Seria</div>
                    <div className="col-span-3 text-center">kg</div>
                    <div className="col-span-3 text-center">Powt.</div>
                    <div className="col-span-4 text-right">Progres</div>
                  </div>
                  {isEditingSets ? (
                    <>
                      {we.sets.map((set, idx) => (
                        <div key={set.id} className={`flex items-center gap-2 text-sm font-mono rounded-lg p-2 ${set.completed ? 'bg-neon/5 border-neon/20' : 'bg-neutral-950/50 border-neutral-800'} border`}>
                          <div className="w-6 text-center text-neutral-500 font-bold">{idx + 1}</div>
                          <input 
                            type="number" 
                            value={set.weight} 
                            onChange={e => handleUpdateSet(we.id, set.id, 'weight', e.target.value)}
                            className="w-16 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-center text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon transition-colors"
                            placeholder="kg"
                          />
                          <input 
                            type="number" 
                            value={set.reps} 
                            onChange={e => handleUpdateSet(we.id, set.id, 'reps', e.target.value)}
                            className="w-16 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-center text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon transition-colors"
                            placeholder="powt."
                          />
                          <button 
                            onClick={() => handleToggleSetCompleted(we.id, set.id)}
                            className={`flex-1 flex justify-center py-2 rounded-lg transition-colors ${set.completed ? 'bg-neon text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => handleRemoveSet(we.id, set.id)}
                            className="p-2 rounded-lg text-red-500 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddSet(we.id)}
                        className="w-full mt-2 py-2 text-xs font-bold uppercase tracking-wider text-neon border border-neon/30 rounded-lg hover:bg-neon/10 transition-colors"
                      >
                        + Dodaj Serię
                      </button>
                    </>
                  ) : (
                    completedSets.map((set, idx) => {
                      let diffElement = null;
                      if (stats?.previousWe) {
                        const prevSets = stats.previousWe.sets.filter(s => s.completed);
                        const prevSet = prevSets[idx];
                        if (prevSet) {
                          const weightDiff = (Number(set.weight) || 0) - (Number(prevSet.weight) || 0);
                          const repsDiff = (Number(set.reps) || 0) - (Number(prevSet.reps) || 0);
  
                          if (weightDiff !== 0) {
                            const isPos = weightDiff > 0;
                            diffElement = <span className={`text-[10px] ${isPos ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1 font-bold`}>{isPos ? '+' : ''}{weightDiff} kg {isPos && '🔥'}</span>;
                          } else if (repsDiff !== 0) {
                            const isPos = repsDiff > 0;
                            diffElement = <span className={`text-[10px] ${isPos ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1 font-bold`}>{isPos ? '+' : ''}{repsDiff} powt {isPos && '💪'}</span>;
                          } else {
                            diffElement = <span className="text-[10px] text-neutral-600 font-bold">-</span>;
                          }
                        }
                      }
  
                      return (
                        <div key={set.id} className="grid grid-cols-12 gap-2 items-center text-sm font-mono bg-neutral-950/50 rounded-lg p-2 border border-neutral-800">
                          <div className="col-span-2 text-center text-neutral-400">{idx + 1}</div>
                          <div className="col-span-3 text-center text-white">{set.weight || '-'}</div>
                          <div className="col-span-3 text-center text-white">{set.reps || '-'}</div>
                          <div className="col-span-4 text-right pr-2 flex items-center justify-end h-full">
                            {diffElement}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          {isEditingSets && (
            <button
              onClick={() => setShowAddExercise(true)}
              className="mt-6 w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider text-black bg-white shadow-xl hover:bg-neutral-200 transition-colors"
            >
              <Plus size={20} /> Dodaj Ćwiczenie
            </button>
          )}
        </div>
      </motion.div>
      {showAddExercise && (
        <ExerciseDatabase 
          selectionMode 
          onSelectExercise={handleAddExercise} 
          onCancel={() => setShowAddExercise(false)} 
        />
      )}
    </>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-24 pt-8 px-4"
    >
      <div className="flex items-center justify-between mb-6 px-2 tracking-tight">
        <h1 className="text-3xl font-bold text-white">Historia</h1>
        <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <History size={14} /> Lista
          </button>
          <button 
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'progress' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Activity size={14} /> Progres
          </button>
        </div>
      </div>

      {activeTab === 'progress' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-2"
        >
          {allExercises.length === 0 ? (
            <div className="text-center text-neutral-500 mt-20 px-6">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">Brak danych do wykresu.</p>
              <p className="text-sm mt-2">Zacznij ćwiczyć, aby zobaczyć swój progres.</p>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-sm">
              <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Wybierz ćwiczenie</label>
              <div className="relative mb-8">
                <select 
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-3 pl-4 pr-10 appearance-none focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-bold"
                >
                  {allExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 rotate-90 pointer-events-none" />
              </div>
              
              {chartData.length < 2 ? (
                <div className="h-64 flex items-center justify-center text-neutral-500 border border-neutral-800/50 rounded-xl bg-neutral-950/30 text-sm">
                  Potrzeba minimum dwóch treningów.
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Trophy size={14} className="text-neon" /> Maksymalny ciężar (kg)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                          <XAxis dataKey="date" stroke="#525252" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#525252" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#D1FA71' }}
                            cursor={{ stroke: '#404040' }}
                          />
                          <Line type="monotone" dataKey="maxWeight" name="Ciężar" stroke="#D1FA71" strokeWidth={3} dot={{ r: 4, fill: '#D1FA71', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#D1FA71' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="border-t border-neutral-800 pt-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Dumbbell size={14} className="text-neon" /> Objętość na trening (kg)</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                          <XAxis dataKey="date" stroke="#525252" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#525252" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#60A5FA' }}
                            cursor={{ stroke: '#404040' }}
                          />
                          <Line type="monotone" dataKey="volume" name="Objętość" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3, fill: '#60A5FA', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#60A5FA' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <>
          <div className="px-2 mb-8 space-y-3">
        <label className="relative block">
          <span className="absolute inset-y-0 left-4 flex items-center text-neutral-500">
            <Search size={18} />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po nazwie ćwiczenia..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors placeholder:text-neutral-500 font-mono text-sm shadow-sm"
          />
        </label>
        
        <div className="flex gap-3">
          <label className="flex-1 relative block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500">
              <Calendar size={14} />
            </div>
            <input 
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-9 pr-3 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors text-xs font-mono shadow-sm [color-scheme:dark]"
            />
          </label>
          <label className="flex-1 relative block">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500">
              <Calendar size={14} />
            </div>
            <input 
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-9 pr-3 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors text-xs font-mono shadow-sm [color-scheme:dark]"
            />
          </label>
        </div>
      </div>

      {filteredWorkouts.length === 0 ? (
        <div className="text-center text-neutral-500 mt-20 px-6">
          <History size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Brak zapisanych treningów.</p>
          {(searchQuery || filterStartDate || filterEndDate) ? (
            <p className="text-sm mt-2">Nie znaleziono treningów spełniających kryteria.</p>
          ) : (
            <p className="text-sm mt-2">Zacznij ćwiczyć, aby zobaczyć tutaj swój progres.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map(workout => {
            const completedExercisesCount = workout.exercises.filter(we => we.sets.some(s => s.completed)).length;
            
            return (
              <button 
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className="w-full text-left bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-5 rounded-2xl flex items-center justify-between group transition-colors shadow-sm"
              >
                <div>
                  <div className="font-bold text-white text-lg mb-1">{formatDate(workout.startTime)}</div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                    {workout.duration && (
                      <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                        <Clock size={12} className="text-neon" /> {formatTime(workout.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                      <Dumbbell size={12} className="text-neon" /> {completedExercisesCount} ćw.
                    </span>
                    {workout.notes && (
                      <span className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                        <FileText size={12} className="text-blue-400" />
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-neutral-600 group-hover:text-neon transition-colors" />
              </button>
            );
          })}
        </div>
      )}
      </>
      )}
    </motion.div>
  );
}
