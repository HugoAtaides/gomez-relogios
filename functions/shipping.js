// Cloudflare Pages Function: POST /api/shipping
// Secrets necessários no Cloudflare:
// MELHOR_ENVIO_TOKEN = access token de produção do Melhor Envio
// MELHOR_ENVIO_USER_AGENT = "Gomez Relógios (seu-email@dominio.com)"

const DEFAULT_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: DEFAULT_HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.MELHOR_ENVIO_TOKEN) {
      return json({ error: 'O cálculo de frete ainda não foi configurado no servidor. Cadastre MELHOR_ENVIO_TOKEN.' }, 503);
    }
    const body = await request.json();
    const postalCode = String(body.postalCode || '').replace(/\D/g, '');
    const cart = Array.isArray(body.cart) ? body.cart : [];
    if (postalCode.length !== 8) return json({ error: 'CEP de destino inválido.' }, 400);
    if (!cart.length) return json({ error: 'Carrinho vazio.' }, 400);

    // Dimensões/peso são calculados pelo catálogo enviado pelo frontend.
    // Para uma operação real, mantenha o catálogo também no backend para evitar adulterações.
    const products = cart.map(item => ({
      id: String(item.id),
      quantity: Math.max(1, Math.min(20, Number(item.qty || 1))),
    }));

    const known = {
      'orient-mbss-1519-g1sx': { weight: 0.6, width: 12, height: 8, length: 18 },
      'orient-mgss1269-g1kx': { weight: 0.6, width: 12, height: 8, length: 18 },
      'orient-c288-d1sx': { weight: 0.6, width: 12, height: 8, length: 18 },
      'orient-eternal-mgss1258': { weight: 0.6, width: 12, height: 8, length: 18 },
      'technos-golf-2115udk': { weight: 0.6, width: 12, height: 8, length: 18 }
    };
    if (products.some(p => !known[p.id])) return json({ error: 'Produto não reconhecido.' }, 400);

    const weight = products.reduce((sum, item) => sum + known[item.id].weight * item.quantity, 0);
    const insurance = 1; // Para cotação, o valor segurado deve ser ajustado na operação comercial.
    const width = Math.max(...products.map(p => known[p.id].width));
    const height = Math.max(...products.map(p => known[p.id].height));
    const length = Math.max(...products.map(p => known[p.id].length)) + Math.max(0, products.length - 1) * 2;

    const payload = {
      from: { postal_code: String(env.GOMEZ_ORIGIN_CEP || '70000000').replace(/\D/g, '') },
      to: { postal_code: postalCode },
      volumes: [{ width, height, length, weight: Math.max(0.2, Number(weight.toFixed(2))), insurance_value: insurance }]
    };

    const r = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MELHOR_ENVIO_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': env.MELHOR_ENVIO_USER_AGENT || 'Gomez Relógios (contato-tecnico@dominio.com)'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return json({ error: data.message || 'O Melhor Envio recusou a consulta.', details: data }, r.status);

    const list = Array.isArray(data) ? data : [];
    const sorted = list.filter(x => x && Number(x.price) >= 0).map(x => ({
      id: x.id,
      name: x.name || x.company?.name || 'Transportadora',
      price: Number(x.custom_price ?? x.price),
      delivery_time: Number(x.custom_delivery_time ?? x.delivery_time ?? 0),
      company: x.company?.name || '',
      delivery_range: x.custom_delivery_range || x.delivery_range || null
    })).sort((a,b)=>a.price-b.price).slice(0, 8);

    return json({ options: sorted });
  } catch (error) {
    return json({ error: error?.message || 'Erro inesperado no cálculo do frete.' }, 500);
  }
}
