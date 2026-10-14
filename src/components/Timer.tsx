import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatTime } from "../utils/format";

interface TimerProps {
  duration: number;
  onComplete: () => void;
}

export function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  const handleStart = useCallback(() => {
    if (timeLeft > 0) setIsRunning(true);
  }, [timeLeft]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 landscape:flex-row landscape:items-center landscape:justify-center landscape:gap-6">
      <div className="relative w-[min(12rem,44dvh)] h-[min(12rem,44dvh)] sm:w-[min(14rem,50dvh)] sm:h-[min(14rem,50dvh)]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[length:min(2.25rem,9dvh)] sm:text-[length:min(3rem,10dvh)] font-bold text-gray-800">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-500 mt-1">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex gap-3 landscape:flex-col landscape:gap-2">
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
