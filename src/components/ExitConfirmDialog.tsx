interface ExitConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmDialog({ onConfirm, onCancel }: ExitConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="exit-confirm-title" className="text-lg font-bold text-gray-800">
          Sair da aplicação?
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Deseja encerrar o Gerenciador de Treino?
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 min-h-11 rounded text-sm font-medium text-gray-700 active:bg-gray-100 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 min-h-11 rounded text-sm font-medium text-white bg-red-500 active:bg-red-600 cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
