import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Screen, Workout, WorkoutTemplate } from './types';
import { generateId, calculateProgression, formatDate } from './utils';
import { RotateCcw, X } from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { WorkoutActive } from './components/WorkoutActive';
import { HistoryList } from './components/HistoryList';
import { ExerciseDatabase } from './components/ExerciseDatabase';
import { Calculator1RM } from './components/Calculator1RM';
import { Profile } from './components/Profile';
import { TabBar } from './components/TabBar';

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [deletedWorkout, setDeletedWorkout] = useState<Workout | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedWorkouts = localStorage.getItem('wt_workouts');
      if (savedWorkouts) {
        setWorkouts(JSON.parse(savedWorkouts));
      }
      const savedActive = localStorage.getItem('wt_active_workout');
      if (savedActive) {
        setActiveWorkout(JSON.parse(savedActive));
      }
      const savedTemplates = localStorage.getItem('wt_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
      const savedDeleted = localStorage.getItem('wt_deleted_workout');
      if (savedDeleted) {
        setDeletedWorkout(JSON.parse(savedDeleted));
      }
    } catch (e) {
      console.error('Failed to load from local storage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('wt_workouts', JSON.stringify(workouts));
  }, [workouts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('wt_templates', JSON.stringify(templates));
  }, [templates, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (activeWorkout) {
      localStorage.setItem('wt_active_workout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('wt_active_workout');
    }
  }, [activeWorkout, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (deletedWorkout) {
      localStorage.setItem('wt_deleted_workout', JSON.stringify(deletedWorkout));
    } else {
      localStorage.removeItem('wt_deleted_workout');
    }
  }, [deletedWorkout, isLoaded]);

  const deleteWorkout = (id: string) => {
    const workoutToDelete = workouts.find(w => w.id === id);
    if (workoutToDelete) {
      setDeletedWorkout(workoutToDelete);
    }
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const restoreWorkout = () => {
    if (deletedWorkout) {
      setWorkouts(prev => {
        const newWorkouts = [...prev, deletedWorkout];
        return newWorkouts.sort((a, b) => b.startTime - a.startTime);
      });
      setDeletedWorkout(null);
    }
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    setWorkouts(workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
  };

  const saveTemplate = (template: WorkoutTemplate) => {
    setTemplates([...templates, template]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const startWorkout = (template?: WorkoutTemplate) => {
    const newWorkout: Workout = {
      id: generateId(),
      startTime: Date.now(),
      exercises: template ? template.exercises.map(e => ({
        ...e,
        sets: e.sets.map((s, idx) => {
          const suggestion = calculateProgression(e.exercise.id, idx, workouts);
          return { 
            ...s, 
            completed: false, 
            id: generateId(),
            weight: suggestion && s.weight === '' ? suggestion.weight : s.weight,
            reps: suggestion && s.reps === '' ? suggestion.reps : s.reps
          };
        })
      })) : []
    };
    setActiveWorkout(newWorkout);
    setScreen('workout');
  };

  const finishWorkout = (finalWorkout: Workout) => {
    setWorkouts(prev => [finalWorkout, ...prev]);
    setActiveWorkout(null);
    setScreen('history');
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#050505] max-w-md mx-auto relative overflow-hidden shadow-2xl sm:border-x sm:border-neutral-900">
      <AnimatePresence mode="wait">
        {screen === 'dashboard' && (
          <Dashboard 
            key="dashboard"
            templates={templates}
            onStartWorkout={startWorkout} 
            hasActiveWorkout={!!activeWorkout} 
            onResumeWorkout={() => setScreen('workout')} 
            onDeleteTemplate={deleteTemplate}
          />
        )}
        
        {screen === 'exercises' && (
          <div key="exercises">
            <ExerciseDatabase workouts={workouts} />
          </div>
        )}
        
        {screen === 'calculator' && (
          <div key="calculator">
            <Calculator1RM />
          </div>
        )}
        
        {screen === 'workout' && activeWorkout && (
          <WorkoutActive 
            key="workout"
            workout={activeWorkout}
            pastWorkouts={workouts}
            onUpdateWorkout={setActiveWorkout}
            onFinishWorkout={finishWorkout}
          />
        )}
        
        {screen === 'history' && (
          <HistoryList 
            key="history" 
            workouts={workouts} 
            onDeleteWorkout={deleteWorkout} 
            onUpdateWorkout={updateWorkout}
            onSaveTemplate={saveTemplate}
          />
        )}

        {screen === 'profile' && (
          <Profile key="profile" />
        )}
      </AnimatePresence>

      {/* Global Undo Snackbar */}
      <AnimatePresence>
        {deletedWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between max-w-md mx-auto"
          >
            <div className="flex-1">
              <div className="text-sm font-bold text-white mb-1">Usunięto trening</div>
              <div className="text-xs text-neutral-400">
                {formatDate(deletedWorkout.startTime)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={restoreWorkout}
                className="flex items-center gap-1.5 text-neon font-bold text-sm px-4 py-2 rounded-xl bg-neon/10 hover:bg-neon/20 transition-colors"
              >
                <RotateCcw size={16} /> Przywróć
              </button>
              <button
                onClick={() => setDeletedWorkout(null)}
                className="p-2 text-neutral-500 hover:text-white transition-colors rounded-lg bg-neutral-800/50 hover:bg-neutral-800"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TabBar 
        currentScreen={screen} 
        onNavigate={setScreen} 
        isWorkoutActive={!!activeWorkout} 
      />
    </div>
  );
}
