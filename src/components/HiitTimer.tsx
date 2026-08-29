import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

type HiitPhase = "prep" | "work" | "rest";

interface HiitTimerProps {
  prepTime: number;
  workTime: number;
  restTime: number;
  autoStart?: boolean;
  onRoundComplete: () => void;
  onReset?: () => void;
}

export function HiitTimer({
  prepTime,
  workTime,
  restTime,
  autoStart,
  onRoundComplete,
  onReset,
}: HiitTimerProps) {
  const [phase, setPhase] = useState<HiitPhase>("prep");
  const [timeLeft, setTimeLeft] = useState(prepTime);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const completedRef = useRef(false);

  const getPhaseDuration = (p: HiitPhase) => {
    switch (p) {
      case "prep":
        return prepTime;
      case "work":
        return workTime;
      case "rest":
        return restTime;
    }
  };

  const getPhaseLabel = (p: HiitPhase) => {
    switch (p) {
      case "prep":
        return "Preparação";
      case "work":
        return "Trabalho";
      case "rest":
        return "Descanso";
    }
  };

  const getPhaseColor = (p: HiitPhase) => {
    switch (p) {
      case "prep":
        return "#f59e0b";
      case "work":
        return "#ef4444";
      case "rest":
        return "#22c55e";
    }
  };

  useEffect(() => {
    completedRef.current = false;
    setPhase("prep");
    setTimeLeft(prepTime);
    setTotalElapsed(0);
    setIsRunning(autoStart ?? false);
  }, [prepTime, workTime, restTime, autoStart]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTotalElapsed((prev) => prev + 1);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (phase === "prep") {
            setPhase("work");
            return workTime;
          } else if (phase === "work") {
            setPhase("rest");
            return restTime;
          } else {
            setIsRunning(false);
            if (!completedRef.current) {
              completedRef.current = true;
              onRoundComplete();
            }
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, workTime, restTime, onRoundComplete]);

  const handleStart = useCallback(() => {
    if (timeLeft > 0) setIsRunning(true);
  }, [timeLeft]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    completedRef.current = false;
    setPhase("prep");
    setTimeLeft(prepTime);
    setTotalElapsed(0);
    onReset?.();
  }, [prepTime, onReset]);

  const currentDuration = getPhaseDuration(phase);
  const progress = currentDuration > 0 ? ((currentDuration - timeLeft) / currentDuration) * 100 : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const phaseColor = getPhaseColor(phase);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={phaseColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium mb-2"
            style={{ backgroundColor: phaseColor }}
          >
            {getPhaseLabel(phase)}
          </span>
          <span className="text-4xl sm:text-5xl font-bold text-gray-800">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-500 mt-1">{formatTime(currentDuration)}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500">Tempo total: {formatTime(totalElapsed)}</p>

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={timeLeft === 0}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg active:bg-red-600 transition-colors min-h-12 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={20} />
            <span>Iniciar</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg active:bg-yellow-600 transition-colors min-h-12 text-sm sm:text-base"
          >
            <Pause size={20} />
            <span>Pausar</span>
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg active:bg-gray-300 transition-colors min-h-12 text-sm sm:text-base"
        >
          <RotateCcw size={20} />
          <span>Resetar</span>
        </button>
      </div>
    </div>
  );
}
