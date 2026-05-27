export type Screen = 'dashboard' | 'workout' | 'history' | 'exercises' | 'calculator';

export type MuscleGroup = 'Klatka piersiowa' | 'Plecy' | 'Nogi' | 'Barki' | 'Biceps' | 'Triceps' | 'Ramiona' | 'Brzuch';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  image?: string;
}

export interface ExerciseCategory {
  name: MuscleGroup;
  image: string;
}

export interface SetData {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: SetData[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface Workout {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  notes?: string;
  exercises: WorkoutExercise[];
  lastActiveTime?: number;
  totalPauseDuration?: number;
}
