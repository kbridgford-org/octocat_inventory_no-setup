import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
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
  const linesRef = useRef(lines);

  const addProduct = useCallback((product: Product, quantity: number): CartActionResult => {
    if (!isValidCartQuantity(quantity)) {
      return quantityError(product.name);
    }

    const currentLines = linesRef.current;
    const existingLine = currentLines.find(
      (line) => line.product.productId === product.productId,
    );
    const nextQuantity = (existingLine?.quantity ?? 0) + quantity;

    if (nextQuantity > MAX_CART_QUANTITY) {
      return quantityError(product.name);
    }

    const nextLines = existingLine
      ? currentLines.map((line) =>
          line.product.productId === product.productId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      : [...currentLines, { product, quantity }];

    linesRef.current = nextLines;
    setLines(nextLines);

    return {
      ok: true,
      message: `Added ${quantity} ${product.name} ${quantity === 1 ? 'item' : 'items'} to the cart.`,
    };
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number): CartActionResult => {
    const currentLines = linesRef.current;
    const line = currentLines.find((candidate) => candidate.product.productId === productId);

    if (!line) {
      return { ok: false, message: 'That product is no longer in the cart.' };
    }

    if (!isValidCartQuantity(quantity) || quantity > MAX_CART_QUANTITY) {
      return quantityError(line.product.name);
    }

    const nextLines = currentLines.map((currentLine) =>
        currentLine.product.productId === productId
          ? { ...currentLine, quantity }
          : currentLine,
    );
    linesRef.current = nextLines;
    setLines(nextLines);

    return { ok: true, message: `Updated ${line.product.name} quantity to ${quantity}.` };
  }, []);

  const removeProduct = useCallback((productId: number) => {
    const nextLines = linesRef.current.filter(
      (line) => line.product.productId !== productId,
    );
    linesRef.current = nextLines;
    setLines(nextLines);
  }, []);

  const value = useMemo(
    () => ({
      lines,
      itemCount: lines.reduce((count, line) => count + line.quantity, 0),
      addProduct,
      updateQuantity,
      removeProduct,
    }),
    [addProduct, lines, removeProduct, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
