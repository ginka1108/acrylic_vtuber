/* =========================================================================
 *  9/30 世界翻訳の日（International Translation Day / 国連の国際デー）
 *  書斎の机。付箋だらけの辞書の山と老眼鏡、単語カード、インク壺、紅茶、
 *  卓上カレンダー、開いた本、地球儀、デスクランプの前に
 *  アクスタを置く。アクスタは右に振り、カメラは少し低めから見上げる。
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'translation-day',   // 英字の短い名前（保存するファイル名に使う）
  title: '世界翻訳の日',
  dayName: 'International Translation Day',
  caption: { fill: '#fffaf0', outline: '#3d2a1b' },
  size: [1350, 1350],
  googleFonts: 'family=Noto+Serif+JP:wght@700&family=Oswald:wght@500',
  fonts: ['700 100px "Noto Serif JP"', '500 100px "Oswald"'],
  fontText: 'おはようございます。よい一日を。ありがとう。はじめまして。またあとで。ようこそ！乾杯！気をつけて。よい夢を。がんばって！',   // 絵の中で使う日本語（フォントの読み込み用）
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: k === 'desk' || k === 'shelf' || k === 'edge' });

    const P = { x: -0.05, z: 0.1, yaw: 22 };
    const eye = [0.55, 1.12, 2.8], at = [0.0, 0.55, 0];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const CAL = { x: 0.6, z: -0.5, yaw: -18 };            // 卓上カレンダー（地球儀の手前）
    const cal = E.dateProp(env, { style: { paper: '#f3ead6', ink: '#3d2a1b', accent: '#7a2e24', back: '#ded2b8', grain: 0.1 } });

    const rad = Math.PI / 180;
    const tp = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
    // (x0,z0) を中心に yaw だけ回した局所座標 → 世界座標
    const local = (x0, y0, z0, yaw) => { const r = yaw * rad, c = Math.cos(r), sn = Math.sin(r); return (lx, ly, lz) => [x0 + c * lx + sn * lz, y0 + ly, z0 - sn * lx + c * lz]; };
    const PAGEMAT = Object.assign({}, M.matte, { color: [0.97, 0.94, 0.86], tex: tex.edge, spec: 0.05 });
    const GOLD = Object.assign({}, M.gold, { color: [0.86, 0.68, 0.32] });

    /* 横に寝かせたハードカバー。背（丸み）は局所 +z（手前）、地は y=0 */
    function hardBook(api, o) {
      const L = local(o.x, o.y, o.z, o.yaw), t = 0.018, w = o.w, h = o.h, d = o.d, rot = [0, o.yaw, 0];
      const cov = Object.assign({}, M.plastic, { color: o.col, spec: 0.22, shin: 28, rim: 0.08 });
      api.rbox(L(0, h / 2, -0.012), rot, [w - 0.045, h - t * 2 + 0.002, d - 0.04], Object.assign({}, PAGEMAT, { round: 0.06 }));   // 小口
      api.rbox(L(0, t / 2, 0), rot, [w, t, d], Object.assign({}, cov, { round: 0.1 }));                // 裏表紙
      api.rbox(L(0, h - t / 2, 0), rot, [w, t, d], Object.assign({}, cov, { round: 0.1 }));            // 表表紙
      api.rbox(L(0, h / 2, d / 2 - t * 0.6), rot, [w, h, t * 2.4], Object.assign({}, cov, { round: 0.35 }));   // 背
      for (const bx of [-w / 2 + 0.07, -w / 2 + 0.1, w / 2 - 0.1, w / 2 - 0.07])                         // 背の金の帯
        api.rbox(L(bx, h / 2, d / 2 - t * 0.6), rot, [0.012, h * 0.93, t * 2.4 + 0.006], Object.assign({}, GOLD, { round: 0.35 }));
      api.rbox(L(0, h / 2, d / 2 - t * 0.6), rot, [w * 0.2, h * 0.5, t * 2.4 + 0.008], Object.assign({}, M.plastic, { color: o.label, spec: 0.3, round: 0.35 }));   // 背ラベル
      for (const [fz, fc, fy] of o.flags || [])                                                      // 付箋（右の地側の小口から出る）
        api.rbox(L(w / 2 - 0.02, h * fy, fz), rot, [0.1, 0.004, 0.05], Object.assign({}, M.matte, { color: fc, round: 0.1 }));
    }

    /* 形 */
    const pageArc = (u) => 0.024 + 0.05 * Math.sin(Math.PI / 2 * Math.min(1, u * 2.4)) * (1 - 0.3 * u * u);   // 開いた本のページのふくらみ（u:0=のど）
    const openPage = (side) => () => G.surface((u, v) => {
      const q = side < 0 ? 1 - u : u;                  // q: のど(0)→小口(1)
      return [side * 0.49 * q, pageArc(q), 0.32 - 0.64 * v];
    }, 40, 4, (u, v) => [u, v]);
    const openEdge = (side) => () => G.surface((u, v) => [side * 0.49, 0.022 + (pageArc(1) - 0.022) * v, 0.32 - 0.64 * u], 4, 2);

    S.render(ctx, {
      W, H, clear: [0.3, 0.24, 0.2], ambient: 0.38, light: [0.5, 0.8, 0.45], lightCol: [1.3, 1.18, 1.0],
      sky: [1.0, 0.95, 0.86], ground: [0.45, 0.33, 0.24], envTop: [1.05, 0.98, 0.88], envBot: [0.35, 0.25, 0.18],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        /* 奥：本棚（ぼける） */
        api.panel([0, 1.8, -3.2], [0, 0, 0], [12, 6], Object.assign({}, M.matte, { tex: tex.shelf, uvScale: [3, 1.5] }));

        /* 机 */
        api.box([0, -0.04, 0], [0, 0, 0], [7, 0.08, 5.2], Object.assign({}, M.wood, { tex: tex.desk, face: S.FACE.TOP, edge: [0.25, 0.15, 0.09], uvScale: [1, 1] }));

        /* 積み上げた辞書（左奥） */
        const books = [
          [0.95, 0.2, 0.7, [0.45, 0.12, 0.12], 4, [0.28, 0.07, 0.07]],
          [0.86, 0.16, 0.66, [0.12, 0.24, 0.38], -6, [0.07, 0.14, 0.24]],
          [0.9, 0.2, 0.62, [0.16, 0.32, 0.22], 7, [0.09, 0.19, 0.12]],
          [0.78, 0.14, 0.58, [0.55, 0.4, 0.2], -3, [0.35, 0.24, 0.11]]
        ];
        const flagSets = [[[-0.1, [0.98, 0.85, 0.3], 0.55]], [[0.05, [0.95, 0.5, 0.55], 0.5], [-0.15, [0.45, 0.75, 0.95], 0.45]], [[0.0, [0.55, 0.85, 0.5], 0.5]], []];
        let by = 0;
        books.forEach(([bw, bh, bd, col, ry, label], i) => {
          hardBook(api, { x: -1.0, y: by, z: -0.7, yaw: ry, w: bw, h: bh, d: bd, col, label, flags: flagSets[i] });
          by += bh;
        });
        /* インク壺（カレンダーの左奥） */
        const IX = 0.2, IZ = -0.62;
        api.lathe('inkwell', [[0, 0], [0.46, 0], [0.5, 0.06, 1], [0.5, 0.5, 1], [0.44, 0.62], [0.22, 0.74], [0.16, 0.78, 1], [0.16, 0.92], [0.12, 0.92], [0.12, 0.8], [0, 0.8]],
          [IX, 0, IZ], [0, 0, 0], [0.26, 0.24, 0.26], Object.assign({}, M.glass, { color: [0.07, 0.09, 0.16], spec: 1.0, shin: 160, rim: 0.5 }));
        api.lathe('inkcollar', [[0.15, 0], [0.19, 0], [0.2, 0.02, 1], [0.2, 0.08, 1], [0.19, 0.1], [0.15, 0.1]], [IX, 0.19, IZ], [0, 0, 0], [0.26, 0.4, 0.26], GOLD);

        /* 紅茶（アクスタの左手前） */
        K.saucer(api, { x: -0.62, z: -0.02, d: 0.46, color: [0.97, 0.95, 0.9], band: [0.25, 0.4, 0.3] });
        K.cup(api, { x: -0.62, z: -0.02, y: 0.035, d: 0.3, h: 0.2, color: [0.97, 0.95, 0.9], handleYaw: -150,
                     liquid: { color: [0.55, 0.25, 0.1], depth: 0.04 } });

        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* 地球儀（右奥）：木の台座＋真鍮の支柱＋子午線の輪 */
        const gx = 1.0, gz = -0.9, gy = 0.74, GR = 0.4;
        api.lathe('globebase', [[0, 0], [0.5, 0], [0.5, 0.18, 1], [0.44, 0.3], [0.3, 0.42], [0.2, 0.62], [0.2, 0.7, 1], [0, 0.7]], [gx, 0, gz], [0, 0, 0], [0.5, 0.16, 0.5],
          Object.assign({}, M.wood, { color: [0.4, 0.24, 0.13], spec: 0.5, shin: 60, bump: 0 }));
        const gm = E.M4.compose([gx, gy, gz], [0, 40, 23], [1, 1, 1]);
        const mb = tp(gm, [0, -(GR + 0.035), 0]);
        api.mesh('globestem', () => G.tube((t) => [0, 0, 0].map((_, k) => {
          const a = [gx, 0.11, gz][k], c = [gx, mb[1] - 0.02, gz][k], b = mb[k];
          return (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * b;
        }), () => 0.016, 24, 10, true), [0, 0, 0], [0, 0, 0], [1, 1, 1], GOLD);
        api.sphere([gx, gy, gz], [0, 40, 23], [GR * 2, GR * 2, GR * 2], Object.assign({}, M.plastic, { tex: tex.globe, spec: 0.45, shin: 60, rim: 0.12 }));
        api.mesh('meridian', () => G.tube((t) => { const a = -Math.PI * 0.5 + t * Math.PI * 1.25; return [Math.sin(a) * 0, Math.sin(a) * (GR + 0.035), Math.cos(a) * (GR + 0.035)]; }, () => 0.012, 64, 10, true),
          [gx, gy, gz], [0, 40 + 90, 23], [1, 1, 1], GOLD);

        /* 開いた本（手前右） */
        const ox = 0.78, oz = 0.42, oyaw = -14;
        api.rbox([ox, 0.011, oz], [0, oyaw, 0], [1.04, 0.022, 0.7], Object.assign({}, M.plastic, { color: [0.38, 0.2, 0.12], spec: 0.2, round: 0.12 }));
        for (const side of [-1, 1]) {
          api.mesh('openpage' + side, openPage(side), [ox, 0, oz], [0, oyaw, 0], [1, 1, 1], Object.assign({}, M.matte, { tex: side < 0 ? tex.pageL : tex.pageR, spec: 0.05 }));
          api.mesh('openedge' + side, openEdge(side), [ox, 0, oz], [0, oyaw, 0], [1, 1, 1], PAGEMAT);
        }

        K.shadow(api, -0.62, -0.02, 0.55, 0.5, 0, 0.5);
        K.shadow(api, -1.0, -0.66, 1.15, 0.85, 0, 0.45);
        K.shadow(api, IX, IZ, 0.34, 0.34, 0, 0.45);
        K.shadow(api, gx, gz, 0.6, 0.6, 0, 0.45);
        K.shadow(api, ox, oz, 1.2, 0.85, oyaw, 0.35);
        if (api.mode === 0) {
          api.blend(true);
          api.quad([1.35, 0.006, -0.05], [0, 0, 0], [1.6, 1.6], { tex: tex.lampLight, unlit: true, alpha: 0.55 });   // 画面外のランプの光だまり
          api.blend(false);
        }
        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.9, H * 0.55, 0, W * 0.9, H * 0.55, W * 0.7);
    lg.addColorStop(0, 'rgba(255,214,150,0.18)'); lg.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.3);
    E.drawGrain(ctx, W, H, 0.035, 30, 2);

  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 机（濃い木）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(303);
    x.fillStyle = '#5a3a24'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 260; i++) {
      x.globalAlpha = 0.06 + r() * 0.1; x.strokeStyle = r() > 0.5 ? '#8a5e3c' : '#2e1c10'; x.lineWidth = 1 + r() * 2;
      x.beginPath(); const y0 = r() * S;
      for (let px = 0; px <= S; px += 16) x.lineTo(px, y0 + Math.sin(px * 0.006 + i) * 8);
      x.stroke();
    }
    x.globalAlpha = 1;
    T.desk = c;
  }
  // 本棚
  {
    const Wd = 1024, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(55);
    x.fillStyle = '#2d1d12'; x.fillRect(0, 0, Wd, Ht);
    const cols = ['#7a2a2a', '#2a4a6a', '#3a5a3a', '#8a6a2a', '#5a3a5a', '#d8cbb0', '#1e2e3e'];
    for (let row = 0; row < 3; row++) {
      let px = 10; const y1 = row * (Ht / 3) + 20, y2 = (row + 1) * (Ht / 3) - 14;
      while (px < Wd - 10) {
        const bw = 18 + r() * 26, bh = (y2 - y1) * (0.7 + r() * 0.3);
        x.fillStyle = cols[(r() * cols.length) | 0]; x.fillRect(px, y2 - bh, bw - 3, bh);
        x.fillStyle = 'rgba(230,200,120,0.5)'; x.fillRect(px + 3, y2 - bh + 12, bw - 9, 4);
        px += bw;
      }
      x.fillStyle = '#4a3020'; x.fillRect(0, y2, Wd, 14);
    }
    T.shelf = c;
  }
  // 地球儀（架空の大陸）
  {
    const Wd = 1024, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(77);
    x.fillStyle = '#6fa6c4'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 9; i++) {
      const cx = r() * Wd, cy = 90 + r() * (Ht - 180), rad = 50 + r() * 90, rr = E.rnd(i * 13 + 5);
      x.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.25) { const k = rad * (0.6 + rr() * 0.6); x.lineTo(cx + Math.cos(a) * k * 1.4, cy + Math.sin(a) * k); }
      x.closePath(); x.fillStyle = ['#d8c48a', '#a9c48a', '#c9a878'][i % 3]; x.fill();
    }
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2;
    for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(0, i * Ht / 8); x.lineTo(Wd, i * Ht / 8); x.stroke(); }
    for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(i * Wd / 12, 0); x.lineTo(i * Wd / 12, Ht); x.stroke(); }
    T.globe = c;
  }
  // 開いた本のページ（左：英文、右：和文）
  const page = (lines, jp) => {
    const Wd = 490, Ht = 640, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f7f1e3'; x.fillRect(0, 0, Wd, Ht);
    const g = x.createLinearGradient(jp ? 0 : Wd, 0, jp ? 60 : Wd - 60, 0);
    g.addColorStop(0, 'rgba(120,100,70,0.35)'); g.addColorStop(1, 'rgba(120,100,70,0)');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#3a3026';
    x.font = jp ? E.font(700, 30, E.FONT.serif) : E.font(500, 30, E.FONT.cond);
    lines.forEach((t, i) => x.fillText(t, 50, 90 + i * 52));
    return c;
  };
  T.pageL = page(['Good morning.', 'Have a nice day.', 'Thank you.', 'Nice to meet you.', 'See you later.', 'Welcome!', 'Cheers!', 'Take care.', 'Sweet dreams.', 'Good luck!'], false);
  T.pageR = page(['おはようございます。', 'よい一日を。', 'ありがとう。', 'はじめまして。', 'またあとで。', 'ようこそ！', '乾杯！', '気をつけて。', 'よい夢を。', 'がんばって！'], true);
  // 本の小口（紙の重なりの細い線）
  {
    const c = C(64, 256), x = c.getContext('2d'), r = E.rnd(71);
    x.fillStyle = '#f1e9d7'; x.fillRect(0, 0, 64, 256);
    for (let y = 4; y < 252; y += 10 + (r() * 6 | 0)) { x.fillStyle = `rgba(150,130,100,${0.06 + r() * 0.06})`; x.fillRect(0, y, 64, 3); }
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(120,100,70,0.12)'); g.addColorStop(0.1, 'rgba(0,0,0,0)'); g.addColorStop(0.9, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,100,70,0.12)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 256);
    T.edge = c;
  }
  // ランプの光だまり
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,220,160,0.55)'); g.addColorStop(1, 'rgba(255,220,160,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    T.lampLight = c;
  }
  return T;
}
})();
