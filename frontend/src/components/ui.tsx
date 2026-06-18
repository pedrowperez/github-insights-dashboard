import type { ComponentType, ReactNode } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  type LucideProps,
} from 'lucide-react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400 dark:text-slate-500">
      <Loader2 className="h-7 w-7 animate-spin text-brand dark:text-brand-300" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`skeleton animate-shimmer rounded-lg ${className ?? 'h-4 w-full'}`}
    />
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
}: {
  title?: string;
  message: string;
  icon?: ComponentType<LucideProps>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center animate-fade-in dark:border-white/10 dark:bg-night-800/40">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-night-700 dark:text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
      {title && (
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </p>
      )}
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}

const ACCENTS: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200',
  amber: 'bg-amber-50 text-[#c08a2e] dark:bg-amber-500/15 dark:text-amber-300',
  emerald:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  rose: 'bg-[#f6eceb] text-[#b5544a] dark:bg-rose-500/15 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'slate',
}: {
  label: string;
  value: ReactNode;
  icon?: ComponentType<LucideProps>;
  accent?: keyof typeof ACCENTS | string;
}) {
  return (
    <div className="surface flex items-center gap-3 p-4 transition hover:shadow-glow">
      {Icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            ACCENTS[accent] ?? ACCENTS.slate
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`surface p-5 ${className ?? ''}`}>{children}</div>;
}

export function SectionTitle({
  icon: Icon,
  children,
}: {
  icon?: ComponentType<LucideProps>;
  children: ReactNode;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
      {Icon && <Icon className="h-4 w-4 text-brand dark:text-brand-300" />}
      {children}
    </h3>
  );
}

export function Pager({
  page,
  totalPages,
  onChange,
  isLoading,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  isLoading?: boolean;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1 || isLoading}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-brand-300 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-night-700 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-200"
        aria-label="Pagina anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Pagina {page} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages || isLoading}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-brand-300 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-night-700 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-200"
        aria-label="Proxima pagina"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return new Intl.NumberFormat('pt-BR').format(n);
}

export function formatFull(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n);
}
