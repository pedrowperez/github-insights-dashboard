import { FormEvent, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
  Pager,
  SectionTitle,
  Skeleton,
  formatNumber,
} from './ui';
import { ChartTooltip } from './ChartTooltip';
import { SERIES, useChartColors } from './chartTheme';

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
  const [page, setPage] = useState(1);
  const [params, setParams] = useState<{
    q: string;
    language: string;
    sort: string;
  } | null>(null);

  const reposQuery = useQuery({
    queryKey: ['repos-search', params, page],
    enabled: !!params,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.get<RepoSearchResult>('/github/repos/search', {
        params: {
          q: params!.q,
          language: params!.language || undefined,
          sort: params!.sort,
          page,
        },
      });
      return data;
    },
  });

  function startSearch(next: { q: string; language: string; sort: string }) {
    setPage(1);
    setParams(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    startSearch({ q: term.trim(), language, sort });
  }

  const { axisTick, gridStroke, cursorFill } = useChartColors();

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
            className="input-field lg:w-auto"
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
            className="input-field lg:w-auto"
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
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Sugestoes:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setTerm(s);
                startSearch({ q: s, language, sort });
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

      {reposQuery.isLoading && (
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
      {!reposQuery.isLoading &&
        reposQuery.data &&
        reposQuery.data.items.length === 0 && (
          <EmptyState message="Nenhum repositorio encontrado." icon={Search} />
        )}

      {!reposQuery.isLoading &&
        reposQuery.data &&
        reposQuery.data.items.length > 0 && (
          <div
            className={`space-y-6 animate-fade-in transition-opacity ${
              reposQuery.isFetching ? 'opacity-60' : ''
            }`}
          >
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle icon={BarChart3}>
                  Comparativo dos principais resultados
                </SectionTitle>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-night-700 dark:text-slate-300">
                  {formatNumber(reposQuery.data.totalCount)} repositorios
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barGap={3}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gridStroke}
                  />
                  <XAxis
                    dataKey="name"
                    tick={axisTick}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill }} />
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
                  className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow dark:border-white/10 dark:bg-night-800 dark:shadow-none dark:hover:border-brand-400/40"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={repo.ownerAvatar}
                      alt={repo.owner}
                      className="h-6 w-6 rounded-full ring-1 ring-slate-200 dark:ring-night-600"
                    />
                    <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand dark:text-slate-100 dark:group-hover:text-brand-300">
                      {repo.fullName}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="mt-2 line-clamp-2 flex-1 text-xs text-slate-500 dark:text-slate-400">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                        <span className="h-2 w-2 rounded-full bg-brand-400" />
                        {repo.language}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Star className="h-3.5 w-3.5" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-brand dark:text-brand-300">
                      <GitFork className="h-3.5 w-3.5" />
                      {formatNumber(repo.forks)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#b5544a] dark:text-rose-400">
                      <CircleDot className="h-3.5 w-3.5" />
                      {formatNumber(repo.openIssues)}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <Pager
              page={reposQuery.data.page}
              totalPages={reposQuery.data.totalPages}
              onChange={setPage}
              isLoading={reposQuery.isFetching}
            />
          </div>
        )}
    </div>
  );
}
