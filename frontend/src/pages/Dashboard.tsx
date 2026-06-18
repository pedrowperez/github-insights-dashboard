import { useEffect, useState, type ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  LogOut,
  Menu,
  Package,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UsersTab } from '../components/UsersTab';
import { ReposTab } from '../components/ReposTab';
import { ThemeToggle } from '../components/ThemeToggle';

type Tab = 'users' | 'repos';

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'repos', label: 'Repositorios', icon: Package },
];

const COLLAPSE_KEY = 'gh_dashboard_sidebar_collapsed';

function SidebarLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`sidebar-label ${className}`}>{children}</span>;
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true',
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  function selectTab(id: Tab) {
    setTab(id);
    setSidebarOpen(false);
  }

  const navItemCollapsed = collapsed
    ? 'lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:gap-0 lg:px-0 lg:py-0'
    : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-night-900">
      {/* Backdrop do drawer (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        data-collapsed={collapsed}
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/70 bg-white transition-[width,transform] duration-300 ease-in-out dark:border-white/10 dark:bg-night-800 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}`}
      >
        {/* Botao flutuante de recolher/expandir (desktop) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-7 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-soft transition hover:text-brand dark:border-white/10 dark:bg-night-700 dark:text-slate-300 dark:hover:text-brand-200 lg:flex"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Topo: marca */}
        <div
          className={`flex h-[72px] shrink-0 items-center gap-2.5 px-5 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
            <GitBranch className="h-5 w-5" />
          </div>
          <SidebarLabel className="min-w-0 flex-1">
            <span className="block leading-tight">
              <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                GitHub Insights
              </span>
              <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                Dados publicos
              </span>
            </span>
          </SidebarLabel>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-night-700 dark:hover:text-slate-200 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegacao */}
        <nav
          className={`flex-1 space-y-1 overflow-y-auto px-3 ${
            collapsed ? 'lg:px-2 lg:pt-1' : ''
          }`}
        >
          <p className="sidebar-section-title px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Explorar
          </p>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => selectTab(id)}
              title={collapsed ? label : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${navItemCollapsed} ${
                tab === id
                  ? 'bg-brand text-white shadow-glow'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-night-700'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <SidebarLabel>{label}</SidebarLabel>
            </button>
          ))}
        </nav>

        {/* Rodape: dados do usuario */}
        <div
          className={`mt-auto shrink-0 border-t border-slate-200/70 p-3 dark:border-white/10 ${
            collapsed ? 'lg:px-2' : ''
          }`}
        >
          <div
            className={`flex items-center gap-2.5 px-2 py-2 ${
              collapsed ? 'lg:justify-center lg:gap-0 lg:px-0' : ''
            }`}
            title={collapsed ? `${user?.name} (${user?.email})` : undefined}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
              {initials || 'U'}
            </div>
            <SidebarLabel className="min-w-0 flex-1">
              <span className="block leading-tight">
                <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {user?.name}
                </span>
                <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                  {user?.email}
                </span>
              </span>
            </SidebarLabel>
          </div>
        </div>
      </aside>

      {/* Area principal */}
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        }`}
      >
        {/* Barra superior: menu mobile + acoes do usuario (direita) */}
        <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur dark:border-white/10 dark:bg-night-800/80 sm:px-6">
          {/* Esquerda: hamburguer (mobile) + titulo curto */}
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-night-700 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-0 sm:block lg:hidden">
              <p className="truncate font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                GitHub Insights
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                Dashboard
              </p>
            </div>
          </div>

          {/* Direita: tema e sair */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="btn-ghost"
              title="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Explorar GitHub
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pesquise usuarios e repositorios e visualize metricas em tempo
              real.
            </p>
          </div>

          <div key={tab} className="animate-fade-in">
            {tab === 'users' ? <UsersTab /> : <ReposTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
