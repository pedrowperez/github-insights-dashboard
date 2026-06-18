import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from '../api/client';
import type { AuthResponse, AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));

    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<AuthUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    setToken(data.accessToken);
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    setToken(data.accessToken);
    setUser(data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
