(function(){
  function productCard(p){
    const compare = p.compareAt ? `<div class="compare">${Gomez.money(p.compareAt)}</div>` : '';
    const badge = p.badge ? `<span class="badge">${Gomez.escape(p.badge)}</span>` : '';
    return `
      <article class="product-card">
        <a href="produto.html?id=${encodeURIComponent(p.id)}" class="product-media" aria-label="Ver ${Gomez.escape(p.name)}">
          <img src="${Gomez.escape(p.image)}" alt="${Gomez.escape(p.brand + ' ' + p.name)}" loading="lazy">
        </a>
        <div class="product-body">
          ${badge}
          <div class="product-brand">${Gomez.escape(p.brand)} · ${Gomez.escape(p.category)}</div>
          <a class="product-name" href="produto.html?id=${encodeURIComponent(p.id)}">${Gomez.escape(p.name)}</a>
          <div>${compare}<div class="price">${Gomez.money(p.price)}</div></div>
          <div class="card-actions">
            <button class="btn btn-primary" data-add="${Gomez.escape(p.id)}">Adicionar</button>
            <a class="btn btn-ghost" href="produto.html?id=${encodeURIComponent(p.id)}">Detalhes</a>
          </div>
        </div>
      </article>`;
  }
  function render(container, list){
    container.innerHTML = list.length ? list.map(productCard).join('') : `<div class="empty" style="grid-column:1/-1">Nenhum relógio encontrado.</div>`;
    container.querySelectorAll('img').forEach(img => img.addEventListener('error', () => Gomez.imageFallback(img), { once: true }));
    container.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.add;
      if (Gomez.addToCart(id)) {
        btn.textContent = 'Adicionado ✓';
        setTimeout(()=>btn.textContent='Adicionar', 1300);
      }
    }));
  }
  window.renderProducts = render;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-products]').forEach(container => {
      let list = window.PRODUCTS.slice();
      const limit = Number(container.dataset.limit || 0);
      if (limit) list = list.slice(0, limit);
      render(container, list);
    });

    const grid = document.querySelector('#catalogGrid');
    if (!grid) return;
    const search = document.querySelector('#search');
    const brand = document.querySelector('#brand');
    const category = document.querySelector('#category');
    const brands = [...new Set(PRODUCTS.map(p=>p.brand))].sort();
    const cats = [...new Set(PRODUCTS.map(p=>p.category))].sort();
    brand.innerHTML += brands.map(v=>`<option value="${Gomez.escape(v)}">${Gomez.escape(v)}</option>`).join('');
    category.innerHTML += cats.map(v=>`<option value="${Gomez.escape(v)}">${Gomez.escape(v)}</option>`).join('');

    function apply(){
      const q=(search.value||'').toLowerCase().trim();
      const list=PRODUCTS.filter(p=>{
        const text=`${p.brand} ${p.name} ${p.category}`.toLowerCase();
        return (!q||text.includes(q))&&(!brand.value||p.brand===brand.value)&&(!category.value||p.category===category.value);
      });
      render(grid,list);
      const count=document.querySelector('#resultCount');
      if(count) count.textContent=`${list.length} produto${list.length===1?'':'s'}`;
    }
    [search,brand,category].forEach(el=>el.addEventListener('input',apply));
    apply();
  });
})();
