import { Workout } from './types';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export const isSetValid = (s: { completed: boolean; weight: string | number; reps: string | number }) => 
  s.completed || Boolean(s.weight) || Boolean(s.reps);

export function calculateProgression(exerciseId: string, setIndex: number, pastWorkouts: Workout[], currentWorkoutId?: string) {
  if (!pastWorkouts || pastWorkouts.length === 0) return null;
  
  const sorted = [...pastWorkouts].sort((a, b) => b.startTime - a.startTime);
  for (const w of sorted) {
    if (currentWorkoutId && w.id === currentWorkoutId) continue;
    const ex = w.exercises.find(e => e.exercise.id === exerciseId);
    if (ex && ex.sets.length > 0) {
      let referenceSet = ex.sets[setIndex];
      
      if (!referenceSet) {
         referenceSet = ex.sets[ex.sets.length - 1]; // fallback to last set
      }

      if (referenceSet && referenceSet.weight) {
         const pastWeight = parseFloat(referenceSet.weight);
         const pastReps = parseInt(referenceSet.reps || "0");
         
         if (!isNaN(pastWeight) && !isNaN(pastReps)) {
            let sugWeight = pastWeight;
            let sugReps = pastReps;
            
            // Intelligent progression
            if (pastReps >= 8 && isSetValid(referenceSet)) {
               sugWeight += 2.5; // Progressive overload
               sugReps = Math.max(6, pastReps - 2); // Drop reps slightly for heavier weight, minimum 6
            } else if (pastReps < 5 && isSetValid(referenceSet)) {
               sugReps += 1; // Same weight, push for more reps
            }
            
            return { 
              weight: sugWeight.toString(), 
              reps: sugReps > 0 ? sugReps.toString() : '', 
              isIncrease: sugWeight > pastWeight,
              pastWeight,
              pastReps
            };
         }
      }
    }
  }
  return null;
}
