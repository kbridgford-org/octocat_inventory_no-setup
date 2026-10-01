import type { Product } from '../types/Product';

export const MAX_CART_QUANTITY = 99;

export interface CartLine {
  product: Product;
  quantity: number;
}

export function isValidCartQuantity(quantity: number): boolean {
  return Number.isFinite(quantity) && Number.isInteger(quantity) && quantity > 0;
}

export function getUnitPriceCents(product: Product): number {
  const priceCents = Math.round(product.price * 100);
  const discount = product.discount ?? 0;

  return Math.round(priceCents * (1 - discount));
}

export function getLineTotalCents(line: CartLine): number {
  const priceCents = Math.round(line.product.price * 100);
  const discount = line.product.discount ?? 0;

  return Math.round(priceCents * (1 - discount) * line.quantity);
}

export function getCartSubtotalCents(lines: CartLine[]): number {
  return lines.reduce((subtotal, line) => subtotal + getLineTotalCents(line), 0);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
