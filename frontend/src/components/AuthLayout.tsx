import type { ReactNode } from 'react';
import { BarChart3, GitBranch, Search, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: Search, text: 'Busque usuarios e repositorios em tempo real' },
  { icon: BarChart3, text: 'Visualize linguagens e metricas em graficos' },
  { icon: ShieldCheck, text: 'Acesso protegido por autenticacao JWT' },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />

        <div className="relative flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <GitBranch className="h-6 w-6" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            GitHub Insights
          </span>
        </div>

        <div className="relative text-white">
          <h2 className="max-w-md text-3xl font-extrabold leading-tight">
            Dados do GitHub transformados em insights visuais.
          </h2>
          <p className="mt-3 max-w-md text-brand-100">
            Explore perfis, compare repositorios e entenda tendencias de
            linguagens em um dashboard rapido e seguro.
          </p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-200">
          Consumindo a API publica do GitHub - api.github.com
        </p>
      </div>

      {/* Painel do formulario */}
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white">
              <GitBranch className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold text-slate-900">
              GitHub Insights
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
