import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { extractErrorMessage } from './client';

describe('extractErrorMessage', () => {
  it('retorna a mensagem string vinda da API', () => {
    const error = new AxiosError('falha');
    error.response = {
      data: { message: 'Credenciais invalidas.' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
    };
    expect(extractErrorMessage(error)).toBe('Credenciais invalidas.');
  });

  it('junta mensagens quando a API retorna um array (validacao)', () => {
    const error = new AxiosError('falha');
    error.response = {
      data: { message: ['email invalido', 'senha curta'] },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    };
    expect(extractErrorMessage(error)).toBe('email invalido, senha curta');
  });

  it('usa o fallback quando o erro nao e um AxiosError', () => {
    expect(extractErrorMessage(new Error('x'), 'fallback')).toBe('fallback');
  });
});
