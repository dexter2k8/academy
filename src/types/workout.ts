export interface Series {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  image?: string;
  recommendedSets: number;
  recommendedRepsMin: number;
  recommendedRepsMax: number;
  recommendedWeight: number;
  series: Series[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  lastAccessed?: number;
}

export type ViewType = 'list' | 'detail' | 'exercise' | 'crud';
