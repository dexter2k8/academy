import { describe, it, expect } from 'vitest';
import {
  getExerciseSeries,
  getCompletedCount,
  isExerciseCompleted,
  generateId,
  createDefaultExercise,
} from '../types/workout';
import type { Exercise } from '../types/workout';

describe('getExerciseSeries', () => {
  it('returns series for repetition exercise', () => {
    const exercise: Exercise = {
      id: 'e1', name: 'Test', type: 'repetition',
      recommendedSets: 3, recommendedRepsMin: 10, recommendedRepsMax: 15, recommendedWeight: 10,
      series: [
        { id: 's1', reps: 10, weight: 10, completed: false },
        { id: 's2', reps: 12, weight: 10, completed: true },
      ],
    };
    expect(getExerciseSeries(exercise)).toHaveLength(2);
    expect(getExerciseSeries(exercise)[0].id).toBe('s1');
  });

  it('returns timedSeries for timed exercise', () => {
    const exercise: Exercise = {
      id: 'e2', name: 'Prancha', type: 'timed',
      recommendedSets: 3, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
      series: [],
      timedSeries: [
        { id: 'ts1', completed: false },
        { id: 'ts2', completed: true },
      ],
    };
    expect(getExerciseSeries(exercise)).toHaveLength(2);
    expect(getExerciseSeries(exercise)[0].id).toBe('ts1');
  });

  it('returns hiitSeries for hiit exercise', () => {
    const exercise: Exercise = {
      id: 'e3', name: 'HIIT', type: 'hiit',
      recommendedSets: 4, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
      series: [],
      hiitSeries: [
        { id: 'hs1', completed: false },
        { id: 'hs2', completed: false },
      ],
    };
    expect(getExerciseSeries(exercise)).toHaveLength(2);
  });

  it('returns empty array when timedSeries is undefined', () => {
    const exercise: Exercise = {
      id: 'e4', name: 'No series', type: 'timed',
      recommendedSets: 3, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
      series: [],
    };
    expect(getExerciseSeries(exercise)).toEqual([]);
  });
});

describe('getCompletedCount', () => {
  it('counts completed series', () => {
    const exercise: Exercise = {
      id: 'e1', name: 'Test', type: 'repetition',
      recommendedSets: 3, recommendedRepsMin: 10, recommendedRepsMax: 15, recommendedWeight: 10,
      series: [
        { id: 's1', reps: 10, weight: 10, completed: true },
        { id: 's2', reps: 12, weight: 10, completed: true },
        { id: 's3', reps: 15, weight: 10, completed: false },
      ],
    };
    expect(getCompletedCount(exercise)).toBe(2);
  });

  it('returns 0 when no series completed', () => {
    const exercise: Exercise = {
      id: 'e1', name: 'Test', type: 'timed',
      recommendedSets: 3, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
      series: [],
      timedSeries: [
        { id: 'ts1', completed: false },
        { id: 'ts2', completed: false },
      ],
    };
    expect(getCompletedCount(exercise)).toBe(0);
  });

  it('returns 0 for empty series', () => {
    const exercise: Exercise = {
      id: 'e1', name: 'Test', type: 'repetition',
      recommendedSets: 0, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
      series: [],
    };
    expect(getCompletedCount(exercise)).toBe(0);
  });
});

describe('isExerciseCompleted', () => {
  it('returns true when all series completed', () => {
    const exercise: Exercise = {
      id: 'e1', name: 'Test', type: 'repetition',
      recommendedSets: 2, recommendedRepsMin: 10, recommendedRepsMax: 15, recommendedWeight: 10,
      series: [
        { id: 's1', reps: 10, weight: 10, completed: true },
        { id: 's2', reps: 12, weight: 10, completed: true },
      ],
    };
    expect(isExerciseCompleted(exercise)).toBe(true);
  });

  it('returns false when some series not completed', () => {
    const exercise: Exercise = {
      id: 'e1', name: 'Test', type: 'repetition',
      recommendedSets: 3, recommendedRepsMin: 10, recommendedRepsMax: 15, recommendedWeight: 10,
      series: [
        { id: 's1', reps: 10, weight: 10, completed: true },
        { id: 's2', reps: 12, weight: 10, completed: false },
      ],
    };
    expect(isExerciseCompleted(exercise)).toBe(false);
  });

  it('returns false when no series', () => {
    const exercise: Exercise = {
      id: 'e1', name: 'Test', type: 'repetition',
      recommendedSets: 3, recommendedRepsMin: 10, recommendedRepsMax: 15, recommendedWeight: 10,
      series: [],
    };
    expect(isExerciseCompleted(exercise)).toBe(false);
  });
});

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('returns unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('returns id with expected length', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThanOrEqual(7);
    expect(id.length).toBeLessThanOrEqual(9);
  });
});

describe('createDefaultExercise', () => {
  it('creates exercise with default values', () => {
    const exercise = createDefaultExercise();
    expect(exercise.id).toBeTruthy();
    expect(exercise.name).toBe('');
    expect(exercise.type).toBe('repetition');
    expect(exercise.recommendedSets).toBe(3);
    expect(exercise.series).toHaveLength(3);
  });

  it('creates unique ids for each call', () => {
    const e1 = createDefaultExercise();
    const e2 = createDefaultExercise();
    expect(e1.id).not.toBe(e2.id);
    expect(e1.series[0].id).not.toBe(e2.series[0].id);
  });

  it('creates series with default reps and weight', () => {
    const exercise = createDefaultExercise();
    exercise.series.forEach((s) => {
      expect(s.reps).toBe(15);
      expect(s.weight).toBe(5);
      expect(s.completed).toBe(false);
    });
  });
});
