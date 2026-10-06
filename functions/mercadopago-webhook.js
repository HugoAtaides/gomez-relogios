// GOMEZ RELÓGIOS — POST /api/mercadopago-webhook
// Atualiza o pedido quando o Mercado Pago cria/atualiza um pagamento.
// Requer no Cloudflare:
// MP_ACCESS_TOKEN
// MP_WEBHOOK_SECRET
// SUPABASE_URL
// SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY, legado)

function json(data, status=200){
  return new Response(JSON.stringify(data), {
    status,
    headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
  });
}

function supabaseConfig(env){
  return {
    url:String(env.SUPABASE_URL || '').replace(/\/$/, ''),
    secretKey:String(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '')
  };
}

function parseSignature(value){
  const result = {};
  for(const part of String(value || '').split(',')){
    const [key,val] = part.split('=');
    if(key && val) result[key.trim()] = val.trim();
  }
  return result;
}

function hexToBytes(hex){
  const out = new Uint8Array(hex.length / 2);
  for(let i=0;i<out.length;i++) out[i] = parseInt(hex.slice(i*2,i*2+2),16);
  return out;
}

async function hmacHex(secret, message){
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name:'HMAC', hash:'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function safeEqual(a,b){
  try{
    const aa = hexToBytes(a);
    const bb = hexToBytes(b);
    if(aa.length !== bb.length) return false;
    let result = 0;
    for(let i=0;i<aa.length;i++) result |= aa[i] ^ bb[i];
    return result === 0;
  }catch{
    return false;
  }
}

async function validateSignature(request, env, notificationId){
  const secret = String(env.MP_WEBHOOK_SECRET || '');
  if(!secret) return false;

  const xSignature = request.headers.get('x-signature') || request.headers.get('X-Signature') || '';
  const xRequestId = request.headers.get('x-request-id') || request.headers.get('X-Request-Id') || '';
  if(!xSignature || !notificationId) return false;

  const parsed = parseSignature(xSignature);
  const manifestParts = [];
  if(notificationId) manifestParts.push(`id:${notificationId}`);
  if(xRequestId) manifestParts.push(`request-id:${xRequestId}`);
  if(parsed.ts) manifestParts.push(`ts:${parsed.ts}`);
  const manifest = `${manifestParts.join(';')};`;
  const expected = await hmacHex(secret, manifest);
  return safeEqual(expected, parsed.v1 || '');
}

async function fetchPayment(paymentId, accessToken){
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers:{ Authorization:`Bearer ${accessToken}` }
  });
  const data = await response.json();
  if(!response.ok) throw new Error(data?.message || 'Não foi possível consultar o pagamento no Mercado Pago.');
  return data;
}

async function updateOrder({ supabaseUrl, secretKey, externalReference, payment }){
  const map = {
    approved:{ status:'paid', payment_status:'approved' },
    pending:{ status:'pending_payment', payment_status:'pending' },
    in_process:{ status:'pending_payment', payment_status:'in_process' },
    authorized:{ status:'pending_payment', payment_status:'authorized' },
    rejected:{ status:'rejected', payment_status:'rejected' },
    cancelled:{ status:'cancelled', payment_status:'cancelled' },
    refunded:{ status:'refunded', payment_status:'refunded' },
    charged_back:{ status:'refunded', payment_status:'charged_back' }
  };

  const mapped = map[payment.status] || { status:'pending_payment', payment_status:String(payment.status || 'unknown') };

  const response = await fetch(
    `${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(externalReference)}`,
    {
      method:'PATCH',
      headers:{
        apikey:secretKey,
        Authorization:`Bearer ${secretKey}`,
        'Content-Type':'application/json',
        Prefer:'return=minimal'
      },
      body:JSON.stringify({
        status:mapped.status,
        payment_status:mapped.payment_status,
        mp_payment_id:String(payment.id || ''),
        mp_status:String(payment.status || ''),
        mp_status_detail:String(payment.status_detail || ''),
        updated_at:new Date().toISOString()
      })
    }
  );

  if(!response.ok){
    const data = await response.json().catch(()=>({}));
    throw new Error(data?.message || 'Não foi possível atualizar o pedido no Supabase.');
  }
}

export async function onRequestPost({ request, env }){
  try{
    if(!env.MP_ACCESS_TOKEN) return json({ok:false,error:'MP_ACCESS_TOKEN não configurado.'},503);
    const { url:supabaseUrl, secretKey } = supabaseConfig(env);
    if(!supabaseUrl || !secretKey) return json({ok:false,error:'Supabase não configurado.'},503);

    const url = new URL(request.url);
    const notificationId = url.searchParams.get('data.id') || '';
    const body = await request.json().catch(()=>({}));

    if(body.type !== 'payment') return json({ok:true});

    if(!env.MP_WEBHOOK_SECRET) return json({ok:false,error:'MP_WEBHOOK_SECRET não configurado.'},503);
    const valid = await validateSignature(request, env, notificationId || String(body?.data?.id || ''));
    if(!valid) return json({ok:false,error:'Assinatura do webhook inválida.'},401);

    const paymentId = String(body?.data?.id || notificationId || '');
    if(!paymentId) return json({ok:false,error:'ID do pagamento não informado.'},400);

    const payment = await fetchPayment(paymentId, env.MP_ACCESS_TOKEN);
    const externalReference = String(payment.external_reference || '');
    if(!externalReference) return json({ok:true,ignored:true});

    await updateOrder({ supabaseUrl, secretKey, externalReference, payment });
    return json({ok:true});
  }catch(error){
    return json({ok:false,error:error?.message || 'Erro no webhook.'},500);
  }
}
