const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

export const parseRoute = () => {
  const seg = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  return { name: seg[0] || 'home', params: seg.slice(1) };
};

export const setRouteIndicator = () => {
  const { name } = parseRoute();
  qsa('.bn-item').forEach((el) => el.removeAttribute('aria-current'));
  const hit = qs(`.bn-item[data-route="${name}"]`);
  if (hit) {
    hit.setAttribute('aria-current', 'page');
  } else {
    const home = qs('.bn-item[data-route="home"]');
    if (home) home.setAttribute('aria-current', 'page');
  }
};

const showHome = () => {
  const hv = qs('#home-view');
  const av = qs('#app-view');
  if (!hv || !av) return;

  hv.hidden = false;
  av.hidden = true;
  av.replaceChildren();

  qs('#main')?.focus();

  setRouteIndicator();
};

const showFavorites = () => {
  showHome();
};

const showPopular = () => {
  showHome();
};

const showApp = async (slug) => {
  const hv = qs('#home-view');
  const av = qs('#app-view');
  if (!hv || !av) return;

  hv.hidden = true;
  av.hidden = false;
  av.replaceChildren();

  const { AppRunner } = await import('/assets/app-runner.js');
  await AppRunner.load(slug);

  setRouteIndicator();
};

export const startRouter = () => {
  const onRoute = async () => {
    const { name, params } = parseRoute();

    if (name === 'home') return showHome();
    if (name === 'favorites') return showFavorites();
    if (name === 'popular') return showPopular();
    if (name === 'app' && params[0]) {
      return showApp(params[0]);
    }
    showHome();
  };

  window.addEventListener('hashchange', onRoute);
  onRoute();
};
