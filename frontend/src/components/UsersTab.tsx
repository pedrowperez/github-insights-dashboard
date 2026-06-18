import { FormEvent, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
import {
  Building2,
  Code2,
  ExternalLink,
  GitFork,
  MapPin,
  Search,
  Star,
  Trophy,
  UserSearch,
  Users,
} from 'lucide-react';
import { api, extractErrorMessage } from '../api/client';
import type { UserProfileResponse, UserSearchResult } from '../types';
import {
  Card,
  EmptyState,
  ErrorBox,
  Pager,
  SectionTitle,
  Skeleton,
  StatCard,
  formatNumber,
} from './ui';
import { ChartTooltip } from './ChartTooltip';
import { AXIS_TICK, CHART_COLORS, CURSOR_FILL, SERIES } from './chartTheme';

const SUGGESTIONS = ['torvalds', 'gaearon', 'sindresorhus', 'antfu', 'tj'];

export function UsersTab() {
  const [term, setTerm] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const searchQuery = useQuery({
    queryKey: ['users-search', submitted, page],
    enabled: submitted.length > 0,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.get<UserSearchResult>('/github/users/search', {
        params: { q: submitted, page },
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

  function runSearch(value: string) {
    if (!value.trim()) return;
    setSelected(null);
    setPage(1);
    setSubmitted(value.trim());
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(term);
  }

  return (
    <div className="space-y-6">
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar usuario do GitHub (ex: torvalds)"
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary sm:w-auto">
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
                runSearch(s);
              }}
              className="chip"
            >
              @{s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
        <div className="space-y-3">
          {searchQuery.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="surface flex items-center gap-3 p-2.5">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchQuery.isError && (
            <ErrorBox message={extractErrorMessage(searchQuery.error)} />
          )}
          {searchQuery.data && searchQuery.data.items.length === 0 && (
            <EmptyState message="Nenhum usuario encontrado." icon={UserSearch} />
          )}
          {!searchQuery.isLoading &&
            searchQuery.data &&
            searchQuery.data.items.length > 0 && (
              <div
                className={`space-y-3 transition-opacity ${
                  searchQuery.isFetching ? 'opacity-60' : ''
                }`}
              >
                <p className="px-1 text-xs text-slate-400">
                  {formatNumber(searchQuery.data.totalCount)} resultados
                </p>
                {searchQuery.data.items.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelected(u.login)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                      selected === u.login
                        ? 'border-brand-300 bg-brand-50 shadow-glow'
                        : 'border-slate-200/70 bg-white hover:border-brand-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.login}
                      className="h-10 w-10 rounded-full ring-2 ring-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {u.login}
                      </p>
                      <p className="text-xs text-slate-400">{u.type}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
                <Pager
                  page={searchQuery.data.page}
                  totalPages={searchQuery.data.totalPages}
                  onChange={setPage}
                  isLoading={searchQuery.isFetching}
                />
              </div>
            )}
          {!submitted && (
            <EmptyState
              title="Comece uma busca"
              message="Digite um nome de usuario ou use uma das sugestoes acima."
              icon={Search}
            />
          )}
        </div>

        <div>
          {!selected && (
            <EmptyState
              title="Nenhum usuario selecionado"
              message="Selecione um usuario na lista para ver perfil, linguagens e repositorios."
              icon={Users}
            />
          )}
          {selected && profileQuery.isFetching && <ProfileSkeleton />}
          {selected && profileQuery.isError && (
            <ErrorBox message={extractErrorMessage(profileQuery.error)} />
          )}
          {selected && !profileQuery.isFetching && profileQuery.data && (
            <ProfileDetails data={profileQuery.data} />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3 py-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    </div>
  );
}

function ProfileDetails({ data }: { data: UserProfileResponse }) {
  const { profile, stats, languages, topRepos } = data;
  const langChart = languages.slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden p-0">
        <div className="h-20 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex flex-col items-start gap-4 sm:flex-row">
            <img
              src={profile.avatarUrl}
              alt={profile.login}
              className="h-20 w-20 rounded-2xl ring-4 ring-white"
            />
            <div className="flex-1 pt-2 sm:pt-10">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={profile.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg font-bold text-slate-900 hover:text-brand"
                >
                  {profile.name ?? profile.login}
                </a>
                <a
                  href={profile.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand"
                >
                  @{profile.login}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {profile.bio && (
                <p className="mt-2 text-sm text-slate-600">{profile.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                {profile.company && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {profile.company}
                  </span>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {formatNumber(profile.followers)} seguidores
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Repos publicos"
          value={formatNumber(profile.publicRepos)}
          icon={Code2}
          accent="brand"
        />
        <StatCard
          label="Total de stars"
          value={formatNumber(stats.totalStars)}
          icon={Star}
          accent="amber"
        />
        <StatCard
          label="Total de forks"
          value={formatNumber(stats.totalForks)}
          icon={GitFork}
          accent="brand"
        />
        <StatCard
          label="Repos analisados"
          value={formatNumber(stats.reposAnalyzed)}
          icon={Trophy}
          accent="slate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={Code2}>Linguagens mais usadas</SectionTitle>
          {langChart.length === 0 ? (
            <EmptyState message="Sem dados de linguagem." icon={Code2} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={langChart}
                  dataKey="count"
                  nameKey="language"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="none"
                >
                  {langChart.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <SectionTitle icon={Star}>Top repositorios (stars x forks)</SectionTitle>
          {topRepos.length === 0 ? (
            <EmptyState message="Sem repositorios." icon={GitFork} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topRepos} barGap={4}>
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
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle icon={Trophy}>Repositorios em destaque</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {topRepos.map((repo) => (
            <a
              key={repo.id}
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-slate-200/70 p-3.5 transition hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-glow"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-slate-900 group-hover:text-brand">
                  {repo.name}
                </p>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-brand" />
              </div>
              {repo.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {repo.description}
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                {repo.language && (
                  <span className="font-medium text-slate-600">
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
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
