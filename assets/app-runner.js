export const AppRunner = (() => {
  let current = null;
  const mountEl = document.getElementById('app-view');

  const unmount = async () => {
    try {
      await current?.api?.unmount?.();
    } catch {}
    if (current?.cleanup) {
      try {
        current.cleanup();
      } catch {}
    }
    mountEl?.replaceChildren?.();
    current = null;
  };

  const load = async (slug) => {
    if (current?.slug === slug) return;
    await unmount();

    try {
      const url = `/apps/${slug}/app.js`;
      const { default: api } = await import(/* @vite-ignore */ url);

      const cleanup = await api?.mount?.(mountEl, {});
      current = { slug, api, cleanup };

      document.title = `${api?.meta?.title ?? slug} — channeul.world`;
    } catch (e) {
      if (mountEl) {
        mountEl.innerHTML = `
          <section class="card" style="margin-top:16px">
            <div class="card-body">
              <h3 class="card-title">앱을 불러오지 못했습니다</h3>
              <p class="card-desc"><b>${slug}</b> 를(을) 로드할 수 없어요.</p>
            </div>
          </section>`;
      }
      console.error(e);
    }
  };

  return { load, unmount };
})();
