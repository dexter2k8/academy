import { useState, useCallback, useEffect, useRef } from 'react';
import type { Workout, ViewType } from './types/workout';
import { getCompletedCount, getExerciseSeries, isExerciseCompleted } from './types/workout';
import { useWorkoutDB, exportWorkoutsAsJson, importWorkoutsFromJson, saveImages } from './hooks/useWorkoutDB';
import { initialWorkouts } from './data/seedWorkouts';
import { WorkoutList } from './components/WorkoutList';
import { WorkoutDetail } from './components/WorkoutDetail';
import { ExerciseDetail } from './components/ExerciseDetail';
import { WorkoutForm } from './components/WorkoutForm';
import { ExitConfirmDialog } from './components/ExitConfirmDialog';

function App() {
  const { workouts, setWorkouts, loaded } = useWorkoutDB(initialWorkouts);

  const [view, setView] = useState<ViewType>('list');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [exitPopupOpen, setExitPopupOpen] = useState(false);
  const pendingExitRef = useRef(false);

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

  const handleToggleExercise = useCallback(
    (exerciseId: string) => {
      if (!selectedWorkoutId) return;
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id !== selectedWorkoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map((e) => {
              if (e.id !== exerciseId) return e;
              const series = getExerciseSeries(e);
              const allCompleted = series.length > 0 && series.every((s) => s.completed);
              const newValue = !allCompleted;
              return {
                ...e,
                series: e.series.map((s) => ({ ...s, completed: newValue })),
                timedSeries: e.timedSeries?.map((s) => ({ ...s, completed: newValue })),
                hiitSeries: e.hiitSeries?.map((s) => ({ ...s, completed: newValue })),
              };
            }),
          };
        })
      );
    },
    [selectedWorkoutId, setWorkouts]
  );

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

  const handleUpdateTimedSeries = useCallback(
    (seriesId: string, completed: boolean) => {
      if (!selectedWorkoutId) return;
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id !== selectedWorkoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map((e) => ({
              ...e,
              timedSeries: e.timedSeries?.map((s) => (s.id === seriesId ? { ...s, completed } : s)),
              hiitSeries: e.hiitSeries?.map((s) => (s.id === seriesId ? { ...s, completed } : s)),
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
              timedSeries: e.timedSeries?.map((s) => ({ ...s, completed: true })),
              hiitSeries: e.hiitSeries?.map((s) => ({ ...s, completed: true })),
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
            timedSeries: e.timedSeries?.map((s) => ({ ...s, completed: false })),
            hiitSeries: e.hiitSeries?.map((s) => ({ ...s, completed: false })),
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
      // Item 1: ao voltar para o menu, se todos os exercícios do treino
      // estiverem marcados, desmarca todos (próxima vez começa limpo)
      if (
        selectedWorkout &&
        selectedWorkout.exercises.length > 0 &&
        selectedWorkout.exercises.every(isExerciseCompleted)
      ) {
        setWorkouts((prev) =>
          prev.map((w) =>
            w.id !== selectedWorkout.id
              ? w
              : {
                  ...w,
                  exercises: w.exercises.map((e) => ({
                    ...e,
                    series: e.series.map((s) => ({ ...s, completed: false })),
                    timedSeries: e.timedSeries?.map((s) => ({ ...s, completed: false })),
                    hiitSeries: e.hiitSeries?.map((s) => ({ ...s, completed: false })),
                  })),
                }
          )
        );
      }
      setView('list');
      setSelectedWorkoutId(null);
    } else if (view === 'crud') {
      setView('list');
      setEditingWorkout(null);
    }
  }, [view, selectedWorkout, setWorkouts]);

  const handleExport = useCallback(() => {
    exportWorkoutsAsJson(workouts);
  }, [workouts]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const { workouts: imported, images } = await importWorkoutsFromJson(file);
      if (Object.keys(images).length > 0) {
        await saveImages(images);
      }
      setWorkouts(imported);
    } catch (error) {
      alert(`Erro ao importar: ${error instanceof Error ? error.message : 'arquivo inválido'}`);
    }
  }, [setWorkouts]);

  const handleClearAll = useCallback(() => {
    setWorkouts([]);
  }, [setWorkouts]);

  // --- Botão "voltar" do Android (itens 2 e 3) -----------------------------
  // O navegador só dispara "popstate" se houver uma entrada extra no
  // histórico. A "guarda" abaixo absorve o primeiro voltar para que o app
  // possa reagir (voltar de tela) em vez de fechar imediatamente.

  const pushHistoryGuard = useCallback(() => {
    window.history.pushState({ appGuard: true }, '');
  }, []);

  useEffect(() => {
    if (window.history.state?.appGuard !== true) {
      window.history.pushState({ appGuard: true }, '');
    }
  }, []);

  const handleCancelExit = useCallback(() => {
    setExitPopupOpen(false);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setExitPopupOpen(false);
    // Tenta fechar a janela/aba (permitido quando o histórico tem uma
    // única entrada, como em apps instalados).
    window.close();
    if (window.closed) return;
    // Senão, volta até a primeira entrada do histórico para então sair:
    // ao chegar lá (popstate), fecha a aba ou mostra uma tela em branco,
    // encerrando a aplicação.
    const delta = 1 - window.history.length;
    if (delta >= 0) {
      window.location.replace('about:blank');
    } else {
      pendingExitRef.current = true;
      window.history.go(delta);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      // Saída confirmada: chegamos ao início do histórico e saímos de fato
      if (pendingExitRef.current) {
        pendingExitRef.current = false;
        window.close();
        if (!window.closed) {
          window.location.replace('about:blank');
        }
        return;
      }

      // Voltar com o popup aberto: apenas fecha o popup (como em qualquer modal)
      if (exitPopupOpen) {
        setExitPopupOpen(false);
        pushHistoryGuard();
        return;
      }

      // Menu inicial: pede confirmação antes de sair da aplicação (item 3)
      if (view === 'list') {
        setExitPopupOpen(true);
        pushHistoryGuard();
        return;
      }

      // Dentro do aplicativo: volta um passo
      // (exercício → treino → menu, item 2) e recria a guarda
      handleBack();
      pushHistoryGuard();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [view, exitPopupOpen, handleBack, pushHistoryGuard]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-100">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

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
    const totalSeriesInWorkout = selectedWorkout.exercises.reduce(
      (acc, e) => acc + getExerciseSeries(e).length, 0
    );
    const completedSeriesInWorkout = selectedWorkout.exercises.reduce(
      (acc, e) => acc + getCompletedCount(e), 0
    );

    return (
      <ExerciseDetail
        exercise={selectedExercise}
        exerciseIndex={selectedExerciseIndex}
        totalExercises={selectedWorkout.exercises.length}
        completedSeriesInWorkout={completedSeriesInWorkout}
        totalSeriesInWorkout={totalSeriesInWorkout}
        onBack={handleBack}
        onNext={
          selectedExerciseIndex < selectedWorkout.exercises.length - 1
            ? handleNextExercise
            : undefined
        }
        onFinish={handleFinishExercise}
        onUpdateSeries={handleUpdateSeries}
        onUpdateTimedSeries={handleUpdateTimedSeries}
      />
    );
  }

  if (view === 'detail' && selectedWorkout) {
    return (
      <WorkoutDetail
        workout={selectedWorkout}
        onBack={handleBack}
        onSelectExercise={handleSelectExercise}
        onToggleExercise={handleToggleExercise}
        onEditWorkout={() => handleEditWorkout(selectedWorkout.id)}
      />
    );
  }

  return (
    <>
      <WorkoutList
        workouts={workouts}
        onSelectWorkout={handleSelectWorkout}
        onAddWorkout={() => {
          setEditingWorkout(null);
          setView('crud');
        }}
        onEditWorkout={handleEditWorkout}
        onDeleteWorkout={handleDeleteWorkout}
        onExport={handleExport}
        onImport={handleImport}
        onClearAll={handleClearAll}
      />
      {exitPopupOpen && (
        <ExitConfirmDialog onConfirm={handleConfirmExit} onCancel={handleCancelExit} />
      )}
    </>
  );
}

export default App;
