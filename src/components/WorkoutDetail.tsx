import { ArrowLeft, Check, Dumbbell, Pencil, Timer, Zap } from "lucide-react";
import type { Workout } from "../types/workout";
import { getCompletedCount, isExerciseCompleted, getExerciseSeries } from "../types/workout";

interface WorkoutDetailProps {
  workout: Workout;
  onBack: () => void;
  onSelectExercise: (exerciseId: string) => void;
  onEditWorkout: () => void;
}

export function WorkoutDetail({
  workout,
  onBack,
  onSelectExercise,
  onEditWorkout,
}: WorkoutDetailProps) {
  const completedCount = workout.exercises.filter(isExerciseCompleted).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <div className="flex flex-col min-h-dvh bg-gray-100 safe-area-inset">
      <header className="bg-red-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button
          onClick={onBack}
          className="p-2 -ml-1 min-w-11 min-h-11 flex items-center justify-center"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold truncate flex-1">{workout.name}</h1>
        <button
          onClick={onEditWorkout}
          className="p-2 min-w-11 min-h-11 flex items-center justify-center"
          title="Editar treino"
        >
          <Pencil size={20} />
        </button>
      </header>

      <main className="flex-1 p-3 sm:p-4 pb-20">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {workout.exercises.map((exercise) => {
            const isTimed = exercise.type === "timed";
            const isHiit = exercise.type === "hiit";
            const isCompleted = isExerciseCompleted(exercise);
            const completedSeries = getCompletedCount(exercise);
            const totalSeries = getExerciseSeries(exercise).length;

            return (
              <button
                key={exercise.id}
                onClick={() => onSelectExercise(exercise.id)}
                className="w-full flex items-center gap-3 px-4 py-3 sm:py-4 border-b border-gray-100 active:bg-gray-50 transition-colors text-left min-h-15"
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  {isCompleted && <Check size={16} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium text-sm sm:text-base truncate">
                    {exercise.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {isTimed ? (
                      <>
                        <Timer size={12} className="inline mr-1" />
                        {exercise.recommendedSets} x {exercise.duration || 30}s
                      </>
                    ) : isHiit ? (
                      <>
                        <Zap size={12} className="inline mr-1" />
                        {exercise.recommendedSets} rodadas | {exercise.prepTime || 10}s /{" "}
                        {exercise.workTime || 30}s / {exercise.restTime || 15}s
                      </>
                    ) : (
                      <>
                        {exercise.series.length} x {exercise.recommendedRepsMin}-
                        {exercise.recommendedRepsMax} [{exercise.recommendedWeight}K Carga]
                      </>
                    )}
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 shrink-0">
                  {completedSeries}/{totalSeries}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center sticky bottom-0 z-10 safe-area-bottom">
        <div className="flex items-center gap-2 text-gray-600">
          <Dumbbell size={18} />
          <span className="text-xs sm:text-sm">
            Feito {completedCount} de {totalExercises}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-xs sm:text-sm font-medium">{progress}% Completo</span>
        </div>
      </footer>
    </div>
  );
}
