import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { Workout, Exercise } from '../types/workout';

interface WorkoutFormProps {
  workout?: Workout;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function WorkoutForm({ workout, onSave, onCancel }: WorkoutFormProps) {
  const [name, setName] = useState(workout?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(
    workout?.exercises || [
      {
        id: generateId(),
        name: '',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: generateId(), reps: 15, weight: 5, completed: false },
          { id: generateId(), reps: 15, weight: 5, completed: false },
          { id: generateId(), reps: 15, weight: 5, completed: false },
        ],
      },
    ]
  );

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: generateId(),
        name: '',
        recommendedSets: 3,
        recommendedRepsMin: 15,
        recommendedRepsMax: 20,
        recommendedWeight: 5,
        series: [
          { id: generateId(), reps: 15, weight: 5, completed: false },
          { id: generateId(), reps: 15, weight: 5, completed: false },
          { id: generateId(), reps: 15, weight: 5, completed: false },
        ],
      },
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((e) => e.id !== exerciseId));
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: string | number) => {
    setExercises(
      exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        const updated = { ...e, [field]: value };
        if (field === 'recommendedSets' && typeof value === 'number') {
          const diff = value - e.series.length;
          if (diff > 0) {
            updated.series = [
              ...e.series,
              ...Array.from({ length: diff }, () => ({
                id: generateId(),
                reps: e.recommendedRepsMin,
                weight: e.recommendedWeight,
                completed: false,
              })),
            ];
          } else if (diff < 0) {
            updated.series = e.series.slice(0, value);
          }
        }
        return updated;
      })
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const hasEmptyExercise = exercises.some((e) => !e.name.trim());
    if (hasEmptyExercise) return;

    onSave({
      id: workout?.id || generateId(),
      name: name.trim(),
      exercises,
      lastAccessed: Date.now(),
    });
  };

  return (
    <div className="flex flex-col min-h-dvh bg-gray-100 safe-area-inset">
      <header className="bg-red-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={onCancel} className="p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold truncate">{workout ? 'Editar Treino' : 'Novo Treino'}</h1>
      </header>

      <main className="flex-1 p-3 sm:p-4 pb-24 overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-3 sm:mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Treino</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Treino A"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-[44px]"
          />
        </div>

        <div className="space-y-3 sm:space-y-4">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800 text-sm sm:text-base">Exercício {index + 1}</h3>
                {exercises.length > 1 && (
                  <button onClick={() => removeExercise(exercise.id)} className="text-red-500 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1">Nome</label>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Ex: Curl com barra"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 mb-1">Séries</label>
                    <input
                      type="number"
                      value={exercise.recommendedSets}
                      onChange={(e) => updateExercise(exercise.id, 'recommendedSets', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 mb-1">Carga (Kg)</label>
                    <input
                      type="number"
                      value={exercise.recommendedWeight}
                      onChange={(e) => updateExercise(exercise.id, 'recommendedWeight', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 mb-1">Reps Mín</label>
                    <input
                      type="number"
                      value={exercise.recommendedRepsMin}
                      onChange={(e) => updateExercise(exercise.id, 'recommendedRepsMin', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 mb-1">Reps Máx</label>
                    <input
                      type="number"
                      value={exercise.recommendedRepsMax}
                      onChange={(e) => updateExercise(exercise.id, 'recommendedRepsMax', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addExercise}
          className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-lg active:bg-gray-300 transition-colors min-h-[48px] text-sm sm:text-base"
        >
          <Plus size={20} />
          <span>Adicionar Exercício</span>
        </button>
      </main>

      <footer className="bg-white border-t border-gray-200 px-3 sm:px-4 py-3 flex gap-2 sm:gap-3 sticky bottom-0 z-10 safe-area-bottom">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 active:bg-gray-50 transition-colors min-h-[48px] text-sm sm:text-base"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-red-500 text-white rounded-lg active:bg-red-600 transition-colors min-h-[48px] text-sm sm:text-base"
        >
          Salvar
        </button>
      </footer>
    </div>
  );
}
