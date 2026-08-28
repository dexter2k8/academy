import { useState, useCallback } from 'react';
import type { Workout, ViewType } from './types/workout';
import { useLocalStorage } from './hooks/useLocalStorage';
import { WorkoutList } from './components/WorkoutList';
import { WorkoutDetail } from './components/WorkoutDetail';
import { ExerciseDetail } from './components/ExerciseDetail';
import { WorkoutForm } from './components/WorkoutForm';

const initialWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Treino A',
    exercises: [
      {
        id: 'e1',
        name: 'Curl com barra',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: 's1', reps: 20, weight: 50, completed: true },
          { id: 's2', reps: 15, weight: 26, completed: true },
          { id: 's3', reps: 15, weight: 14, completed: false },
        ],
      },
      {
        id: 'e2',
        name: 'Curl com barra agarro afastado',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: 's4', reps: 15, weight: 5, completed: false },
          { id: 's5', reps: 15, weight: 5, completed: false },
          { id: 's6', reps: 15, weight: 5, completed: false },
        ],
      },
      {
        id: 'e3',
        name: 'Curl com barra ez',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: 's7', reps: 15, weight: 5, completed: false },
          { id: 's8', reps: 15, weight: 5, completed: false },
          { id: 's9', reps: 15, weight: 5, completed: false },
        ],
      },
      {
        id: 'e4',
        name: 'Curl com barra ez agarro afastado',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: 's10', reps: 15, weight: 5, completed: false },
          { id: 's11', reps: 15, weight: 5, completed: false },
          { id: 's12', reps: 15, weight: 5, completed: false },
        ],
      },
      {
        id: 'e5',
        name: 'Curl scott com barra',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: 's13', reps: 15, weight: 5, completed: false },
          { id: 's14', reps: 15, weight: 5, completed: false },
          { id: 's15', reps: 15, weight: 5, completed: false },
        ],
      },
      {
        id: 'e6',
        name: 'Curl scott com barra em pé',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: 's16', reps: 15, weight: 5, completed: false },
          { id: 's17', reps: 15, weight: 5, completed: false },
          { id: 's18', reps: 15, weight: 5, completed: false },
        ],
      },
    ],
    lastAccessed: Date.now(),
  },
  {
    id: '2',
    name: 'Treino B',
    exercises: [
      {
        id: 'e7',
        name: 'Supino reto',
        recommendedSets: 3,
        recommendedRepsMin: 10,
        recommendedRepsMax: 12,
        recommendedWeight: 10,
        series: [
          { id: 's19', reps: 12, weight: 10, completed: false },
          { id: 's20', reps: 10, weight: 10, completed: false },
          { id: 's21', reps: 10, weight: 10, completed: false },
        ],
      },
      {
        id: 'e8',
        name: 'Supino inclinado',
        recommendedSets: 3,
        recommendedRepsMin: 10,
        recommendedRepsMax: 12,
        recommendedWeight: 8,
        series: [
          { id: 's22', reps: 12, weight: 8, completed: false },
          { id: 's23', reps: 10, weight: 8, completed: false },
          { id: 's24', reps: 10, weight: 8, completed: false },
        ],
      },
    ],
  },
];

