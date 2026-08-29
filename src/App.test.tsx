import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

vi.mock('./hooks/useWorkoutDB', () => ({
  useWorkoutDB: (_initialValue: unknown) => ({ workouts: _initialValue, setWorkouts: vi.fn(), loaded: true }),
  saveImage: vi.fn(),
  getImage: vi.fn(),
  deleteImage: vi.fn(),
  resolveImageUrl: vi.fn(),
  isIdbImageKey: vi.fn(() => false),
}));

describe('App', () => {
  it('renders the workout list', () => {
    render(<App />);
    expect(screen.getByText('Treino')).toBeInTheDocument();
    expect(screen.getByText('Treino A')).toBeInTheDocument();
    expect(screen.getByText('Treino B')).toBeInTheDocument();
  });
});
