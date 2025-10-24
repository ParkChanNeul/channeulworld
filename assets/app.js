import { startRouter, setRouteIndicator } from '/assets/router.js';
import { AppRunner } from '/assets/app-runner.js';

const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];
const storeKey = "channeul::state";
const initialState = { theme:null, lang:"kr", q:"", cats:[], favs:[] };

const loadState = () => { try{ return JSON.parse(localStorage.getItem(storeKey)) || {...initialState}; }catch{ return {...initialState}; } };
const saveState = (st) => localStorage.setItem(storeKey, JSON.stringify(st));
let state = loadState();

const boot = () => {
qs('#year').textContent = new Date().getFullYear();

const systemPrefersDark = () => window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
if (state.theme === null) { state.theme = systemPrefersDark() ? "dark" : "light"; saveState(state); }
const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  const isDark = state.theme === "dark";
  const btn = qs("#themeToggle");
  if (btn){ btn.textContent = isDark ? "🌙" : "☀️"; btn.setAttribute("aria-pressed", String(isDark)); }
};
qs("#themeToggle")?.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState(state); applyTheme();
});
applyTheme();

const I18N = {
  kr: { lang:"ko", heroTitle:"마이크로 캠페인 허브", heroSub:"정적 HTML + 브라우저 로직만으로 동작합니다.", searchPlaceholder:"검색 (예: 더치페이, 운세)" },
  en: { lang:"en", heroTitle:"Micro Campaign Hub", heroSub:"Runs on static HTML + browser logic.", searchPlaceholder:"Search (e.g., Split bill, Fortune)" }
};
const applyLang = () => {
  const t = I18N[state.lang] || I18N.kr;
  document.documentElement.lang = t.lang;
  const heroTitle = qs("#heroTitle"); if (heroTitle) heroTitle.textContent = t.heroTitle;
  const heroSub = qs(".hero .sub"); if (heroSub) heroSub.textContent = t.heroSub;
  const inputQ = qs("#q"); if (inputQ) inputQ.placeholder = t.searchPlaceholder;
  qs("#langToggle")?.setAttribute("aria-pressed", String(state.lang === "en"));
};
qs("#langToggle")?.addEventListener("click", () => {
  state.lang = state.lang === "kr" ? "en" : "kr"; saveState(state); applyLang();
});
applyLang();

const inputQ = qs("#q");
const applySearch = () => {
  const q = (state.q || "").trim().toLowerCase();
  qsa(".card").forEach(card => {
    const txt = (card.textContent || "").toLowerCase();
    const passQ = txt.includes(q);
    const cats = (card.dataset.cats || "").split(/\s+/);
    const passCat = state.cats.length ? state.cats.some(c => cats.includes(c)) : true;
    card.style.display = (passQ && passCat) ? "" : "none";
  });
};
inputQ?.addEventListener("input", (e) => { state.q = e.target.value; saveState(state); applySearch(); });
qsa(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const c = chip.dataset.cat;
    state.cats = state.cats.includes(c) ? state.cats.filter(x => x !== c) : [...state.cats, c];
    saveState(state);
    qsa(".chip").forEach(ch => ch.setAttribute("aria-pressed", String(state.cats.includes(ch.dataset.cat))));
    applySearch();
  });
});
applySearch();

const applyFavs = () => {
  qsa(".fav").forEach(btn => {
    const app = btn.dataset.app;
    const on = state.favs.includes(app);
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "★" : "☆";
  });
};
qsa(".fav").forEach(btn => {
  btn.addEventListener("click", () => {
    const app = btn.dataset.app;
    state.favs = state.favs.includes(app) ? state.favs.filter(x => x !== app) : [...state.favs, app];
    saveState(state); applyFavs();
    window.gtag?.('event','toggle_fav',{ app, on: state.favs.includes(app) });
  });
});
applyFavs();

const updatePopularity = async (windowDays=30) => {
  try {
    const res = await fetch(`/.netlify/functions/popular?window=${windowDays}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('popular fetch failed');
    const data = await res.json();
    const map = new Map(data.items.map(i => [i.slug, i.metrics?.open || 0]));
    qsa('.card').forEach(card => {
      const slug = card.dataset.slug;
      const el = card.querySelector('.pop');
      if (el) el.textContent = map.has(slug) ? map.get(slug) : '–';
    });
  } catch(e){
    qsa('.card .pop').forEach(el => el.textContent = '–');
  }
};
const PROD_DOMAIN = /(^|\.)channeul\.world$/i.test(location.hostname) || /netlify\.app$/i.test(location.hostname);
const USE_FUNCTIONS = document.documentElement.dataset.useFunctions === "true";
if (PROD_DOMAIN && USE_FUNCTIONS) { updatePopularity(30); }

startRouter();
setRouteIndicator();
}; 

window.addEventListener('DOMContentLoaded', boot);
