import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { MAX_CART_QUANTITY } from '../../src/cart/cart';
import { CartProvider } from '../../src/context/CartContext';
import { useCart } from '../../src/context/useCart';
import type { Product } from '../../src/types/Product';

const product: Product = {
  productId: 1,
  supplierId: 1,
  name: 'Test product',
  description: 'Cart state test fixture',
  price: 10,
  sku: 'TEST-1',
  unit: 'each',
  imgName: 'test.png',
};

function SameTurnAdditionProbe() {
  const cart = useCart();
  const [secondResult, setSecondResult] = useState('');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          cart.addProduct(product, MAX_CART_QUANTITY);
          setSecondResult(String(cart.addProduct(product, 1).ok));
        }}
      >
        Add twice
      </button>
      <output aria-label="Current quantity">{cart.lines[0]?.quantity ?? 0}</output>
      <output aria-label="Second addition result">{secondResult}</output>
    </>
  );
}

afterEach(cleanup);

describe('CartProvider', () => {
  test('validates repeated additions against the latest same-turn state', () => {
    render(
      <CartProvider>
        <SameTurnAdditionProbe />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add twice' }));

    expect(screen.getByLabelText('Current quantity').textContent).toBe(
      String(MAX_CART_QUANTITY),
    );
    expect(screen.getByLabelText('Second addition result').textContent).toBe('false');
  });
});
