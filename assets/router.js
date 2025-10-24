const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

export const parseRoute = () => {
  // "#/app/calc-split" → ["app","calc-split",...]
  const seg = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  return { name: seg[0] || 'home', params: seg.slice(1) };
};

export const setRouteIndicator = () => {
  // bottom-nav에 aria-current 세팅
  const { name } = parseRoute();
  qsa('.bn-item').forEach((el) => el.removeAttribute('aria-current'));
  const hit = qs(`.bn-item[data-route="${name}"]`);
  if (hit) {
    hit.setAttribute('aria-current', 'page');
  } else {
    // 홈 (#/app/slug 등)일 때는 홈으로 유지
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
  av.replaceChildren(); // 앱 뷰 비우기

  // 포커스 이동(접근성)
  qs('#main')?.focus();

  setRouteIndicator();
};

const showFavorites = () => {
  // MVP: 일단 홈을 그대로 보여주고
  // 나중에 "즐겨찾기만 필터링된 뷰" 구현 예정
  showHome();
};

const showPopular = () => {
  // MVP: 일단 홈 동일
  showHome();
};

const showApp = async (slug) => {
  const hv = qs('#home-view');
  const av = qs('#app-view');
  if (!hv || !av) return;

  hv.hidden = true;
  av.hidden = false;
  av.replaceChildren(); // mount 전에 깨끗하게

  // 앱 로더
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
    // fallback
    showHome();
  };

  window.addEventListener('hashchange', onRoute);
  onRoute();
};
