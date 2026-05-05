import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const model = 'gemini-3-flash-preview';
const deliveryFee = Number(process.env.DELIVERY_FEE_KES || 500);
const deliveryEstimate = process.env.DELIVERY_ESTIMATE || '3-7 business days after payment confirmation';

app.use(express.json({ limit: '25mb' }));

function initializeAdmin() {
  if (getApps().length > 0) return;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    initializeApp({ credential: cert(serviceAccount) });
    return;
  }

  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

initializeAdmin();
const adminAuth = getAuth();
const adminDb = getFirestore();

type PaymentMethod = 'mpesa' | 'card';

interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
}

interface CheckoutLineItem {
  cartItemId: string;
  productId: string;
  productName: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variationName?: string;
  customNotes?: string;
  category?: string;
}

function getBearerToken(req: express.Request) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

async function requireUser(req: express.Request): Promise<AuthenticatedUser> {
  const token = getBearerToken(req);
  if (!token) throw new Error('auth-required');
  const decoded = await adminAuth.verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name
  };
}

function sanitizeString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function makeCheckoutOrderId(uid: string, idempotencyKey: string) {
  const hash = crypto.createHash('sha256').update(`${uid}:${idempotencyKey}`).digest('hex').slice(0, 24);
  return `checkout_${hash}`;
}

function getVariationPrice(product: FirebaseFirestore.DocumentData, variationName?: string) {
  if (!variationName || !Array.isArray(product.variations)) return Number(product.price || 0);
  const variation = product.variations.find((item: any) => item?.name === variationName);
  return Number(variation?.price || product.price || 0);
}

async function buildVerifiedCheckoutItems(uid: string, cartItemIds: string[]) {
  if (!Array.isArray(cartItemIds) || cartItemIds.length === 0 || cartItemIds.length > 50) {
    throw new Error('invalid-cart');
  }

  const uniqueIds = Array.from(new Set(cartItemIds.map(id => sanitizeString(id, 128)).filter(Boolean)));
  const items: CheckoutLineItem[] = [];

  for (const cartItemId of uniqueIds) {
    const cartSnap = await adminDb.collection('cart').doc(cartItemId).get();
    if (!cartSnap.exists) throw new Error('cart-item-not-found');

    const cart = cartSnap.data() || {};
    if (cart.userId !== uid) throw new Error('cart-item-forbidden');

    const productId = sanitizeString(cart.productId, 128);
    const quantity = Number(cart.quantity || 0);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('invalid-cart-item');
    }

    const productSnap = await adminDb.collection('products').doc(productId).get();
    if (!productSnap.exists) throw new Error('product-not-found');

    const product = productSnap.data() || {};
    const stockQuantity = Number(product.stockQuantity ?? 999999);
    if (stockQuantity < quantity) throw new Error('insufficient-stock');

    const unitPrice = getVariationPrice(product, cart.variationName);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('invalid-product-price');

    items.push({
      cartItemId,
      productId,
      productName: sanitizeString(product.name || cart.productName, 160),
      image: sanitizeString(product.image || cart.image, 2048),
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      variationName: sanitizeString(cart.variationName, 80) || undefined,
      customNotes: sanitizeString(cart.customNotes, 2000) || undefined,
      category: sanitizeString(product.category, 80) || undefined
    });
  }

  return items;
}

function getPaymentInstructions(paymentMethod: PaymentMethod, total: number, orderId: string) {
  const checkoutRequestId = `maridadi_${orderId}`;

  if (paymentMethod === 'mpesa') {
    return {
      provider: process.env.MPESA_SHORTCODE ? 'mpesa' : 'mpesa-provider-pending',
      checkoutRequestId,
      title: 'M-Pesa STK payment',
      message: process.env.MPESA_SHORTCODE
        ? `Approve the M-Pesa prompt for KSH ${total}. Your order updates only after provider callback verification.`
        : 'M-Pesa credentials are not configured yet. The order is created, but no live STK push was sent.'
    };
  }

  return {
    provider: process.env.CARD_PROVIDER || 'card-provider-pending',
    checkoutRequestId,
    title: 'Card payment',
    message: process.env.CARD_PROVIDER
      ? `Pay KSH ${total} using the configured card provider. Status updates only after provider callback verification.`
      : 'Card provider credentials are not configured yet. The order is created, but no live card payment was started.'
  };
}

