import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

const { timedWorkouts } = vi.hoisted(() => ({
  timedWorkouts: [
    {
      id: 'w1',
      name: 'Treino Tempo',
      lastAccessed: Date.now(),
      exercises: [
        {
          id: 'e1',
          name: 'Prancha',
          type: 'timed' as const,
          recommendedSets: 3,
          recommendedRepsMin: 0,
          recommendedRepsMax: 0,
          recommendedWeight: 0,
          duration: 30,
          series: [],
          timedSeries: [
            { id: 'ts1', completed: false },
            { id: 'ts2', completed: false },
            { id: 'ts3', completed: false },
          ],
        },
        {
          id: 'e2',
          name: 'Agachamento',
          type: 'timed' as const,
          recommendedSets: 2,
          recommendedRepsMin: 0,
          recommendedRepsMax: 0,
          recommendedWeight: 0,
          duration: 20,
          series: [],
          timedSeries: [
            { id: 'ts4', completed: false },
            { id: 'ts5', completed: false },
          ],
        },
      ],
    },
    {
      id: 'w2',
      name: 'Treino Rep',
      lastAccessed: Date.now() - 100000,
      exercises: [
        {
          id: 'e3',
          name: 'Curl',
          type: 'repetition' as const,
          recommendedSets: 3,
          recommendedRepsMin: 10,
          recommendedRepsMax: 15,
          recommendedWeight: 10,
          series: [
            { id: 's1', reps: 10, weight: 10, completed: false },
            { id: 's2', reps: 12, weight: 10, completed: false },
            { id: 's3', reps: 15, weight: 10, completed: false },
          ],
        },
      ],
    },
  ],
}));

vi.mock('../data/seedWorkouts', () => ({
  initialWorkouts: timedWorkouts,
}));

vi.mock('../hooks/useWorkoutDB', async () => {
  const { useState } = await import('react');
  return {
    useWorkoutDB: (initial: typeof timedWorkouts) => {
      const [workouts, setWorkouts] = useState(initial);
      const [loaded] = useState(true);
      return { workouts, setWorkouts, loaded };
    },
    saveImage: vi.fn(),
    getImage: vi.fn(),
    deleteImage: vi.fn(),
    resolveImageUrl: vi.fn(),
    isIdbImageKey: vi.fn(() => false),
  };
});

describe('App - Navigation', () => {
  it('renders workout list on load', () => {
    render(<App />);
    expect(screen.getByText('Treino Tempo')).toBeInTheDocument();
    expect(screen.getByText('Treino Rep')).toBeInTheDocument();
  });

  it('navigates to detail view when selecting a workout', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    expect(screen.getByText('Treino Tempo')).toBeInTheDocument();
    expect(screen.getByText('Prancha')).toBeInTheDocument();
    expect(screen.getByText('Agachamento')).toBeInTheDocument();
  });

  it('navigates back from detail to list', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    const backBtn = screen.getByText('Treino Tempo').closest('header')!.querySelector('button')!;
    fireEvent.click(backBtn);
    expect(screen.getByText('Escolha uma rotina')).toBeInTheDocument();
  });

  it('navigates to exercise detail from workout detail', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    fireEvent.click(screen.getByText('Prancha'));
    expect(screen.getByText('Exercicio 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('3 x 30s')).toBeInTheDocument();
  });

  it('navigates back from exercise to detail', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    fireEvent.click(screen.getByText('Prancha'));
    const backBtn = screen.getByText(/Exercicio/).closest('header')!.querySelector('button')!;
    fireEvent.click(backBtn);
    expect(screen.getByText('Prancha')).toBeInTheDocument();
  });
});

describe('App - Timed exercise checkbox counter', () => {
  it('shows "Feito 0 de 3" initially', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    fireEvent.click(screen.getByText('Prancha'));
    expect(screen.getByText(/Feito 0 de 3/)).toBeInTheDocument();
  });

  it('updates counter to "Feito 1 de 3" after checking a timed series', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    fireEvent.click(screen.getByText('Prancha'));

    const seriesRow = screen.getByText('1ª Série').closest('div')!;
    const checkButton = seriesRow.querySelector('button')!;

    await act(async () => {
      fireEvent.click(checkButton);
    });

    expect(screen.getByText(/Feito 1 de 3/)).toBeInTheDocument();
  });

  it('advances highlight to next unchecked series', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    fireEvent.click(screen.getByText('Prancha'));

    const seriesRow = screen.getByText('1ª Série').closest('div')!;
    const checkButton = seriesRow.querySelector('button')!;

    await act(async () => {
      fireEvent.click(checkButton);
    });

    const secondRow = screen.getByText('2ª Série').closest('.bg-red-50');
    expect(secondRow).toBeInTheDocument();
  });
});

describe('App - Edit workout', () => {
  it('opens edit form when clicking edit button', () => {
    render(<App />);
    const editButtons = screen.getAllByTitle('Editar');
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Editar Treino')).toBeInTheDocument();
  });
});
