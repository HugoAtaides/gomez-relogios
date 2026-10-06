document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  const p = getProduct(id);
  const root = document.querySelector('#productRoot');
  if (!root) return;
  if (!p) {
    root.innerHTML = `<div class="empty"><h2>Produto não encontrado</h2><a class="btn btn-primary" href="produtos.html">Voltar para relógios</a></div>`;
    return;
  }
  const gallery = (p.gallery?.length ? p.gallery : [p.image]);
  root.innerHTML = `
    <div class="product-detail">
      <div class="gallery">
        <div class="gallery-main"><img id="mainProductImage" src="${Gomez.escape(gallery[0])}" alt="${Gomez.escape(p.name)}"></div>
        <div class="gallery-thumbs">${gallery.map((src,i)=>`<button class="thumb" data-src="${Gomez.escape(src)}"><img src="${Gomez.escape(src)}" alt="Foto ${i+1}"></button>`).join('')}</div>
      </div>
      <div>
        <div class="product-brand">${Gomez.escape(p.brand)} · ${Gomez.escape(p.category)}</div>
        <h1>${Gomez.escape(p.name)}</h1>
        ${p.badge ? `<span class="badge">${Gomez.escape(p.badge)}</span>` : ''}
        <div class="detail-price">${Gomez.money(p.price)}</div>
        ${p.compareAt ? `<div class="compare">De ${Gomez.money(p.compareAt)}</div>` : ''}
        <p class="detail-sub">Produto para pronta entrega enquanto durar o estoque.</p>
        <div class="btns">
          <button id="addBtn" class="btn btn-primary">Adicionar ao carrinho</button>
          <button id="buyBtn" class="btn btn-gold">Comprar agora</button>
        </div>
        <div class="ship-box">
          <strong>Calcule o frete</strong>
          <p class="small">Digite o CEP de entrega para consultar opções disponíveis.</p>
          <div class="ship-row">
            <input class="input" id="cep" inputmode="numeric" maxlength="9" placeholder="00000-000">
            <button class="btn btn-ghost" id="shipBtn">Calcular</button>
          </div>
          <div id="shippingResults" class="shipping-results"></div>
        </div>
        <div class="specs">${Object.entries(p.specs||{}).map(([k,v])=>`<div class="spec"><strong>${Gomez.escape(k)}</strong><span>${Gomez.escape(v)}</span></div>`).join('')}</div>
        <p>${Gomez.escape(p.description)}</p>
      </div>
    </div>`;

  root.querySelectorAll('img').forEach(img => img.addEventListener('error', () => Gomez.imageFallback(img), {once:true}));
  document.querySelectorAll('[data-src]').forEach(btn=>btn.addEventListener('click',()=>document.querySelector('#mainProductImage').src=btn.dataset.src));
  const msg = ()=>`Olá! Tenho interesse no ${p.brand} ${p.name}, no valor de ${Gomez.money(p.price)}. Ele está disponível?`;
  document.querySelector('#addBtn').addEventListener('click',()=>{ Gomez.addToCart(p.id); location.href='carrinho.html'; });
  document.querySelector('#buyBtn').addEventListener('click',()=>{ Gomez.addToCart(p.id); location.href='carrinho.html?checkout=1'; });

  const cep=document.querySelector('#cep');
  cep.addEventListener('input',()=>{ let v=cep.value.replace(/\D/g,'').slice(0,8); if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5); cep.value=v; });
  document.querySelector('#shipBtn').addEventListener('click',async()=>{
    const out=document.querySelector('#shippingResults');
    const clean=cep.value.replace(/\D/g,'');
    if(clean.length!==8){out.innerHTML='<div class="notice">Informe um CEP válido com 8 números.</div>';return;}
    out.innerHTML='<div class="small">Consultando opções de frete...</div>';
    try{
      const r=await fetch('/api/shipping',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({postalCode:clean,cart:[{id:p.id,qty:1}]})});
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||'Não foi possível calcular.');
      out.innerHTML=data.options?.length ? data.options.map(o=>`<div class="shipping-option"><span><strong>${Gomez.escape(o.name)}</strong><br><small>${o.delivery_time?`Prazo estimado: ${o.delivery_time} dias`:''}</small></span><strong>${Gomez.money(Number(o.price))}</strong></div>`).join('') : '<div class="notice">Nenhuma opção encontrada para este CEP.</div>';
    }catch(e){out.innerHTML=`<div class="notice">${Gomez.escape(e.message)}<br><small>Também é possível finalizar pelo WhatsApp.</small></div>`;}
  });
});
