import { ChevronRight, Pencil, Trash2, Download, Upload, Eraser } from 'lucide-react';
import { useRef } from 'react';
import type { Workout } from '../types/workout';

interface WorkoutListProps {
  workouts: Workout[];
  onSelectWorkout: (id: string) => void;
  onAddWorkout: () => void;
  onEditWorkout: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClearAll: () => void;
}

export function WorkoutList({ workouts, onSelectWorkout, onAddWorkout, onEditWorkout, onDeleteWorkout, onExport, onImport, onClearAll }: WorkoutListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastAccessedId = workouts
    .filter((w) => w.lastAccessed)
    .sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))[0]?.id ?? null;

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Deseja excluir o treino "${name}"?`)) {
      onDeleteWorkout(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onEditWorkout(id);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Deseja excluir TODOS os treinos? Esta ação não pode ser desfeita.')) {
      onClearAll();
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-gray-100 safe-area-inset">
      <header className="bg-red-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold">Treino</h1>
      </header>

      <main className="flex-1 p-3 sm:p-4 pb-20">
        <p className="text-gray-600 mb-1 text-sm sm:text-base">Escolha uma rotina</p>
        <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Para melhor desempenho, escolha a rotina em destaque.</p>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {workouts.map((workout, index) => (
            <div
              key={workout.id}
              className={`flex items-center border-b border-gray-100 min-h-14 ${
                workout.id === lastAccessedId ? 'font-bold' : ''
              }`}
            >
              <button
                onClick={() => onSelectWorkout(workout.id)}
                className="flex-1 flex items-center justify-between px-4 py-3 sm:py-4 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center font-bold text-sm shrink-0">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800 text-sm sm:text-base">{workout.name}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 shrink-0" />
              </button>
              
              <div className="flex items-center pr-2 gap-1">
                <button
                  onClick={(e) => handleEdit(e, workout.id)}
                  className="p-2 text-gray-400 hover:text-blue-500 active:text-blue-600 min-w-10 min-h-10 flex items-center justify-center"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, workout.id, workout.name)}
                  className="p-2 text-gray-400 hover:text-red-500 active:text-red-600 min-w-10 min-h-10 flex items-center justify-center"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={onAddWorkout}
            className="w-full flex items-center justify-center px-4 py-3 sm:py-4 text-red-500 active:bg-gray-50 transition-colors min-h-14"
          >
            <span className="text-2xl mr-2 leading-none">+</span>
            <span className="text-sm sm:text-base">Adicionar Treino</span>
          </button>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 justify-center items-center sticky bottom-0 z-10 safe-area-bottom">
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 active:bg-gray-100 rounded transition-colors min-h-10 cursor-pointer"
          title="Exportar treinos"
        >
          <Download size={14} />
          <span>Exportar</span>
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 active:bg-gray-100 rounded transition-colors min-h-10 cursor-pointer"
          title="Importar treinos"
        >
          <Upload size={14} />
          <span>Importar</span>
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={handleDeleteAll}
          className="flex items-center gap-1 px-3 py-2 text-xs text-red-400 hover:text-red-600 active:bg-red-50 rounded transition-colors min-h-10 cursor-pointer"
          title="Limpar todos os treinos"
        >
          <Eraser size={14} />
          <span>Limpar</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = '';
          }}
        />
        <span className="text-gray-300">|</span>
        <p className="text-xs text-gray-400">&copy; 2026 Gerenciador de Treino</p>
      </footer>
    </div>
  );
}
