import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutForm } from '../components/WorkoutForm';
import type { Workout } from '../types/workout';

vi.mock('../hooks/useWorkoutDB', async () => ({
  saveImage: vi.fn(),
  getImage: vi.fn().mockResolvedValue(null),
  deleteImage: vi.fn(),
  resolveImageUrl: vi.fn(),
  isIdbImageKey: vi.fn(() => false),
}));

describe('WorkoutForm - New Workout', () => {
  const defaultProps = {
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Novo Treino" title', () => {
    render(<WorkoutForm {...defaultProps} />);
    expect(screen.getByText('Novo Treino')).toBeInTheDocument();
  });

  it('renders name input', () => {
    render(<WorkoutForm {...defaultProps} />);
    expect(screen.getByPlaceholderText('Ex: Treino A')).toBeInTheDocument();
  });

  it('renders default exercise fields', () => {
    render(<WorkoutForm {...defaultProps} />);
    expect(screen.getByText('Exercício 1')).toBeInTheDocument();
  });

  it('renders save and cancel buttons', () => {
    render(<WorkoutForm {...defaultProps} />);
    expect(screen.getByText('Salvar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('calls onCancel when clicking cancel', () => {
    render(<WorkoutForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('does not call onSave when name is empty', () => {
    render(<WorkoutForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Salvar'));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with correct data when form is valid', () => {
    render(<WorkoutForm {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Ex: Treino A'), {
      target: { value: 'Treino Novo' },
    });
    const exerciseNameInputs = screen.getAllByPlaceholderText('Ex: Curl com barra');
    fireEvent.change(exerciseNameInputs[0], { target: { value: 'Curl' } });
    fireEvent.click(screen.getByText('Salvar'));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Treino Novo',
        exercises: expect.arrayContaining([expect.objectContaining({ name: 'Curl' })]),
      })
    );
  });

  it('adds a new exercise when clicking add button', () => {
    render(<WorkoutForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Adicionar Exercício'));
    expect(screen.getByText('Exercício 1')).toBeInTheDocument();
    expect(screen.getByText('Exercício 2')).toBeInTheDocument();
  });

  it('removes exercise when clicking remove button', () => {
    render(<WorkoutForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Adicionar Exercício'));
    const removeButtons = screen.getAllByText('').filter(
      (el) => el.closest('button')?.querySelector('svg')?.classList.contains('lucide-trash2')
    );
    fireEvent.click(removeButtons[0].closest('button')!);
    expect(screen.queryByText('Exercício 2')).not.toBeInTheDocument();
  });

  it('does not show remove button when only 1 exercise', () => {
    render(<WorkoutForm {...defaultProps} />);
    const trashButtons = screen.queryAllByTitle('Excluir');
    expect(trashButtons.length).toBe(0);
  });
});

describe('WorkoutForm - Edit Workout', () => {
  const existingWorkout: Workout = {
    id: 'w1',
    name: 'Treino Existente',
    exercises: [
      {
        id: 'e1', name: 'Curl', type: 'repetition',
        recommendedSets: 3, recommendedRepsMin: 10, recommendedRepsMax: 15, recommendedWeight: 10,
        series: [
          { id: 's1', reps: 10, weight: 10, completed: false },
          { id: 's2', reps: 12, weight: 10, completed: false },
          { id: 's3', reps: 15, weight: 10, completed: false },
        ],
      },
    ],
  };

  it('renders "Editar Treino" title', () => {
    render(<WorkoutForm workout={existingWorkout} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Editar Treino')).toBeInTheDocument();
  });

  it('pre-fills workout name', () => {
    render(<WorkoutForm workout={existingWorkout} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByDisplayValue('Treino Existente')).toBeInTheDocument();
  });

  it('pre-fills exercise name', () => {
    render(<WorkoutForm workout={existingWorkout} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByDisplayValue('Curl')).toBeInTheDocument();
  });
});

describe('WorkoutForm - Exercise Type', () => {
  it('renders type buttons', () => {
    render(<WorkoutForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Repetição')).toBeInTheDocument();
    expect(screen.getByText('Temporizado')).toBeInTheDocument();
    expect(screen.getByText('HIIT')).toBeInTheDocument();
  });

  it('shows repetition fields by default', () => {
    render(<WorkoutForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Séries')).toBeInTheDocument();
    expect(screen.getByText('Carga (Kg)')).toBeInTheDocument();
    expect(screen.getByText('Reps Mín')).toBeInTheDocument();
  });

  it('shows timed fields when selecting timed type', () => {
    render(<WorkoutForm onSave={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('Temporizado'));
    expect(screen.getByText('Duração (seg)')).toBeInTheDocument();
  });

  it('shows HIIT fields when selecting hiit type', () => {
    render(<WorkoutForm onSave={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('HIIT'));
    expect(screen.getByText('Rodadas')).toBeInTheDocument();
    expect(screen.getByText('Prep (seg)')).toBeInTheDocument();
    expect(screen.getByText('Trabalho (seg)')).toBeInTheDocument();
    expect(screen.getByText('Desc (seg)')).toBeInTheDocument();
  });
});
