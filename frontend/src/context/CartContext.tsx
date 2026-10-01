import { useMemo, useState, type ReactNode } from 'react';
import { isValidCartQuantity, MAX_CART_QUANTITY, type CartLine } from '../cart/cart';
import type { Product } from '../types/Product';
import { CartContext, type CartActionResult } from './cartContextDefinition';

function quantityError(productName: string): CartActionResult {
  return {
    ok: false,
    message: `Choose a whole-number quantity from 1 to ${MAX_CART_QUANTITY} for ${productName}.`,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addProduct = (product: Product, quantity: number): CartActionResult => {
    if (!isValidCartQuantity(quantity)) {
      return quantityError(product.name);
    }

    const existingLine = lines.find((line) => line.product.productId === product.productId);
    const nextQuantity = (existingLine?.quantity ?? 0) + quantity;

    if (nextQuantity > MAX_CART_QUANTITY) {
      return quantityError(product.name);
    }

    setLines((currentLines) => {
      const matchingLine = currentLines.find(
        (line) => line.product.productId === product.productId,
      );

      if (!matchingLine) {
        return [...currentLines, { product, quantity }];
      }

      return currentLines.map((line) =>
        line.product.productId === product.productId
          ? { ...line, quantity: line.quantity + quantity }
          : line,
      );
    });

    return {
      ok: true,
      message: `Added ${quantity} ${product.name} ${quantity === 1 ? 'item' : 'items'} to the cart.`,
    };
  };

  const updateQuantity = (productId: number, quantity: number): CartActionResult => {
    const line = lines.find((candidate) => candidate.product.productId === productId);

    if (!line) {
      return { ok: false, message: 'That product is no longer in the cart.' };
    }

    if (!isValidCartQuantity(quantity) || quantity > MAX_CART_QUANTITY) {
      return quantityError(line.product.name);
    }

    setLines((currentLines) =>
      currentLines.map((currentLine) =>
        currentLine.product.productId === productId
          ? { ...currentLine, quantity }
          : currentLine,
      ),
    );

    return { ok: true, message: `Updated ${line.product.name} quantity to ${quantity}.` };
  };

  const removeProduct = (productId: number) => {
    setLines((currentLines) =>
      currentLines.filter((line) => line.product.productId !== productId),
    );
  };

  const value = useMemo(
    () => ({
      lines,
      itemCount: lines.reduce((count, line) => count + line.quantity, 0),
      addProduct,
      updateQuantity,
      removeProduct,
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
