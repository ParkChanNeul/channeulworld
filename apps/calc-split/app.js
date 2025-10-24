const template = /*html*/`
  <section class="card" style="display:grid;gap:12px">
    <div style="display:flex;align-items:center;gap:12px">
      <svg width="64" height="64" aria-hidden="true"><use href="#thumb-calc"/></svg>
      <div>
        <h1 class="card-title" style="margin:0">더치페이 계산기</h1>
        <p class="card-desc" style="margin:4px 0 0;color:var(--muted)">부가세·팁 포함 총액을 인원별로 나눕니다.</p>
      </div>
    </div>

    <div class="row" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
      <label for="amount">총액</label>
      <input id="amount" type="number" placeholder="82500" />
    </div>
    <div class="row" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
      <label for="vat">부가세(%)</label>
      <input id="vat" type="number" value="0" />
    </div>
    <div class="row" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
      <label for="tip">팁(%)</label>
      <input id="tip" type="number" value="0" />
    </div>
    <div class="row" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
      <label for="people">인원</label>
      <input id="people" type="number" value="2" min="1" />
    </div>

    <div class="card-actions" style="margin-top:4px">
      <button id="run" class="btn primary" type="button"><svg width="18" height="18" aria-hidden="true" style="margin-right:4px"><use href="#i-run"/></svg> 실행</button>
      <button id="share" class="btn ghost" type="button"><svg width="18" height="18" aria-hidden="true" style="margin-right:4px"><use href="#i-share"/></svg> 공유</button>
      <button id="reset" class="btn ghost" type="button"><svg width="18" height="18" aria-hidden="true" style="margin-right:4px"><use href="#i-reset"/></svg> 리셋</button>
    </div>

    <div id="out" class="result" style="font-weight:700">1인 금액: -</div>
  </section>
`;

const mount = async (el) => {
  el.insertAdjacentHTML('beforeend', template);
  const $ = (s) => el.querySelector(s);
  const n = (id) => Number($(id).value || 0);

  const calc = () => {
    const amount = n('#amount'), vat = n('#vat'), tip = n('#tip');
    const people = Math.max(1, n('#people'));
    const total = amount * (1 + vat/100) * (1 + tip/100);
    const each = isFinite(total/people) ? Math.ceil(total/people) : 0;
    $('#out').textContent = `1인 금액: ${each.toLocaleString()}원`;
    window.gtag?.('event','result_visible',{ app:'calc-split' });
  };

  const onRun = () => { calc(); window.gtag?.('event','run_app',{ app:'calc-split' }); };
  const onReset = () => { ['#amount','#vat','#tip','#people'].forEach(id => $(id).value = id==='#people' ? 2 : 0); $('#out').textContent = '1인 금액: -'; };
  const onShare = async () => {
    const url = location.href;
    const text = '더치페이 계산기 — channeul.world';
    try{
      if (navigator.share){ await navigator.share({ title:text, text, url }); window.gtag?.('event','share_success',{ app:'calc-split', method:'web_share' }); }
      else { await navigator.clipboard.writeText(url); window.gtag?.('event','share_success',{ app:'calc-split', method:'copy' }); alert('링크가 복사되었습니다.'); }
    }catch{ /* user cancel */ }
    window.gtag?.('event','share_click',{ app:'calc-split', method: navigator.share ? 'web_share' : 'copy' });
  };

  el.querySelector('#run').addEventListener('click', onRun);
  el.querySelector('#reset').addEventListener('click', onReset);
  el.querySelector('#share').addEventListener('click', onShare);

  return () => {
    el.querySelector('#run')?.removeEventListener('click', onRun);
    el.querySelector('#reset')?.removeEventListener('click', onReset);
    el.querySelector('#share')?.removeEventListener('click', onShare);
  };
};

const unmount = () => {};

export default { meta: { title: '더치페이 계산기', desc: '부가세·팁 포함 더치페이' }, mount, unmount };
