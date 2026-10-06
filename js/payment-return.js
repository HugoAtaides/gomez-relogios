document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const ref = params.get('external_reference') || '';
  const target = document.querySelector('[data-order-ref]');
  if(target && ref) target.textContent = ref;
  if(location.pathname.endsWith('/sucesso.html')){
    localStorage.removeItem('gomez_cart');
  }
});
