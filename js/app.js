(function () {
  const CONFIG = window.GOMEZ_CONFIG;
  const PRODUCTS = window.PRODUCTS;
  const PLACEHOLDER = 'assets/produtos/relogio-placeholder.svg';

  window.Gomez = {
    money(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },
    imageFallback(img) {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      img.src = PLACEHOLDER;
    },
    cart() {
      try { return JSON.parse(localStorage.getItem('gomez_cart') || '[]'); }
      catch { return []; }
    },
    saveCart(cart) { localStorage.setItem('gomez_cart', JSON.stringify(cart)); this.updateCartCount(); },
    addToCart(id, qty = 1) {
      const product = PRODUCTS.find(p => p.id === id);
      if (!product || product.stock < 1) return false;
      const cart = this.cart();
      const found = cart.find(i => i.id === id);
      if (found) found.qty = Math.min(found.qty + qty, product.stock);
      else cart.push({ id, qty: Math.min(qty, product.stock) });
      this.saveCart(cart);
      return true;
    },
    removeFromCart(id) { this.saveCart(this.cart().filter(i => i.id !== id)); },
    setQty(id, qty) {
      const product = PRODUCTS.find(p => p.id === id);
      const cart = this.cart();
      const item = cart.find(i => i.id === id);
      if (!product || !item) return;
      if (qty <= 0) return this.removeFromCart(id);
      item.qty = Math.min(qty, product.stock);
      this.saveCart(cart);
    },
    updateCartCount() {
      const count = this.cart().reduce((sum, i) => sum + i.qty, 0);
      document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count);
    },
    productImage(product) { return product?.image || PLACEHOLDER; },
    productTotal(cart = this.cart()) {
      return cart.reduce((sum, i) => {
        const p = PRODUCTS.find(p => p.id === i.id);
        return sum + (p ? p.price * i.qty : 0);
      }, 0);
    },
    itemsDetailed(cart = this.cart()) {
      return cart.map(i => ({ ...i, product: PRODUCTS.find(p => p.id === i.id) })).filter(i => i.product);
    },
    shippingPackage(cart = this.cart()) {
      // Soma o volume de cada item em um único pacote comercial. Ajuste as dimensões
      // no catálogo quando tiver a embalagem real de cada produto.
      const items = this.itemsDetailed(cart);
      const weight = items.reduce((s, i) => s + (i.product.shipping.weight * i.qty), 0);
      const value = this.productTotal(cart);
      const maxWidth = Math.max(10, ...items.map(i => i.product.shipping.width));
      const maxHeight = Math.max(8, ...items.map(i => i.product.shipping.height));
      const length = Math.max(18, ...items.map(i => i.product.shipping.length)) + Math.max(0, items.length - 1) * 2;
      return { weight: Math.max(.2, Number(weight.toFixed(2))), width: maxWidth, height: maxHeight, length, insurance_value: Number(value.toFixed(2)) };
    },
    whatsappUrl(message) {
      return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    },
    orderMessage(cart, customer = {}, shipping = null) {
      const items = this.itemsDetailed(cart);
      const lines = [
        `Olá, Gomez Relógios! Quero finalizar meu pedido:`,
        '',
        ...items.map(i => `• ${i.product.brand} ${i.product.name} — ${i.qty} un. — ${this.money(i.product.price * i.qty)}`),
        '',
        `Subtotal: ${this.money(this.productTotal(cart))}`
      ];
      if (shipping?.price != null) lines.push(`Frete: ${this.money(shipping.price)}`);
      if (shipping?.name) lines.push(`Envio: ${shipping.name}`);
      lines.push(`Total: ${this.money(this.productTotal(cart) + (shipping?.price || 0))}`);
      if (customer.name) lines.push('', `Cliente: ${customer.name}`);
      if (customer.cep) lines.push(`CEP: ${customer.cep}`);
      if (customer.address) lines.push(`Endereço: ${customer.address}`);
      return lines.join('\n');
    },
    escape(text) {
      return String(text ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c]));
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Gomez.updateCartCount();
    document.querySelectorAll('img').forEach(img => img.addEventListener('error', () => Gomez.imageFallback(img), { once: true }));

    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
    });

    const mobileBtn = document.querySelector('[data-mobile-menu]');
    const nav = document.querySelector('.nav');
    if (mobileBtn && nav) {
      mobileBtn.addEventListener('click', () => {
        nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
        nav.style.position = 'absolute';
        nav.style.top = '78px';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = '#fbfaf7';
        nav.style.flexDirection = 'column';
        nav.style.padding = '18px 5%';
        nav.style.borderBottom = '1px solid #e7e2d8';
      });
    }
  });
})();
