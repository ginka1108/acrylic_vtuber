/* =========================================================================
 *  毎日おはV — アプリ本体（基幹・固定）
 *   - 公開ルール：「今日」から数えて7日分（今日〜6日後）のテーマだけを選べる
 *   - テーマは assets/themes/YYYY-MM-DD/theme.js（フォルダ名＝その日の日付）
 *     一覧ファイルは持たず、7日分の日付のフォルダを直接読みに行く。無い日は「準備中」
 *   - 立ち絵の読み込み / 位置・大きさ調整 / 保存 / Xへ投稿
 *   - 立ち絵と調整値はブラウザ(IndexedDB)に覚えておき、翌日は開くだけで出る
 *
 *  URLパラメータ（任意）
 *   ?date=YYYY-MM-DD   … 7日の範囲内の日を開く（範囲外は今日になる）
 *   ?dev&date=YYYY-MM-DD … 制作確認用。範囲の制限なしで、その日から7日分を並べる
 * ====================================================================== */
(function () {
'use strict';
const OhaV = window.OhaV = window.OhaV || {};
const E = OhaV.E;
const $ = (id) => document.getElementById(id);
const THEME_ROOT = 'assets/themes/';
const WINDOW_DAYS = 7;                      // 今日を含めて何日分を公開するか
const CAPTION_FONTS = ['400 100px "Righteous"', '500 100px "Oswald"', '700 100px "Oswald"', '900 100px "Noto Sans JP"'];   // 共通キャプション・日付カレンダー用（index.html で読み込み）
const WEEK_JA = ['日', '月', '火', '水', '木', '金', '土'];

/* ---------------- 日付 ---------------- */
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const QS = new URLSearchParams(location.search);
const DEV = QS.has('dev');
const TODAY = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); })();

/* 並べる7日間。通常は今日から。dev のときは ?date の日から */
function windowDates() {
  const start = DEV && parseYmd(QS.get('date')) ? parseYmd(QS.get('date')) : TODAY;
  return Array.from({ length: WINDOW_DAYS }, (_, i) => ymd(addDays(start, i)));
}

/* ---------------- テーマの読み込み ----------------
 * theme.js は OhaV.defineTheme({...}) を呼ぶだけのファイル。
 * どの日付のファイルから呼ばれたかは <script data-date> で見分ける。 */
const pending = new Map();
OhaV.defineTheme = (def) => {
  const sc = document.currentScript;
  const date = sc && sc.dataset.date;
  if (date && pending.has(date)) pending.get(date)(def);
};
function loadThemeScript(date) {
  return new Promise((ok) => {
    const s = document.createElement('script');
    s.dataset.date = date;
    // GitHub Pages のキャッシュ対策：日付が変わると必ず取り直す
    s.src = `${THEME_ROOT}${date}/theme.js?v=${ymd(new Date()).replace(/-/g, '')}${DEV ? '-' + Date.now() : ''}`;
    const done = (def) => { pending.delete(date); ok(def || null); };
    pending.set(date, done);
    s.onerror = () => done(null);                 // まだ無い日＝準備中
    s.onload = () => setTimeout(() => done(null), 0);  // defineTheme を呼ばなかった場合の保険
    document.head.appendChild(s);
  });
}
function loadImage(src) {
  return new Promise((ok, ng) => {
    const im = new Image();
    im.onload = () => ok(im); im.onerror = () => ng(new Error('画像読み込み失敗: ' + src));
    im.src = src;
  });
}
/* 選んだテーマの付属物（フォント・画像）を用意する。1回だけ */
async function prepareTheme(t) {
  if (t._ready) return t._ready;
  t._ready = (async () => {
    if (t.googleFonts) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?' + t.googleFonts + '&display=swap';
      document.head.appendChild(l);
    }
    // フォントの定義（CSS）が届いてから読み込みを始める。届く前に load すると空振りする
    await Promise.all([...document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]')].map(sheetReady));
    t.images = {};
    // 画像が1枚でも欠けたら描かない（欠けたまま出力しない）
    await Promise.all(Object.entries(t.assets || {}).map(([k, file]) =>
      loadImage(t.dir + file).then(im => { t.images[k] = im; })));
    // 日本語フォントは文字ごとに分割配信されるので、実際に描く文字をまとめて読み込む
    const text = 'Good Morning 0123456789/・ JANUARY FEBRUARY MARCH APRIL MAY JUNE JULY AUGUST SEPTEMBER OCTOBER NOVEMBER DECEMBER SUN MON TUE WED THU FRI SAT '
      + (t.title || '') + (t.dayName || '') + (t.fontText || '');
    await waitFonts(CAPTION_FONTS.concat(t.fonts || []), text);
  })();
  return t._ready;
}
function sheetReady(l) {
  if (l.sheet) return Promise.resolve();
  return new Promise((ok, ng) => {
    l.addEventListener('load', () => ok(), { once: true });
    l.addEventListener('error', () => ng(new Error('フォントのCSSを読み込めませんでした: ' + l.href)), { once: true });
  });
}
/* フォントがすべて届くまで待つ。届かなかったら代わりの字体で描かずにエラーにする */
async function waitFonts(specs, sample) {
  await Promise.all((specs || []).map(s => document.fonts.load(s, sample)));
  await document.fonts.ready;
  const missing = (specs || []).filter(s => !document.fonts.check(s, sample));
  if (missing.length) throw new Error('フォントを読み込めませんでした: ' + missing.join(', '));
}

