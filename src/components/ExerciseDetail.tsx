import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Dumbbell, Check } from 'lucide-react';
import type { Exercise } from '../types/workout';
import { getImage, isIdbImageKey } from '../hooks/useWorkoutDB';

interface ExerciseDetailProps {
  exercise: Exercise;
  exerciseIndex: number;
  totalExercises: number;
  completedSeriesInWorkout: number;
  totalSeriesInWorkout: number;
  onBack: () => void;
  onNext?: () => void;
  onFinish: () => void;
  onUpdateSeries: (seriesId: string, field: 'reps' | 'weight' | 'completed', value: number | boolean) => void;
}

export function ExerciseDetail({
  exercise,
  exerciseIndex,
  totalExercises,
  completedSeriesInWorkout,
  totalSeriesInWorkout,
  onBack,
  onNext,
  onFinish,
  onUpdateSeries,
}: ExerciseDetailProps) {
  const progress = totalSeriesInWorkout > 0 ? Math.round((completedSeriesInWorkout / totalSeriesInWorkout) * 100) : 0;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      if (isIdbImageKey(exercise.image)) {
        const url = await getImage(exercise.id);
        if (!cancelled) {
          objectUrl = url;
          setImageUrl(url);
        }
      } else if (exercise.image) {
        if (!cancelled) setImageUrl(exercise.image);
      } else {
        if (!cancelled) setImageUrl(null);
      }
    };

    loadImage();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [exercise.id, exercise.image]);

  return (
    <div className="flex flex-col min-h-dvh bg-gray-100 safe-area-inset">
      <header className="bg-red-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold truncate">Exercicio {exerciseIndex + 1} de {totalExercises}</h1>
      </header>

      <main className="flex-1 p-3 sm:p-4 pb-20 overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-3 sm:mb-4">{exercise.name}</h2>

          <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Dumbbell size={48} className="text-red-500 sm:hidden" />
                <Dumbbell size={64} className="text-red-500 hidden sm:block" />
              </>
            )}
          </div>

          <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
            Recomendado: {exercise.series.length} x {exercise.recommendedRepsMin}-{exercise.recommendedRepsMax} [{exercise.recommendedWeight}K Carga]
          </p>

          <div className="space-y-3 sm:space-y-4">
            {exercise.series.map((series, index) => (
              <div key={series.id} className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 w-8 text-sm sm:text-base">{index + 1}ª</span>
                
                <div className="flex-1 flex items-center gap-2">
                  <label className="text-xs text-gray-500 hidden sm:inline">Reps:</label>
                  <input
                    type="number"
                    value={series.reps}
                    onChange={(e) => onUpdateSeries(series.id, 'reps', parseInt(e.target.value) || 0)}
                    className="w-16 sm:w-20 border border-gray-300 rounded px-2 py-2 text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                  />
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <label className="text-xs text-gray-500 hidden sm:inline">Carga:</label>
                  <input
                    type="number"
                    value={series.weight}
                    onChange={(e) => onUpdateSeries(series.id, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-16 sm:w-20 border border-gray-300 rounded px-2 py-2 text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                  />
                </div>

                <button
                  onClick={() => onUpdateSeries(series.id, 'completed', !series.completed)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded flex items-center justify-center shrink-0 transition-colors ${
                    series.completed ? 'bg-green-500' : 'bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  {series.completed && <Check size={18} className="text-white" />}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 sm:mt-6">
            {onNext ? (
              <button
                onClick={onNext}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg active:bg-red-600 transition-colors min-h-[48px] text-sm sm:text-base"
              >
                <span>Próximo</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={onFinish}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg active:bg-green-600 transition-colors min-h-[48px] text-sm sm:text-base"
              >
                <span>Finalizar</span>
                <ArrowUp size={20} />
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center sticky bottom-0 z-10 safe-area-bottom">
        <div className="flex items-center gap-2 text-gray-600">
          <Dumbbell size={18} />
          <span className="text-xs sm:text-sm">Feito {completedSeriesInWorkout} de {totalSeriesInWorkout}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-xs sm:text-base font-medium">{progress}% Completo</span>
        </div>
      </footer>
    </div>
  );
}
