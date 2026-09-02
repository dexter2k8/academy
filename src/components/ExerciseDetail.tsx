import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Dumbbell,
  Check,
  Timer as TimerIcon,
  Zap,
} from "lucide-react";
import type { Exercise } from "../types/workout";
import { getCompletedCount, getExerciseSeries } from "../types/workout";
import { getImage, isIdbImageKey } from "../hooks/useWorkoutDB";
import { Timer } from "./Timer";
import { HiitTimer } from "./HiitTimer";
import { NumberInput } from "./NumberInput";

interface ExerciseDetailProps {
  exercise: Exercise;
  exerciseIndex: number;
  totalExercises: number;
  completedSeriesInWorkout: number;
  totalSeriesInWorkout: number;
  onBack: () => void;
  onNext?: () => void;
  onFinish: () => void;
  onUpdateSeries: (
    seriesId: string,
    field: "reps" | "weight" | "completed",
    value: number | boolean,
  ) => void;
  onUpdateTimedSeries?: (seriesId: string, completed: boolean) => void;
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
  onUpdateTimedSeries,
}: ExerciseDetailProps) {
  const progress =
    totalSeriesInWorkout > 0
      ? Math.round((completedSeriesInWorkout / totalSeriesInWorkout) * 100)
      : 0;
  const isTimedExercise = exercise.type === "timed";
  const isHiitExercise = exercise.type === "hiit";
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentTimedSeriesIndex, setCurrentTimedSeriesIndex] = useState(() => {
    if (exercise.type !== "timed" || !exercise.timedSeries) return 0;
    const firstUnchecked = exercise.timedSeries.findIndex((s) => !s.completed);
    return firstUnchecked === -1 ? exercise.timedSeries.length - 1 : firstUnchecked;
  });

  useEffect(() => {
    if (isTimedExercise && exercise.timedSeries) {
      const firstUnchecked = exercise.timedSeries.findIndex((s) => !s.completed);
      setCurrentTimedSeriesIndex(firstUnchecked === -1 ? exercise.timedSeries.length - 1 : firstUnchecked);
    }
  }, [isTimedExercise, exercise.timedSeries]);

  const [currentHiitSeriesIndex, setCurrentHiitSeriesIndex] = useState(() => {
    if (exercise.type !== "hiit" || !exercise.hiitSeries) return 0;
    const firstUnchecked = exercise.hiitSeries.findIndex((s) => !s.completed);
    return firstUnchecked === -1 ? exercise.hiitSeries.length - 1 : firstUnchecked;
  });

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

  const handleTimedSeriesComplete = useCallback(() => {
    if (!exercise.timedSeries || !onUpdateTimedSeries) return;
    const currentSeries = exercise.timedSeries[currentTimedSeriesIndex];
    if (currentSeries) {
      onUpdateTimedSeries(currentSeries.id, true);
      if (currentTimedSeriesIndex < exercise.timedSeries.length - 1) {
        setCurrentTimedSeriesIndex((prev) => prev + 1);
      }
    }
  }, [exercise.timedSeries, currentTimedSeriesIndex, onUpdateTimedSeries]);

  const handleHiitRoundComplete = useCallback(() => {
    if (!exercise.hiitSeries || !onUpdateTimedSeries) return;
    const currentSeries = exercise.hiitSeries[currentHiitSeriesIndex];
    if (currentSeries) {
      onUpdateTimedSeries(currentSeries.id, true);
      if (currentHiitSeriesIndex < exercise.hiitSeries.length - 1) {
        setCurrentHiitSeriesIndex((prev) => prev + 1);
      }
    }
  }, [exercise.hiitSeries, currentHiitSeriesIndex, onUpdateTimedSeries]);

  const handleHiitReset = useCallback(() => {
    if (!exercise.hiitSeries || !onUpdateTimedSeries) return;
    exercise.hiitSeries.forEach((s) => {
      if (s.completed) onUpdateTimedSeries(s.id, false);
    });
    setCurrentHiitSeriesIndex(0);
  }, [exercise.hiitSeries, onUpdateTimedSeries]);

  const completedSeries = getCompletedCount(exercise);
  const totalSeries = getExerciseSeries(exercise).length;

  return (
    <div className="flex flex-col min-h-dvh bg-gray-100 safe-area-inset">
      <header className="bg-red-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button
          onClick={onBack}
          className="p-2 -ml-1 min-w-11 min-h-11 flex items-center justify-center"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold truncate">
          Exercicio {exerciseIndex + 1} de {totalExercises}
        </h1>
      </header>

      <main className="flex-1 p-3 sm:p-4 pb-20 overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-3 sm:mb-4">
            {exercise.name}
          </h2>

          <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={exercise.name} className="w-full h-full object-cover" />
            ) : (
              <>
                <Dumbbell size={48} className="text-red-500 sm:hidden" />
                <Dumbbell size={64} className="text-red-500 hidden sm:block" />
              </>
            )}
          </div>

          {isTimedExercise ? (
            <>
              <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                <TimerIcon size={16} className="inline mr-1" />
                {exercise.recommendedSets} x {exercise.duration || 30}s
              </p>

              <div className="mb-4">
                <p className="text-center text-sm text-gray-500 mb-2">
                  Série {currentTimedSeriesIndex + 1} de {exercise.timedSeries?.length || 0}
                </p>
                <Timer
                  key={`${exercise.id}-${currentTimedSeriesIndex}`}
                  duration={exercise.duration || 30}
                  onComplete={handleTimedSeriesComplete}
                />
              </div>

              <div className="space-y-2">
                {exercise.timedSeries?.map((series, index) => (
                  <div
                    key={series.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      series.completed
                        ? "bg-green-50"
                        : index === currentTimedSeriesIndex
                          ? "bg-red-50"
                          : "bg-gray-50"
                    }`}
                  >
                    <span className="font-medium text-gray-700 text-sm">{index + 1}ª Série</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{exercise.duration || 30}s</span>
                      <button
                        onClick={() => onUpdateTimedSeries?.(series.id, !series.completed)}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded flex items-center justify-center shrink-0 transition-colors ${
                          series.completed ? "bg-green-500" : "bg-gray-200 active:bg-gray-300"
                        }`}
                      >
                        {series.completed && <Check size={18} className="text-white" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : isHiitExercise ? (
            <>
              <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                <Zap size={16} className="inline mr-1" />
                {exercise.recommendedSets} rodadas | Prep: {exercise.prepTime || 10}s | Trab:{" "}
                {exercise.workTime || 30}s | Desc: {exercise.restTime || 15}s
              </p>

              <div className="mb-4">
                <p className="text-center text-sm text-gray-500 mb-2">
                  Rodada {currentHiitSeriesIndex + 1} de {exercise.hiitSeries?.length || 0}
                </p>
                <HiitTimer
                  key={`${exercise.id}-${currentHiitSeriesIndex}`}
                  prepTime={exercise.prepTime || 10}
                  workTime={exercise.workTime || 30}
                  restTime={exercise.restTime || 15}
                  autoStart={currentHiitSeriesIndex > 0}
                  onRoundComplete={handleHiitRoundComplete}
                  onReset={handleHiitReset}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                Recomendado: {exercise.series.length} x {exercise.recommendedRepsMin}-
                {exercise.recommendedRepsMax} [{exercise.recommendedWeight}K Carga]
              </p>

              <div className="space-y-3 sm:space-y-4">
                {exercise.series.map((series, index) => (
                  <div
                    key={series.id}
                    className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700 w-8 text-sm sm:text-base">
                      {index + 1}ª
                    </span>

                    <div className="flex-1 flex items-center gap-2">
                      <label className="text-xs text-gray-500 hidden sm:inline">Reps:</label>
                      <NumberInput
                        value={series.reps}
                        onChange={(val) =>
                          onUpdateSeries(series.id, "reps", val)
                        }
                        className="w-16 sm:w-20 border border-gray-300 rounded px-2 py-2 text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 min-h-11"
                      />
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <label className="text-xs text-gray-500 hidden sm:inline">Carga:</label>
                      <NumberInput
                        value={series.weight}
                        onChange={(val) =>
                          onUpdateSeries(series.id, "weight", val)
                        }
                        step={0.5}
                        className="w-16 sm:w-20 border border-gray-300 rounded px-2 py-2 text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 min-h-11"
                      />
                    </div>

                    <button
                      onClick={() => onUpdateSeries(series.id, "completed", !series.completed)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded flex items-center justify-center shrink-0 transition-colors ${
                        series.completed ? "bg-green-500" : "bg-gray-200 active:bg-gray-300"
                      }`}
                    >
                      {series.completed && <Check size={18} className="text-white" />}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-4 sm:mt-6">
            {onNext ? (
              <button
                onClick={onNext}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg active:bg-red-600 transition-colors min-h-12 text-sm sm:text-base"
              >
                <span>Próximo</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={onFinish}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg active:bg-green-600 transition-colors min-h-12 text-sm sm:text-base"
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
          <span className="text-xs sm:text-sm">
            Feito {completedSeries} de {totalSeries}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-xs sm:text-base font-medium">{progress}% Completo</span>
        </div>
      </footer>
    </div>
  );
}