/* ---------------- 保存領域（IndexedDB / 失敗しても動く） ---------------- */
const store = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((ok, ng) => {
    try {
      const r = indexedDB.open('ohav', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => ok(r.result); r.onerror = () => ng(r.error);
    } catch (e) { ng(e); }
  }));
  const tx = (mode, fn) => open().then(db => new Promise((ok, ng) => {
    const t = db.transaction('kv', mode), s = t.objectStore('kv'), req = fn(s);
    t.oncomplete = () => ok(req && req.result); t.onerror = () => ng(t.error);
  }));
  return {
    get: (k) => tx('readonly', s => s.get(k)).catch(() => undefined),
    set: (k, v) => tx('readwrite', s => s.put(v, k)).catch(() => undefined)
  };
})();

/* ---------------- アプリ ---------------- */
const cv = $('preview');
const ctx = cv.getContext('2d');
const state = { theme: null, img: null, meta: null, adj: { scale: 1, dx: 0, dy: 0 }, blob: null, busy: false, again: false, failed: false };

let toastT = 0;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600);
}
/* 失敗したことを画面に出す（代わりの絵で黙って続けない） */
function showError(msg) {
  resetCtx();
  ctx.fillStyle = '#1a1d24'; ctx.fillRect(0, 0, cv.width, cv.height);
  const fs = Math.round(cv.width / 30), lines = msg.split(/(?<=。)/).filter(Boolean);
  ctx.fillStyle = '#ff8a8a'; ctx.font = `700 ${fs}px sans-serif`; ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, cv.width / 2, cv.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.5));
  toast(msg);
}
function setBusy(on) {
  $('spinner').hidden = !on;
  const ready = !on && !!state.img && !state.failed && !!state.blob;
  $('btnSave').disabled = !ready; $('btnShare').disabled = !ready;
}

/* 位置・大きさ（スライダーは % 表示。内部値は scale 倍率 / dx,dy は比率） */
const RANGES = { scale: [50, 200], x: [-50, 50], y: [-50, 50] };
function syncSliders() {
  const a = state.adj;
  $('adjScale').value = Math.round(a.scale * 100);
  $('adjX').value = Math.round(a.dx * 100);
  $('adjY').value = Math.round(-a.dy * 100);   // 上 = プラス
}
function setRanges(ranges) {
  const r = Object.assign({}, RANGES, ranges || {});
  const set = (id, [mn, mx]) => { $(id).min = mn; $(id).max = mx; };
  set('adjScale', r.scale); set('adjX', r.x); set('adjY', r.y);
}
function wireSliders() {
  const on = () => {
    state.adj = { scale: $('adjScale').value / 100, dx: $('adjX').value / 100, dy: -$('adjY').value / 100 };
    store.set('adj:' + state.theme.date, state.adj);
    schedule();
  };
  for (const id of ['adjScale', 'adjX', 'adjY']) $(id).addEventListener('input', on);
  $('adjReset').onclick = () => {
    state.adj = Object.assign({ scale: 1, dx: 0, dy: 0 }, state.theme.defaultAdjust || {});
    syncSliders(); store.set('adj:' + state.theme.date, state.adj); render();
  };
}

