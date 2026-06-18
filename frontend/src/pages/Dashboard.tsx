import { useState } from 'react';
import { GitBranch, LogOut, Package, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UsersTab } from '../components/UsersTab';
import { ReposTab } from '../components/ReposTab';

type Tab = 'users' | 'repos';

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'repos', label: 'Repositorios', icon: Package },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
              <GitBranch className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold text-slate-900">
                GitHub Insights
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">
                Dashboard de dados publicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {initials || 'U'}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-slate-800">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-ghost"
              title="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Explorar GitHub
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pesquise usuarios e repositorios e visualize metricas em tempo real.
          </p>
        </div>

        <div className="mb-7 inline-flex rounded-2xl border border-slate-200/70 bg-white p-1 shadow-soft">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === id
                  ? 'bg-brand text-white shadow-glow'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div key={tab} className="animate-fade-in">
          {tab === 'users' ? <UsersTab /> : <ReposTab />}
        </div>
      </main>
    </div>
  );
}
