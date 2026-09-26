/* =========================================================================
 *  10/10 トマトの日（「ト(10)マト(10)」の語呂合わせ。全国トマト工業会が制定）
 *  農家の台所のテーブル。緑のストライプのクロスに、トマトを詰めた木箱、
 *  まな板の上の輪切り（断面）と丸ごとのトマト、トマトジュースのグラス、
 *  卓上カレンダーの横にアクスタを置く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'tomato-day',
  title: 'トマトの日',
  dayName: 'Tomato Day',
  caption: { fill: '#fffaf0', outline: '#b3261e' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf6ea', ink: '#3b5a2a', accent: '#c0392b', back: '#e6ddc8', grain: 0.06 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['cloth', 'wall', 'slat'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.02, z: 0.04, yaw: 14 };            // アクスタ
    const CRATE = { x: 0.6, z: -1.4, yaw: -12 };         // トマトの木箱（右奥）
    const BOARD = { x: -0.64, z: -0.02 };                 // まな板（左手前）
    const GLASS = { x: 0.58, z: -0.1 };                  // トマトジュース（右手前）
    const CAL = { x: -0.84, z: -1.08, yaw: 22 };          // 卓上カレンダー（左奥）
    const eye = [0.26, 1.3, 2.75], at = [-0.02, 0.48, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const SKIN = mat(M.glossyFood, { tex: tex.skin, spec: 0.75, shin: 90, rim: 0.2 });
    const LEAF = mat(M.plastic, { color: [0.3, 0.5, 0.22], spec: 0.25, shin: 30 });

    /* ---------- 形 ---------- */
    // トマト：少しつぶれた球、ヘタのまわりがくぼむ。お尻側は丸い（直径1・高さ≒0.78）
    const tomatoProf = [];
    for (let i = 0; i <= 24; i++) {
      const f = -Math.PI / 2 + Math.PI * i / 24;
      let r = 0.5 * Math.cos(f), y = 0.39 + 0.39 * Math.sin(f);
      if (f > 1.1) y -= (f - 1.1) * 0.12;                      // ヘタのくぼみ
      tomatoProf.push([Math.max(0, r), y]);
    }
    tomatoProf[24] = [0, tomatoProf[23][1] - 0.02];
    const halfProf = tomatoProf.slice(0, 13);                  // 下半分（輪切りの断面を上に）
    // ヘタ：5枚のがく（反り返った細い葉）
    const calyx = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, k = Math.pow((Math.cos(5 * th) + 1) / 2, 3), r = (0.08 + 0.42 * k) * v;
      return [Math.sin(th) * r, 0.02 + 0.06 * v - 0.14 * v * v * k, Math.cos(th) * r];
    }, 100, 6);
    // グラス（外・内）とジュース
    const glassProf = [[0, 0.004], [0.36, 0.004], [0.38, 0, 1], [0.4, 0.02], [0.44, 0.9], [0.45, 1.0], [0.43, 1.0], [0.42, 0.9], [0.37, 0.08], [0, 0.07]];
    const juiceProf = [[0, 0.075], [0.365, 0.08], [0.41, 0.72], [0, 0.72]];

    const tomato = (api, x, y, z, s, ry, tilt) => {
      api.lathe('tom:tomato', tomatoProf, [x, y, z], [tilt || 0, ry, 0], [s, s, s], SKIN);
      const top = y + (tomatoProf[23][1] - 0.01) * s * Math.cos((tilt || 0) * Math.PI / 180);
      api.mesh('tom:calyx', calyx, [x, top, z], [tilt || 0, ry, 0], [s * 0.5, s * 0.5, s * 0.5], LEAF);
      api.lathe('tom:stem', [[0, 0], [0.5, 0], [0.4, 1], [0, 1]], [x, top, z], [tilt || 0, ry, 0], [s * 0.06, s * 0.12, s * 0.06], LEAF);
    };

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.93, 0.91, 0.86], ambient: 0.55, light: [0.4, 0.86, 0.55], lightCol: [1.08, 1.06, 1.0],
      sky: [1.0, 1.0, 0.98], ground: [0.66, 0.62, 0.5], envTop: [1.04, 1.04, 1.0], envBot: [0.46, 0.44, 0.36],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：白い板壁と窓（菜園） --- */
        api.panel([0, 1.6, -3.0], [0, 0, 0], [12, 5], { tex: tex.wall, uvScale: [10, 1], unlit: true });
        api.panel([-0.5, 1.5, -2.98], [0, 0, 0], [2.4, 1.4], { tex: tex.window, unlit: true });
        /* --- テーブル（クロス） --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.matte, { tex: tex.cloth, face: S.FACE.TOP, edge: [0.9, 0.92, 0.88], uvScale: [4, 3] }));

        /* --- トマトを詰めた木箱 --- */
        const bx = CRATE.x, bz = CRATE.z, by = CRATE.yaw, br = by * Math.PI / 180;
        const at3 = (lx, ly, lz) => [bx + Math.cos(br) * lx + Math.sin(br) * lz, ly, bz - Math.sin(br) * lx + Math.cos(br) * lz];
        const SLAT = mat(M.wood, { tex: tex.slat, spec: 0.1 });
        const cw = 0.9, cd = 0.6, ch = 0.3;
        api.box(at3(0, 0.02, 0), [0, by, 0], [cw, 0.04, cd], SLAT);                               // 底
        for (const sy of [0.07, 0.19]) for (const sg of [-1, 1]) {
          api.box(at3(0, sy + 0.04, sg * (cd / 2 - 0.015)), [0, by, 0], [cw, 0.09, 0.03], SLAT);  // 長辺の板
          api.box(at3(sg * (cw / 2 - 0.015), sy + 0.04, 0), [0, by, 0], [0.03, 0.09, cd - 0.06], SLAT);
        }
        for (const sg of [-1, 1]) for (const sz of [-1, 1]) api.box(at3(sg * (cw / 2 - 0.03), ch / 2, sz * (cd / 2 - 0.03)), [0, by, 0], [0.05, ch, 0.05], SLAT);   // 四隅の柱
        const ts = 0.24;
        for (const [lx, lz, ly, ry, tl] of [[-0.28, -0.13, 0.04, 10, 6], [0.0, -0.14, 0.04, 70, -8], [0.28, -0.12, 0.04, 140, 5], [-0.28, 0.13, 0.04, 200, -4],
          [0.0, 0.13, 0.04, 30, 8], [0.28, 0.14, 0.04, 90, -6], [-0.12, 0.0, 0.2, 50, 14], [0.15, 0.02, 0.2, 160, -12]]) {
          const p = at3(lx, ly, lz);
          tomato(api, p[0], p[1], p[2], ts, ry, tl);
        }

        /* --- まな板：輪切りと丸ごとのトマト --- */
        const kx = BOARD.x, kz = BOARD.z;
        api.lathe('tom:board', [[0, 0], [0.48, 0], [0.5, 0.02], [0.5, 0.06], [0.48, 0.08], [0, 0.08]], [kx, 0, kz], [0, 0, 0], [0.64, 0.5, 0.64], mat(M.wood, { tex: tex.board }));
        const y0 = 0.04, hs = 0.28;
        api.lathe('tom:half', halfProf, [kx - 0.09, y0 - 0.01, kz + 0.05], [0, 0, 0], [hs, hs, hs], SKIN);
        api.cylinder([kx - 0.09, y0 - 0.01 + 0.39 * hs + 0.001, kz + 0.05], [0, 30, 0], [hs * 0.99, 0.002, hs * 0.99], mat(M.glossyFood, { tex: tex.cut, part: 'TOP', spec: 0.6, shin: 70 }));
        tomato(api, kx + 0.1, y0, kz - 0.12, 0.25, 20, 0);
        // 輪切りを1枚（薄い円柱）
        api.cylinder([kx + 0.1, y0 + 0.012, kz + 0.14], [0, 60, 0], [0.22, 0.024, 0.22], mat(M.glossyFood, { tex: tex.cut, spec: 0.6, shin: 70 }));

        /* --- トマトジュース（グラスは後で半透明に） --- */
        const gs = 0.3, gx = GLASS.x, gz = GLASS.z;
        api.lathe('tom:juice', juiceProf, [gx, 0, gz], [0, 0, 0], [gs, gs * 1.35, gs], mat(M.glossyFood, { color: [0.8, 0.12, 0.08], spec: 0.5, shin: 60 }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, bx, bz, 1.05, 0.75, by, 0.45);
        K.shadow(api, kx, kz, 0.72, 0.68, 0, 0.4);
        K.shadow(api, gx, gz, 0.36, 0.34, 0, 0.35);

        stand.shadow(api, P);
        api.blend(true);
        api.lathe('tom:glass', glassProf, [gx, 0, gz], [0, 0, 0], [gs, gs * 1.35, gs], mat(M.glass, { color: [0.9, 0.96, 0.98], alpha: 0.22, rim: 1.0, castShadow: false }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.024, 110, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // テーブルクロス：生成りに緑の太いストライプと細い線（リネン）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#f6f2e6'; x.fillRect(0, 0, S, S);
    x.fillStyle = 'rgba(92,140,80,0.55)'; x.fillRect(0, 40, S, 44);
    x.fillStyle = 'rgba(92,140,80,0.45)'; x.fillRect(0, 100, S, 8); x.fillRect(0, 16, S, 8);
    for (let i = 0; i < S; i += 4) { x.fillStyle = 'rgba(150,140,110,0.06)'; x.fillRect(i, 0, 1, S); }
    T.cloth = c;
  }
  // 白い板壁（縦張り）
  {
    const c = C(128, 256), x = c.getContext('2d');
    x.fillStyle = '#f3f0e8'; x.fillRect(0, 0, 128, 256);
    x.fillStyle = 'rgba(150,140,120,0.35)'; x.fillRect(0, 0, 4, 256);
    T.wall = c;
  }
  // 窓：家庭菜園の支柱とトマトの株
  {
    const Wd = 900, Ht = 520, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(10);
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#bfe0f2'); g.addColorStop(1, '#f3f1dc');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 7; i++) {
      const px = 60 + i * 130;
      x.fillStyle = '#9a7a52'; x.fillRect(px, 140, 8, Ht);
      for (let k = 0; k < 9; k++) { x.fillStyle = r() > 0.5 ? '#6a9a4e' : '#88b466'; x.beginPath(); x.ellipse(px + (r() - 0.5) * 80, 170 + r() * 320, 30, 18, r() * 3, 0, 7); x.fill(); }
      for (let k = 0; k < 3; k++) { x.fillStyle = '#d8402f'; x.beginPath(); x.arc(px + (r() - 0.5) * 60, 240 + r() * 220, 14, 0, 7); x.fill(); }
    }
    x.fillStyle = '#f7f6f0'; const fw = 20;
    x.fillRect(0, 0, Wd, fw); x.fillRect(0, Ht - fw, Wd, fw); x.fillRect(0, 0, fw, Ht); x.fillRect(Wd - fw, 0, fw, Ht); x.fillRect(Wd / 2 - 8, 0, 16, Ht);
    T.window = c;
  }
  // トマトの皮：赤、ヘタのまわりは少し橙、縦にうっすら筋（v=下→上）
  {
    const Wd = 256, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, Ht, 0, 0);
    g.addColorStop(0, '#d42a1e'); g.addColorStop(0.6, '#e8402a'); g.addColorStop(0.9, '#e0582a'); g.addColorStop(1, '#d9772f');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(150,20,14,0.14)'; x.fillRect(i * Wd / 6, 0, 10, Ht); }
    T.skin = c;
  }
  // 断面：外皮・果肉の壁・ゼリー状の部屋（種）・中心の芯
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), cx = S / 2;
    x.fillStyle = '#c9241a'; x.fillRect(0, 0, S, S);                 // 角も塗る（透明だと縮小時に暗くなる）
    x.fillStyle = '#ff7e5c'; x.beginPath(); x.arc(cx, cx, S * 0.47, 0, 7); x.fill();
    const n = 4;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + 0.4, mx = cx + Math.cos(a) * S * 0.24, my = cx + Math.sin(a) * S * 0.24;
      x.fillStyle = '#ffd49a'; x.beginPath(); x.ellipse(mx, my, S * 0.15, S * 0.11, a, 0, 7); x.fill();
      x.fillStyle = '#fff2c0';
      for (let k = 0; k < 5; k++) {
        const t = (k - 2) / 2.2, sx = mx + Math.cos(a + Math.PI / 2) * t * S * 0.1, sy = my + Math.sin(a + Math.PI / 2) * t * S * 0.1;
        x.beginPath(); x.ellipse(sx, sy, 10, 6, a, 0, 7); x.fill();
      }
    }
    x.fillStyle = '#ffc8a0'; x.beginPath(); x.arc(cx, cx, S * 0.08, 0, 7); x.fill();
    T.cut = c;
  }
  // 木箱の板（白っぽい杉）
  {
    const c = C(256, 64), x = c.getContext('2d'), r = E.rnd(4);
    x.fillStyle = '#dcc098'; x.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(160,120,80,0.25)'; x.fillRect(0, r() * 64, 256, 3); }
    x.fillStyle = '#b3261e'; x.font = '700 30px "Oswald",sans-serif'; x.textAlign = 'center'; x.fillText('FARM', 128, 44);
    T.slat = c;
  }
  // 丸いまな板（年輪）
  {
    const c = C(64, 256), x = c.getContext('2d');
    x.fillStyle = '#d9b27c'; x.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 256; i += 24) { x.fillStyle = 'rgba(160,110,60,0.3)'; x.fillRect(0, i, 64, 5); }
    T.board = c;
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
