import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/');
});

test('home page loads', async ({ page }) => {
  await expect(page).toHaveURL(/rahulshettyacademy\.com/);
  await expect(page).toHaveTitle(/Rahul Shetty Academy/i);
  await expect(page.getByRole('link', { name: 'Sign Up', exact: true })).toBeVisible();
});

test('top navigation links go to the right pages', async ({ page }) => {
  const nav = page.getByRole('navigation');

  await nav.getByRole('link', { name: 'Learning Paths' }).click();
  await expect(page).toHaveURL(/learning-path/i);

  await page.getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/course-library/i);

  await nav.getByRole('link', { name: 'Mentorship' }).click();
  await expect(page).toHaveURL(/mentorship/i);
  await expect(page.getByRole('heading').first()).toBeVisible();
});

test('sign up form accepts input and rejects a bad email', async ({ page }) => {
  // Sign Up opens in a new tab, so wait for the popup
  const signupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Sign Up', exact: true }).click();
  const signup = await signupPromise;

  const name = signup.getByTestId('name-input');
  const email = signup.getByTestId('email-input');
  const marketing = signup.getByTestId('allow-marketing-emails');

  await expect(name).toBeVisible();

  await name.fill('Test User');
  await expect(name).toHaveValue('Test User');

  await marketing.check();
  await expect(marketing).toBeChecked();

  // Invalid email: the form should show an error instead of creating an account
  await email.fill('not-an-email');
  await signup.getByTestId('btn-signup').click();
  await expect(signup.getByTestId('email-input-error')).toBeVisible();
});
