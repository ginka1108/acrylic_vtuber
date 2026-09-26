/* =========================================================================
 *  10/11 「リンゴの唄」の日（1945年のこの日、映画『そよかぜ』が公開され、主題歌「リンゴの唄」が広まった）
 *  昭和レトロな部屋。花柄の壁紙、チークのテーブル。主役はふたを開けたポータブルレコードプレーヤーで、
 *  盤面にりんごを描いたピクチャーレコードをのせる。ひとつだけ置いたりんご、卓上カレンダーの横にアクスタを置く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'apple-song-day',
  title: 'リンゴの唄の日',
  dayName: 'Apple Song Day',
  caption: { fill: '#fff8ec', outline: '#8e2a22' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f7efdc', ink: '#5a2e22', accent: '#c0392b', back: '#e4d6b8', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'paper'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.2, z: 0.1, yaw: 10 };            // アクスタ
    const PLAYER = { x: 0.44, z: -0.86, yaw: -22, s: 1.36 };  // レコードプレーヤー（右。主役なので大きく）
        const APPLE = { x: 0.36, z: 0.42 };                  // ひとつのりんご（左手前）
    const CAL = { x: -0.8, z: -0.62, yaw: 24 };           // 卓上カレンダー（左奥）
    const eye = [0.12, 1.3, 2.75], at = [-0.1, 0.48, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const APPLE_M = mat(M.glossyFood, { tex: tex.apple, spec: 0.7, shin: 90, rim: 0.2 });
    const STEM = mat(M.wood, { color: [0.4, 0.26, 0.14] });
    const LEAF = mat(M.plastic, { color: [0.36, 0.56, 0.26], spec: 0.3, shin: 40 });

    /* ---------- 形 ---------- */
    // りんご：肩の張った丸み、上下にくぼみ（直径1・高さ≒0.9）
    const appleProf = [];
    for (let i = 0; i <= 28; i++) {
      const f = -Math.PI / 2 + Math.PI * i / 28;
      let r = 0.5 * Math.cos(f) * (1 + 0.06 * Math.max(0, Math.sin(f))), y = 0.45 + 0.45 * Math.sin(f);
      if (f > 1.05) y -= (f - 1.05) * 0.2;          // 上のくぼみ
      if (f < -1.15) y += (-1.15 - f) * 0.12;       // お尻のくぼみ
      appleProf.push([Math.max(0, r), y]);
    }
    const appleTop = appleProf[28][1];
    const leafGeo = () => G.surface((u, v) => {
      const s = v * 2 - 1, w = 0.34 * Math.pow(Math.sin(Math.PI * u), 0.8) + 0.004;
      return [s * w, 0.18 * u * u - 0.05 * s * s, u];
    }, 24, 8);
    const apple = (api, x, y, z, s, ry, tilt, leaf) => {
      const tl = tilt || 0;
      api.lathe('ap:apple', appleProf, [x, y, z], [tl, ry, 0], [s, s, s], APPLE_M);
      const tr = tl * Math.PI / 180, yr = ry * Math.PI / 180, top = appleTop * s;
      const tx = x + Math.sin(tr) * Math.sin(yr) * top, ty = y + Math.cos(tr) * top, tz = z + Math.sin(tr) * Math.cos(yr) * top;
      api.mesh('ap:stem', () => G.tube((t) => [0.03 * t * t, t * 0.22, 0], (t) => 0.03 - 0.01 * t, 12, 8, true), [tx, ty - 0.03 * s, tz], [tl, ry, 0], [s, s, s], STEM);
      if (leaf) api.mesh('ap:leaf', leafGeo, [tx, ty + 0.08 * s, tz], [tl - 10, ry + 40, 0], [s * 0.36, s * 0.36, s * 0.46], LEAF);
    };
    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.93, 0.88, 0.8], ambient: 0.55, light: [0.4, 0.86, 0.55], lightCol: [1.08, 1.05, 1.0],
      sky: [1.02, 1.0, 0.96], ground: [0.66, 0.54, 0.42], envTop: [1.04, 1.0, 0.94], envBot: [0.44, 0.34, 0.26],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：花柄の壁紙 --- */
        api.panel([0, 1.6, -3.0], [0, 0, 0], [12, 5], { tex: tex.paper, uvScale: [5, 2], unlit: true });
        /* --- チークのテーブル --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.45, 0.28, 0.16], uvScale: [2, 1] }));

        /* --- ポータブルレコードプレーヤー（主役。大きく手前に） --- */
        const px = PLAYER.x, pz = PLAYER.z, py = PLAYER.yaw, pr = py * Math.PI / 180, Q = PLAYER.s;
        const at3 = (lx, ly, lz) => [px + (Math.cos(pr) * lx + Math.sin(pr) * lz) * Q, ly * Q, pz + (-Math.sin(pr) * lx + Math.cos(pr) * lz) * Q];
        const CASE = mat(M.plastic, { tex: tex.caseSide, spec: 0.35, shin: 50 });
        const cw = 0.92, cd = 0.68, chh = 0.17;
        api.rbox(at3(0, chh / 2, 0), [0, py, 0], [cw * Q, chh * Q, cd * Q], mat(CASE, { round: 0.12 }));
        api.box(at3(0, chh + 0.002, 0), [0, py, 0], [(cw - 0.06) * Q, 0.004, (cd - 0.06) * Q], mat(M.plastic, { color: [0.93, 0.9, 0.82], spec: 0.3 }));
        // ふた（奥の辺で開いて立つ。内側にスピーカーの網）
        api.rbox(at3(0, chh + 0.33, -cd / 2 - 0.02), [-8, py, 0], [cw * Q, 0.66 * Q, 0.05 * Q], mat(CASE, { round: 0.12 }));
        api.panel(at3(0, chh + 0.33, -cd / 2 + 0.012), [8, py, 0], [(cw - 0.14) * Q, 0.52 * Q], mat(M.matte, { tex: tex.grill, sharp: true }));
        // 手前の金具（ふたの留め金）と取っ手の付け根
        for (const sx of [-0.3, 0.3]) api.rbox(at3(sx, chh * 0.62, cd / 2 + 0.004), [0, py, 0], [0.07 * Q, 0.04 * Q, 0.02 * Q], mat(M.metal, { color: [0.82, 0.83, 0.85], round: 0.3 }));
        // ターンテーブルとレコード（りんごのピクチャー盤）
        const tt = at3(-0.1, chh + 0.004, 0.02);
        api.cylinder([tt[0], tt[1] + 0.015 * Q, tt[2]], [0, 0, 0], [0.56 * Q, 0.03 * Q, 0.56 * Q], mat(M.metal, { color: [0.72, 0.74, 0.76] }));
        api.cylinder([tt[0], tt[1] + 0.034 * Q, tt[2]], [0, py + 8, 0], [0.54 * Q, 0.008 * Q, 0.54 * Q], mat(M.plastic, { tex: tex.record, spec: 0.55, shin: 90 }));
        api.cylinder([tt[0], tt[1] + 0.05 * Q, tt[2]], [0, 0, 0], [0.012 * Q, 0.03 * Q, 0.012 * Q], mat(M.metal, { color: [0.8, 0.8, 0.82] }));
        // トーンアーム（支柱から弧を描いてレコードの外周へ）
        const base = at3(0.3, chh + 0.004, -0.2);
        api.cylinder([base[0], base[1] + 0.03 * Q, base[2]], [0, 0, 0], [0.07 * Q, 0.06 * Q, 0.07 * Q], mat(M.metal, { color: [0.6, 0.62, 0.64] }));
        api.mesh('ap:arm', () => G.tube((t) => [-0.14 * t - 0.03 * Math.sin(t * Math.PI), 0.02 * Math.sin(t * Math.PI), 0.3 * t], () => 0.01, 24, 8, true),
          [base[0], base[1] + 0.06 * Q, base[2]], [0, py, 0], [Q, Q, Q], mat(M.metal, { color: [0.82, 0.83, 0.85] }));
        const head = at3(0.16, chh + 0.07, 0.1);
        api.rbox(head, [0, py - 20, 0], [0.04 * Q, 0.02 * Q, 0.07 * Q], mat(M.plastic, { color: [0.15, 0.15, 0.16], round: 0.2 }));
        // つまみ
        for (const kx of [0.3, 0.38]) api.lathe('ap:knob', [[0, 0], [0.5, 0], [0.5, 0.6], [0.4, 1], [0, 1]], at3(kx, chh + 0.004, 0.24), [0, 0, 0], [0.05 * Q, 0.03 * Q, 0.05 * Q],
          mat(M.plastic, { color: [0.93, 0.88, 0.76], spec: 0.4 }));

        /* --- ひとつのりんご（葉つき） --- */
        apple(api, APPLE.x, 0, APPLE.z, 0.26, 30, 0, true);

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, px, pz, 1.05 * Q, 0.8 * Q, py, 0.45);
        K.shadow(api, APPLE.x, APPLE.z, 0.32, 0.3, 0, 0.45);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.14);
    E.drawGrain(ctx, W, H, 0.026, 111, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 花柄の壁紙：クリーム地に橙と茶の丸い花（昭和レトロ、粗く大きめ）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#f3e3c3'; x.fillRect(0, 0, S, S);
    const flower = (cx, cy, r, c1, c2) => {
      x.fillStyle = c1;
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; x.beginPath(); x.arc(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.45, 0, 7); x.fill(); }
      x.fillStyle = c2; x.beginPath(); x.arc(cx, cy, r * 0.35, 0, 7); x.fill();
    };
    flower(128, 128, 90, '#e8923a', '#8a4a26');
    flower(384, 384, 90, '#c8642e', '#f3c46a');
    flower(384, 128, 50, '#b98a4e', '#f3e3c3');
    flower(128, 384, 50, '#b98a4e', '#f3e3c3');
    T.paper = c;
  }
  // チークの天板（赤みのある茶・粗い木目）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(73);
    const n = 5, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.94 + r() * 0.1;
      x.fillStyle = `rgb(${160 * b | 0},${100 * b | 0},${60 * b | 0})`; x.fillRect(0, i * pw, S, pw);
      for (let k = 0; k < 7; k++) {
        x.strokeStyle = r() > 0.5 ? 'rgba(90,50,24,0.26)' : 'rgba(210,150,100,0.2)'; x.lineWidth = 3 + r() * 4;
        const y0 = i * pw + 8 + r() * (pw - 16); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k + i) * 6);
        x.stroke();
      }
      x.fillStyle = 'rgba(60,30,14,0.4)'; x.fillRect(0, i * pw, S, 3);
    }
    T.table = c;
  }
  // りんごの皮：赤、ところどころ黄色の縦すじ、上（ヘタ側）は少し黄緑（v=下→上）
  {
    const Wd = 256, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(12);
    const g = x.createLinearGradient(0, Ht, 0, 0);
    g.addColorStop(0, '#b01e22'); g.addColorStop(0.5, '#d22a2a'); g.addColorStop(0.85, '#c83a2a'); g.addColorStop(0.97, '#b8a040'); g.addColorStop(1, '#9a8a3a');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 10; i++) { x.fillStyle = 'rgba(240,180,80,0.22)'; x.fillRect(r() * Wd, Ht * 0.1, 6 + r() * 8, Ht * 0.7); }
    T.apple = c;
  }
  // プレーヤーのケース：ツートン（下が赤茶、上端にクリームの帯）
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#b9483a'; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#efe4cc'; x.fillRect(0, 0, 256, 40);
    x.fillStyle = 'rgba(80,30,20,0.3)'; x.fillRect(0, 40, 256, 4);
    T.caseSide = c;
  }
  // スピーカーの網（粗い格子を淡く）
  {
    const c = C(256, 160), x = c.getContext('2d');
    x.fillStyle = '#d9cbb0'; x.fillRect(0, 0, 256, 160);
    x.fillStyle = 'rgba(120,90,60,0.25)';
    for (let i = 0; i < 256; i += 12) x.fillRect(i, 0, 5, 160);
    x.strokeStyle = '#8a6a4a'; x.lineWidth = 6; x.strokeRect(6, 6, 244, 148);
    x.fillStyle = '#c9a25a'; x.font = '700 22px "Oswald",sans-serif'; x.textAlign = 'center'; x.fillText('HI-FI', 128, 146);
    T.grill = c;
  }
  // レコード：りんごを描いたピクチャー盤（クリーム地に大きな赤いりんご・葉・音符、外周に溝の帯）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), cx = S / 2;
    x.fillStyle = '#1c1c1e'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#f6e9cf'; x.beginPath(); x.arc(cx, cx, S * 0.47, 0, 7); x.fill();
    // 外周の溝の帯（黒い輪を数本、太く淡く）
    x.strokeStyle = 'rgba(40,30,30,0.85)'; x.lineWidth = 26; x.beginPath(); x.arc(cx, cx, S * 0.475, 0, 7); x.stroke();
    x.strokeStyle = 'rgba(120,60,50,0.35)'; x.lineWidth = 6;
    for (const r of [0.43, 0.4]) { x.beginPath(); x.arc(cx, cx, S * r, 0, 7); x.stroke(); }
    // 背景の水玉
    x.fillStyle = 'rgba(214,80,60,0.18)';
    for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; x.beginPath(); x.arc(cx + Math.cos(t) * S * 0.34, cx + Math.sin(t) * S * 0.34, 16, 0, 7); x.fill(); }
    // 大きなりんご（ハート形に近い丸み・つや・へた・葉）
    const ay = cx + 30, aw = S * 0.25;
    x.fillStyle = '#d8322a';
    x.beginPath();
    x.moveTo(cx, ay - aw * 0.62);
    x.bezierCurveTo(cx + aw * 0.5, ay - aw * 0.95, cx + aw * 1.15, ay - aw * 0.6, cx + aw * 0.98, ay + aw * 0.1);
    x.bezierCurveTo(cx + aw * 0.85, ay + aw * 0.75, cx + aw * 0.35, ay + aw * 1.0, cx, ay + aw * 0.82);
    x.bezierCurveTo(cx - aw * 0.35, ay + aw * 1.0, cx - aw * 0.85, ay + aw * 0.75, cx - aw * 0.98, ay + aw * 0.1);
    x.bezierCurveTo(cx - aw * 1.15, ay - aw * 0.6, cx - aw * 0.5, ay - aw * 0.95, cx, ay - aw * 0.62);
    x.fill();
    x.fillStyle = '#a81e1e'; x.beginPath(); x.ellipse(cx + aw * 0.45, ay + aw * 0.35, aw * 0.36, aw * 0.4, -0.5, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,240,230,0.85)'; x.beginPath(); x.ellipse(cx - aw * 0.5, ay - aw * 0.25, aw * 0.12, aw * 0.26, 0.5, 0, 7); x.fill();
    x.strokeStyle = '#5a3420'; x.lineWidth = 16; x.lineCap = 'round';
    x.beginPath(); x.moveTo(cx, ay - aw * 0.55); x.quadraticCurveTo(cx + 8, ay - aw * 0.85, cx + 30, ay - aw * 1.0); x.stroke();
    x.fillStyle = '#5a9a3a'; x.beginPath(); x.ellipse(cx + aw * 0.36, ay - aw * 0.9, aw * 0.3, aw * 0.13, -0.5, 0, 7); x.fill();
    // 音符（大きく2つ）
    x.fillStyle = '#3a2a2a';
    const note = (nx, ny, s) => { x.beginPath(); x.ellipse(nx, ny, s, s * 0.75, -0.4, 0, 7); x.fill(); x.fillRect(nx + s * 0.75, ny - s * 3.2, s * 0.3, s * 3.2); x.fillRect(nx + s * 0.75, ny - s * 3.2, s * 1.3, s * 0.4); };
    note(cx - S * 0.3, cx - S * 0.12, 26); note(cx + S * 0.28, cx - S * 0.2, 22);
    // 中心穴（黒）
    x.fillStyle = '#1c1c1e'; x.beginPath(); x.arc(cx, cx, 14, 0, 7); x.fill();
    T.record = c;
  }
  // 籐（編み目を粗く）
  {
    const c = C(128, 64), x = c.getContext('2d');
    x.fillStyle = '#c99a62'; x.fillRect(0, 0, 128, 64);
    for (let i = 0; i < 128; i += 16) { x.fillStyle = 'rgba(130,90,50,0.35)'; x.fillRect(i, 0, 5, 64); }
    for (let j = 0; j < 64; j += 12) { x.fillStyle = 'rgba(240,210,160,0.35)'; x.fillRect(0, j, 128, 4); }
    T.wicker = c;
  }
  return T;
}

