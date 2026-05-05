export const DEMO_USER_ID = 'demo-client';

const CART_KEY = 'maridadi.demoCart';
const WISHLIST_KEY = 'maridadi.demoWishlist';
const ORDERS_KEY = 'maridadi.demoOrders';
const ADDRESSES_KEY = 'maridadi.demoAddresses';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getDemoCart<T = any>() {
  return readJson<T[]>(CART_KEY, []);
}

export function saveDemoCart(items: any[]) {
  writeJson(CART_KEY, items);
}

export function addDemoCartItem(item: any) {
  const items = getDemoCart();
  const next = [{ ...item, id: item.id || `demo-cart-${Date.now()}` }, ...items];
  saveDemoCart(next);
  return next;
}

export function getDemoWishlist() {
  return readJson<string[]>(WISHLIST_KEY, []);
}

export function saveDemoWishlist(ids: string[]) {
  writeJson(WISHLIST_KEY, Array.from(new Set(ids)));
}

export function getDemoOrders<T = any>() {
  return readJson<T[]>(ORDERS_KEY, []);
}

export function addDemoOrder(order: any) {
  const orders = getDemoOrders();
  const next = [{ ...order, id: order.id || `demo-order-${Date.now()}` }, ...orders];
  writeJson(ORDERS_KEY, next);
  return next;
}

export function getDemoAddresses<T = any>() {
  return readJson<T[]>(ADDRESSES_KEY, []);
}

export function saveDemoAddresses(addresses: any[]) {
  writeJson(ADDRESSES_KEY, addresses);
}
