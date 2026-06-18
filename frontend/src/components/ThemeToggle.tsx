import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sand-300 bg-white text-ink-soft transition hover:border-brand-300 hover:text-brand dark:border-white/10 dark:bg-night-700 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-200 ${
        className ?? ''
      }`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
