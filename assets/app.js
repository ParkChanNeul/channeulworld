import { startRouter, setRouteIndicator } from '/assets/router.js';
import { AppRunner } from '/assets/app-runner.js';

const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

const STORE_KEY = 'channeul::state';
const defaultState = {
  theme: null, // "light" | "dark"
  lang: 'kr',  // "kr" | "en"
  favs: [],    // ["calc-split", ...]
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

/**
 * THEME HANDLING
 * - prefers-color-scheme 반영
 * - localStorage 저장
 * - 토글 버튼(헤더)에서 아이콘 업데이트
 */
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

/**
 * LANGUAGE HANDLING
 * - 지금은 텍스트 일부만 바꾼다 (hero copy 대신 섹션 안내 정도)
 * - 실제 다국어 전환은 추후 카드 title/desc에 i18n map 추가해서 확장
 */
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

/**
 * FAVORITES
 * - 즐겨찾기 토글 시 localStorage 반영
 * - 초기 로드시 버튼 상태(★ / ☆) 세팅
 */
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

/**
 * SEARCH / FILTER HOOK
 * - 지금은 전체 텍스트에 대해 단순 포함 검색
 * - 추후 카테고리별 필터, GEO필터 등 확장 가능
 */
const initSearch = () => {
  const input = qs('#globalSearch');
  if (!input) return;

  const runFilter = () => {
    const q = (input.value || '').trim().toLowerCase();
    // 필터 기준: 카드 전체 텍스트
    qsa('.cards-grid .card').forEach((card) => {
      const txt = (card.textContent || '').toLowerCase();
      card.style.display = txt.includes(q) ? '' : 'none';
    });
    // CTA 리스트는 숨기지 않음 (바로가기 섹션은 계속 보여줄 가치가 있음)
  };

  input.addEventListener('input', runFilter);
};

/**
 * POPULARITY / ANALYTICS PLACEHOLDER
 * - prod에서만 Netlify function을 불러서 인기 지표 반영할 예정
 * - 지금은 기능 비활성
 */
const initPopularity = () => {
  // placeholder no-op
};

/**
 * YEAR FOOTER
 */
const initYear = () => {
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();
};

/**
 * ROUTER INIT
 * - #/app/slug 로 들어오면 home-view 숨기고 app-view mount
 * - #/favorites, #/popular 등은 차후 구현
 */
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