async function writePaymentEvent(userId: string, eventType: string, orderId: string, metadata: Record<string, unknown>) {
  await adminDb.collection('events').add({
    userId,
    eventType,
    productId: null,
    metadata: { orderId, ...metadata },
    createdAt: FieldValue.serverTimestamp()
  });
}

app.post('/api/analyze-space', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'missing-gemini-key' });
    }

    const { inputs, refinementPrompt, isVideo } = req.body as {
      inputs: string | string[];
      refinementPrompt?: string;
      isVideo?: boolean;
    };

    const basePrompt = `
      You are a senior creative production consultant for "Maridadi Creations", a design, print, gift, decor, sticker, and branding studio.
      Use the provided brief and any visual references to create a practical custom order direction.
      Include:
      1. A concise style direction.
      2. Recommended colors, materials, sizes, finishes, or print treatments.
      3. 3-5 customization options the customer can choose from.
      4. Production notes Maridadi should confirm before quoting.
      5. Suggested next step for the customer.

      Format your response in professional Markdown.
    `;

    const prompt = refinementPrompt
      ? `Create or refine a Maridadi Creations custom order direction from this customer brief: ${refinementPrompt}. If visual references are provided, use them. Be practical about design, print, branding, decor, sticker, gift, or production choices.`
      : basePrompt;

    const parts: any[] = [{ text: prompt }];
    if (Array.isArray(inputs)) {
      inputs.forEach(base64 => {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64 } });
      });
    } else {
      parts.push({ inlineData: { mimeType: isVideo ? 'video/mp4' : 'image/jpeg', data: inputs } });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }]
    });

    res.json({ text: response.text || '' });
  } catch {
    res.status(500).json({ error: 'analysis-failed' });
  }
});

