import { useState } from 'react';
import {
  formatCurrency,
  getCartSubtotalCents,
  getLineTotalCents,
  getUnitPriceCents,
  MAX_CART_QUANTITY,
  type CartLine,
} from '../../cart/cart';
import { useCart } from '../../context/useCart';
import { useTheme } from '../../context/ThemeContext';

interface CartLineItemProps {
  line: CartLine;
  darkMode: boolean;
  onMessage: (message: string) => void;
}

function CartLineItem({ line, darkMode, onMessage }: CartLineItemProps) {
  const { updateQuantity, removeProduct } = useCart();
  const { product, quantity } = line;

  const handleQuantityChange = (nextQuantity: number) => {
    const result = updateQuantity(product.productId, nextQuantity);
    onMessage(result.message);
  };

  const handleRemove = () => {
    removeProduct(product.productId);
    onMessage(`Removed ${product.name} from the cart.`);
  };

  return (
    <li
      className={`grid gap-4 rounded-lg border p-4 sm:grid-cols-[7rem_1fr_auto] ${
        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}
    >
      <img
        src={`/${product.imgName}`}
        alt=""
        className={`h-28 w-28 rounded-md object-contain ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}
      />
      <div>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          {product.name}
        </h2>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          {formatCurrency(getUnitPriceCents(product))} each
        </p>
        <label
          htmlFor={`cart-quantity-${product.productId}`}
          className={`mt-3 block text-sm font-medium ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Quantity
        </label>
        <input
          id={`cart-quantity-${product.productId}`}
          type="number"
          min="1"
          max={MAX_CART_QUANTITY}
          step="1"
          value={quantity}
          onChange={(event) => handleQuantityChange(Number(event.target.value))}
          className={`mt-1 w-24 rounded-md border px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary ${
            darkMode
              ? 'border-gray-600 bg-gray-700 text-light'
              : 'border-gray-300 bg-white text-gray-800'
          }`}
        />
        <button
          type="button"
          onClick={handleRemove}
          className="mt-3 block rounded-md text-sm font-medium text-red-600 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Remove {product.name}
        </button>
      </div>
      <p className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
        {formatCurrency(getLineTotalCents(line))}
      </p>
    </li>
  );
}

export default function Cart() {
  const { lines } = useCart();
  const { darkMode } = useTheme();
  const [message, setMessage] = useState('');

  return (
    <div
      className={`min-h-screen px-4 pb-16 pt-24 transition-colors duration-300 ${
        darkMode ? 'bg-dark' : 'bg-gray-100'
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          Shopping cart
        </h1>
        <div className="min-h-8 py-2" role="status" aria-live="polite">
          <p className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{message}</p>
        </div>

        {lines.length === 0 ? (
          <div
            className={`rounded-lg border p-10 text-center ${
              darkMode
                ? 'border-gray-700 bg-gray-800 text-gray-200'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <p className="text-lg font-medium">Your cart is empty.</p>
            <p className="mt-2">Add products from the catalog to see them here.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
            <ul className="space-y-4" aria-label="Cart items">
              {lines.map((line) => (
                <CartLineItem
                  key={line.product.productId}
                  line={line}
                  darkMode={darkMode}
                  onMessage={setMessage}
                />
              ))}
            </ul>
            <aside
              className={`h-fit rounded-lg border p-5 ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
              aria-label="Cart summary"
            >
              <div
                className={`flex items-center justify-between text-lg font-bold ${
                  darkMode ? 'text-light' : 'text-gray-800'
                }`}
              >
                <span>Subtotal</span>
                <span>{formatCurrency(getCartSubtotalCents(lines))}</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
