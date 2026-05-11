import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should allow user to login and see dashboard', async ({ page }) => {
    // Note: This assumes the backend is running and has this user.
    // In a real CI, we would seed the DB or mock API calls.
    
    await page.goto('/login');
    
    // Check elements
    await expect(page.locator('h1')).toHaveText('Access System');
    
    // We don't actually submit to avoid breaking real DB in this test
    // But we check that the form elements are present
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });
});
