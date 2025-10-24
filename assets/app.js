import { startRouter, setRouteIndicator } from '/assets/router.js';
import { AppRunner } from '/assets/app-runner.js';

const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

const STORE_KEY = 'channeul::state';
const defaultState = {
  theme: null,
  lang: 'kr',
  favs: [],
};

const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { ...defaultState };
  } catch {
    return { ...defaultState };
  }
};

const saveState = (st) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(st));
};

let state = loadState();

const initTheme = () => {
  const prefersDark = () =>
    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;

  if (state.theme === null) {
    state.theme = prefersDark() ? 'dark' : 'light';
    saveState(state);
  }

  const applyTheme = () => {
    document.documentElement.dataset.theme = state.theme;
    const isDark = state.theme === 'dark';
    const btn = qs('#themeToggle');
    if (btn) {
      btn.textContent = isDark ? '🌙' : '☀️';
      btn.setAttribute('aria-pressed', String(isDark));
    }
  };

  qs('#themeToggle')?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveState(state);
    applyTheme();
  });

  applyTheme();
};

const initLang = () => {
  const I18N = {
    kr: {
      placeholder: '검색 (예: 더치페이, QR, 세후 월급)',
    },
    en: {
      placeholder: 'Search (e.g. split bill, QR code, after-tax pay)',
    },
  };

  const applyLang = () => {
    const t = I18N[state.lang] || I18N.kr;
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'ko';
    const searchInput = qs('#globalSearch');
    if (searchInput) {
      searchInput.placeholder = t.placeholder;
    }
    qs('#langToggle')?.setAttribute(
      'aria-pressed',
      String(state.lang === 'en')
    );
  };

  qs('#langToggle')?.addEventListener('click', () => {
    state.lang = state.lang === 'kr' ? 'en' : 'kr';
    saveState(state);
    applyLang();
  });

  applyLang();
};

const initFavs = () => {
  const applyFavUI = () => {
    qsa('.fav').forEach((btn) => {
      const app = btn.dataset.app;
      const on = state.favs.includes(app);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? '★' : '☆';
    });
  };

  qsa('.fav').forEach((btn) => {
    btn.addEventListener('click', () => {
      const app = btn.dataset.app;
      if (state.favs.includes(app)) {
        state.favs = state.favs.filter((x) => x !== app);
      } else {
        state.favs = [...state.favs, app];
      }
      saveState(state);
      applyFavUI();
    });
  });

  applyFavUI();
};

const initSearch = () => {
  const input = qs('#globalSearch');
  if (!input) return;

  const runFilter = () => {
    const q = (input.value || '').trim().toLowerCase();
    qsa('.cards-grid .card').forEach((card) => {
      const txt = (card.textContent || '').toLowerCase();
      card.style.display = txt.includes(q) ? '' : 'none';
    });
  };

  input.addEventListener('input', runFilter);
};

const initPopularity = () => {};

const initYear = () => {
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();
};

const initRouter = () => {
  startRouter();
  setRouteIndicator();
};

const boot = () => {
  initYear();
  initTheme();
  initLang();
  initFavs();
  initSearch();
  initPopularity();
  initRouter();
};

window.addEventListener('DOMContentLoaded', boot);
