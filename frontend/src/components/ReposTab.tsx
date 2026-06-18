import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, extractErrorMessage } from '../api/client';
import type { RepoSearchResult } from '../types';
import { Card, EmptyState, ErrorBox, Spinner, formatNumber } from './ui';

const LANGUAGES = [
  '',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C#',
  'PHP',
  'Ruby',
];

const SORTS = [
  { value: 'stars', label: 'Stars' },
  { value: 'forks', label: 'Forks' },
  { value: 'updated', label: 'Atualizacao' },
];

export function ReposTab() {
  const [term, setTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState('stars');
  const [params, setParams] = useState<{
    q: string;
    language: string;
    sort: string;
  } | null>(null);

  const reposQuery = useQuery({
    queryKey: ['repos-search', params],
    enabled: !!params,
    queryFn: async () => {
      const { data } = await api.get<RepoSearchResult>('/github/repos/search', {
        params: {
          q: params!.q,
          language: params!.language || undefined,
          sort: params!.sort,
        },
      });
      return data;
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setParams({ q: term.trim(), language, sort });
  }

  const chartData =
    reposQuery.data?.items.slice(0, 8).map((r) => ({
      name: r.name.length > 12 ? `${r.name.slice(0, 12)}...` : r.name,
      stars: r.stars,
      forks: r.forks,
      issues: r.openIssues,
    })) ?? [];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar repositorios (ex: machine learning)"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-brand"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l === '' ? 'Todas linguagens' : l}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-brand"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Ordenar: {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
        >
          Buscar
        </button>
      </form>

      {!params && (
        <EmptyState message="Busque por repositorios para visualizar os dados." />
      )}
      {reposQuery.isFetching && <Spinner />}
      {reposQuery.isError && (
        <ErrorBox message={extractErrorMessage(reposQuery.error)} />
      )}
      {reposQuery.data && reposQuery.data.items.length === 0 && (
        <EmptyState message="Nenhum repositorio encontrado." />
      )}

      {reposQuery.data && reposQuery.data.items.length > 0 && (
        <>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Comparativo dos principais resultados
              </h3>
              <span className="text-xs text-slate-500">
                {formatNumber(reposQuery.data.totalCount)} repositorios
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                <Bar dataKey="issues" name="Issues abertas" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reposQuery.data.items.map((repo) => (
              <a
                key={repo.id}
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={repo.ownerAvatar}
                    alt={repo.owner}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="truncate text-sm font-medium text-slate-900">
                    {repo.fullName}
                  </span>
                </div>
                {repo.description && (
                  <p className="mt-2 line-clamp-2 flex-1 text-xs text-slate-500">
                    {repo.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  {repo.language && (
                    <span className="font-medium text-slate-700">
                      {repo.language}
                    </span>
                  )}
                  <span className="text-amber-500">
                    * {formatNumber(repo.stars)}
                  </span>
                  <span className="text-emerald-600">
                    fork {formatNumber(repo.forks)}
                  </span>
                  <span className="text-red-500">
                    issues {formatNumber(repo.openIssues)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
