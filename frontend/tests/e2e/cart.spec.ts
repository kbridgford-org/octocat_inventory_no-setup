import { expect, test, type Page } from '@playwright/test';

const products = [
  {
    productId: 1,
    supplierId: 1,
    name: 'SmartFeeder One',
    description: 'AI-powered feeder that works around nap cycles.',
    price: 40,
    sku: 'FEED-1',
    unit: 'each',
    imgName: 'feeder.png',
    discount: 0.25,
  },
  {
    productId: 2,
    supplierId: 1,
    name: 'Nap Tracker',
    description: 'A comfortable tracker for serious sleepers.',
    price: 25,
    sku: 'NAP-1',
    unit: 'each',
    imgName: 'tracker-mat.png',
    discount: 0,
  },
];

async function fixtureCatalog(page: Page) {
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/')) {
      expect(request.method()).toBe('GET');
    }
  });
  await page.route('**/api/products', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ status: 200, contentType: 'application/json', json: products });
  });
}

test.describe('Guest shopping cart', () => {
  test.beforeEach(async ({ page }) => {
    await fixtureCatalog(page);
  });

  test('adds distinct products, keeps state across routes, and updates the subtotal', async ({
    page,
  }) => {
    await page.goto('/products');

    await page.getByRole('button', { name: 'Increase quantity of SmartFeeder One' }).click();
    await page.getByRole('button', { name: 'Add 1 SmartFeeder One to cart' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Added 1 SmartFeeder One' })).toBeVisible();

    await page.getByRole('button', { name: 'Increase quantity of Nap Tracker' }).click();
    await page.getByRole('button', { name: 'Add 1 Nap Tracker to cart' }).click();
    await expect(page.getByRole('link', { name: 'Shopping cart with 2 items' })).toBeVisible();

    await page.getByRole('link', { name: 'About us' }).click();
    await page.getByRole('link', { name: 'Shopping cart with 2 items' }).click();

    await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Cart items' })).toContainText('SmartFeeder One');
    await expect(page.getByRole('list', { name: 'Cart items' })).toContainText('Nap Tracker');
    await expect(page.getByLabel('Cart summary')).toContainText('$55.00');

    await expect(page.getByLabel('Quantity for SmartFeeder One', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Quantity for Nap Tracker', { exact: true })).toBeVisible();
    await page.getByLabel('Quantity for SmartFeeder One', { exact: true }).fill('2');
    await expect(page.getByLabel('Cart summary')).toContainText('$85.00');
  });

  test('rejects invalid quantity edits without removing the line', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Increase quantity of SmartFeeder One' }).click();
    await page.getByRole('button', { name: 'Add 1 SmartFeeder One to cart' }).click();
    await page.getByRole('link', { name: 'Shopping cart with 1 item' }).click();
    await expect(page).toHaveURL(/\/cart$/);

    const quantity = page.locator('#cart-quantity-1');
    await quantity.fill('0');

    await expect(page.getByRole('status')).toContainText('Choose a whole-number quantity');
    await expect(quantity).toHaveValue('1');
    await expect(page.getByRole('heading', { name: 'SmartFeeder One' })).toBeVisible();
  });

  test('removes a line explicitly and resets the cart on reload', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Increase quantity of SmartFeeder One' }).click();
    await page.getByRole('button', { name: 'Add 1 SmartFeeder One to cart' }).click();
    await page.getByRole('link', { name: 'Shopping cart with 1 item' }).click();

    await page.getByRole('button', { name: 'Remove SmartFeeder One' }).click();
    await expect(page.getByText('Your cart is empty.')).toBeVisible();

    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('button', { name: 'Increase quantity of Nap Tracker' }).click();
    await page.getByRole('button', { name: 'Add 1 Nap Tracker to cart' }).click();
    await page.getByRole('link', { name: 'Shopping cart with 1 item' }).click();
    await page.reload();

    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('keeps the cart link available at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Shopping cart with 0 items' })).toBeVisible();
  });
});