/* =========================================================================
 *  メッシュを初めて描くときの保険
 *   基幹の api.mesh / lathe / rbox は、その描画（render 1回）で初めて使う形のとき、
 *   最初のパス（影）で直前の形の頂点設定のまま描いてしまい、影に余計な形が映り込む。
 *   そこで形ごとに1回だけ「大きさほぼ0で描く → 別の形（box）を挟む」を先に行い、
 *   正しい頂点設定で描かれるようにする。見た目には何も足さない。
 * ====================================================================== */
function guardApi() {
  const seen = new Set(), Z = [1e-6, 1e-6, 1e-6];
  const prime = (t, id, first, pos, rot) => {
    if (seen.has(id)) return;
    seen.add(id);
    first(Z);
    t.box(pos, rot || [0, 0, 0], Z, {});
  };
  return (api) => new Proxy(api, {
    get(t, p) {
      if (p === 'mesh') return (key, build, pos, rot, size, o) => {
        prime(t, 'mesh:' + key, (z) => t.mesh(key, build, pos, rot, z, o), pos, rot);
        return t.mesh(key, build, pos, rot, size, o);
      };
      if (p === 'lathe') return (key, prof, pos, rot, size, o) => {
        prime(t, 'lathe:' + key, (z) => t.lathe(key, prof, pos, rot, z, o), pos, rot);
        return t.lathe(key, prof, pos, rot, size, o);
      };
      if (p === 'rbox') return (pos, rot, size, o) => {
        const rr = +((o && o.round !== undefined ? o.round : 0.15)).toFixed(2);
        prime(t, 'rbox' + rr, (z) => t.rbox(pos, rot, z, o), pos, rot);
        return t.rbox(pos, rot, size, o);
      };
      const v = t[p];
      return typeof v === 'function' ? v.bind(t) : v;
    }
  });
}
})();
