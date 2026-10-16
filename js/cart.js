
async function ensureGomezAuth(){
  if(window.GomezAuth) return window.GomezAuth;

  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gomez-auth-loader]');

    if(existing){
      existing.addEventListener('load', resolve, { once:true });
      existing.addEventListener('error', () => reject(
        new Error('Não foi possível carregar o módulo de login da Gomez.')
      ), { once:true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'js/auth.js';
    script.async = false;
    script.dataset.gomezAuthLoader = '1';
    script.onload = resolve;
    script.onerror = () => reject(
      new Error('Não foi possível carregar o módulo de login da Gomez.')
    );
    document.head.appendChild(script);
  });

  if(!window.GomezAuth){
    throw new Error('O módulo de autenticação da Gomez não foi carregado.');
  }

  return window.GomezAuth;
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#cartRoot');
  if(!root) return;

  let shipping = null;
  let cepAddress = null;

  function render(){
    const items = Gomez.itemsDetailed();

    if(!items.length){
      root.innerHTML = `
        <div class="empty">
          <h2>Seu carrinho está vazio</h2>
          <p>Escolha um relógio para começar.</p>
          <a class="btn btn-primary" href="produtos.html">Ver relógios</a>
        </div>`;
      return;
    }

    root.innerHTML = `
      <div class="cart-layout">
        <section class="cart-items">
          <h2>Seu carrinho</h2>
          ${items.map(i => `
            <div class="cart-item">
              <img src="${Gomez.escape(i.product.image)}"
                   alt="${Gomez.escape(i.product.name)}">
              <div>
                <div class="product-brand">${Gomez.escape(i.product.brand)}</div>
                <strong>${Gomez.escape(i.product.name)}</strong>
                <div class="price">${Gomez.money(i.product.price)}</div>
                <div class="qty">
                  <button data-minus="${i.id}">−</button>
                  <span>${i.qty}</span>
                  <button data-plus="${i.id}">+</button>
                </div>
              </div>
              <div>
                <strong>${Gomez.money(i.product.price * i.qty)}</strong><br>
                <button class="small"
                  style="border:0;background:transparent;cursor:pointer"
                  data-remove="${i.id}">Remover</button>
              </div>
            </div>`).join('')}
        </section>

        <aside class="summary">
          <h3>Resumo do pedido</h3>

          <div class="total-line">
            <span>Subtotal</span>
            <strong>${Gomez.money(Gomez.productTotal())}</strong>
          </div>

          <div class="ship-box">
            <strong>1. Informe o CEP para consultar o endereço e calcular o frete</strong>
            <div class="ship-row" style="margin-top:8px">
              <input class="input" id="cartCep"
                inputmode="numeric" maxlength="9"
                placeholder="00000-000" aria-label="CEP">
              <button class="btn btn-ghost" id="cartShip">
                Calcular frete
              </button>
            </div>
            <div id="cartShippingResults" class="shipping-results"></div>
          </div>

          <div class="delivery-form" id="deliveryForm" hidden>
            <h3>2. Confirme a entrega</h3>
            <p>Confira o endereço encontrado para o CEP informado.</p>

            <div id="deliveryAddressDisplay" class="notice"></div>

            <label for="deliveryNumber">Número da residência *</label>
            <input class="input" id="deliveryNumber"
              autocomplete="address-line2" required
              placeholder="Número da casa ou prédio">

            <label for="deliveryComplement">Complemento (opcional)</label>
            <input class="input" id="deliveryComplement"
              autocomplete="address-line3"
              placeholder="Apartamento, bloco, casa dos fundos etc.">

            <p class="small">
              O endereço acima foi consultado automaticamente pelo CEP.
            </p>
          </div>

          <div class="total-line total">
            <span>Total</span>
            <strong id="cartTotal">${Gomez.money(Gomez.productTotal())}</strong>
          </div>

          <button id="checkoutBtn" class="btn btn-primary"
            style="width:100%;margin-top:12px">
            Finalizar compra pelo site
          </button>

          <a id="waBtn" class="btn btn-ghost"
            style="width:100%;margin-top:8px"
            target="_blank" rel="noopener">
            Finalizar pelo WhatsApp
          </a>

          <div class="notice">
            Ao finalizar pelo site, você entrará no checkout seguro do
            Mercado Pago. O pedido ficará vinculado à sua conta Gomez
            para acompanhamento.
          </div>
        </aside>
      </div>`;

    root.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => Gomez.imageFallback(img), { once:true });
    });

    root.querySelectorAll('[data-plus]').forEach(button => {
      button.addEventListener('click', () => {
        const item = Gomez.cart().find(i => i.id === button.dataset.plus);
        Gomez.setQty(button.dataset.plus, (item?.qty || 0) + 1);
        shipping = null;
        cepAddress = null;
        render();
      });
    });

    root.querySelectorAll('[data-minus]').forEach(button => {
      button.addEventListener('click', () => {
        const item = Gomez.cart().find(i => i.id === button.dataset.minus);
        Gomez.setQty(button.dataset.minus, (item?.qty || 0) - 1);
        shipping = null;
        cepAddress = null;
        render();
      });
    });

    root.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', () => {
        Gomez.removeFromCart(button.dataset.remove);
        shipping = null;
        cepAddress = null;
        render();
      });
    });

    const cep = document.querySelector('#cartCep');
    const shipButton = document.querySelector('#cartShip');

    cep.addEventListener('input', () => {
      let value = cep.value.replace(/\D/g, '').slice(0, 8);
      if(value.length > 5){
        value = value.slice(0, 5) + '-' + value.slice(5);
      }
      cep.value = value;

      // Se o CEP mudar, o endereço e o frete anteriores deixam de valer.
      shipping = null;
      cepAddress = null;
      document.querySelector('#deliveryForm').hidden = true;
      document.querySelector('#cartShippingResults').innerHTML = '';
      document.querySelector('#cartTotal').textContent =
        Gomez.money(Gomez.productTotal());
    });

    shipButton.addEventListener('click', () => quoteShipping(cep.value));
    document.querySelector('#checkoutBtn').addEventListener('click', checkout);

    const wa = document.querySelector('#waBtn');
    wa.href = Gomez.whatsappUrl(
      Gomez.orderMessage(Gomez.cart(), {}, shipping)
    );
  }

  async function quoteShipping(cepRaw){
    const cep = (cepRaw || '').replace(/\D/g, '');
    const out = document.querySelector('#cartShippingResults');
    const shipButton = document.querySelector('#cartShip');
    const deliveryForm = document.querySelector('#deliveryForm');

    if(cep.length !== 8){
      out.innerHTML = '<div class="notice">Informe um CEP válido com 8 números.</div>';
      return;
    }

    shipping = null;
    cepAddress = null;
    deliveryForm.hidden = true;
    out.innerHTML = '<div class="small">Consultando CEP e calculando o frete...</div>';
    shipButton.disabled = true;
    shipButton.textContent = 'Aguarde...';

    try{
      // 1. Consulta o endereço pelo CEP.
      const cepResponse = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );
      if(!cepResponse.ok){
        throw new Error('Não foi possível consultar o CEP.');
      }

      const address = await cepResponse.json();

      if(address.erro){
        throw new Error('CEP não encontrado. Confira o número informado.');
      }

      cepAddress = {
        street: address.logradouro || '',
        district: address.bairro || '',
        city: address.localidade || '',
        state: (address.uf || '').toUpperCase(),
        postal_code: cep
      };

      // Mostra o endereço consultado e pede apenas número e complemento.
      const addressParts = [
        cepAddress.street,
        cepAddress.district,
        [cepAddress.city, cepAddress.state].filter(Boolean).join(' - '),
        'CEP: ' + cep
      ].filter(Boolean);

      document.querySelector('#deliveryAddressDisplay').textContent =
        addressParts.length > 1
          ? addressParts.join(' · ')
          : 'O CEP foi encontrado, mas não há endereço detalhado disponível.';

      deliveryForm.hidden = false;

      // 2. Calcula o frete para o mesmo CEP.
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: cep,
          cart: Gomez.cart()
        })
      });

      const data = await response.json();
      if(!response.ok){
        throw new Error(data.error || 'Não foi possível calcular o frete.');
      }

      const options = data.options || [];

      out.innerHTML = options.length
        ? '<p class="small">Selecione uma opção de entrega:</p>' +
          options.map((option, index) => `
            <button class="shipping-option"
              data-ship-index="${index}"
              style="text-align:left">
              <span>
                <strong>${Gomez.escape(option.name)}</strong><br>
                <small>
                  ${option.company ? Gomez.escape(option.company) : ''}
                  ${option.delivery_time
                    ? ` · Prazo estimado: ${option.delivery_time} dias`
                    : ''}
                </small>
              </span>
              <strong>${Gomez.money(Number(option.price))}</strong>
            </button>`).join('')
        : '<div class="notice">Nenhuma opção de frete encontrada para este CEP.</div>';

      out.querySelectorAll('[data-ship-index]').forEach(button => {
        button.addEventListener('click', () => {
          shipping = options[Number(button.dataset.shipIndex)];

          document.querySelector('#cartTotal').textContent =
            Gomez.money(Gomez.productTotal() + Number(shipping.price || 0));

          document.querySelector('#waBtn').href = Gomez.whatsappUrl(
            Gomez.orderMessage(Gomez.cart(), {}, shipping)
          );

          out.querySelectorAll('[data-ship-index]').forEach(optionButton => {
            optionButton.style.outline = 'none';
          });

          button.style.outline = '2px solid #c79b32';
        });
      });
    }catch(error){
      cepAddress = null;
      shipping = null;
      deliveryForm.hidden = true;
      out.innerHTML = `<div class="notice">${Gomez.escape(error.message)}</div>`;
    }finally{
      shipButton.disabled = false;
      shipButton.textContent = 'Calcular frete';
    }
  }

  async function checkout(){
    const btn = document.querySelector('#checkoutBtn');

    if(!cepAddress){
      alert('Informe o CEP e clique em Calcular frete para consultar o endereço.');
      return;
    }

    if(GOMEZ_CONFIG.shippingEnabled && !shipping){
      alert('Selecione uma opção de frete antes de finalizar a compra pelo site.');
      return;
    }

    const number = document.querySelector('#deliveryNumber').value.trim();
    const complement = document.querySelector('#deliveryComplement').value.trim();

    if(!number){
      alert('Informe o número da residência para continuar.');
      document.querySelector('#deliveryNumber').focus();
      return;
    }

    // A variável é criada aqui, dentro da função de checkout,
    // usando o endereço consultado e os dados digitados pelo cliente.
    const deliveryAddress = {
      recipient: '',
      street: cepAddress.street,
      number,
      complement,
      district: cepAddress.district,
      city: cepAddress.city,
      state: cepAddress.state,
      postal_code: cepAddress.postal_code
    };

    try{
      const auth = await ensureGomezAuth();
      await auth.ready;
      const session = await auth.getSession();

      if(!session){
        const next = 'carrinho.html?checkout=1';
        window.location.href = `login.html?next=${encodeURIComponent(next)}`;
        return;
      }
    }catch(error){
      alert(error.message || 'Não foi possível verificar seu login.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Abrindo pagamento...';

    try{
      const auth = await ensureGomezAuth();
      await auth.ready;
      const session = await auth.getSession();
      const token = session?.access_token;

      if(!token){
        throw new Error('Sessão inválida. Entre novamente para continuar.');
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cart: Gomez.cart(),
          deliveryAddress,
          shipping: shipping ? {
            price: Number(shipping.price || 0),
            name: shipping.name,
            delivery_time: Number(shipping.delivery_time || 0),
            id: shipping.id || shipping.service || null
          } : null
        })
      });

      const data = await response.json();
      if(!response.ok){
        throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      }

      sessionStorage.setItem('gomez_last_order', JSON.stringify({
        order_code: data.order_code,
        created_at: new Date().toISOString()
      }));

      location.href = data.init_point;
    }catch(error){
      btn.disabled = false;
      btn.textContent = 'Finalizar compra pelo site';
      alert(
        `${error.message}\n\nVocê também pode finalizar pelo WhatsApp usando o botão abaixo.`
      );
    }
  }

  async function autoCheckout(){
    if(new URLSearchParams(location.search).get('checkout') !== '1') return;

    try{
      const auth = await ensureGomezAuth();
      await auth.ready;
      const session = await auth.getSession();

      if(session){
        setTimeout(() => {
          document.querySelector('#checkoutBtn')?.click();
        }, 250);
      }
    }catch{}
  }

  render();
  autoCheckout();
});
