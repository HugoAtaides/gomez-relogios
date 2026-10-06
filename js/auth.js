(function(){
  const config = window.GOMEZ_CONFIG || {};
  const STORAGE_KEY = 'gomez_checkout_next';
  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  let client = null;
  let readyPromise = null;

  function isConfigured(){
    const url = String(config.supabaseUrl || '').trim();
    const key = String(config.supabasePublishableKey || config.supabaseAnonKey || '').trim();
    return Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.includes('YOUR_'));
  }

  function safeRelativePath(value){
    if (!value) return 'minha-conta.html';
    try{
      const url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin) return 'minha-conta.html';
      return url.pathname + url.search + url.hash;
    }catch{
      return 'minha-conta.html';
    }
  }

  function loadSupabase(){
    if (window.supabase) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-supabase-client]');
      if (existing){
        existing.addEventListener('load', resolve, { once:true });
        existing.addEventListener('error', reject, { once:true });
        return;
      }
      const script = document.createElement('script');
      script.src = SUPABASE_CDN;
      script.async = true;
      script.dataset.supabaseClient = '1';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Não foi possível carregar o serviço de autenticação.'));
      document.head.appendChild(script);
    });
  }

  function init(){
    if (!isConfigured()) return null;
    if (!window.supabase) throw new Error('Biblioteca Supabase não carregada.');
    const url = String(config.supabaseUrl).trim();
    const key = String(config.supabasePublishableKey || config.supabaseAnonKey).trim();
    client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
    return client;
  }

  readyPromise = (async () => {
    if (!isConfigured()) return null;
    await loadSupabase();
    return init();
  })();

  async function getClient(){
    return await readyPromise;
  }

  async function getSession(){
    const supabase = await getClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function getUser(){
    const session = await getSession();
    return session?.user || null;
  }

  async function signIn(provider, next){
    const supabase = await getClient();
    if (!supabase) throw new Error('Configure o Supabase no arquivo data.js antes de usar o login.');
    const destination = safeRelativePath(next);
    localStorage.setItem(STORAGE_KEY, destination);
    const redirectTo = `${window.location.origin}/login.html`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    });
    if (error) throw error;
  }

  async function signOut(){
    const supabase = await getClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  function consumeNext(defaultPath='minha-conta.html'){
    const next = localStorage.getItem(STORAGE_KEY) || defaultPath;
    localStorage.removeItem(STORAGE_KEY);
    return safeRelativePath(next);
  }

  async function requireAuth(next='minha-conta.html'){
    const session = await getSession();
    if (session) return session;
    const destination = safeRelativePath(next);
    window.location.href = `login.html?next=${encodeURIComponent(destination)}`;
    return null;
  }

  window.GomezAuth = {
    ready: readyPromise,
    isConfigured,
    getClient,
    getSession,
    getUser,
    signIn,
    signOut,
    consumeNext,
    requireAuth
  };
})();
