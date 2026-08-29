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

export interface Exercise {
  id: string;
  name: string;
  image?: string;
  type: 'repetition' | 'timed';
  recommendedSets: number;
  recommendedRepsMin: number;
  recommendedRepsMax: number;
  recommendedWeight: number;
  duration?: number;
  series: Series[];
  timedSeries?: TimedSeries[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  lastAccessed?: number;
}

export type ViewType = 'list' | 'detail' | 'exercise' | 'crud';
