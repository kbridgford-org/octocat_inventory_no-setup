import { test, expect } from '@playwright/test';

const products = [
  {
    productId: 1,
    supplierId: 1,
    name: 'SmartFeeder One',
    description: 'AI-powered feeder that works around nap cycles.',
    price: 49.99,
    sku: 'FEED-1',
    unit: 'each',
    imgName: 'feeder.png',
    discount: 0,
  },
];

/**
 * Product catalog discovery E2E tests
 * Implements: frontend/tests/features/product-navigation.feature
 *
 * Covers:
 * - Navigation from home page to product catalog
 * - Product search with valid matches
 * - Product search with no matches (empty state)
 */

test.describe('Product catalog discovery', () => {
  test.beforeEach(async ({ page }) => {
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/api/')) {
        expect(request.method()).toBe('GET');
      }
    });
    await page.route('**/api/products', async (route) => {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ status: 200, contentType: 'application/json', json: products });
    });
    await page.goto('/');
  });

  test('Navigate from the home page to the product catalog', async ({ page }) => {
    // Given I am on the home page
    await page.goto('/');
    await expect(page.locator('h1:has-text("Smart Cat Tech")')).toBeVisible();

    // When I select the Products navigation link
    await page.click('nav a:has-text("Products")');

    // Then I land on the product catalog page
    await expect(page).toHaveURL(/\/products/);

    // And I see the catalog header "Products"
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();
  });

  test('Search for a product by name', async ({ page }) => {
    // Given I am viewing the product catalog
    await page.goto('/products');
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();

    // And the catalog includes "SmartFeeder One"
    // Wait for product grid to load
    const productGrid = page.locator('div[class*="grid"]').filter({ hasText: 'SmartFeeder One' });
    await expect(productGrid).toBeVisible();

    // When I search for "SmartFeeder"
    const searchInput = page.locator('input[aria-label="Search products"]');
    await searchInput.fill('SmartFeeder');

    // Then the results list shows "SmartFeeder One"
    const productCard = page.locator('h3:has-text("SmartFeeder One")');
    await expect(productCard).toBeVisible();

    // And the product description is visible in the results
    const description = page.locator('text=/AI-powered feeder.*nap cycles/i').first();
    await expect(description).toBeVisible();
  });

  test('Search for a product with no matches', async ({ page }) => {
    // Given I am viewing the product catalog
    await page.goto('/products');
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();

    // Wait for initial products to load
    await expect(page.locator('div[class*="grid"]').first()).toBeVisible();

    // When I search for "Space Tuna"
    const searchInput = page.locator('input[aria-label="Search products"]');
    await searchInput.fill('Space Tuna');

    // Then I see the empty state message "No products found"
    const emptyState = page.getByRole('status').filter({ hasText: 'No products found' });
    await expect(emptyState).toContainText('No products found');

    // And I am prompted to adjust the search filters
    await expect(emptyState).toContainText(/clearing.*changing.*search filters/i);
  });

  test('Open and close product details', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('img', { name: 'SmartFeeder One' }).click();

    await expect(page.getByRole('heading', { name: 'SmartFeeder One', level: 2 })).toBeVisible();
    await page.locator('button').filter({ has: page.locator('path[d*="M6 18"]') }).click();
    await expect(page.getByRole('heading', { name: 'SmartFeeder One', level: 2 })).toBeHidden();
  });
});
