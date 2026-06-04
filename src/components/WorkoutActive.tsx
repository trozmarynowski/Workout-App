import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workout, WorkoutExercise, SetData, Exercise } from '../types';
import { formatTime, generateId, calculateProgression } from '../utils';
import { Play, Plus, Trash2, Check, X, Timer } from 'lucide-react';
import { ExerciseDatabase } from './ExerciseDatabase';
import { RestTimer } from './RestTimer';

interface WorkoutActiveProps {
  key?: React.Key;
  workout: Workout;
  pastWorkouts?: Workout[];
  onUpdateWorkout: (workout: Workout) => void;
  onFinishWorkout: (workout: Workout) => void;
}

export function WorkoutActive({ workout, pastWorkouts = [], onUpdateWorkout, onFinishWorkout }: WorkoutActiveProps) {
  const [elapsed, setElapsed] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const inactivityLimit = 10 * 60 * 1000;

  const handleActivityAndUpdate = (newWorkout: Workout) => {
    const now = Date.now();
    let lastActiveTime = workout.lastActiveTime || workout.startTime;
    let totalPauseDuration = workout.totalPauseDuration || 0;
    
    const inactiveTime = now - lastActiveTime;
    if (inactiveTime > inactivityLimit) {
      totalPauseDuration += (inactiveTime - inactivityLimit);
    }
    
    onUpdateWorkout({
      ...newWorkout,
      lastActiveTime: now,
      totalPauseDuration
    });
  };

  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      let lastActiveTime = workout.lastActiveTime || workout.startTime;
      let totalPauseDuration = workout.totalPauseDuration || 0;
      
      let inactiveTime = now - lastActiveTime;
      let currentPause = 0;
      if (inactiveTime > inactivityLimit) {
        currentPause = inactiveTime - inactivityLimit;
      }
      
      setElapsed(Math.max(0, Math.floor((now - workout.startTime - totalPauseDuration - currentPause) / 1000)));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [workout]);

  const handleAddExercise = (exercise: Exercise) => {
    const suggestion = calculateProgression(exercise.id, 0, pastWorkouts || [], workout.id);
    const newExercise: WorkoutExercise = {
      id: generateId(),
      exercise,
      sets: [
        { 
          id: generateId(), 
          reps: suggestion ? suggestion.reps : '', 
          weight: suggestion ? suggestion.weight : '', 
          completed: false 
        }
      ]
    };
    handleActivityAndUpdate({
      ...workout,
      exercises: [...workout.exercises, newExercise]
    });
    setShowAddExercise(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    handleActivityAndUpdate({
      ...workout,
      exercises: workout.exercises.filter(e => e.id !== exerciseId)
    });
  };

  const handleAddSet = (exerciseId: string) => {
    const we = workout.exercises.find(e => e.id === exerciseId);
    let newReps = '';
    let newWeight = '';
    
    if (we) {
      const setIndex = we.sets.length;
      const suggestion = calculateProgression(we.exercise.id, setIndex, pastWorkouts || [], workout.id);
      
      if (suggestion) {
        newReps = suggestion.reps;
        newWeight = suggestion.weight;
      } else if (we.sets.length > 0) {
        // Copy from last set
        const lastSet = we.sets[we.sets.length - 1];
        newReps = lastSet.reps;
        newWeight = lastSet.weight;
      }
    }

    handleActivityAndUpdate({
      ...workout,
      exercises: workout.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: [...e.sets, { id: generateId(), reps: newReps, weight: newWeight, completed: false }]
          };
        }
        return e;
      })
    });
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    handleActivityAndUpdate({
      ...workout,
      exercises: workout.exercises.map(e => {
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
    });
  };

  const handleToggleSet = (exerciseId: string, setId: string) => {
    let nowCompleted = false;
    handleActivityAndUpdate({
      ...workout,
      exercises: workout.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map(s => {
              if (s.id === setId) {
                if (!s.completed) nowCompleted = true;
                return { ...s, completed: !s.completed };
              }
              return s;
            })
          };
        }
        return e;
      })
    });
    if (nowCompleted) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      setShowRestTimer(true);
    }
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
     handleActivityAndUpdate({
      ...workout,
      exercises: workout.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.filter(s => s.id !== setId)
          };
        }
        return e;
      })
    });
  };

  const finish = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const now = Date.now();
    let { lastActiveTime = workout.startTime, totalPauseDuration = 0 } = workout;
    let inactiveTime = now - lastActiveTime;
    let currentPause = 0;
    if (inactiveTime > inactivityLimit) {
      currentPause = inactiveTime - inactivityLimit;
    }
    const finalDuration = Math.max(0, Math.floor((now - workout.startTime - totalPauseDuration - currentPause) / 1000));

    const finalWorkout: Workout = {
      ...workout,
      endTime: now,
      duration: finalDuration
    };
    onFinishWorkout(finalWorkout);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="pb-28 min-h-screen"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-neutral-900 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-neon font-mono text-xl tracking-wider">
            <Timer size={24} />
            {formatTime(elapsed)}
          </div>
          <button
            onClick={() => setShowRestTimer(!showRestTimer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${showRestTimer ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'}`}
          >
            Pauza
          </button>
        </div>
        <button 
          onClick={finish}
          className="bg-neon text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg active:scale-95 transition-transform"
        >
          Zakończ
        </button>
      </div>

      <div className="p-4 space-y-6 mt-2">
        <AnimatePresence>
          {workout.exercises.map((we, exIdx) => (
            <motion.div 
              key={we.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="pr-4">
                  <h3 className="font-bold text-white text-lg leading-tight mb-1">
                    <span className="text-neon mr-2">{exIdx + 1}.</span> 
                    {we.exercise.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest pl-6">{we.exercise.muscleGroup}</p>
                </div>
                <button 
                  onClick={() => handleRemoveExercise(we.id)}
                  className="p-2 text-neutral-500 hover:text-red-400 bg-neutral-950 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex text-[10px] uppercase font-bold text-neutral-500 tracking-wider px-2 mb-1">
                  <div className="w-8 text-center">Seria</div>
                  <div className="flex-1 text-center">kg</div>
                  <div className="flex-1 text-center">Powt.</div>
                  <div className="w-10 text-center"><Check size={14} className="mx-auto" /></div>
                  <div className="w-8"></div>
                </div>

                <AnimatePresence>
                  {we.sets.map((set, setIdx) => (
                    <motion.div 
                      key={set.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-center gap-1.5 rounded-lg p-1.5 transition-colors ${set.completed ? 'bg-neon/10 border border-neon/20' : 'bg-neutral-950/50 border border-neutral-800'}`}
                    >
                      <div className="w-8 text-center flex items-center justify-center">
                        <div className="text-neutral-500 font-mono text-sm">
                          {setIdx + 1}
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(we.id, set.id, 'weight', e.target.value)}
                          placeholder="-"
                          className={`w-full text-center py-2.5 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-neon transition-all ${set.completed ? 'bg-transparent text-white focus:bg-neutral-900' : 'bg-neutral-900 text-white'}`}
                        />
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(we.id, set.id, 'reps', e.target.value)}
                          placeholder="-"
                          className={`w-full text-center py-2.5 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-neon transition-all ${set.completed ? 'bg-transparent text-white focus:bg-neutral-900' : 'bg-neutral-900 text-white'}`}
                        />
                      </div>
                      <div className="w-10 flex justify-center">
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleSet(we.id, set.id)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors overflow-hidden ${set.completed ? 'bg-neon text-black' : 'bg-neutral-800 text-neutral-500 shadow-inner'}`}
                        >
                          {set.completed ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <Check size={18} strokeWidth={3} />
                            </motion.div>
                          ) : (
                            <Check size={18} strokeWidth={2} />
                          )}
                        </motion.button>
                      </div>
                      <div className="w-8 flex justify-center">
                        {!set.completed && (
                          <button
                            onClick={() => {
                              if (window.confirm('Usunąć tę serię?')) {
                                handleRemoveSet(we.id, set.id);
                              }
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button 
                  onClick={() => handleAddSet(we.id)}
                  className="w-full py-3 mt-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 border border-dashed border-neutral-800 hover:border-neon hover:text-neon transition-colors"
                >
                  <Plus size={16} /> Dodaj Serię
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button 
          onClick={() => setShowAddExercise(true)}
          className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider text-black bg-white shadow-xl hover:bg-neutral-200 transition-colors"
        >
          <Plus size={20} /> Dodaj Ćwiczenie
        </button>
      </div>

      {showAddExercise && (
        <ExerciseDatabase 
          selectionMode 
          onSelectExercise={handleAddExercise} 
          onCancel={() => setShowAddExercise(false)} 
        />
      )}

      <AnimatePresence>
        {showRestTimer && (
          <RestTimer onDismiss={() => setShowRestTimer(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
