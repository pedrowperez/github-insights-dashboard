import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

function renderLogin() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  it('renderiza os campos de e-mail e senha e o botao de entrar', () => {
    renderLogin();
    expect(
      screen.getByRole('heading', { name: /entrar/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/voce@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/sua senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('exibe o link para cadastro', () => {
    renderLogin();
    expect(
      screen.getByRole('link', { name: /cadastre-se/i }),
    ).toBeInTheDocument();
  });
});
