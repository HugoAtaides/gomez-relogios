// GOMEZ RELÓGIOS — POST /api/shipping
//
// Cotação de frete via Melhor Envio.
// A API do Melhor Envio é gratuita para integração, sem mensalidade da API.
// A conta do Melhor Envio é usada para obter o token e para as condições de envio.
//
// Secrets/Variables no Cloudflare:
//   MELHOR_ENVIO_TOKEN       = access token de produção
//   MELHOR_ENVIO_USER_AGENT  = "Gomez Relógios (seu-email@dominio.com)"
//   GOMEZ_ORIGIN_CEP         = CEP de onde as encomendas serão postadas
//
// O front envia somente o CEP de destino e os IDs/quantidades do carrinho.
// Peso e dimensões válidos são mantidos também aqui no backend.

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: HEADERS
  });
}

const CATALOG = {
  'orient-mbss-1519-g1sx': {
    weight: 0.60,
    width: 12,
    height: 8,
    length: 18
  },
  'orient-mgss1269-g1kx': {
    weight: 0.60,
    width: 12,
    height: 8,
    length: 18
  },
  'orient-c288-d1sx': {
    weight: 0.60,
    width: 12,
    height: 8,
    length: 18
  },
  'orient-eternal-mgss1258': {
    weight: 0.60,
    width: 12,
    height: 8,
    length: 18
  },
  'technos-golf-2115udk': {
    weight: 0.60,
    width: 12,
    height: 8,
    length: 18
  }
};

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function buildShipment(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('Carrinho vazio.');
  }

  let totalWeight = 0;
  let insuranceValue = 0;
  let maxWidth = 0;
  let maxHeight = 0;
  let maxLength = 0;
  let itemSlots = 0;

  for (const item of cart) {
    const id = String(item?.id || '');
    const product = CATALOG[id];
    if (!product) {
      throw new Error(`Produto não reconhecido: ${id}`);
    }

    const quantity = Math.max(
      1,
      Math.min(20, Math.floor(Number(item?.qty || 1)))
    );

    totalWeight += product.weight * quantity;
    maxWidth = Math.max(maxWidth, product.width);
    maxHeight = Math.max(maxHeight, product.height);
    maxLength = Math.max(maxLength, product.length);
    itemSlots += quantity;

    // O backend não confia em preços enviados pelo navegador para o seguro.
    // O valor segurado pode ser preenchido depois com o preço real do catálogo.
    // Mantemos o seguro como 1 por padrão para não alterar a cotação sem necessidade.
  }

  // Um pacote comercial padrão para relógios.
  // Atualize estes limites quando você definir a embalagem real da Gomez.
  const length = Math.max(18, maxLength) + Math.max(0, itemSlots - 1) * 2;
  const width = Math.max(12, maxWidth);
  const height = Math.max(8, maxHeight);
  const weight = Math.max(0.30, Number(totalWeight.toFixed(2)));

  return {
    width,
    height,
    length,
    weight,
    insuranceValue: Math.max(1, money(insuranceValue))
  };
}

async function calculateWithMelhorEnvio({ env, originCep, destinationCep, shipment }) {
  const endpoint = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

  const payload = {
    from: {
      postal_code: originCep
    },
    to: {
      postal_code: destinationCep
    },
    volumes: [
      {
        width: shipment.width,
        height: shipment.height,
        length: shipment.length,
        weight: shipment.weight
      }
    ]
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MELHOR_ENVIO_TOKEN}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': env.MELHOR_ENVIO_USER_AGENT || 'Gomez Relógios (contato@gomezrelogios.com.br)'
    },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!response.ok) {
    const apiMessage =
      data?.message ||
      (Array.isArray(data?.error) ? data.error.join(' ') : '') ||
      (typeof data?.error === 'string' ? data.error : '') ||
      `Melhor Envio respondeu com HTTP ${response.status}.`;

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'O token do Melhor Envio não está autorizado para a cotação. Gere/renove o token e verifique as permissões de shipping-calculate.'
      );
    }

    throw new Error(apiMessage);
  }

  if (!Array.isArray(data)) {
    throw new Error('A resposta do Melhor Envio veio em formato inesperado.');
  }

  return data;
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.MELHOR_ENVIO_TOKEN) {
      return json({
        error:
          'Frete ainda não configurado. Crie uma conta no Melhor Envio, gere um token de integração e cadastre MELHOR_ENVIO_TOKEN no Cloudflare.'
      }, 503);
    }

    const body = await request.json().catch(() => ({}));
    const originCep = digits(env.GOMEZ_ORIGIN_CEP || '');
    const destinationCep = digits(body.postalCode || '');
    const cart = Array.isArray(body.cart) ? body.cart : [];

    if (originCep.length !== 8) {
      return json({
        error: 'O CEP de origem da Gomez Relógios não foi configurado corretamente no Cloudflare.'
      }, 500);
    }

    if (destinationCep.length !== 8) {
      return json({
        error: 'Informe um CEP de destino válido com 8 números.'
      }, 400);
    }

    const shipment = buildShipment(cart);
    const services = await calculateWithMelhorEnvio({
      env,
      originCep,
      destinationCep,
      shipment
    });

    const options = services
      .filter(item => item && Number.isFinite(Number(item.price)))
      .map(item => ({
        id: item.id,
        name: item.name || item.company?.name || 'Transportadora',
        company: item.company?.name || '',
        price: money(item.custom_price ?? item.price),
        delivery_time: Number(item.custom_delivery_time ?? item.delivery_time ?? 0),
        delivery_range: item.custom_delivery_range || item.delivery_range || null
      }))
      .filter(item => item.price >= 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);

    if (!options.length) {
      return json({
        error: 'O Melhor Envio não encontrou uma modalidade para este CEP e pacote.'
      }, 422);
    }

    return json({
      provider: 'Melhor Envio',
      options
    });
  } catch (error) {
    return json({
      error: error?.message || 'Erro inesperado ao calcular o frete.'
    }, 500);
  }
}
