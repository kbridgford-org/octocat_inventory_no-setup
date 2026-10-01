import { createContext } from 'react';
import type { CartLine } from '../cart/cart';
import type { Product } from '../types/Product';

export interface CartActionResult {
  ok: boolean;
  message: string;
}

export interface CartContextType {
  lines: CartLine[];
  itemCount: number;
  addProduct: (product: Product, quantity: number) => CartActionResult;
  updateQuantity: (productId: number, quantity: number) => CartActionResult;
  removeProduct: (productId: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
