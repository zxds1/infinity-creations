import { auth } from './firebase';

export type PaymentMethod = 'mpesa' | 'card';

export interface CheckoutContact {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutRequest {
  cartItemIds: string[];
  contact: CheckoutContact;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface CheckoutResponse {
  orderId: string;
  status: 'pending_payment' | 'requires_provider_setup' | 'paid' | 'payment_failed';
  paymentStatus: string;
  paymentInstructions: {
    title: string;
    message: string;
    provider: string;
    checkoutRequestId?: string;
  };
  amounts: {
    currency: 'KES';
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  deliveryEstimate: string;
}

export async function createCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('auth-required');
  }

  const response = await fetch('/api/checkout/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'checkout-failed');
  }

  return data as CheckoutResponse;
}