/* 立ち絵 */
async function useBlob(blob, remember, noRender) {
  if (!blob || !/^image\//.test(blob.type)) { toast('画像ファイルを選んでください'); return; }
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    state.img = img; state.meta = E.analyzeImage(img);
    if (!state.meta.hasAlpha) toast('背景が透過されていない画像のようです（透過PNG推奨）');
    document.body.classList.add('has-img');
    $('thumb').src = url;
    if (remember) store.set('portrait', blob);
    if (!noRender) render();
  } catch (e) { toast('画像を読み込めませんでした'); }
}
function wirePicker() {
  const input = $('file');
  const pick = () => input.click();
  $('pickEmpty').onclick = pick; $('btnChange').onclick = pick;
  input.onchange = () => { if (input.files[0]) useBlob(input.files[0], true); input.value = ''; };
  const stage = $('stage');
  stage.addEventListener('dragover', (e) => { e.preventDefault(); stage.classList.add('over'); });
  stage.addEventListener('dragleave', () => stage.classList.remove('over'));
  stage.addEventListener('drop', (e) => {
    e.preventDefault(); stage.classList.remove('over');
    if (e.dataTransfer.files[0]) useBlob(e.dataTransfer.files[0], true);
  });
  window.addEventListener('paste', (e) => {
    const f = e.clipboardData && e.clipboardData.files && e.clipboardData.files[0];
    if (f) useBlob(f, true);
  });
}

/* 描画 */
function resetCtx() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
}
const nextFrame = () => new Promise(r => {
  let done = false; const fin = () => { if (!done) { done = true; r(); } };
  requestAnimationFrame(() => requestAnimationFrame(fin)); setTimeout(fin, 120);
});
async function render() {
  if (!state.img || !state.theme) return;
  if (state.prepError) { showError('素材を読み込めませんでした。通信を確認して、もう一度開いてください'); setBusy(false); return; }
  if (state.busy) { state.again = true; return; }
  state.busy = true; setBusy(true);
  await nextFrame();
  const t = state.theme, t0 = performance.now();
  try {
    resetCtx();
    ctx.clearRect(0, 0, cv.width, cv.height);
    E.resetDateUsed();
    t.render(ctx, { W: cv.width, H: cv.height, img: state.img, meta: state.meta, adj: state.adj,
                    E, images: t.images, theme: t, date: t.date });
    // 共通ルール：画角内に「MM/DD」を入れる（E.dateProp）。使っていないテーマは開発者向けに警告
    if (!E.dateUsed) console.warn('[ohav] このテーマは日付の小道具（E.dateProp）を使っていません: ' + t.date);
    // 共通キャプション（上：Good Morning / 下：英語の「◯◯の日」）。caption:false で無効
    if (t.caption !== false) {
      resetCtx();
      E.drawDayCaption(ctx, cv.width, cv.height, Object.assign({ bottom: t.dayName }, t.caption || {}));
    }
    state.failed = false;
  } catch (e) {
    console.error(e);
    state.failed = true;
    showError(/WebGL|GPU/.test(e && e.message) ? e.message : '生成に失敗しました');
  }
  resetCtx();
  console.log('[render] %s %dms', t.date, Math.round(performance.now() - t0));
  // 失敗した絵は保存・投稿させない
  state.blob = state.failed ? null : await new Promise(r => cv.toBlob(r, 'image/png'));
  state.busy = false; setBusy(false);
  if (state.again) { state.again = false; render(); }
}
let schedT = 0;
function schedule() { clearTimeout(schedT); schedT = setTimeout(render, 260); }

/* 出力 */
function outName() { return `ohav-${state.theme.date}${state.theme.id ? '-' + state.theme.id : ''}.png`; }
function download(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const shareText = () => state.theme.shareText || (location.origin + location.pathname);
const canShareFiles = (() => {
  try {
    if (!navigator.canShare || !navigator.share) return false;
    return navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 't.png', { type: 'image/png' })] });
  } catch (e) { return false; }
})();
function wireOutput() {
  $('btnSave').onclick = () => { if (state.blob) { download(state.blob, outName()); toast('画像を保存しました'); } };
  $('btnShare').onclick = async () => {
    if (!state.blob) return;
    if (canShareFiles) {
      try { await navigator.share({ files: [new File([state.blob], outName(), { type: 'image/png' })], text: shareText() }); }
      catch (e) { if (!e || e.name !== 'AbortError') toast('共有できませんでした'); }
      return;
    }
    // PC: X の投稿画面は画像を受け取れないため、先に保存してから開く
    download(state.blob, outName());
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText()), '_blank', 'noopener');
    toast('画像を保存しました。Xの投稿画面で添付してください');
  };
}

