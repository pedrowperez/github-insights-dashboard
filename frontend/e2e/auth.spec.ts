import { expect, test } from '@playwright/test';

// Smoke test do fluxo de autenticacao no frontend.
// Nao depende do backend: valida render, validacao de formulario e navegacao.
test.describe('Autenticacao', () => {
  test('a pagina de login renderiza os campos e o botao', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('button', { name: /entrar/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/senha/i).first()).toBeVisible();
  });

  test('rota protegida redireciona para o login quando deslogado', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('permite navegar de login para cadastro', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /cadastre-se/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});
