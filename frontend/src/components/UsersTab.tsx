import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, extractErrorMessage } from '../api/client';
import type { UserProfileResponse, UserSearchResult } from '../types';
import {
  Card,
  EmptyState,
  ErrorBox,
  Spinner,
  StatCard,
  formatNumber,
} from './ui';

const COLORS = [
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#db2777',
  '#7c3aed',
  '#0891b2',
  '#dc2626',
  '#65a30d',
];

export function UsersTab() {
  const [term, setTerm] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const searchQuery = useQuery({
    queryKey: ['users-search', submitted],
    enabled: submitted.length > 0,
    queryFn: async () => {
      const { data } = await api.get<UserSearchResult>('/github/users/search', {
        params: { q: submitted },
      });
      return data;
    },
  });

  const profileQuery = useQuery({
    queryKey: ['user-profile', selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await api.get<UserProfileResponse>(
        `/github/users/${selected}`,
      );
      return data;
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setSelected(null);
    setSubmitted(term.trim());
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar usuario do GitHub (ex: torvalds)"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
        >
          Buscar
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div>
          {searchQuery.isFetching && <Spinner />}
          {searchQuery.isError && (
            <ErrorBox message={extractErrorMessage(searchQuery.error)} />
          )}
          {searchQuery.data && searchQuery.data.items.length === 0 && (
            <EmptyState message="Nenhum usuario encontrado." />
          )}
          {searchQuery.data && searchQuery.data.items.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                {formatNumber(searchQuery.data.totalCount)} resultados
              </p>
              {searchQuery.data.items.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelected(u.login)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition ${
                    selected === u.login
                      ? 'border-brand bg-brand/5'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.login}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {u.login}
                    </p>
                    <p className="text-xs text-slate-500">{u.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!submitted && (
            <EmptyState message="Busque por um usuario para comecar." />
          )}
        </div>

        <div>
          {!selected && (
            <EmptyState message="Selecione um usuario para ver os detalhes." />
          )}
          {selected && profileQuery.isFetching && <Spinner />}
          {selected && profileQuery.isError && (
            <ErrorBox message={extractErrorMessage(profileQuery.error)} />
          )}
          {profileQuery.data && (
            <ProfileDetails data={profileQuery.data} />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileDetails({ data }: { data: UserProfileResponse }) {
  const { profile, stats, languages, topRepos } = data;
  const langChart = languages.slice(0, 8);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <img
            src={profile.avatarUrl}
            alt={profile.login}
            className="h-20 w-20 rounded-full"
          />
          <div className="flex-1">
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-bold text-slate-900 hover:text-brand"
            >
              {profile.name ?? profile.login}
            </a>
            <p className="text-sm text-slate-500">@{profile.login}</p>
            {profile.bio && (
              <p className="mt-2 text-sm text-slate-600">{profile.bio}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {profile.company && <span>{profile.company}</span>}
              {profile.location && <span>{profile.location}</span>}
              <span>{formatNumber(profile.followers)} seguidores</span>
              <span>{formatNumber(profile.following)} seguindo</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Repos publicos"
          value={formatNumber(profile.publicRepos)}
        />
        <StatCard
          label="Total de stars"
          value={formatNumber(stats.totalStars)}
          accent="text-amber-500"
        />
        <StatCard
          label="Total de forks"
          value={formatNumber(stats.totalForks)}
          accent="text-emerald-600"
        />
        <StatCard
          label="Repos analisados"
          value={formatNumber(stats.reposAnalyzed)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold text-slate-900">
            Linguagens mais usadas
          </h3>
          {langChart.length === 0 ? (
            <EmptyState message="Sem dados de linguagem." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={langChart}
                  dataKey="count"
                  nameKey="language"
                  outerRadius={90}
                  label
                >
                  {langChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold text-slate-900">
            Top repositorios (stars x forks)
          </h3>
          {topRepos.length === 0 ? (
            <EmptyState message="Sem repositorios." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topRepos}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stars" name="Stars" fill="#f59e0b" />
                <Bar dataKey="forks" name="Forks" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold text-slate-900">
          Repositorios em destaque
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {topRepos.map((repo) => (
            <a
              key={repo.id}
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 p-3 transition hover:border-brand hover:bg-brand/5"
            >
              <p className="font-medium text-slate-900">{repo.name}</p>
              {repo.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {repo.description}
                </p>
              )}
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                {repo.language && <span>{repo.language}</span>}
                <span>* {formatNumber(repo.stars)}</span>
                <span>fork {formatNumber(repo.forks)}</span>
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
