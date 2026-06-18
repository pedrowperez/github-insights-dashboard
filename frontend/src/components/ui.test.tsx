import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Star } from 'lucide-react';
import { EmptyState, StatCard, formatFull, formatNumber } from './ui';

describe('formatNumber', () => {
  it('mantem numeros pequenos formatados em pt-BR', () => {
    expect(formatNumber(950)).toBe('950');
  });

  it('abrevia milhares com sufixo k', () => {
    expect(formatNumber(1500)).toBe('1.5k');
  });

  it('abrevia milhoes com sufixo M', () => {
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });
});

describe('formatFull', () => {
  it('formata o numero completo sem abreviar', () => {
    expect(formatFull(2_500_000)).toBe('2.500.000');
  });
});

describe('StatCard', () => {
  it('renderiza label e valor', () => {
    render(<StatCard label="Total de stars" value="135" icon={Star} />);
    expect(screen.getByText('Total de stars')).toBeInTheDocument();
    expect(screen.getByText('135')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renderiza titulo e mensagem', () => {
    render(<EmptyState title="Sem dados" message="Faca uma busca" />);
    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.getByText('Faca uma busca')).toBeInTheDocument();
  });
});
