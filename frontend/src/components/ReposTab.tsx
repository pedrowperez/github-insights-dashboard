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
import {
  BarChart3,
  CircleDot,
  GitFork,
  Package,
  Search,
  Star,
} from 'lucide-react';
import { api, extractErrorMessage } from '../api/client';
import type { RepoSearchResult } from '../types';
import {
  Card,
  EmptyState,
  ErrorBox,
  SectionTitle,
  Skeleton,
  formatNumber,
} from './ui';
import { ChartTooltip } from './ChartTooltip';
import { AXIS_TICK, CURSOR_FILL, GRID_STROKE, SERIES } from './chartTheme';

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

const SUGGESTIONS = ['react', 'machine learning', 'cli', 'design system'];

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
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar repositorios (ex: machine learning)"
              className="input-field pl-10"
            />
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field sm:w-auto"
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
            className="input-field sm:w-auto"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Ordenar: {s.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary lg:w-auto">
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Sugestoes:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setTerm(s);
                setParams({ q: s, language, sort });
              }}
              className="chip"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {!params && (
        <EmptyState
          title="Explore repositorios"
          message="Busque por um tema e compare stars, forks e issues dos principais resultados."
          icon={Package}
        />
      )}

      {reposQuery.isFetching && (
        <div className="space-y-6">
          <Skeleton className="h-[340px] rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {reposQuery.isError && (
        <ErrorBox message={extractErrorMessage(reposQuery.error)} />
      )}
      {!reposQuery.isFetching &&
        reposQuery.data &&
        reposQuery.data.items.length === 0 && (
          <EmptyState message="Nenhum repositorio encontrado." icon={Search} />
        )}

      {!reposQuery.isFetching &&
        reposQuery.data &&
        reposQuery.data.items.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle icon={BarChart3}>
                  Comparativo dos principais resultados
                </SectionTitle>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {formatNumber(reposQuery.data.totalCount)} repositorios
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barGap={3}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={GRID_STROKE}
                  />
                  <XAxis
                    dataKey="name"
                    tick={AXIS_TICK}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: CURSOR_FILL }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="stars" name="Stars" fill={SERIES.stars} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="forks" name="Forks" fill={SERIES.forks} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="issues" name="Issues" fill={SERIES.issues} radius={[4, 4, 0, 0]} />
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
                  className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={repo.ownerAvatar}
                      alt={repo.owner}
                      className="h-6 w-6 rounded-full ring-1 ring-slate-200"
                    />
                    <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand">
                      {repo.fullName}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="mt-2 line-clamp-2 flex-1 text-xs text-slate-500">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-brand-400" />
                        {repo.language}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <Star className="h-3.5 w-3.5" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-brand">
                      <GitFork className="h-3.5 w-3.5" />
                      {formatNumber(repo.forks)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#b5544a]">
                      <CircleDot className="h-3.5 w-3.5" />
                      {formatNumber(repo.openIssues)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
