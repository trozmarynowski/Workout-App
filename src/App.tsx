import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Screen, Workout, WorkoutTemplate } from './types';
import { generateId } from './utils';

import { Dashboard } from './components/Dashboard';
import { WorkoutActive } from './components/WorkoutActive';
import { HistoryList } from './components/HistoryList';
import { ExerciseDatabase } from './components/ExerciseDatabase';
import { TabBar } from './components/TabBar';

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
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

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
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
        // Reset completion status for the new workout, keep weight/reps from template
        sets: e.sets.map(s => ({ ...s, completed: false, id: generateId() }))
      })) : []
    };
    setActiveWorkout(newWorkout);
    setScreen('workout');
  };

  const finishWorkout = (finalWorkout: Workout) => {
    setWorkouts([...workouts, finalWorkout]);
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
            <ExerciseDatabase />
          </div>
        )}
        
        {screen === 'workout' && activeWorkout && (
          <WorkoutActive 
            key="workout"
            workout={activeWorkout}
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
      </AnimatePresence>

      <TabBar 
        currentScreen={screen} 
        onNavigate={setScreen} 
        isWorkoutActive={!!activeWorkout} 
      />
    </div>
  );
}
