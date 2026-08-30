import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutList } from '../components/WorkoutList';
import type { Workout } from '../types/workout';

const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Treino A',
    lastAccessed: Date.now(),
    exercises: [],
  },
  {
    id: 'w2',
    name: 'Treino B',
    exercises: [],
  },
];

describe('WorkoutList', () => {
  const defaultProps = {
    workouts: mockWorkouts,
    onSelectWorkout: vi.fn(),
    onAddWorkout: vi.fn(),
    onEditWorkout: vi.fn(),
    onDeleteWorkout: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onClearAll: vi.fn(),
  };

  it('renders workout names', () => {
    render(<WorkoutList {...defaultProps} />);
    expect(screen.getByText('Treino A')).toBeInTheDocument();
    expect(screen.getByText('Treino B')).toBeInTheDocument();
  });

  it('renders header with title', () => {
    render(<WorkoutList {...defaultProps} />);
    expect(screen.getByText('Treino')).toBeInTheDocument();
  });

  it('renders footer copyright', () => {
    render(<WorkoutList {...defaultProps} />);
    expect(screen.getByText(/2026 Gerenciador de Treino/)).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<WorkoutList {...defaultProps} />);
    expect(screen.getByText('Adicionar Treino')).toBeInTheDocument();
  });

  it('calls onSelectWorkout when clicking a workout', () => {
    render(<WorkoutList {...defaultProps} />);
    fireEvent.click(screen.getByText('Treino A'));
    expect(defaultProps.onSelectWorkout).toHaveBeenCalledWith('w1');
  });

  it('calls onAddWorkout when clicking add button', () => {
    render(<WorkoutList {...defaultProps} />);
    fireEvent.click(screen.getByText('Adicionar Treino'));
    expect(defaultProps.onAddWorkout).toHaveBeenCalled();
  });

  it('calls onEditWorkout when clicking edit button', () => {
    render(<WorkoutList {...defaultProps} />);
    const editButtons = screen.getAllByText('').filter(
      (el) => el.closest('button')?.getAttribute('title') === 'Editar'
    );
    fireEvent.click(editButtons[0].closest('button')!);
    expect(defaultProps.onEditWorkout).toHaveBeenCalledWith('w1');
  });

  it('highlights the last accessed workout with font-bold', () => {
    const workouts: Workout[] = [
      { id: 'w1', name: 'Alpha', exercises: [], lastAccessed: 100 },
      { id: 'w2', name: 'Beta', exercises: [], lastAccessed: 200 },
    ];
    render(<WorkoutList {...defaultProps} workouts={workouts} />);
    const betaRow = screen.getByText('Beta').closest('div[class*="flex items-center border-b"]');
    expect(betaRow).toHaveClass('font-bold');
  });

  it('renders empty list without workouts', () => {
    render(<WorkoutList {...defaultProps} workouts={[]} />);
    expect(screen.getByText('Adicionar Treino')).toBeInTheDocument();
    expect(screen.queryByText('Treino A')).not.toBeInTheDocument();
  });

  it('renders export and import buttons', () => {
    render(<WorkoutList {...defaultProps} />);
    expect(screen.getByText('Exportar')).toBeInTheDocument();
    expect(screen.getByText('Importar')).toBeInTheDocument();
  });

  it('calls onExport when clicking export button', () => {
    render(<WorkoutList {...defaultProps} />);
    fireEvent.click(screen.getByText('Exportar'));
    expect(defaultProps.onExport).toHaveBeenCalled();
  });
});
