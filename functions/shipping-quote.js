// GOMEZ RELÓGIOS — comprovantes assinados de cotação de frete.
// Este módulo é executado somente no backend (Cloudflare Worker).

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const base64 = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function getSigningKey(secret) {
  if (!secret || String(secret).length < 32) {
    throw new Error('A variável SHIPPING_QUOTE_SECRET não foi configurada corretamente no Cloudflare.');
  }
  return crypto.subtle.importKey(
    'raw', encoder.encode(String(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  );
}

// Normaliza o carrinho usando somente IDs e quantidades.
// Não aceita preço, nome ou qualquer dado comercial enviado pelo navegador.
export function normalizeShippingCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > 30) {
    throw new Error('Carrinho inválido para cálculo do frete.');
  }

  const quantities = new Map();
  for (const item of cart) {
    const id = String(item?.id || '').trim();
    const qty = Number(item?.qty);
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      throw new Error('Produto ou quantidade inválida no carrinho.');
    }
    const total = (quantities.get(id) || 0) + qty;
    if (total > 10) throw new Error('A quantidade máxima por produto é 10 unidades.');
    quantities.set(id, total);
  }

  return [...quantities.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, qty]) => ({ id, qty }));
}

function safeEqualCart(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function createShippingQuoteToken({ env, postalCode, cart, option }) {
  const secret = env.SHIPPING_QUOTE_SECRET;
  const key = await getSigningKey(secret);
  const price = Number(option.price);
  const deliveryTime = Number(option.delivery_time || 0);

  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(deliveryTime) || deliveryTime < 0) {
    throw new Error('A transportadora retornou uma cotação inválida.');
  }

  const payload = {
    v: 1,
    postal_code: String(postalCode),
    cart: normalizeShippingCart(cart),
    price_cents: Math.round(price * 100),
    service_id: String(option.id ?? ''),
    name: String(option.name || 'Transportadora').slice(0, 120),
    company: String(option.company || '').slice(0, 120),
    delivery_time: Math.floor(deliveryTime),
    delivery_range: option.delivery_range || null,
    exp: Math.floor(Date.now() / 1000) + 30 * 60
  };

  const payloadPart = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadPart));
  return `${payloadPart}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifyShippingQuoteToken({ env, token, postalCode, cart }) {
  if (typeof token !== 'string' || token.length > 5000) {
    throw new Error('A cotação do frete expirou ou é inválida. Calcule o frete novamente.');
  }

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Comprovante de frete inválido. Calcule o frete novamente.');
  }

  const key = await getSigningKey(env.SHIPPING_QUOTE_SECRET);
  let signatureValid = false;
  try {
    signatureValid = await crypto.subtle.verify(
      'HMAC', key,
      base64UrlToBytes(parts[1]),
      encoder.encode(parts[0])
    );
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    throw new Error('A cotação do frete foi alterada ou é inválida. Calcule novamente.');
  }

  let payload;
  try {
    payload = JSON.parse(decoder.decode(base64UrlToBytes(parts[0])));
  } catch {
    throw new Error('Não foi possível validar a cotação. Calcule novamente.');
  }

  const normalizedCart = normalizeShippingCart(cart);
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    payload?.v !== 1 ||
    !Number.isInteger(payload.exp) || payload.exp < currentTime ||
    payload.postal_code !== String(postalCode) ||
    !safeEqualCart(payload.cart, normalizedCart) ||
    !Number.isInteger(payload.price_cents) || payload.price_cents < 0 ||
    !payload.service_id
  ) {
    throw new Error('A cotação do frete expirou ou não corresponde ao CEP/carrinho atual. Calcule novamente.');
  }

  return {
    price: payload.price_cents / 100,
    name: payload.name,
    company: payload.company,
    id: payload.service_id,
    delivery_time: payload.delivery_time,
    delivery_range: payload.delivery_range
  };
}
