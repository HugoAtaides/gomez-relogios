document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#cartRoot');
  if (!root) return;

  let shipping = null;

  function render(){
    const items = Gomez.itemsDetailed();

    if(!items.length){
      root.innerHTML=`
        <div class="empty">
          <h2>Seu carrinho está vazio</h2>
          <p>Escolha um relógio para começar.</p>
          <a class="btn btn-primary" href="produtos.html">Ver relógios</a>
        </div>`;
      return;
    }

    root.innerHTML=`
      <div class="cart-layout">
        <section class="cart-items">
          <h2>Seu carrinho</h2>
          ${items.map(i=>`<div class="cart-item">
            <img src="${Gomez.escape(i.product.image)}" alt="${Gomez.escape(i.product.name)}">
            <div>
              <div class="product-brand">${Gomez.escape(i.product.brand)}</div>
              <strong>${Gomez.escape(i.product.name)}</strong>
              <div class="price">${Gomez.money(i.product.price)}</div>
              <div class="qty"><button data-minus="${i.id}">−</button><span>${i.qty}</span><button data-plus="${i.id}">+</button></div>
            </div>
            <div>
              <strong>${Gomez.money(i.product.price*i.qty)}</strong><br>
              <button class="small" style="border:0;background:transparent;cursor:pointer" data-remove="${i.id}">Remover</button>
            </div>
          </div>`).join('')}
        </section>

        <aside class="summary">
          <h3>Resumo do pedido</h3>
          <div class="total-line"><span>Subtotal</span><strong>${Gomez.money(Gomez.productTotal())}</strong></div>

          <div class="ship-box">
            <strong>Calcular frete</strong>
            <div class="ship-row" style="margin-top:8px">
              <input class="input" id="cartCep" inputmode="numeric" maxlength="9" placeholder="00000-000" aria-label="CEP">
              <button class="btn btn-ghost" id="cartShip">Calcular</button>
            </div>
            <div id="cartShippingResults" class="shipping-results"></div>
          </div>

          <div class="total-line total"><span>Total</span><strong id="cartTotal">${Gomez.money(Gomez.productTotal())}</strong></div>

          <button id="checkoutBtn" class="btn btn-primary" style="width:100%;margin-top:12px">Finalizar compra pelo site</button>
          <a id="waBtn" class="btn btn-ghost" style="width:100%;margin-top:8px" target="_blank" rel="noopener">Finalizar pelo WhatsApp</a>

          <div class="notice">Ao finalizar pelo site, você entrará no checkout seguro do Mercado Pago. O pedido ficará vinculado à sua conta Gomez para acompanhamento.</div>
        </aside>
      </div>`;

    root.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>Gomez.imageFallback(img),{once:true}));

    root.querySelectorAll('[data-plus]').forEach(b=>b.addEventListener('click',()=>{
      const item=Gomez.cart().find(i=>i.id===b.dataset.plus);
      Gomez.setQty(b.dataset.plus,(item?.qty||0)+1);
      shipping=null;
      render();
    }));

    root.querySelectorAll('[data-minus]').forEach(b=>b.addEventListener('click',()=>{
      const item=Gomez.cart().find(i=>i.id===b.dataset.minus);
      Gomez.setQty(b.dataset.minus,(item?.qty||0)-1);
      shipping=null;
      render();
    }));

    root.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{
      Gomez.removeFromCart(b.dataset.remove);
      shipping=null;
      render();
    }));

    const cep=document.querySelector('#cartCep');
    cep.addEventListener('input',()=>{
      let v=cep.value.replace(/\D/g,'').slice(0,8);
      if(v.length>5) v=v.slice(0,5)+'-'+v.slice(5);
      cep.value=v;
    });

    document.querySelector('#cartShip').addEventListener('click',()=>quoteShipping(cep.value));
    document.querySelector('#checkoutBtn').addEventListener('click',checkout);

    const wa=document.querySelector('#waBtn');
    wa.href=Gomez.whatsappUrl(Gomez.orderMessage(Gomez.cart(),{},shipping));
  }

  async function quoteShipping(cepRaw){
    const cep=(cepRaw||'').replace(/\D/g,'');
    const out=document.querySelector('#cartShippingResults');
    if(cep.length!==8){
      out.innerHTML='<div class="notice">Informe um CEP válido com 8 números.</div>';
      return;
    }

    out.innerHTML='<div class="small">Calculando frete com o Melhor Envio...</div>';

    try{
      const r=await fetch('/api/shipping',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({postalCode:cep,cart:Gomez.cart()})
      });
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||'Não foi possível calcular o frete.');
      const options=data.options||[];

      out.innerHTML=options.length
        ? options.map((o,idx)=>`<button class="shipping-option" data-ship-index="${idx}" style="text-align:left"><span><strong>${Gomez.escape(o.name)}</strong><br><small>${o.company ? Gomez.escape(o.company) : ''}${o.delivery_time ? ` · Prazo estimado: ${o.delivery_time} dias` : ''}</small></span><strong>${Gomez.money(Number(o.price))}</strong></button>`).join('')
        : '<div class="notice">Nenhuma opção encontrada para este CEP.</div>';

      out.querySelectorAll('[data-ship-index]').forEach(btn=>btn.addEventListener('click',()=>{
        shipping=options[Number(btn.dataset.shipIndex)];
        document.querySelector('#cartTotal').textContent=Gomez.money(Gomez.productTotal()+Number(shipping.price||0));
        document.querySelector('#waBtn').href=Gomez.whatsappUrl(Gomez.orderMessage(Gomez.cart(),{},shipping));
        out.querySelectorAll('button').forEach(x=>x.style.outline='none');
        btn.style.outline='2px solid #c79b32';
      }));
    }catch(e){
      out.innerHTML=`<div class="notice">${Gomez.escape(e.message)}</div>`;
    }
  }

  async function checkout(){
    const btn=document.querySelector('#checkoutBtn');
    if(GOMEZ_CONFIG.shippingEnabled && !shipping){
      alert('Calcule e selecione uma opção de frete antes de finalizar a compra pelo site.');
      return;
    }

    try{
      const session = await GomezAuth.getSession();
      if(!session){
        const next = 'carrinho.html?checkout=1';
        window.location.href = `login.html?next=${encodeURIComponent(next)}`;
        return;
      }
    }catch(error){
      alert(error.message || 'Não foi possível verificar seu login.');
      return;
    }

    btn.disabled=true;
    btn.textContent='Abrindo pagamento...';

    try{
      const session = await GomezAuth.getSession();
      const token = session?.access_token;
      if(!token) throw new Error('Sessão inválida. Entre novamente para continuar.');

      const r=await fetch('/api/checkout',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':`Bearer ${token}`
        },
        body:JSON.stringify({
          cart:Gomez.cart(),
          shipping:shipping?{
            price:Number(shipping.price||0),
            name:shipping.name,
            delivery_time:Number(shipping.delivery_time||0),
            id:shipping.id||shipping.service||null
          }:null
        })
      });
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||'Não foi possível iniciar o pagamento.');

      sessionStorage.setItem('gomez_last_order', JSON.stringify({
        order_code:data.order_code,
        created_at:new Date().toISOString()
      }));
      location.href=data.init_point;
    }catch(e){
      btn.disabled=false;
      btn.textContent='Finalizar compra pelo site';
      alert(`${e.message}\n\nVocê também pode finalizar pelo WhatsApp usando o botão abaixo.`);
    }
  }

  async function autoCheckout(){
    if(new URLSearchParams(location.search).get('checkout')!=='1') return;
    try{
      await GomezAuth.ready;
      const session = await GomezAuth.getSession();
      if(session) setTimeout(()=>document.querySelector('#checkoutBtn')?.click(),250);
    }catch{}
  }

  render();
  autoCheckout();
});
