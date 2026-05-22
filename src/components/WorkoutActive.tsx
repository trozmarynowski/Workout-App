import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workout, WorkoutExercise, SetData, Exercise } from '../types';
import { formatTime, generateId } from '../utils';
import { Play, Plus, Trash2, Check, X, Timer } from 'lucide-react';
import { ExerciseDatabase } from './ExerciseDatabase';
import { RestTimer } from './RestTimer';

interface WorkoutActiveProps {
  key?: React.Key;
  workout: Workout;
  onUpdateWorkout: (workout: Workout) => void;
  onFinishWorkout: (workout: Workout) => void;
}

export function WorkoutActive({ workout, onUpdateWorkout, onFinishWorkout }: WorkoutActiveProps) {
  const [elapsed, setElapsed] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  useEffect(() => {
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - workout.startTime) / 1000));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [workout.startTime]);

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: generateId(),
      exercise,
      sets: [
        { id: generateId(), reps: '', weight: '', completed: false }
      ]
    };
    onUpdateWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise]
    });
    setShowAddExercise(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    onUpdateWorkout({
      ...workout,
      exercises: workout.exercises.filter(e => e.id !== exerciseId)
    });
  };

  const handleAddSet = (exerciseId: string) => {
    const defaultReps = '';
    const defaultWeight = '';
    
    // Optionally copy from last set
    const we = workout.exercises.find(e => e.id === exerciseId);
    let prevReps = defaultReps;
    let prevWeight = defaultWeight;
    if (we && we.sets.length > 0) {
      const lastSet = we.sets[we.sets.length - 1];
      prevReps = lastSet.reps;
      prevWeight = lastSet.weight;
    }

    onUpdateWorkout({
      ...workout,
      exercises: workout.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: [...e.sets, { id: generateId(), reps: prevReps, weight: prevWeight, completed: false }]
          };
        }
        return e;
      })
    });
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    onUpdateWorkout({
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
    onUpdateWorkout({
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
      setShowRestTimer(true);
    }
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
     onUpdateWorkout({
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

  const finish = () => {
    const finalWorkout: Workout = {
      ...workout,
      endTime: Date.now(),
      duration: elapsed
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
                  <div className="w-10 text-center">Seria</div>
                  <div className="flex-1 text-center">kg</div>
                  <div className="flex-1 text-center">Powt.</div>
                  <div className="w-12 text-center"><Check size={14} className="mx-auto" /></div>
                </div>

                <AnimatePresence>
                  {we.sets.map((set, setIdx) => (
                    <motion.div 
                      key={set.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-center gap-2 rounded-lg p-1.5 transition-colors ${set.completed ? 'bg-neon/10 border border-neon/20' : 'bg-neutral-950/50 border border-neutral-800'}`}
                    >
                      <div className="w-10 text-center focus-within:w-16 flex items-center justify-center">
                        {/* Make the number slightly subtle, or red delete if hovered */}
                        <div className="text-neutral-500 font-mono text-sm relative group cursor-pointer" onClick={() => handleRemoveSet(we.id, set.id)}>
                          <span className="group-hover:hidden">{setIdx + 1}</span>
                          <X size={14} className="hidden group-hover:block text-red-500" />
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(we.id, set.id, 'weight', e.target.value)}
                          disabled={set.completed}
                          placeholder="-"
                          className="w-full bg-neutral-900 disabled:bg-transparent disabled:text-neutral-300 text-center py-2.5 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-neon transition-all"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(we.id, set.id, 'reps', e.target.value)}
                          disabled={set.completed}
                          placeholder="-"
                          className="w-full bg-neutral-900 disabled:bg-transparent disabled:text-neutral-300 text-center py-2.5 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-neon transition-all"
                        />
                      </div>
                      <div className="w-12 flex justify-center">
                        <button 
                          onClick={() => handleToggleSet(we.id, set.id)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${set.completed ? 'bg-neon text-black' : 'bg-neutral-800 text-neutral-500 shadow-inner'}`}
                        >
                          <Check size={18} strokeWidth={set.completed ? 3 : 2} />
                        </button>
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