/* ---------------- 日付タブ ---------------- */
const themes = new Map();     // date -> theme def（無い日は null）
function buildDays(dates) {
  const nav = $('days');
  nav.innerHTML = '';
  dates.forEach((date, i) => {
    const t = themes.get(date), d = parseYmd(date);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'day'; b.dataset.date = date;
    const rel = DEV ? `${WEEK_JA[d.getDay()]}曜` : (i === 0 ? '今日' : i === 1 ? '明日' : `${WEEK_JA[d.getDay()]}曜`);
    b.innerHTML = `<span class="d1"></span><span class="d2"></span><span class="d3"></span>`;
    b.children[0].textContent = rel;
    b.children[1].textContent = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    b.children[2].textContent = t ? t.title : '準備中';
    b.disabled = !t;
    b.onclick = () => selectDate(date);
    nav.appendChild(b);
  });
}
function markDay(date) {
  for (const b of $('days').children) {
    const on = b.dataset.date === date;
    b.setAttribute('aria-current', on ? 'true' : 'false');
    if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

async function selectDate(date) {
  const t = themes.get(date);
  if (!t) return;
  state.theme = t;
  markDay(date);
  const d = parseYmd(date);
  $('themeDate').textContent = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}（${WEEK_JA[d.getDay()]}）`;
  $('themeTitle').textContent = t.title;
  document.title = `${t.title}｜毎日おはV`;
  // URL に日付を残す（今日なら付けない）
  const q = new URLSearchParams(location.search);
  if (date === ymd(TODAY) && !DEV) q.delete('date'); else q.set('date', date);
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q.toString().replace('dev=', 'dev') : ''));
  const [W, H] = t.size || [1350, 1350];
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  $('stage').style.aspectRatio = W + ' / ' + H;
  setRanges(t.adjustRange);
  state.adj = Object.assign({ scale: 1, dx: 0, dy: 0 }, t.defaultAdjust || {}, await store.get('adj:' + date) || {});
  syncSliders();
  setBusy(true);
  state.blob = null;
  try {
    await prepareTheme(t);
  } catch (e) {
    console.error(e);
    t._ready = null;                    // 次に選んだときに読み直す
    if (state.theme !== t) return;
    state.failed = true; state.prepError = true; setBusy(false);
    showError('素材を読み込めませんでした。通信を確認して、もう一度開いてください');
    return;
  }
  if (state.theme !== t) return;        // 読み込み中に別の日が選ばれた
  state.failed = false; state.prepError = false;
  setBusy(false);
  if (state.img) render();
}

/* 起動 */
async function boot() {
  wirePicker(); wireOutput(); wireSliders(); setBusy(false);
  if (DEV && QS.get('style')) E.Stage3D.setStyle(QS.get('style'));   // 制作確認用：描画スタイルの切り替え
  if (!E.GLX.available()) toast('この端末ではWebGL2が使えないため、正しく表示できません');
  const dates = windowDates();
  const defs = await Promise.all(dates.map(loadThemeScript));
  dates.forEach((date, i) => {
    const t = defs[i];
    if (t) { t.date = date; t.dir = `${THEME_ROOT}${date}/`; }
    themes.set(date, t);
  });
  buildDays(dates);
  // 最初に開く日：?date（範囲内）> 今日 > 範囲内で最初に用意されている日
  const want = QS.get('date');
  const first = (want && themes.get(want)) ? want : (themes.get(dates[0]) ? dates[0] : dates.find(d => themes.get(d)));
  if (!first) {
    $('themeDate').textContent = '--/--';
    $('themeTitle').textContent = 'この1週間のテーマは準備中です';
    return;
  }
  const saved = await store.get('portrait');
  if (saved) await useBlob(saved, false, true);
  await selectDate(first);
}
boot();
})();
