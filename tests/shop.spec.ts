import { test, expect, Page } from '@playwright/test';

// Practice shop: https://rahulshettyacademy.com/client
// Test account on a demo site. In a real project, read credentials from
// environment variables instead of committing them.
const USER = {
  email: 'first.last@email.com',
  password: 'Test1234',
};
const PRODUCT = 'ADIDAS ORIGINAL';

async function login(page: Page) {
  await page.goto('https://rahulshettyacademy.com/client');
  await page.getByPlaceholder('email@example.com').fill(USER.email);
  await page.getByPlaceholder('enter your passsword').fill(USER.password); // site's typo
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test.describe('Shop', () => {
  test('new user can register', async ({ page }) => {
    // Unique email per run, so the test can be repeated
    const email = `first.last.${Date.now()}@email.com`;

    await page.goto('https://rahulshettyacademy.com/client/#/auth/register');
    await page.locator('#firstName').fill('Dummy');
    await page.locator('#lastName').fill('User');
    await page.locator('#userEmail').fill(email);
    await page.locator('#userMobile').fill('2223320096');
    await page.locator('select[formcontrolname="occupation"]').selectOption('Student');
    await page.getByRole('radio', { name: 'Male', exact: true }).check();
    await page.locator('#userPassword').fill(USER.password);
    await page.locator('#confirmPassword').fill(USER.password);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('heading', { name: 'Account Created Successfully' })).toBeVisible();
  });

  test('registered user can log in', async ({ page }) => {
    await login(page);

    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    await expect(page.getByText(PRODUCT)).toBeVisible();
  });

  test('user can order a product and find it in order history', async ({ page }) => {
    await login(page);

    await test.step('add product to cart', async () => {
      await page
        .locator('.card-body')
        .filter({ hasText: PRODUCT })
        .getByRole('button', { name: 'Add To Cart' })
        .click();
      await expect(page.getByText('Product Added To Cart')).toBeVisible();
    });

    await test.step('check the cart', async () => {
      await page.locator('[routerlink*="cart"]').click();
      await expect(page.getByRole('heading', { name: PRODUCT }).first()).toBeVisible();
      await page.getByRole('button', { name: /Checkout/ }).click();
    });

    await test.step('fill in payment and shipping', async () => {
      await page.locator('.field').filter({ hasText: 'CVV Code' }).getByRole('textbox').fill('123');
      await page.locator('.field').filter({ hasText: 'Name on Card' }).getByRole('textbox').fill('First Last');
      await page.getByPlaceholder('Select Country').pressSequentially('United');
      // Name has a leading icon; $ excludes "United States Minor Outlying Islands"
      await page.getByRole('button', { name: /United States$/ }).click();
      await page.getByText('Place Order').click();
    });

    const orderId = await test.step('confirm order placed', async () => {
      await expect(page.getByRole('heading', { name: /Thankyou for the order/i })).toBeVisible();
      const idText = await page.locator('label.ng-star-inserted').first().textContent();
      return idText!.replace(/\|/g, '').trim();
    });

    await test.step('find order in history', async () => {
      await page.getByText('Orders History Page').click();
      await expect(page.getByRole('rowheader', { name: orderId })).toBeVisible();
    });
  });
});
