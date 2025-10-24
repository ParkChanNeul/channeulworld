const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

export const parseRoute = () => {
  const seg = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  return { name: seg[0] || 'home', params: seg.slice(1) };
};

export const setRouteIndicator = () => {
  const { name } = parseRoute();
  qsa('.bn-item').forEach(el => el.removeAttribute('aria-current'));
  const hit = qs(`.bn-item[data-route="${name}"]`);
  if (hit) hit.setAttribute('aria-current','page');
};

const showHome = () => {
  const hv = qs('#home-view');
  const av = qs('#app-view');
  if (!hv || !av) return;
  hv.hidden = false;
  av.hidden = true;
  qs('#main')?.focus();
  window.gtag?.('event','view_home',{});
  setRouteIndicator();
};

const showFavorites = () => {
  const hv = qs('#home-view');
  const av = qs('#app-view');
  if (!hv || !av) return;
  const favs = JSON.parse(localStorage.getItem('channeul::state')||'{}').favs || [];
  const cards = qsa('#cards .card');
  cards.forEach(c => c.style.display = favs.includes(c.dataset.slug) ? '' : 'none');
  hv.hidden = false;
  av.hidden = true;
  setRouteIndicator();
};

const showPopular = () => {
  const hv = qs('#home-view');
  const av = qs('#app-view');
  if (!hv || !av) return;
  hv.hidden = false;
  av.hidden = true;
  setRouteIndicator();
};

export const startRouter = () => {
  const onRoute = async () => {
    const { name, params } = parseRoute();
    if (name === 'home') return showHome();
    if (name === 'favorites') return showFavorites();
    if (name === 'popular') return showPopular();
    if (name === 'app' && params[0]){
      const { AppRunner } = await import('/assets/app-runner.js');
      const hv = qs('#home-view');
      const av = qs('#app-view');
      if (hv && av) { hv.hidden = true; av.hidden = false; }
      await AppRunner.load(params[0]);
      setRouteIndicator();
      return;
    }
    showHome();
  };
  window.addEventListener('hashchange', onRoute);
  onRoute();
};
