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

  function initFloatingWhatsApp() {
    if (!CONFIG || !CONFIG.whatsapp) return;
    if (document.getElementById('floatingWhatsapp')) return;

    const link = document.createElement('a');
    link.id = 'floatingWhatsapp';
    link.className = 'floating-whatsapp';
    const whatsappConfigured = CONFIG.whatsapp !== '5561999999999';
    link.href = whatsappConfigured
      ? Gomez.whatsappUrl('Olá, Gomez Relógios! Gostaria de conhecer os relógios disponíveis.')
      : '#';
    if (whatsappConfigured) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        alert('Configure o número do WhatsApp da Gomez Relógios no arquivo data.js antes de publicar a loja.');
      });
    }
    link.setAttribute('aria-label', 'Falar com a Gomez Relógios pelo WhatsApp');
    link.title = whatsappConfigured ? 'Fale conosco pelo WhatsApp' : 'Configure o WhatsApp no data.js';
    link.innerHTML = `
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M19.11 17.08c-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.27-.7.87-.86 1.05-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.2-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.26s.98 2.62 1.11 2.8c.14.18 1.93 2.95 4.67 4.14.65.28 1.16.45 1.56.57.65.21 1.24.18 1.7.11.52-.08 1.59-.65 1.81-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32ZM16.02 3A12.99 12.99 0 0 0 4.9 22.72L3 29l6.45-1.85A13 13 0 1 0 16.02 3Zm0 23.65c-2.07 0-4.1-.56-5.88-1.63l-.42-.25-3.83 1.1 1.11-3.73-.27-.43a10.94 10.94 0 1 1 9.29 4.94Z"/>
      </svg>
      <span>WhatsApp</span>
    `;
    document.body.appendChild(link);
  }

  document.addEventListener('DOMContentLoaded', () => {
    Gomez.updateCartCount();
    initFloatingWhatsApp();
    document.querySelectorAll('img').forEach(img => img.addEventListener('error', () => Gomez.imageFallback(img), { once: true }));

    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    const current = location.pathname.split('/').pop() || 'index.html';
    const nav = document.querySelector('.nav');
    if (nav && !nav.querySelector('[data-account-link]')) {
      const accountLink = document.createElement('a');
      accountLink.href = 'minha-conta.html';
      accountLink.textContent = 'Minha conta';
      accountLink.dataset.accountLink = '1';
      nav.appendChild(accountLink);
    }

    document.querySelectorAll('.nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
    });

    const footerAtendimento = document.querySelector('footer .footer-grid > div:nth-child(3)');
    if (footerAtendimento && !footerAtendimento.querySelector('[data-footer-account]')) {
      const p = document.createElement('p');
      p.innerHTML = '<a href="minha-conta.html" data-footer-account>Minha conta</a>';
      footerAtendimento.appendChild(p);
    }

    const mobileBtn = document.querySelector('[data-mobile-menu]');
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
