import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutDetail } from '../components/WorkoutDetail';
import type { Workout } from '../types/workout';

const workout: Workout = {
  id: 'w1',
  name: 'Treino Teste',
  exercises: [
    {
      id: 'e1', name: 'Curl', type: 'repetition',
      recommendedSets: 3, recommendedRepsMin: 10, recommendedRepsMax: 15, recommendedWeight: 10,
      series: [
        { id: 's1', reps: 10, weight: 10, completed: true },
        { id: 's2', reps: 12, weight: 10, completed: false },
        { id: 's3', reps: 15, weight: 10, completed: false },
      ],
    },
    {
      id: 'e2', name: 'Prancha', type: 'timed',
      recommendedSets: 3, recommendedRepsMin: 0, recommendedRepsMax: 0, recommendedWeight: 0,
      duration: 30, series: [],
      timedSeries: [
        { id: 'ts1', completed: true },
        { id: 'ts2', completed: false },
        { id: 'ts3', completed: false },
      ],
    },
  ],
};

describe('WorkoutDetail', () => {
  const defaultProps = {
    workout,
    onBack: vi.fn(),
    onSelectExercise: vi.fn(),
    onToggleExercise: vi.fn(),
    onEditWorkout: vi.fn(),
  };

  it('renders workout name in header', () => {
    render(<WorkoutDetail {...defaultProps} />);
    expect(screen.getByText('Treino Teste')).toBeInTheDocument();
  });

  it('renders exercise names', () => {
    render(<WorkoutDetail {...defaultProps} />);
    expect(screen.getByText('Curl')).toBeInTheDocument();
    expect(screen.getByText('Prancha')).toBeInTheDocument();
  });

  it('renders repetition exercise info', () => {
    render(<WorkoutDetail {...defaultProps} />);
    expect(screen.getByText(/3 x 10-15/)).toBeInTheDocument();
  });

  it('renders timed exercise info', () => {
    render(<WorkoutDetail {...defaultProps} />);
    expect(screen.getByText(/3 x 30s/)).toBeInTheDocument();
  });

  it('shows series counter for each exercise', () => {
    render(<WorkoutDetail {...defaultProps} />);
    const curl = screen.getByText('Curl').closest('[class*="flex"]')!.parentElement!;
    expect(curl).toHaveTextContent('1/3');
    const prancha = screen.getByText('Prancha').closest('[class*="flex"]')!.parentElement!;
    expect(prancha).toHaveTextContent('1/3');
  });

  it('shows footer counter', () => {
    render(<WorkoutDetail {...defaultProps} />);
    expect(screen.getByText(/Feito 0 de 2/)).toBeInTheDocument();
  });

  it('calls onSelectExercise when clicking an exercise', () => {
    render(<WorkoutDetail {...defaultProps} />);
    fireEvent.click(screen.getByText('Curl'));
    expect(defaultProps.onSelectExercise).toHaveBeenCalledWith('e1');
  });

  it('calls onBack when clicking back button', () => {
    render(<WorkoutDetail {...defaultProps} />);
    const backBtn = screen.getByText('Treino Teste').closest('header')!.querySelector('button')!;
    fireEvent.click(backBtn);
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('calls onEditWorkout when clicking edit button', () => {
    render(<WorkoutDetail {...defaultProps} />);
    const editBtn = screen.getByTitle('Editar treino');
    fireEvent.click(editBtn);
    expect(defaultProps.onEditWorkout).toHaveBeenCalled();
  });
});
