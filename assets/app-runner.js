export const AppRunner = (() => {
  let current = null;
  const mountEl = document.getElementById('app-view');

  const unmount = async () => {
    try { await current?.api?.unmount?.(); } catch {}
    if (current?.cleanup) { try { current.cleanup(); } catch {} }
    mountEl?.replaceChildren?.();
    current = null;
  };

  const load = async (slug) => {
    if (current?.slug === slug) return;
    await unmount();
    try {
      const url = `/apps/${slug}/app.js`;
      const { default: api } = await import(/* @vite-ignore */ url);
      if (mountEl) {
        mountEl.hidden = false;
        const hv = document.getElementById('home-view'); if (hv) hv.hidden = true;
      }
      document.title = `${api?.meta?.title ?? slug} — channeul.world`;
      const cleanup = await api?.mount?.(mountEl, {});
      current = { slug, api, cleanup };
      window.gtag?.('event','view_app',{ app: slug });
    } catch (e) {
      if (mountEl) mountEl.innerHTML = `<p style="padding:16px">앱을 불러오지 못했습니다: <b>${slug}</b></p>`;
      console.error(e);
    }
  };

  return { load, unmount };
})();
