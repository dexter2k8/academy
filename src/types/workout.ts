export interface Series {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface TimedSeries {
  id: string;
  completed: boolean;
}

export interface HiitSeries {
  id: string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  image?: string;
  type: 'repetition' | 'timed' | 'hiit';
  recommendedSets: number;
  recommendedRepsMin: number;
  recommendedRepsMax: number;
  recommendedWeight: number;
  duration?: number;
  prepTime?: number;
  workTime?: number;
  restTime?: number;
  series: Series[];
  timedSeries?: TimedSeries[];
  hiitSeries?: HiitSeries[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  lastAccessed?: number;
}

export type ViewType = 'list' | 'detail' | 'exercise' | 'crud';

export function getExerciseSeries(exercise: Exercise): readonly { id: string; completed: boolean }[] {
  if (exercise.type === 'timed') return exercise.timedSeries ?? [];
  if (exercise.type === 'hiit') return exercise.hiitSeries ?? [];
  return exercise.series;
}

export function getCompletedCount(exercise: Exercise): number {
  return getExerciseSeries(exercise).filter((s) => s.completed).length;
}

export function isExerciseCompleted(exercise: Exercise): boolean {
  const series = getExerciseSeries(exercise);
  return series.length > 0 && series.every((s) => s.completed);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createDefaultExercise(): Exercise {
  return {
    id: generateId(),
    name: '',
    image: '',
    type: 'repetition',
    recommendedSets: 3,
    recommendedRepsMin: 15,
    recommendedRepsMax: 20,
    recommendedWeight: 5,
    series: [
      { id: generateId(), reps: 15, weight: 5, completed: false },
      { id: generateId(), reps: 15, weight: 5, completed: false },
      { id: generateId(), reps: 15, weight: 5, completed: false },
    ],
  };
}
