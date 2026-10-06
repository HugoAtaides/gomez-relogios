// GOMEZ RELÓGIOS — POST /api/checkout
// Requer no Cloudflare:
// MP_ACCESS_TOKEN
// SUPABASE_URL
// SUPABASE_PUBLISHABLE_KEY (ou SUPABASE_ANON_KEY, legado)
// SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY, legado)

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

function json(data, status=200){
  return new Response(JSON.stringify(data), { status, headers });
}

function supabaseConfig(env){
  return {
    url: String(env.SUPABASE_URL || '').replace(/\/$/, ''),
    publishableKey: String(env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || ''),
    secretKey: String(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '')
  };
}

async function supabaseUser({ supabaseUrl, publishableKey, accessToken }){
  if(!supabaseUrl || !publishableKey) throw new Error('Supabase não configurado no backend.');
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  if(!response.ok || !data?.id){
    throw new Error('Sua sessão de login expirou. Entre novamente para concluir a compra.');
  }
  return data;
}

async function supabaseInsert({ supabaseUrl, secretKey, table, row }){
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(row)
  });
  const data = await response.json();
  if(!response.ok) throw new Error(data?.message || data?.hint || 'Não foi possível registrar o pedido.');
  return Array.isArray(data) ? data[0] : data;
}

async function supabaseUpdate({ supabaseUrl, secretKey, table, column, value, row }){
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`, {
    method: 'PATCH',
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(row)
  });
  if(!response.ok){
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || 'Não foi possível atualizar o pedido.');
  }
}

async function supabaseDelete({ supabaseUrl, secretKey, table, column, value }){
  await fetch(`${supabaseUrl}/rest/v1/${table}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`, {
    method: 'DELETE',
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`
    }
  });
}

const catalog = {
  'orient-mbss-1519-g1sx': { title:'Orient Solartech Elite Sea MBSS 1519 G1SX', price:1190.00 },
  'orient-mgss1269-g1kx': { title:'Orient MGSS1269 G1KX', price:899.00 },
  'orient-c288-d1sx': { title:'Orient Solartech Elite Sea MBSS C288 D1SX', price:1390.00 },
  'orient-eternal-mgss1258': { title:'Orient Eternal MGSS 1258', price:799.00 },
  'technos-golf-2115udk': { title:'Technos Golf 2115UDK', price:566.00 }
};

function orderCode(){
  const date = new Date();
  const stamp = `${date.getUTCFullYear()}${String(date.getUTCMonth()+1).padStart(2,'0')}${String(date.getUTCDate()).padStart(2,'0')}`;
  const suffix = crypto.randomUUID().replace(/-/g,'').slice(0,6).toUpperCase();
  return `GZ-${stamp}-${suffix}`;
}

export async function onRequestPost({ request, env }){
  let createdOrderId = null;

  try{
    if(!env.MP_ACCESS_TOKEN) return json({ error:'Mercado Pago ainda não foi configurado. Cadastre MP_ACCESS_TOKEN no Cloudflare.' }, 503);

    const authHeader = request.headers.get('Authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if(!accessToken) return json({ error:'Faça login para concluir a compra pelo site.' }, 401);

    const { url:supabaseUrl, publishableKey, secretKey } = supabaseConfig(env);
    if(!supabaseUrl || !publishableKey || !secretKey){
      return json({ error:'O banco de pedidos ainda não foi configurado no Cloudflare.' }, 503);
    }

    const user = await supabaseUser({ supabaseUrl, publishableKey, accessToken });
    const body = await request.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];
    if(!cart.length) return json({ error:'Carrinho vazio.' }, 400);

    const items = [];
    for(const raw of cart){
      const id = String(raw?.id || '');
      const product = catalog[id];
      if(!product) return json({ error:'Produto não reconhecido.' }, 400);
      const quantity = Math.max(1, Math.min(10, Math.floor(Number(raw?.qty || 1))));
      items.push({ id, title:product.title, quantity, unit_price:product.price, currency_id:'BRL' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const shippingPayload = body.shipping && Number(body.shipping.price) >= 0 ? body.shipping : null;
    const shippingCost = Number(shippingPayload?.price || 0);
    const total = Number((subtotal + shippingCost).toFixed(2));
    if(!Number.isFinite(total) || total <= 0) return json({ error:'Total do pedido inválido.' }, 400);

    const code = orderCode();
    const created = await supabaseInsert({
      supabaseUrl,
      secretKey,
      table:'orders',
      row:{
        order_code: code,
        user_id: user.id,
        customer_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        customer_email: user.email || null,
        status:'awaiting_payment',
        payment_status:'created',
        fulfillment_status:'not_started',
        order_items: items,
        subtotal: Number(subtotal.toFixed(2)),
        shipping_cost: Number(shippingCost.toFixed(2)),
        shipping_name: shippingPayload?.name || null,
        shipping_deadline: Number(shippingPayload?.delivery_time || 0) || null,
        total
      }
    });
    createdOrderId = created.id;

    const baseUrl = new URL(request.url).origin;
    const preference = {
      items: items.map(item => ({
        id:item.id,
        title:item.title,
        quantity:item.quantity,
        currency_id:'BRL',
        unit_price:item.unit_price
      })),
      ...(shippingCost > 0 ? { shipments:{ cost:shippingCost, mode:'not_specified' } } : {}),
      ...(user.email ? { payer:{ email:user.email } } : {}),
      back_urls:{
        success:`${baseUrl}/sucesso.html`,
        pending:`${baseUrl}/pendente.html`,
        failure:`${baseUrl}/falha.html`
      },
      auto_return:'approved',
      notification_url:`${baseUrl}/api/mercadopago-webhook`,
      external_reference:code,
      statement_descriptor:'GOMEZ RELOGIOS',
      metadata:{ order_id:created.id, order_code:code, user_id:user.id }
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:'POST',
      headers:{
        Authorization:`Bearer ${env.MP_ACCESS_TOKEN}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify(preference)
    });

    const data = await response.json();
    if(!response.ok){
      await supabaseDelete({ supabaseUrl, secretKey, table:'orders', column:'id', value:created.id });
      return json({ error:data?.message || 'O Mercado Pago recusou a criação do pagamento.' }, response.status);
    }

    await supabaseUpdate({
      supabaseUrl,
      secretKey,
      table:'orders',
      column:'id',
      value:created.id,
      row:{ mp_preference_id:data.id }
    });

    return json({ init_point:data.init_point, id:data.id, order_code:code });
  }catch(error){
    return json({ error:error?.message || 'Erro inesperado ao iniciar a compra.' }, 500);
  }
}
