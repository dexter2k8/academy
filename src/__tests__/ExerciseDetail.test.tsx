import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExerciseDetail } from '../components/ExerciseDetail';
import type { Exercise } from '../types/workout';

vi.mock('../hooks/useWorkoutDB', async () => ({
  saveImage: vi.fn(),
  getImage: vi.fn().mockResolvedValue(null),
  deleteImage: vi.fn(),
  resolveImageUrl: vi.fn(),
  isIdbImageKey: vi.fn(() => false),
}));

const repetitionExercise: Exercise = {
  id: 'e1', name: 'Curl com barra', type: 'repetition',
  recommendedSets: 3, recommendedRepsMin: 15, recommendedRepsMax: 20, recommendedWeight: 10,
  series: [
    { id: 's1', reps: 15, weight: 10, completed: false },
    { id: 's2', reps: 15, weight: 10, completed: false },
    { id: 's3', reps: 15, weight: 10, completed: false },
  ],
};

const timedExercise: Exercise = {
  id: 'e2', name: 'Prancha', type: 'timed',
  recommendedSets: 3, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
  duration: 30, series: [],
  timedSeries: [
    { id: 'ts1', completed: false },
    { id: 'ts2', completed: false },
    { id: 'ts3', completed: false },
  ],
};

const hiitExercise: Exercise = {
  id: 'e3', name: 'Burpees', type: 'hiit',
  recommendedSets: 4, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
  prepTime: 10, workTime: 20, restTime: 10, series: [],
  hiitSeries: [
    { id: 'hs1', completed: false },
    { id: 'hs2', completed: false },
    { id: 'hs3', completed: false },
    { id: 'hs4', completed: false },
  ],
};

function renderExerciseDetail(
  exercise: Exercise,
  overrides: Partial<React.ComponentProps<typeof ExerciseDetail>> = {}
) {
  const defaults = {
    exercise,
    exerciseIndex: 0,
    totalExercises: 3,
    completedSeriesInWorkout: 0,
    totalSeriesInWorkout: 9,
    onBack: vi.fn(),
    onNext: vi.fn(),
    onFinish: vi.fn(),
    onUpdateSeries: vi.fn(),
    onUpdateTimedSeries: vi.fn(),
  };
  return render(<ExerciseDetail {...defaults} {...overrides} />);
}

describe('ExerciseDetail - Repetition', () => {
  it('renders exercise name', () => {
    renderExerciseDetail(repetitionExercise);
    expect(screen.getByText('Curl com barra')).toBeInTheDocument();
  });

  it('renders exercise index in header', () => {
    renderExerciseDetail(repetitionExercise, { exerciseIndex: 1, totalExercises: 3 });
    expect(screen.getByText('Exercicio 2 de 3')).toBeInTheDocument();
  });

  it('renders recommended info', () => {
    renderExerciseDetail(repetitionExercise);
    expect(screen.getByText(/Recomendado: 3 x 15-20/)).toBeInTheDocument();
  });

  it('renders 3 series inputs', () => {
    renderExerciseDetail(repetitionExercise);
    const repsInputs = screen.getAllByDisplayValue('15');
    expect(repsInputs.length).toBeGreaterThanOrEqual(3);
  });

  it('calls onUpdateSeries when changing reps', async () => {
    const onUpdateSeries = vi.fn();
    renderExerciseDetail(repetitionExercise, { onUpdateSeries });
    const repsInputs = screen.getAllByDisplayValue('15');
    fireEvent.change(repsInputs[0], { target: { value: '20' } });
    expect(onUpdateSeries).toHaveBeenCalledWith('s1', 'reps', 20);
  });

  it('calls onUpdateSeries when toggling checkbox', () => {
    const onUpdateSeries = vi.fn();
    renderExerciseDetail(repetitionExercise, { onUpdateSeries });
    const checkboxes = screen.getAllByRole('button').filter(
      (btn) => btn.className.includes('bg-gray-200')
    );
    fireEvent.click(checkboxes[0]);
    expect(onUpdateSeries).toHaveBeenCalledWith('s1', 'completed', true);
  });

  it('calls onNext when clicking next button', () => {
    const onNext = vi.fn();
    renderExerciseDetail(repetitionExercise, { onNext });
    fireEvent.click(screen.getByText('Próximo'));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onFinish when no onNext provided', () => {
    const onFinish = vi.fn();
    renderExerciseDetail(repetitionExercise, { onNext: undefined, onFinish });
    fireEvent.click(screen.getByText('Finalizar'));
    expect(onFinish).toHaveBeenCalled();
  });

  it('shows progress in footer', () => {
    renderExerciseDetail(repetitionExercise, { completedSeriesInWorkout: 3, totalSeriesInWorkout: 9 });
    expect(screen.getByText(/33% Completo/)).toBeInTheDocument();
  });

  it('shows series count in footer', () => {
    renderExerciseDetail(repetitionExercise, { completedSeriesInWorkout: 1 });
    expect(screen.getByText(/Feito 0 de 3/)).toBeInTheDocument();
  });
});

