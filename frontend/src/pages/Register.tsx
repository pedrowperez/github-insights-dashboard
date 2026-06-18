import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../api/client';
import { AuthLayout } from '../components/AuthLayout';

export function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordStrength = getStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Nao foi possivel cadastrar.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para explorar dados do GitHub"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Nome
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field pl-10"
              placeholder="Seu nome"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="voce@email.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Senha
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 pr-10"
              placeholder="Minimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              aria-label="Mostrar senha"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full transition ${
                      i < passwordStrength.level
                        ? passwordStrength.color
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ja tem conta?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}

function getStrength(password: string): {
  level: number;
  label: string;
  color: string;
} {
  if (password.length === 0) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: 'Fraca', color: 'bg-rose-400' };
  if (score === 2) return { level: 2, label: 'Media', color: 'bg-amber-400' };
  return { level: 3, label: 'Forte', color: 'bg-emerald-500' };
}
