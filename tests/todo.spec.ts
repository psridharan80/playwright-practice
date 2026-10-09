import { test, expect } from '@playwright/test';

// Practice site: https://demo.playwright.dev/todomvc
test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

test('adds a todo', async ({ page }) => {
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Buy milk');
  await input.press('Enter');

  await expect(page.getByTestId('todo-title')).toHaveText(['Buy milk']);
});

test('completing a todo updates the counter', async ({ page }) => {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of ['Buy milk', 'Walk dog', 'Write tests']) {
    await input.fill(item);
    await input.press('Enter');
  }

  await page.getByTestId('todo-item').filter({ hasText: 'Walk dog' }).getByRole('checkbox').check();

  await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
});

test('Completed filter shows only completed todos', async ({ page }) => {
  // TODO (your turn): add three todos, complete one, click the "Completed"
  // link, and assert only that one todo is visible.
  // Hint: page.getByRole('link', { name: 'Completed' })
  test.fixme();
});
