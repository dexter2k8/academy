import { ArrowLeft, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
}

export function Header({ title, subtitle, showBack, onBack, showMenu }: HeaderProps) {
  return (
    <div className="bg-red-500 text-white p-4 flex items-center gap-3">
      {showMenu && (
        <button className="p-1">
          <Menu size={24} />
        </button>
      )}
      {showBack && (
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} />
        </button>
      )}
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
      </div>
    </div>
  );
}
