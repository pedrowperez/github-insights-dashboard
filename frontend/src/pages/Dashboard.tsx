import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UsersTab } from '../components/UsersTab';
import { ReposTab } from '../components/ReposTab';

type Tab = 'users' | 'repos';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">
              GitHub Insights
            </span>
            <span className="hidden rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand sm:inline">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Ola, <strong>{user?.name}</strong>
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab('users')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === 'users'
                ? 'bg-brand text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setTab('repos')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === 'repos'
                ? 'bg-brand text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Repositorios
          </button>
        </div>

        {tab === 'users' ? <UsersTab /> : <ReposTab />}
      </main>
    </div>
  );
}
