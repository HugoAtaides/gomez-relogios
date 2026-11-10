
(function () {
  const config = window.GOMEZ_CONFIG || {};

  const STORAGE_KEY = 'gomez_checkout_next';

  const SUPABASE_CDN =
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  const ALLOWED_PROVIDERS = ['google', 'facebook'];

  let client = null;
  let readyPromise = null;

  function isConfigured() {
    const url = String(config.supabaseUrl || '').trim();

    const key = String(
      config.supabasePublishableKey ||
      config.supabaseAnonKey ||
      ''
    ).trim();

    return Boolean(
      url &&
      key &&
      !url.includes('YOUR_PROJECT') &&
      !key.includes('YOUR_')
    );
  }

  /*
   * Aceita somente destinos dentro do próprio site.
   * Isso impede redirecionamentos para sites externos.
   */
  function safeRelativePath(value) {
    if (!value) {
      return '/minha-conta.html';
    }

    try {
      const url = new URL(
        String(value),
        window.location.origin
      );

      if (url.origin !== window.location.origin) {
        return '/minha-conta.html';
      }

      return (
        url.pathname +
        url.search +
        url.hash
      );

    } catch (error) {
      return '/minha-conta.html';
    }
  }

  function loadSupabase() {
    if (window.supabase) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[data-supabase-client]'
      );

      if (existing) {
        existing.addEventListener(
          'load',
          resolve,
          { once: true }
        );

        existing.addEventListener(
          'error',
          () => reject(
            new Error(
              'Não foi possível carregar o serviço de autenticação.'
            )
          ),
          { once: true }
        );

        return;
      }

      const script = document.createElement('script');

      script.src = SUPABASE_CDN;
      script.async = true;
      script.dataset.supabaseClient = '1';

      script.onload = resolve;

      script.onerror = () => {
        reject(
          new Error(
            'Não foi possível carregar o serviço de autenticação.'
          )
        );
      };

      document.head.appendChild(script);
    });
  }

  function init() {
    if (!isConfigured()) {
      return null;
    }

    if (!window.supabase) {
      throw new Error(
        'Biblioteca Supabase não carregada.'
      );
    }

    const url = String(
      config.supabaseUrl
    ).trim();

    const key = String(
      config.supabasePublishableKey ||
      config.supabaseAnonKey
    ).trim();

    client = window.supabase.createClient(
      url,
      key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    );

    return client;
  }

  /*
   * Inicialização do Supabase.
   */
  readyPromise = (async function () {
    if (!isConfigured()) {
      return null;
    }

    await loadSupabase();

    return init();
  })();

  async function getClient() {
    return await readyPromise;
  }

  async function getSession() {
    const supabase = await getClient();

    if (!supabase) {
      return null;
    }

    const { data, error } =
      await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session || null;
  }

  async function getUser() {
    const session = await getSession();

    return session?.user || null;
  }

  /*
   * Login social.
   *
   * Agora aceita somente:
   * - Google
   * - Facebook
   */
  async function signIn(provider, next) {
    const supabase = await getClient();

    if (!supabase) {
      throw new Error(
        'Configure o Supabase no arquivo data.js antes de usar o login.'
      );
    }

    const selectedProvider = String(
      provider || ''
    ).toLowerCase();

    if (!ALLOWED_PROVIDERS.includes(selectedProvider)) {
      throw new Error(
        'Provedor de autenticação não permitido.'
      );
    }

    const destination = safeRelativePath(next);

    /*
     * Guarda o destino para recuperá-lo
     * depois que o Supabase concluir o OAuth.
     */
    try {
      localStorage.setItem(
        STORAGE_KEY,
        destination
      );
    } catch (error) {
      throw new Error(
        'Não foi possível guardar o destino do login. Verifique as configurações do navegador.'
      );
    }

    /*
     * O Supabase retorna o usuário para login.html.
     * O login.html recuperará a sessão e redirecionará
     * o usuário para a página originalmente solicitada.
     */
    const redirectTo =
      `${window.location.origin}/login.html`;

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: selectedProvider,
        options: {
          redirectTo
        }
      });

    if (error) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (storageError) {
        // Não interrompe o tratamento do erro original.
      }

      throw error;
    }
  }

  async function signOut() {
    const supabase = await getClient();

    if (!supabase) {
      return;
    }

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  /*
   * Recupera o destino salvo após o login.
   */
  function consumeNext(defaultPath = '/minha-conta.html') {
    let next = defaultPath;

    try {
      next =
        localStorage.getItem(STORAGE_KEY) ||
        defaultPath;

      localStorage.removeItem(STORAGE_KEY);

    } catch (error) {
      next = defaultPath;
    }

    return safeRelativePath(next);
  }

  async function requireAuth(
    next = '/minha-conta.html'
  ) {
    const session = await getSession();

    if (session) {
      return session;
    }

    const destination = safeRelativePath(next);

    window.location.href =
      `login.html?next=${encodeURIComponent(destination)}`;

    return null;
  }

  /*
   * Disponibiliza as funções para as páginas do site.
   */
  window.GomezAuth = {
    ready: readyPromise,

    isConfigured,

    getClient,

    getSession,

    getUser,

    signIn,

    signOut,

    consumeNext,

    requireAuth,

    safeRelativePath
  };

})();
