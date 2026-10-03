document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#cartRoot');
  if (!root) return;

  let shipping = null;

  function render(){
    const items = Gomez.itemsDetailed();

    if(!items.length){
      root.innerHTML = `
        <div class="empty">
          <h2>Seu carrinho está vazio</h2>
          <p>Escolha um relógio para começar.</p>
          <a class="btn btn-primary" href="produtos.html">Ver relógios</a>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="cart-layout">

        <section class="cart-items">
          <h2>Seu carrinho</h2>

          ${items.map(i => `
            <div class="cart-item">

              <img
                src="${Gomez.escape(i.product.image)}"
                alt="${Gomez.escape(i.product.name)}"
              >

              <div>
                <div class="product-brand">
                  ${Gomez.escape(i.product.brand)}
                </div>

                <strong>
                  ${Gomez.escape(i.product.name)}
                </strong>

                <div class="price">
                  ${Gomez.money(i.product.price)}
                </div>

                <div class="qty">
                  <button data-minus="${i.id}">−</button>
                  <span>${i.qty}</span>
                  <button data-plus="${i.id}">+</button>
                </div>
              </div>

              <div>
                <strong>
                  ${Gomez.money(i.product.price * i.qty)}
                </strong>

                <br>

                <button
                  class="small"
                  style="border:0;background:transparent;cursor:pointer"
                  data-remove="${i.id}"
                >
                  Remover
                </button>
              </div>

            </div>
          `).join('')}

        </section>

        <aside class="summary">

          <h3>Resumo do pedido</h3>

          <div class="total-line">
            <span>Subtotal</span>
            <strong>
              ${Gomez.money(Gomez.productTotal())}
            </strong>
          </div>

          <div class="ship-box">

            <strong>Calcular frete</strong>

            <div
              class="ship-row"
              style="margin-top:8px"
            >
              <input
                class="input"
                id="cartCep"
                inputmode="numeric"
                maxlength="9"
                placeholder="00000-000"
              >

              <button
                class="btn btn-ghost"
                id="cartShip"
              >
                Calcular
              </button>
            </div>

            <div
              id="cartShippingResults"
              class="shipping-results"
            ></div>

          </div>

          <div class="total-line total">

            <span>Total</span>

            <strong id="cartTotal">
              ${Gomez.money(Gomez.productTotal())}
            </strong>

          </div>

          <a
            id="waBtn"
            class="btn btn-primary"
            style="width:100%;margin-top:14px"
            target="_blank"
            rel="noopener"
          >
            Finalizar pelo WhatsApp
          </a>

          <div class="notice">
            Ao clicar em "Finalizar pelo WhatsApp", seu pedido será enviado
            para a Gomez Relógios para confirmação de disponibilidade,
            frete e pagamento.
          </div>

        </aside>

      </div>
    `;

    root.querySelectorAll('img').forEach(img =>
      img.addEventListener(
        'error',
        () => Gomez.imageFallback(img),
        {once:true}
      )
    );

    root.querySelectorAll('[data-plus]').forEach(button => {
      button.addEventListener('click', () => {

        const item = Gomez.cart().find(
          i => i.id === button.dataset.plus
        );

        Gomez.setQty(
          button.dataset.plus,
          (item?.qty || 0) + 1
        );

        render();
      });
    });

    root.querySelectorAll('[data-minus]').forEach(button => {
      button.addEventListener('click', () => {

        const item = Gomez.cart().find(
          i => i.id === button.dataset.minus
        );

        Gomez.setQty(
          button.dataset.minus,
          (item?.qty || 0) - 1
        );

        render();
      });
    });

    root.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', () => {

        Gomez.removeFromCart(button.dataset.remove);

        shipping = null;

        render();
      });
    });

    const cep = document.querySelector('#cartCep');

    cep.addEventListener('input', () => {

      let value = cep.value
        .replace(/\D/g,'')
        .slice(0,8);

      if(value.length > 5){
        value =
          value.slice(0,5) +
          '-' +
          value.slice(5);
      }

      cep.value = value;
    });

    document
      .querySelector('#cartShip')
      .addEventListener(
        'click',
        () => quoteShipping(cep.value)
      );

    const wa = document.querySelector('#waBtn');

    wa.href = Gomez.whatsappUrl(
      Gomez.orderMessage(
        Gomez.cart(),
        {},
        shipping
      )
    );
  }

  async function quoteShipping(cepRaw){

    const cep = (cepRaw || '')
      .replace(/\D/g,'')
      .slice(0,8);

    const out =
      document.querySelector(
        '#cartShippingResults'
      );

    if(cep.length !== 8){

      out.innerHTML = `
        <div class="notice">
          Informe um CEP válido com 8 números.
        </div>
      `;

      return;
    }

    out.innerHTML = `
      <div class="small">
        Consultando opções de frete...
      </div>
    `;

    try{

      const response = await fetch(
        '/api/shipping',
        {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            postalCode:cep,
            cart:Gomez.cart()
          })
        }
      );

      const data = await response.json();

      if(!response.ok){
        throw new Error(
          data.error ||
          'Não foi possível calcular o frete.'
        );
      }

      const options = data.options || [];

      out.innerHTML = options.length
        ? options.map((option,index) => `
            <button
              class="shipping-option"
              data-ship-index="${index}"
              style="text-align:left"
            >
              <span>
                <strong>
                  ${Gomez.escape(option.name)}
                </strong>

                <br>

                <small>
                  ${
                    option.delivery_time
                    ? `Prazo estimado: ${option.delivery_time} dias`
                    : ''
                  }
                </small>
              </span>

              <strong>
                ${Gomez.money(Number(option.price))}
              </strong>

            </button>
          `).join('')

        : `
          <div class="notice">
            Nenhuma opção encontrada para este CEP.
          </div>
        `;

      out
        .querySelectorAll('[data-ship-index]')
        .forEach(button => {

          button.addEventListener('click', () => {

            shipping =
              options[
                Number(button.dataset.shipIndex)
              ];

            document.querySelector(
              '#cartTotal'
            ).textContent =
              Gomez.money(
                Gomez.productTotal() +
                Number(shipping.price || 0)
              );

            const wa =
              document.querySelector('#waBtn');

            wa.href =
              Gomez.whatsappUrl(
                Gomez.orderMessage(
                  Gomez.cart(),
                  {},
                  shipping
                )
              );

            out
              .querySelectorAll('button')
              .forEach(item => {
                item.style.outline = 'none';
              });

            button.style.outline =
              '2px solid #c79b32';
          });

        });

    }catch(error){

      out.innerHTML = `
        <div class="notice">
          ${Gomez.escape(error.message)}
        </div>
      `;
    }
  }

  render();
});