app.post('/api/admin-insights', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'missing-gemini-key' });
    }

    const { orders = [], products = [] } = req.body as { orders?: any[]; products?: any[] };
    const prompt = `
      You are the data strategist for "Maridadi Creations", a luxury Kenyan artisanal brand.
      Analyze the current business state:
      - Total Orders: ${orders.length}
      - Catalog Size: ${products.length}
      - Recent Orders Summary: ${JSON.stringify(orders.slice(0, 3))}

      Provide a brief high-level strategic brief (Markdown):
      1. Business Performance Summary.
      2. Inventory Recommendations based on observable demand patterns.
      3. 2 growth opportunities specifically for Maridadi.
      Keep it brief, professional, and luxury-focused. Use Kenyan business context.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    res.json({ text: response.text || '' });
  } catch {
    res.status(500).json({ error: 'insights-failed' });
  }
});

app.post('/api/checkout/create', async (req, res) => {
  try {
    const user = await requireUser(req);
    const body = req.body as {
      cartItemIds?: string[];
      contact?: { name?: string; email?: string; phone?: string };
      deliveryAddress?: string;
      paymentMethod?: PaymentMethod;
      idempotencyKey?: string;
    };

    const paymentMethod = body.paymentMethod === 'card' ? 'card' : 'mpesa';
    const idempotencyKey = sanitizeString(body.idempotencyKey, 120);
    const deliveryAddress = sanitizeString(body.deliveryAddress, 500);
    const contact = {
      name: sanitizeString(body.contact?.name || user.name, 120),
      email: sanitizeString(body.contact?.email || user.email, 160),
      phone: sanitizeString(body.contact?.phone, 40)
    };

    if (!idempotencyKey || !deliveryAddress || !contact.name || !contact.email || !contact.phone) {
      return res.status(400).json({ error: 'checkout-details-required' });
    }

    const orderId = makeCheckoutOrderId(user.uid, idempotencyKey);
    const orderRef = adminDb.collection('orders').doc(orderId);
    const existingOrder = await orderRef.get();

    if (existingOrder.exists) {
      const order = existingOrder.data() || {};
      return res.json({
        orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentInstructions: order.paymentInstructions,
        amounts: order.amounts,
        deliveryEstimate: order.deliveryEstimate
      });
    }

    const items = await buildVerifiedCheckoutItems(user.uid, body.cartItemIds || []);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = subtotal + deliveryFee;
    const paymentInstructions = getPaymentInstructions(paymentMethod, total, orderId);

    const order = {
      userId: user.uid,
      type: 'checkout',
      status: 'pending_payment',
      paymentStatus: 'pending',
      fulfillmentStatus: 'not_started',
      details: {
        items,
        contact,
        deliveryAddress,
        fulfiller: {
          name: 'Maridadi Creations',
          location: 'Nairobi, Kenya',
          support: 'hello@maridadicreations.com'
        }
      },
      amounts: {
        currency: 'KES',
        subtotal,
        deliveryFee,
        total
      },
      totalAmount: total,
      paymentMethod,
      paymentInstructions,
      deliveryEstimate,
      checkoutIdempotencyKey: idempotencyKey,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await orderRef.create(order);
    await writePaymentEvent(user.uid, 'checkout_started', orderId, { paymentMethod, total });
    await writePaymentEvent(user.uid, 'payment_attempted', orderId, { paymentMethod, total });

    res.status(201).json({
      orderId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentInstructions,
      amounts: order.amounts,
      deliveryEstimate
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'checkout-failed';
    const status = message.includes('auth') ? 401 : 400;
    res.status(status).json({ error: message });
  }
});

app.post('/api/payments/callback/:provider', async (req, res) => {
  try {
    const sharedSecret = process.env.PAYMENT_CALLBACK_SECRET;
    if (!sharedSecret || req.headers['x-maridadi-payment-secret'] !== sharedSecret) {
      return res.status(401).json({ error: 'callback-forbidden' });
    }

    const orderId = sanitizeString(req.body.orderId, 160);
    const resultCode = String(req.body.resultCode ?? req.body.status ?? '');
    const amount = Number(req.body.amount);
    const receiptNumber = sanitizeString(req.body.receiptNumber, 120);
    const providerReference = sanitizeString(req.body.checkoutRequestId || req.body.providerReference, 160);

    const orderRef = adminDb.collection('orders').doc(orderId);
    const outcome = await adminDb.runTransaction(async tx => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) throw new Error('order-not-found');

      const order = orderSnap.data() || {};
      if (order.paymentStatus === 'paid') {
        return { status: 'paid', userId: order.userId, alreadyPaid: true };
      }

      const expectedTotal = Number(order.amounts?.total || order.totalAmount || 0);
      const isSuccess = ['0', 'success', 'paid'].includes(resultCode.toLowerCase()) && amount === expectedTotal;
      const status = isSuccess ? 'paid' : 'payment_failed';

      if (isSuccess && Array.isArray(order.details?.items)) {
        for (const item of order.details.items) {
          const productRef = adminDb.collection('products').doc(item.productId);
          const productSnap = await tx.get(productRef);
          if (productSnap.exists && typeof productSnap.data()?.stockQuantity === 'number') {
            tx.update(productRef, {
              stockQuantity: FieldValue.increment(-Number(item.quantity || 0))
            });
          }

          if (item.cartItemId) {
            tx.delete(adminDb.collection('cart').doc(item.cartItemId));
          }
        }
      }

      tx.update(orderRef, {
        status,
        paymentStatus: isSuccess ? 'paid' : 'failed',
        fulfillmentStatus: isSuccess ? 'processing' : 'not_started',
        paymentVerification: {
          provider: req.params.provider,
          resultCode,
          amount,
          receiptNumber,
          providerReference,
          verifiedAt: FieldValue.serverTimestamp()
        },
        updatedAt: FieldValue.serverTimestamp()
      });

      return { status, userId: order.userId, alreadyPaid: false };
    });

    if (!outcome.alreadyPaid) {
      await writePaymentEvent(outcome.userId, outcome.status === 'paid' ? 'payment_success' : 'payment_failed', orderId, {
        provider: req.params.provider,
        amount
      });
    }

    res.json({ ok: true, status: outcome.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'callback-failed';
    res.status(message === 'order-not-found' ? 404 : 500).json({ error: message });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Maridadi AI API listening on ${port}`);
});
