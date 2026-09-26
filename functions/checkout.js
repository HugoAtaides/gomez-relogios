// Cloudflare Pages Function: POST /api/checkout
// Secret necessário:
// MP_ACCESS_TOKEN = Access Token de produção do Mercado Pago.

function json(data, status=200){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.MP_ACCESS_TOKEN) return json({ error: 'O pagamento online ainda não foi configurado. Cadastre MP_ACCESS_TOKEN no Cloudflare.' }, 503);
    const body = await request.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];
    if (!cart.length) return json({ error: 'Carrinho vazio.' },400);

    // Validação no backend. Se alterar preços em data.js, altere também este mapa.
    const catalog = {
      'orient-mbss-1519-g1sx': { title:'Orient Solartech Elite Sea MBSS 1519 G1SX', price:1190.00 },
      'orient-mgss1269-g1kx': { title:'Orient MGSS1269 G1KX', price:899.00 },
      'orient-c288-d1sx': { title:'Orient Solartech Elite Sea MBSS C288 D1SX', price:1390.00 },
      'orient-eternal-mgss1258': { title:'Orient Eternal MGSS 1258', price:799.00 },
      'technos-golf-2115udk': { title:'Technos Golf 2115UDK', price:566.00 }
    };

    const items = [];
    for (const raw of cart) {
      const id = String(raw.id);
      const p = catalog[id];
      if (!p) return json({ error: 'Produto não reconhecido.' },400);
      const quantity = Math.max(1, Math.min(10, Math.floor(Number(raw.qty || 1))));
      items.push({ id, title:p.title, quantity, currency_id:'BRL', unit_price:p.price });
    }

    let shipping = null;
    if (body.shipping && Number(body.shipping.price) > 0) {
      shipping = { cost:Number(body.shipping.price), mode:'not_specified' };
    }

    const baseUrl = new URL(request.url).origin;
    const preference = {
      items,
      ...(shipping ? { shipments: shipping } : {}),
      back_urls: {
        success: `${baseUrl}/sucesso.html`,
        pending: `${baseUrl}/pendente.html`,
        failure: `${baseUrl}/falha.html`
      },
      auto_return: 'approved',
      external_reference: `GOMEZ-${Date.now()}`,
      statement_descriptor: 'GOMEZ RELOGIOS'
    };

    const r = await fetch('https://api.mercadopago.com/checkout/preferences',{
      method:'POST',
      headers:{
        Authorization:`Bearer ${env.MP_ACCESS_TOKEN}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify(preference)
    });
    const data=await r.json();
    if(!r.ok) return json({error:data.message||'O Mercado Pago recusou a criação do pagamento.',details:data},r.status);
    return json({init_point:data.init_point,id:data.id});
  }catch(error){
    return json({error:error?.message||'Erro inesperado ao iniciar o pagamento.'},500);
  }
}