function App() {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', initialWorkouts);

  const [view, setView] = useState<ViewType>('list');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const selectedWorkout = workouts.find((w) => w.id === selectedWorkoutId) || null;
  const selectedExercise = selectedWorkout?.exercises.find((e) => e.id === selectedExerciseId) || null;
  const selectedExerciseIndex = selectedWorkout?.exercises.findIndex((e) => e.id === selectedExerciseId) ?? -1;

  const handleSelectWorkout = useCallback(
    (id: string) => {
      setWorkouts((prev) =>
        prev.map((w) => (w.id === id ? { ...w, lastAccessed: Date.now() } : w))
      );
      setSelectedWorkoutId(id);
      setView('detail');
    },
    [setWorkouts]
  );

  const handleSelectExercise = useCallback((id: string) => {
    setSelectedExerciseId(id);
    setView('exercise');
  }, []);

  const handleUpdateSeries = useCallback(
    (seriesId: string, field: 'reps' | 'weight' | 'completed', value: number | boolean) => {
      if (!selectedWorkoutId) return;
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id !== selectedWorkoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map((e) => ({
              ...e,
              series: e.series.map((s) => (s.id === seriesId ? { ...s, [field]: value } : s)),
            })),
          };
        })
      );
    },
    [selectedWorkoutId, setWorkouts]
  );

  const handleNextExercise = useCallback(() => {
    if (!selectedWorkout || selectedExerciseIndex < 0 || !selectedWorkoutId) return;
    
    const currentExercise = selectedWorkout.exercises[selectedExerciseIndex];
    if (!currentExercise) return;

    setWorkouts((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWorkoutId) return w;
        return {
          ...w,
          exercises: w.exercises.map((e) => {
            if (e.id !== currentExercise.id) return e;
            return {
              ...e,
              series: e.series.map((s) => ({ ...s, completed: true })),
            };
          }),
        };
      })
    );

    const nextIndex = selectedExerciseIndex + 1;
    if (nextIndex < selectedWorkout.exercises.length) {
      setSelectedExerciseId(selectedWorkout.exercises[nextIndex].id);
    }
  }, [selectedWorkout, selectedExerciseIndex, selectedWorkoutId, setWorkouts]);

  const handleFinishExercise = useCallback(() => {
    if (!selectedWorkoutId) return;

    setWorkouts((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWorkoutId) return w;
        return {
          ...w,
          exercises: w.exercises.map((e) => ({
            ...e,
            series: e.series.map((s) => ({ ...s, completed: false })),
          })),
        };
      })
    );

    setView('list');
    setSelectedWorkoutId(null);
    setSelectedExerciseId(null);
  }, [selectedWorkoutId, setWorkouts]);

  const handleSaveWorkout = useCallback(
    (workout: Workout) => {
      setWorkouts((prev) => {
        const exists = prev.find((w) => w.id === workout.id);
        if (exists) {
          return prev.map((w) => (w.id === workout.id ? workout : w));
        }
        return [...prev, workout];
      });
      setView('list');
      setEditingWorkout(null);
    },
    [setWorkouts]
  );

  const handleEditWorkout = useCallback(
    (id: string) => {
      const workout = workouts.find((w) => w.id === id);
      if (workout) {
        setEditingWorkout(workout);
        setView('crud');
      }
    },
    [workouts]
  );

  const handleDeleteWorkout = useCallback(
    (id: string) => {
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      if (selectedWorkoutId === id) {
        setSelectedWorkoutId(null);
        setView('list');
      }
    },
    [setWorkouts, selectedWorkoutId]
  );

  const handleBack = useCallback(() => {
    if (view === 'exercise') {
      setView('detail');
      setSelectedExerciseId(null);
    } else if (view === 'detail') {
      setView('list');
      setSelectedWorkoutId(null);
    } else if (view === 'crud') {
      setView('list');
      setEditingWorkout(null);
    }
  }, [view]);

  if (view === 'crud') {
    return (
      <WorkoutForm
        workout={editingWorkout || undefined}
        onSave={handleSaveWorkout}
        onCancel={() => {
          setView('list');
          setEditingWorkout(null);
        }}
      />
    );
  }

  if (view === 'exercise' && selectedExercise && selectedWorkout) {
    const totalSeriesInWorkout = selectedWorkout.exercises.reduce((acc, e) => acc + e.series.length, 0);
    const completedSeriesInWorkout = selectedWorkout.exercises.reduce(
      (acc, e) => acc + e.series.filter((s) => s.completed).length,
      0
    );

    return (
      <ExerciseDetail
        exercise={selectedExercise}
        exerciseIndex={selectedExerciseIndex}
        totalExercises={selectedWorkout.exercises.length}
        completedSeriesInWorkout={completedSeriesInWorkout}
        totalSeriesInWorkout={totalSeriesInWorkout}
        onBack={() => {
          setView('detail');
          setSelectedExerciseId(null);
        }}
        onNext={
          selectedExerciseIndex < selectedWorkout.exercises.length - 1
            ? handleNextExercise
            : undefined
        }
        onFinish={handleFinishExercise}
        onUpdateSeries={handleUpdateSeries}
      />
    );
  }

  if (view === 'detail' && selectedWorkout) {
    return (
      <WorkoutDetail
        workout={selectedWorkout}
        onBack={handleBack}
        onSelectExercise={handleSelectExercise}
        onEditWorkout={() => handleEditWorkout(selectedWorkout.id)}
      />
    );
  }

  return (
    <WorkoutList
      workouts={workouts}
      onSelectWorkout={handleSelectWorkout}
      onAddWorkout={() => {
        setEditingWorkout(null);
        setView('crud');
      }}
      onEditWorkout={handleEditWorkout}
      onDeleteWorkout={handleDeleteWorkout}
    />
  );
}

export default App;
