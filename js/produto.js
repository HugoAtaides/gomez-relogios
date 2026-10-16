document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  const p = getProduct(id);
  const root = document.querySelector('#productRoot');

  if (!root) return;

  if (!p) {
    root.innerHTML = `
      <div class="empty">
        <h2>Produto não encontrado</h2>
        <a class="btn btn-primary" href="produtos.html">
          Voltar para relógios
        </a>
      </div>`;
    return;
  }

  const gallery = (p.gallery?.length ? p.gallery : [p.image]).filter(Boolean);
  const photos = gallery.length ? gallery : [p.image];
  let currentImageIndex = 0;
  let touchStartX = 0;

  root.innerHTML = `
    <div class="product-detail">
      <div class="gallery">

        <div class="gallery-main" id="galleryMain">
          <img
            id="mainProductImage"
            src="${Gomez.escape(photos[0])}"
            alt="${Gomez.escape(p.name)} — foto 1"
          >

          <button
            type="button"
            class="gallery-arrow gallery-arrow-prev"
            id="galleryPrev"
            aria-label="Ver foto anterior"
            title="Foto anterior"
            ${photos.length <= 1 ? 'hidden' : ''}
          >&#8249;</button>

          <button
            type="button"
            class="gallery-arrow gallery-arrow-next"
            id="galleryNext"
            aria-label="Ver próxima foto"
            title="Próxima foto"
            ${photos.length <= 1 ? 'hidden' : ''}
          >&#8250;</button>
        </div>

        <div class="gallery-thumbs" id="galleryThumbs"
          aria-label="Miniaturas das fotos do produto">
          ${photos.map((src, i) => `
            <button
              type="button"
              class="thumb ${i === 0 ? 'active' : ''}"
              data-gallery-index="${i}"
              aria-label="Ver foto ${i + 1}"
              aria-pressed="${i === 0 ? 'true' : 'false'}"
            >
              <img
                src="${Gomez.escape(src)}"
                alt="Miniatura ${i + 1} de ${Gomez.escape(p.name)}"
                loading="lazy"
              >
            </button>
          `).join('')}
        </div>
      </div>

      <div>
        <div class="product-brand">
          ${Gomez.escape(p.brand)} · ${Gomez.escape(p.category)}
        </div>

        <h1>${Gomez.escape(p.name)}</h1>

        ${p.badge
          ? `<span class="badge">${Gomez.escape(p.badge)}</span>`
          : ''}

        <div class="detail-price">${Gomez.money(p.price)}</div>

        ${p.compareAt
          ? `<div class="compare">De ${Gomez.money(p.compareAt)}</div>`
          : ''}

        <p class="detail-sub">
          Produto para pronta entrega enquanto durar o estoque.
        </p>

        <div class="btns">
          <button id="addBtn" class="btn btn-primary">
            Adicionar ao carrinho
          </button>

          <button id="buyBtn" class="btn btn-gold">
            Comprar agora
          </button>
        </div>

        <div class="ship-box">
          <strong>Calcule o frete</strong>

          <p class="small">
            Digite o CEP de entrega para consultar opções disponíveis.
          </p>

          <div class="ship-row">
            <input
              class="input"
              id="cep"
              inputmode="numeric"
              maxlength="9"
              placeholder="00000-000"
              aria-label="CEP de entrega"
            >

            <button class="btn btn-ghost" id="shipBtn">
              Calcular
            </button>
          </div>

          <div id="shippingResults" class="shipping-results"></div>
        </div>

        <div class="specs">
          ${Object.entries(p.specs || {}).map(([k, v]) => `
            <div class="spec">
              <strong>${Gomez.escape(k)}</strong>
              <span>${Gomez.escape(v)}</span>
            </div>
          `).join('')}
        </div>

        <p>${Gomez.escape(p.description)}</p>
      </div>
    </div>`;

  // Tratamento de imagens que não carregarem.
  root.querySelectorAll('img').forEach(img => {
    img.addEventListener(
      'error',
      () => Gomez.imageFallback(img),
      { once: true }
    );
  });

  // ----------------------------------------
  // CARROSSEL DE FOTOS
  // ----------------------------------------

  const mainImage = root.querySelector('#mainProductImage');
  const galleryMain = root.querySelector('#galleryMain');
  const prevButton = root.querySelector('#galleryPrev');
  const nextButton = root.querySelector('#galleryNext');
  const thumbButtons = [
    ...root.querySelectorAll('[data-gallery-index]')
  ];

  function showImage(index, direction = 1) {
    if (!photos.length) return;

    // Faz o carrossel circular: depois da última vem a primeira.
    currentImageIndex = (index + photos.length) % photos.length;

    mainImage.classList.remove(
      'gallery-slide-left',
      'gallery-slide-right'
    );

    // Reinicia a animação para que ela aconteça em cada troca.
    void mainImage.offsetWidth;

    mainImage.src = photos[currentImageIndex];
    mainImage.alt =
      `${p.name} — foto ${currentImageIndex + 1} de ${photos.length}`;

    mainImage.classList.add(
      direction > 0 ? 'gallery-slide-left' : 'gallery-slide-right'
    );

    thumbButtons.forEach((button, i) => {
      const active = i === currentImageIndex;

      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    // Mantém a miniatura selecionada visível na faixa.
    const activeThumb = thumbButtons[currentImageIndex];

    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }

  prevButton.addEventListener('click', () => {
    showImage(currentImageIndex - 1, -1);
  });

  nextButton.addEventListener('click', () => {
    showImage(currentImageIndex + 1, 1);
  });

  thumbButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.galleryIndex);
      const direction = index >= currentImageIndex ? 1 : -1;

      showImage(index, direction);
    });
  });

  // Permite deslizar o dedo para trocar a foto no celular.
  galleryMain.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  galleryMain.addEventListener('touchend', event => {
    const touchEndX = event.changedTouches[0].screenX;
    const difference = touchEndX - touchStartX;

    if (Math.abs(difference) < 45 || photos.length <= 1) return;

    if (difference < 0) {
      showImage(currentImageIndex + 1, 1);
    } else {
      showImage(currentImageIndex - 1, -1);
    }
  }, { passive: true });

  // ----------------------------------------
  // CARRINHO E COMPRA
  // ----------------------------------------

  document.querySelector('#addBtn').addEventListener('click', () => {
    const added = Gomez.addToCart(p.id);

    if (added) {
      location.href = 'carrinho.html';
    } else {
      alert('Não foi possível adicionar este produto ao carrinho.');
    }
  });

  document.querySelector('#buyBtn').addEventListener('click', () => {
    const added = Gomez.addToCart(p.id);

    if (added) {
      location.href = 'carrinho.html?checkout=1';
    } else {
      alert('Não foi possível adicionar este produto ao carrinho.');
    }
  });

  // ----------------------------------------
  // CÁLCULO DE FRETE
  // ----------------------------------------

  const cep = document.querySelector('#cep');
  const shipButton = document.querySelector('#shipBtn');

  cep.addEventListener('input', () => {
    let value = cep.value.replace(/\D/g, '').slice(0, 8);

    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5);
    }

    cep.value = value;
  });

  shipButton.addEventListener('click', async () => {
    const out = document.querySelector('#shippingResults');
    const cleanCep = cep.value.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      out.innerHTML = `
        <div class="notice">
          Informe um CEP válido com 8 números.
        </div>`;
      return;
    }

    out.innerHTML = '<div class="small">Consultando opções de frete...</div>';
    shipButton.disabled = true;
    shipButton.textContent = 'Aguarde...';

    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postalCode: cleanCep,
          cart: [{ id: p.id, qty: 1 }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível calcular o frete.');
      }

      out.innerHTML = data.options?.length
        ? data.options.map(option => `
            <div class="shipping-option">
              <span>
                <strong>${Gomez.escape(option.name)}</strong><br>
                <small>
                  ${option.delivery_time
                    ? `Prazo estimado: ${Gomez.escape(option.delivery_time)} dias`
                    : ''}
                </small>
              </span>
              <strong>${Gomez.money(Number(option.price))}</strong>
            </div>
          `).join('')
        : `
          <div class="notice">
            Nenhuma opção encontrada para este CEP.
          </div>`;

    } catch (error) {
      out.innerHTML = `
        <div class="notice">
          ${Gomez.escape(error.message)}<br>
          <small>Também é possível finalizar pelo WhatsApp.</small>
        </div>`;
    } finally {
      shipButton.disabled = false;
      shipButton.textContent = 'Calcular';
    }
  });
});