describe('ExerciseDetail - Timed', () => {
  it('renders timed exercise name', () => {
    renderExerciseDetail(timedExercise);
    expect(screen.getByText('Prancha')).toBeInTheDocument();
  });

  it('renders timer info', () => {
    renderExerciseDetail(timedExercise);
    expect(screen.getByText(/3 x 30s/)).toBeInTheDocument();
  });

  it('renders 3 timed series checkboxes', () => {
    renderExerciseDetail(timedExercise);
    expect(screen.getByText('1ª Série')).toBeInTheDocument();
    expect(screen.getByText('2ª Série')).toBeInTheDocument();
    expect(screen.getByText('3ª Série')).toBeInTheDocument();
  });

  it('shows first series highlighted as current', () => {
    renderExerciseDetail(timedExercise);
    const firstRow = screen.getByText('1ª Série').closest('.bg-red-50');
    expect(firstRow).toBeInTheDocument();
  });

  it('calls onUpdateTimedSeries when clicking checkbox', () => {
    const onUpdateTimedSeries = vi.fn();
    renderExerciseDetail(timedExercise, { onUpdateTimedSeries });
    const seriesRow = screen.getByText('1ª Série').closest('div[class*="flex items-center justify-between"]')!;
    const checkButton = seriesRow.querySelector('button')!;
    fireEvent.click(checkButton);
    expect(onUpdateTimedSeries).toHaveBeenCalledWith('ts1', true);
  });

  it('highlights next series after checking first', () => {
    const exerciseWithChecked: Exercise = {
      ...timedExercise,
      timedSeries: [
        { id: 'ts1', completed: true },
        { id: 'ts2', completed: false },
        { id: 'ts3', completed: false },
      ],
    };
    renderExerciseDetail(exerciseWithChecked);
    const secondRow = screen.getByText('2ª Série').closest('.bg-red-50');
    expect(secondRow).toBeInTheDocument();
  });

  it('shows series progress in footer', () => {
    renderExerciseDetail(timedExercise);
    expect(screen.getByText(/Feito 0 de 3/)).toBeInTheDocument();
  });

  it('shows completed series count when partially done', () => {
    const partialExercise: Exercise = {
      ...timedExercise,
      timedSeries: [
        { id: 'ts1', completed: true },
        { id: 'ts2', completed: false },
        { id: 'ts3', completed: false },
      ],
    };
    renderExerciseDetail(partialExercise);
    expect(screen.getByText(/Feito 1 de 3/)).toBeInTheDocument();
  });
});

describe('ExerciseDetail - HIIT', () => {
  it('renders HIIT exercise name', () => {
    renderExerciseDetail(hiitExercise);
    expect(screen.getByText('Burpees')).toBeInTheDocument();
  });

  it('renders HIIT config info', () => {
    renderExerciseDetail(hiitExercise);
    expect(screen.getByText(/4 rodadas/)).toBeInTheDocument();
    expect(screen.getByText(/Prep: 10s/)).toBeInTheDocument();
    expect(screen.getByText(/Trab: 20s/)).toBeInTheDocument();
    expect(screen.getByText(/Desc: 10s/)).toBeInTheDocument();
  });

  it('shows current round', () => {
    renderExerciseDetail(hiitExercise);
    expect(screen.getByText('Rodada 1 de 4')).toBeInTheDocument();
  });
});

describe('ExerciseDetail - Back button', () => {
  it('calls onBack when clicking back', () => {
    const onBack = vi.fn();
    renderExerciseDetail(repetitionExercise, { onBack });
    const header = screen.getByText(/Exercicio/).closest('header')!;
    const backBtn = header.querySelector('button')!;
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();
  });
});
