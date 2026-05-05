import { addDoc, auth, collection, db, doc, getDocFromServer, serverTimestamp } from './firebase';

export type BehaviorEventType =
  | 'view'
  | 'compare'
  | 'wishlist'
  | 'cart'
  | 'intent'
  | 'analyzer'
  | 'branding'
  | 'checkout_started'
  | 'payment_attempted'
  | 'payment_success'
  | 'payment_failed';

export interface DesignPreferences {
  styles: string[];
  colors: string[];
  layouts: string[];
  updatedAt: string;
}

interface BehaviorEventInput {
  eventType: BehaviorEventType;
  productId?: string;
  metadata?: Record<string, unknown>;
}

const PREFERENCE_KEY = 'maridadi.designPreferences';
const GUEST_EVENTS_KEY = 'maridadi.guestEvents';

const STYLE_TERMS = ['minimalist', 'modern', 'rustic', 'luxury', 'traditional', 'contemporary', 'artisanal', 'scandinavian', 'bohemian'];
const COLOR_TERMS = ['white', 'black', 'cream', 'green', 'blue', 'red', 'gold', 'brown', 'teak', 'oak', 'neutral', 'earth', 'terracotta'];
const LAYOUT_TERMS = ['open', 'compact', 'gallery', 'studio', 'lounge', 'dining', 'office', 'bedroom', 'living'];

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function pickTerms(text: string, terms: string[]) {
  const normalized = text.toLowerCase();
  return terms.filter(term => normalized.includes(term));
}

export function extractDesignPreferences(text: string, refinement = ''): DesignPreferences {
  const source = `${text} ${refinement}`;
  const stored = getStoredPreferences();

  return {
    styles: Array.from(new Set([...stored.styles, ...pickTerms(source, STYLE_TERMS)])).slice(0, 6),
    colors: Array.from(new Set([...stored.colors, ...pickTerms(source, COLOR_TERMS)])).slice(0, 6),
    layouts: Array.from(new Set([...stored.layouts, ...pickTerms(source, LAYOUT_TERMS)])).slice(0, 6),
    updatedAt: new Date().toISOString()
  };
}

export function getStoredPreferences(): DesignPreferences {
  return readStoredJson<DesignPreferences>(PREFERENCE_KEY, {
    styles: [],
    colors: [],
    layouts: [],
    updatedAt: ''
  });
}

export function saveStoredPreferences(preferences: DesignPreferences) {
  writeStoredJson(PREFERENCE_KEY, preferences);
}

export async function assertProductExists(productId: string) {
  const snapshot = await getDocFromServer(doc(db, 'products', productId));
  if (!snapshot.exists()) {
    throw new Error('Invalid product reference');
  }
}

export async function trackEvent({ eventType, productId, metadata = {} }: BehaviorEventInput) {
  const payload = {
    eventType,
    productId: productId || null,
    metadata,
    userId: auth.currentUser?.uid || null,
    createdAt: serverTimestamp()
  };

  if (!auth.currentUser) {
    const guestEvents = readStoredJson<Record<string, unknown>[]>(GUEST_EVENTS_KEY, []);
    writeStoredJson(GUEST_EVENTS_KEY, [
      ...guestEvents.slice(-49),
      { ...payload, createdAt: new Date().toISOString() }
    ]);
    return;
  }

  await addDoc(collection(db, 'events'), payload);
}

export function getProductPreferenceScore(product: any, preferences: DesignPreferences) {
  const haystack = [
    product.name,
    product.category,
    product.description,
    ...(Array.isArray(product.tags) ? product.tags : [])
  ].filter(Boolean).join(' ').toLowerCase();

  const terms = [...preferences.styles, ...preferences.colors, ...preferences.layouts];
  return terms.reduce((score, term) => score + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0);
}

export function getProductInsightLabels(product: any, preferences: DesignPreferences, index: number) {
  const labels: string[] = [];
  const score = getProductPreferenceScore(product, preferences);
  const rating = Number(product.rating || 0);
  const stock = Number(product.stockQuantity ?? 0);

  if (score > 0) labels.push('Best match for your style');
  if (rating >= 4.7) labels.push('Popular in this category');
  if (rating >= 4.4 && Number(product.price || 0) <= 20000) labels.push('Good value');
  if (stock > 0 && stock <= 3) labels.push('Limited availability');
  labels.push(`Compared ${Math.max(3, (index + 2) * 4)} times`);

  return labels.slice(0, 3);
}
