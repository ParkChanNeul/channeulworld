const template = /*html*/ `
<section class="card" style="margin-top:16px;display:flex;flex-direction:column;gap:12px;">
  <div style="display:flex;align-items:flex-start;gap:12px;">
    <svg width="64" height="64" aria-hidden="true"><use href="#thumb-calc"/></svg>
    <div>
      <h1 class="card-title" style="margin:0;">더치페이 계산기</h1>
      <p class="card-desc" style="margin:4px 0 0;color:var(--muted);">
        부가세·팁 포함 총액을 인원별로 나눕니다.
      </p>
    </div>
  </div>

  <div class="row"
    style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;">
    <label for="amount">총액</label>
    <input id="amount" type="number" placeholder="82500"
      style="border:1px solid var(--line);background:var(--card-bg);color:var(--fg);
             border-radius:var(--radius-sm);padding:8px 10px;min-width:120px;"/>
  </div>

  <div class="row"
    style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;">
    <label for="vat">부가세(%)</label>
    <input id="vat" type="number" value="0"
      style="border:1px solid var(--line);background:var(--card-bg);color:var(--fg);
             border-radius:var(--radius-sm);padding:8px 10px;min-width:120px;"/>
  </div>

  <div class="row"
    style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;">
    <label for="tip">팁(%)</label>
    <input id="tip" type="number" value="0"
      style="border:1px solid var(--line);background:var(--card-bg);color:var(--fg);
             border-radius:var(--radius-sm);padding:8px 10px;min-width:120px;"/>
  </div>

  <div class="row"
    style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;">
    <label for="people">인원</label>
    <input id="people" type="number" value="2" min="1"
      style="border:1px solid var(--line);background:var(--card-bg);color:var(--fg);
             border-radius:var(--radius-sm);padding:8px 10px;min-width:120px;"/>
  </div>

  <div class="card-actions" style="margin-top:4px;">
    <button id="run" class="btn primary" type="button">
      <svg width="18" height="18" aria-hidden="true"
        style="margin-right:4px;"><use href="#i-run"/></svg> 실행
    </button>

    <button id="share" class="btn ghost" type="button">
      <svg width="18" height="18" aria-hidden="true"
        style="margin-right:4px;"><use href="#i-share"/></svg> 공유
    </button>

    <button id="reset" class="btn ghost" type="button">
      <svg width="18" height="18" aria-hidden="true"
        style="margin-right:4px;"><use href="#i-reset"/></svg> 리셋
    </button>
  </div>

  <div id="out" class="result"
    style="font-weight:700;font-size:16px;">1인 금액: -</div>
</section>
`;

const mount = async (el) => {
  el.insertAdjacentHTML('beforeend', template);

  const $ = (sel) => el.querySelector(sel);
  const numVal = (sel) => Number($(sel).value || 0);

  const calc = () => {
    const amount = numVal('#amount');
    const vat    = numVal('#vat');
    const tip    = numVal('#tip');
    const people = Math.max(1, numVal('#people'));

    const total =
      amount * (1 + vat / 100) * (1 + tip / 100);

    const each = isFinite(total / people)
      ? Math.ceil(total / people)
      : 0;

    $('#out').textContent =
      `1인 금액: ${each.toLocaleString()}원`;
  };

  const onRun = () => { calc(); };
  const onReset = () => {
    $('#amount').value = '';
    $('#vat').value = '0';
    $('#tip').value = '0';
    $('#people').value = '2';
    $('#out').textContent = '1인 금액: -';
  };
  const onShare = async () => {
    const url = location.href;
    const text = '더치페이 계산기 — channeul.world';
    try {
      if (navigator.share) {
        await navigator.share({ title:text, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('링크가 복사되었습니다.');
      }
    } catch {
      /* 사용자가 취소한 경우 등 무시 */
    }
  };

  $('#run').addEventListener('click', onRun);
  $('#reset').addEventListener('click', onReset);
  $('#share').addEventListener('click', onShare);

  // cleanup fn
  return () => {
    $('#run')?.removeEventListener('click', onRun);
    $('#reset')?.removeEventListener('click', onReset);
    $('#share')?.removeEventListener('click', onShare);
  };
};

const unmount = () => {};

export default {
  meta: {
    title: '더치페이 계산기',
    desc: '부가세·팁 포함 금액 n-way split',
  },
  mount,
  unmount,
};
