/* =========================================================================
 *  10/11 「リンゴの唄」の日（1945年のこの日、映画『そよかぜ』が公開され、主題歌「リンゴの唄」が広まった）
 *  昭和レトロな部屋。花柄の壁紙、チークのテーブルに、ふたを開けたポータブルレコードプレーヤー、
 *  籐のかごに盛ったりんご、ひとつだけ置いたりんご、卓上カレンダーの横にアクスタを置く。
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
    const P = { x: -0.04, z: 0.04, yaw: 12 };            // アクスタ
    const PLAYER = { x: 0.68, z: -1.35, yaw: -16 };        // レコードプレーヤー（右奥）
    const BASKET = { x: -0.6, z: 0.1 };                // りんごのかご（左手前）
    const APPLE = { x: 0.56, z: -0.02 };                  // ひとつのりんご（右手前）
    const CAL = { x: -0.8, z: -1.12, yaw: 22 };           // 卓上カレンダー（左奥）
    const eye = [0.3, 1.3, 2.75], at = [0.02, 0.48, -0.1];
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
    // 籐のかご：厚みのある縁
    const basketProf = [[0, 0.01], [0.3, 0.01], [0.32, 0, 1], [0.36, 0.02], [0.46, 0.2], [0.5, 0.34], [0.52, 0.36], [0.5, 0.38], [0.47, 0.36],
      [0.43, 0.2], [0.34, 0.07], [0, 0.06]];

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

        /* --- ポータブルレコードプレーヤー --- */
        const px = PLAYER.x, pz = PLAYER.z, py = PLAYER.yaw, pr = py * Math.PI / 180;
        const at3 = (lx, ly, lz) => [px + Math.cos(pr) * lx + Math.sin(pr) * lz, ly, pz - Math.sin(pr) * lx + Math.cos(pr) * lz];
        const cw = 0.92, cd = 0.68, chh = 0.17;
        api.rbox(at3(0, chh / 2, 0), [0, py, 0], [cw, chh, cd], mat(M.plastic, { tex: tex.caseSide, round: 0.12, spec: 0.35, shin: 50 }));
        api.box(at3(0, chh + 0.002, 0), [0, py, 0], [cw - 0.06, 0.004, cd - 0.06], mat(M.plastic, { color: [0.93, 0.9, 0.82], spec: 0.3 }));
        // ふた（奥の辺で開いて立つ。内側にスピーカーの網）
        api.rbox(at3(0, chh + 0.33, -cd / 2 - 0.02), [-8, py, 0], [cw, 0.66, 0.05], mat(M.plastic, { tex: tex.caseSide, round: 0.12, spec: 0.35, shin: 50 }));
        api.panel(at3(0, chh + 0.33, -cd / 2 + 0.01), [8, py, 0], [cw - 0.14, 0.52], mat(M.matte, { tex: tex.grill, sharp: true }));
        // ターンテーブルとレコード
        const tt = at3(-0.1, chh + 0.004, 0.02);
        api.cylinder([tt[0], tt[1] + 0.015, tt[2]], [0, 0, 0], [0.56, 0.03, 0.56], mat(M.metal, { color: [0.72, 0.74, 0.76] }));
        api.cylinder([tt[0], tt[1] + 0.034, tt[2]], [0, 30, 0], [0.54, 0.008, 0.54], mat(M.plastic, { tex: tex.record, spec: 0.6, shin: 90 }));
        api.cylinder([tt[0], tt[1] + 0.05, tt[2]], [0, 0, 0], [0.012, 0.03, 0.012], mat(M.metal, { color: [0.8, 0.8, 0.82] }));
        // トーンアーム（支柱から弧を描いてレコードの外周へ）
        const base = at3(0.3, chh + 0.004, -0.18);
        api.cylinder([base[0], base[1] + 0.03, base[2]], [0, 0, 0], [0.07, 0.06, 0.07], mat(M.metal, { color: [0.6, 0.62, 0.64] }));
        api.mesh('ap:arm', () => G.tube((t) => [-0.2 * t - 0.04 * Math.sin(t * Math.PI), 0.02 * Math.sin(t * Math.PI), 0.3 * t], () => 0.01, 24, 8, true),
          [base[0], base[1] + 0.06, base[2]], [0, py, 0], [1, 1, 1], mat(M.metal, { color: [0.82, 0.83, 0.85] }));
        const head = at3(0.1, chh + 0.056, 0.12);
        api.rbox(head, [0, py - 30, 0], [0.04, 0.02, 0.07], mat(M.plastic, { color: [0.15, 0.15, 0.16], round: 0.2 }));
        // つまみ
        for (const kx of [0.3, 0.38]) api.lathe('ap:knob', [[0, 0], [0.5, 0], [0.5, 0.6], [0.4, 1], [0, 1]], at3(kx, chh + 0.004, 0.22), [0, 0, 0], [0.05, 0.03, 0.05],
          mat(M.plastic, { color: [0.93, 0.88, 0.76], spec: 0.4 }));

        /* --- 籐のかごとりんご --- */
        const bx = BASKET.x, bz = BASKET.z, bs = 0.58;
        api.lathe('ap:basket', basketProf, [bx, 0, bz], [0, 0, 0], [bs, bs, bs], mat(M.matte, { tex: tex.wicker, spec: 0.1 }));
        const as = 0.2;
        for (const [ax, ay, az, ry, tl] of [[-0.09, 0.07, 0.03, 20, 8], [0.09, 0.07, -0.04, 140, -6], [0.01, 0.07, 0.11, 260, 10], [0.0, 0.17, -0.01, 80, -4]])
          apple(api, bx + ax, ay, bz + az, as, ry, tl, false);

        /* --- ひとつのりんご（葉つき） --- */
        apple(api, APPLE.x, 0, APPLE.z, 0.24, 30, 0, true);

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, px, pz, 1.05, 0.8, py, 0.45);
        K.shadow(api, bx, bz, 0.66, 0.62, 0, 0.45);
        K.shadow(api, APPLE.x, APPLE.z, 0.3, 0.28, 0, 0.45);

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
  // レコード：黒い盤面に太めの溝（淡く）と赤いラベル
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), cx = S / 2;
    x.fillStyle = '#1c1c1e'; x.fillRect(0, 0, S, S);
    for (let r = 70; r < 250; r += 14) { x.strokeStyle = 'rgba(90,90,96,0.35)'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cx, r, 0, 7); x.stroke(); }
    x.fillStyle = '#c8322a'; x.beginPath(); x.arc(cx, cx, 64, 0, 7); x.fill();
    x.fillStyle = '#f3e3c3'; x.beginPath(); x.arc(cx, cx - 30, 14, 0, 7); x.fill();       // ラベルのりんご印
    x.fillStyle = '#1c1c1e'; x.beginPath(); x.arc(cx, cx, 6, 0, 7); x.fill();
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
