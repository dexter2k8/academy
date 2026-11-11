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
    expect(screen.getByText('Exercício 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('3 x 30s')).toBeInTheDocument();
  });

  it('navigates back from exercise to detail', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    fireEvent.click(screen.getByText('Prancha'));
    const backBtn = screen.getByText(/Exercício/).closest('header')!.querySelector('button')!;
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

describe('App - Botão voltar do Android (popstate)', () => {
  it('volta da tela de exercício para o detalhe do treino', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    fireEvent.click(screen.getByText('Prancha'));
    expect(screen.getByText('Exercício 1 de 2')).toBeInTheDocument();

    fireEvent.popState(window);

    expect(screen.queryByText('Exercício 1 de 2')).not.toBeInTheDocument();
    expect(screen.getByText('Prancha')).toBeInTheDocument();
    expect(screen.getByText('Agachamento')).toBeInTheDocument();
  });

  it('volta do treino para o menu inicial', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));
    expect(screen.queryByText('Escolha uma rotina')).not.toBeInTheDocument();

    fireEvent.popState(window);

    expect(screen.getByText('Escolha uma rotina')).toBeInTheDocument();
  });

  it('volta do formulário para o menu inicial', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Adicionar Treino'));
    expect(screen.getByText('Novo Treino')).toBeInTheDocument();

    fireEvent.popState(window);

    expect(screen.getByText('Escolha uma rotina')).toBeInTheDocument();
  });

  it('no menu inicial, o voltar abre o popup de confirmação', () => {
    render(<App />);

    fireEvent.popState(window);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Sair da aplicação?')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('cancelar no popup mantém o aplicativo aberto', () => {
    render(<App />);
    fireEvent.popState(window);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Escolha uma rotina')).toBeInTheDocument();
  });

  it('confirmar a saída fecha o popup e tenta encerrar a aplicação', () => {
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
    const { unmount } = render(<App />);
    fireEvent.popState(window);

    fireEvent.click(screen.getByText('Sair'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(closeSpy).toHaveBeenCalled();

    // remove o listener antes do "traversal" assíncrono do jsdom disparar
    unmount();
    closeSpy.mockRestore();
  });

  it('com todos os exercícios marcados, voltar desmarca todos', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));

    // marca todos os exercícios do treino
    ['Prancha', 'Agachamento'].forEach((name) => {
      const row = screen.getByText(name).closest('div')!;
      fireEvent.click(row.querySelector('button')!);
    });
    expect(screen.getByText(/Feito 2 de 2/)).toBeInTheDocument();

    // volta para o menu pelo botão da tela
    const backBtn = screen.getByText('Treino Tempo').closest('header')!.querySelector('button')!;
    fireEvent.click(backBtn);
    expect(screen.getByText('Escolha uma rotina')).toBeInTheDocument();

    // reentra: tudo desmarcado
    fireEvent.click(screen.getByText('Treino Tempo'));
    expect(screen.getByText(/Feito 0 de 2/)).toBeInTheDocument();
    expect(screen.getByText('0% Completo')).toBeInTheDocument();
  });

  it('com apenas parte marcada, voltar mantém as marcações', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));

    const row = screen.getByText('Prancha').closest('div')!;
    fireEvent.click(row.querySelector('button')!);
    expect(screen.getByText(/Feito 1 de 2/)).toBeInTheDocument();

    const backBtn = screen.getByText('Treino Tempo').closest('header')!.querySelector('button')!;
    fireEvent.click(backBtn);

    fireEvent.click(screen.getByText('Treino Tempo'));
    expect(screen.getByText(/Feito 1 de 2/)).toBeInTheDocument();
    expect(screen.getByText('50% Completo')).toBeInTheDocument();
  });

  it('o voltar físico também desmarca tudo ao sair do treino', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Treino Tempo'));

    ['Prancha', 'Agachamento'].forEach((name) => {
      const row = screen.getByText(name).closest('div')!;
      fireEvent.click(row.querySelector('button')!);
    });
    expect(screen.getByText(/Feito 2 de 2/)).toBeInTheDocument();

    fireEvent.popState(window);
    expect(screen.getByText('Escolha uma rotina')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Treino Tempo'));
    expect(screen.getByText(/Feito 0 de 2/)).toBeInTheDocument();
  });
});
