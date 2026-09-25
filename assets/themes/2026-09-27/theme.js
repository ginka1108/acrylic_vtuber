/* =========================================================================
 *  9/27 世界観光の日（World Tourism Day / 国連世界観光機関）
 *  旅立ちの朝。海の見える窓辺のテーブルに地図を広げ、アクスタを置く。
 *  スーツケースと麦わら帽子、カメラ、サングラス、絵はがき、パスポート、搭乗券。
 *  窓の外には海と帆船、カモメ。アクスタは右に大きめに振る。
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'tourism-day',   // 英字の短い名前（保存するファイル名に使う）
  title: '世界観光の日',
  dayName: 'World Tourism Day',
  caption: { fill: '#fffdf6', outline: '#1d3f6e' },
  size: [1350, 1350],
  googleFonts: 'family=Oswald:wght@500;700',
  fonts: ['700 100px "Oswald"', '500 100px "Oswald"'],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['wood', 'leather', 'shell', 'knurl'].includes(k) });

    const P = { x: -0.18, z: 0.05, yaw: 24 };           // アクスタ（右に大きく振る）
    const eye = [0.62, 1.34, 2.62], at = [0.06, 0.48, 0];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const CASE = [0.2, 0.44, 0.5];                         // スーツケースの色
    const CAL = { x: 0.5, z: -0.72, yaw: -16 };            // 卓上カレンダー（スーツケースの手前）
    const cal = E.dateProp(env, { style: { paper: '#fbf7ee', ink: '#1d3f6e', accent: '#c0392b', back: '#e9e2d2', grain: 0.08 } });
    const CHROME = Object.assign({}, M.metal, { color: [0.9, 0.9, 0.92] });
    const BLACK = Object.assign({}, M.plastic, { color: [0.07, 0.07, 0.08], spec: 0.5, shin: 60 });

    S.render(ctx, {
      W, H, clear: [0.80, 0.90, 0.97], ambient: 0.5, light: [0.35, 0.85, 0.5], lightCol: [1.15, 1.12, 1.06],
      sky: [1.0, 1.02, 1.06], ground: [0.72, 0.66, 0.58], envTop: [1.1, 1.12, 1.18], envBot: [0.52, 0.47, 0.42],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        /* 奥：壁と大きな窓（海と空）・カーテン（ぼける） */
        api.panel([0, 1.6, -4.2], [0, 0, 0], [14, 6], Object.assign({}, M.matte, { color: [0.95, 0.93, 0.89] }));
        api.panel([0.2, 1.9, -4.15], [0, 0, 0], [5.2, 3.0], { tex: tex.window, unlit: true });
        api.rbox([0.2, 0.36, -4.05], [0, 0, 0], [5.5, 0.1, 0.3], Object.assign({}, M.matte, { color: [0.92, 0.9, 0.86], round: 0.1 }));
        for (const kx of [-2.6, 3.0]) api.panel([kx, 1.95, -4.02], [0, 0, 0], [0.75, 3.2], Object.assign({}, M.matte, { tex: tex.curtain }));
        api.cylinder([0.2, 3.6, -4.0], [0, 0, 90], [0.05, 6.4, 0.05], Object.assign({}, M.gold, { color: [0.7, 0.55, 0.35] }));
        K.plant(api, { x: -2.3, y: 0.41, z: -3.9, s: 1.6, seed: 8 });

        /* テーブル */
        api.box([0, -0.04, 0], [0, 0, 0], [7, 0.08, 5.2], Object.assign({}, M.wood, { tex: tex.wood, face: S.FACE.TOP, edge: [0.5, 0.36, 0.24] }));
        // 広げた地図（紙）
        api.quad([0.05, 0.003, -0.15], [0, -8, 0], [2.3, 1.55], Object.assign({}, M.matte, { tex: tex.map }));

        /* スーツケース（右奥に立てて置く。角の丸いシェル＋縦のリブ、伸縮ハンドル、キャスター） */
        const cx = 1.05, cz = -0.95, cr = -24, rr = cr * Math.PI / 180;
        const side = (d) => [cx + Math.cos(rr) * d, cz - Math.sin(rr) * d];
        api.rbox([cx, 0.64, cz], [0, cr, 0], [1.02, 1.16, 0.42], Object.assign({}, M.plastic, { tex: tex.shell, tint: true, color: CASE, round: 0.14, spec: 0.55, shin: 80, rim: 0.2, bump: 0.8 }));
        api.rbox([cx, 0.64, cz], [0, cr, 0], [1.03, 0.03, 0.43], Object.assign({}, BLACK, { round: 0.3 }));   // ファスナーの帯
        for (const d of [-0.12, 0.12]) { const [px, pz] = side(d); api.cylinder([px, 1.36, pz - 0.0], [0, cr, 0], [0.035, 0.36, 0.035], CHROME); }
        { const [px, pz] = side(0); api.rbox([px, 1.55, pz], [0, cr, 0], [0.32, 0.05, 0.07], Object.assign({}, BLACK, { round: 0.5 })); }
        for (const d of [-0.42, 0.42]) {
          const [px, pz] = side(d);
          api.rbox([px, 0.06, pz], [0, cr, 0], [0.12, 0.06, 0.12], Object.assign({}, BLACK, { round: 0.4 }));
          api.cylinder([px, 0.04, pz], [0, cr, 90], [0.08, 0.05, 0.08], Object.assign({}, BLACK, { color: [0.15, 0.15, 0.16] }));
        }
        { const [px, pz] = side(-0.18);                  // 荷札（革）
          api.rbox([px + Math.sin(rr) * 0.23, 1.0, pz + Math.cos(rr) * 0.23], [0, cr, 6], [0.2, 0.13, 0.012], Object.assign({}, M.matte, { tex: tex.tag, round: 0.2 })); }

        /* 地図の上：クラシックカメラ（革張りのボディ・金属の軍艦部・レンズ） */
        const kx = -0.82, kz = -0.62, kr = 30, kra = kr * Math.PI / 180;
        const fwd = (d, h, sd) => [kx + Math.sin(kra) * d + Math.cos(kra) * (sd || 0), h, kz + Math.cos(kra) * d - Math.sin(kra) * (sd || 0)];
        api.rbox(fwd(0, 0.1, 0), [0, kr, 0], [0.44, 0.2, 0.15], Object.assign({}, M.matte, { tex: tex.leather, color: [0.12, 0.11, 0.1], tint: true, round: 0.18, bump: 0.8, spec: 0.12 }));
        api.rbox(fwd(0, 0.215, 0), [0, kr, 0], [0.44, 0.07, 0.15], Object.assign({}, CHROME, { round: 0.25 }));
        api.rbox(fwd(0.02, 0.265, -0.1), [0, kr, 0], [0.12, 0.05, 0.08], Object.assign({}, CHROME, { round: 0.35 }));        // ファインダー
        api.lathe('dial', [[0, 0], [0.5, 0], [0.5, 0.35], [0.4, 0.4], [0, 0.4]], fwd(0, 0.25, 0.12), [0, 0, 0], [0.09, 0.09, 0.09], Object.assign({}, CHROME, { tex: tex.knurl, uvScale: [8, 1] }));
        api.lathe('shutter', [[0, 0], [0.5, 0], [0.5, 0.6], [0.3, 0.9], [0, 0.95]], fwd(-0.02, 0.25, 0.04), [0, 0, 0], [0.04, 0.04, 0.04], CHROME);
        const lens = [[0, 0], [0.5, 0], [0.5, 0.25, 1], [0.44, 0.27], [0.44, 0.55], [0.4, 0.58, 1], [0.4, 0.9], [0.36, 0.92, 1], [0.3, 0.9], [0, 0.88]];
        api.lathe('lens', lens, fwd(0.075, 0.1, 0), [90, kr, 0], [0.16, 0.18, 0.16], Object.assign({}, CHROME, { tex: tex.knurl, uvScale: [16, 1] }));
        api.lathe('glass', [[0, 0], [0.3, 0], [0.24, 0.03], [0, 0.05]], fwd(0.075 + 0.18 * 0.88, 0.1, 0), [90, kr, 0], [0.16, 0.18, 0.16],
          Object.assign({}, M.glass, { color: [0.1, 0.14, 0.24], spec: 1.0, shin: 200, rim: 0.9 }));

        // 絵はがき
        api.box([-0.35, 0.005, -1.35], [0, 14, 0], [0.5, 0.008, 0.34], Object.assign({}, M.matte, { tex: tex.postcard, face: S.FACE.TOP, edge: [0.95, 0.93, 0.88] }));

        /* 奥：観葉植物、ガイドブックの山 */
        K.plant(api, { x: -1.25, z: -2.1, s: 1.8, seed: 21, pot: [0.9, 0.86, 0.8], leaf: [0.3, 0.55, 0.32], leaves: 14 });
        K.book(api, { x: 0.25, z: -1.85, w: 0.62, d: 0.44, h: 0.1, yaw: 8, col: [0.85, 0.35, 0.25] });
        K.book(api, { x: 0.27, y: 0.1, z: -1.85, w: 0.58, d: 0.42, h: 0.08, yaw: -4, col: [0.2, 0.45, 0.6] });
        K.book(api, { x: 0.24, y: 0.18, z: -1.86, w: 0.55, d: 0.4, h: 0.12, yaw: 12, col: [0.95, 0.78, 0.3] });

        /* パスポート（手前右） */
        api.rbox([0.78, 0.018, 0.42], [0, 18, 0], [0.34, 0.036, 0.48], Object.assign({}, M.matte, { tex: tex.passport, round: 0.08, bump: 0.3 }));
        // 方位磁針（真鍮のケース＋文字盤＋ガラス）
        api.lathe('compass', [[0, 0], [0.48, 0], [0.5, 0.05], [0.5, 0.3], [0.46, 0.34], [0.43, 0.3], [0, 0.3]], [-0.62, 0, 0.5], [0, 0, 0], [0.44, 0.44, 0.44],
          Object.assign({}, M.gold, { color: [0.8, 0.62, 0.36] }));
        api.cylinder([-0.62, 0.133, 0.5], [0, 20, 0], [0.37, 0.001, 0.37], Object.assign({}, M.matte, { tex: tex.compass, part: 'TOP' }));
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        K.shadow(api, cx + 0.02, cz + 0.03, 1.3, 0.8, cr, 0.45);
        K.shadow(api, -0.62, 0.5, 0.55, 0.5, 0, 0.4);
        K.shadow(api, kx, kz, 0.62, 0.36, kr, 0.45);
        stand.shadow(api, P);
        api.blend(true);
        if (api.mode === 0) api.cylinder([-0.62, 0.136, 0.5], [0, 0, 0], [0.37, 0.02, 0.37], Object.assign({}, M.glass, { part: 'TOP', color: [0.9, 0.95, 1], alpha: 0.12, rim: 0.8 }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createLinearGradient(0, 0, W, H);
    lg.addColorStop(0, 'rgba(255,245,220,0.22)'); lg.addColorStop(0.6, 'rgba(255,245,220,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.2);
    E.drawGrain(ctx, W, H, 0.03, 27, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 窓：朝の海と空
  {
    const Wd = 1024, Ht = 600, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(12);
    const sky = x.createLinearGradient(0, 0, 0, Ht * 0.6);
    sky.addColorStop(0, '#8cc7ef'); sky.addColorStop(1, '#fdf1dc');
    x.fillStyle = sky; x.fillRect(0, 0, Wd, Ht * 0.6);
    const sea = x.createLinearGradient(0, Ht * 0.6, 0, Ht);
    sea.addColorStop(0, '#4fa3c7'); sea.addColorStop(1, '#2d7ea8');
    x.fillStyle = sea; x.fillRect(0, Ht * 0.6, Wd, Ht * 0.4);
    x.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(r() * Wd, 60 + r() * 180, 70 + r() * 80, 18 + r() * 14, 0, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(255,250,230,0.5)';
    for (let i = 0; i < 60; i++) x.fillRect(r() * Wd, Ht * 0.62 + r() * Ht * 0.35, 20 + r() * 40, 2);
    // 帆船と遠くの島、カモメ
    x.fillStyle = 'rgba(80,120,110,0.55)'; x.beginPath(); x.ellipse(Wd * 0.8, Ht * 0.6, 160, 30, 0, Math.PI, 0); x.fill();
    x.fillStyle = '#fdfbf6'; x.beginPath(); x.moveTo(300, 330); x.lineTo(300, 250); x.lineTo(345, 330); x.fill();
    x.beginPath(); x.moveTo(296, 330); x.lineTo(296, 265); x.lineTo(262, 330); x.fill();
    x.fillStyle = '#6b4a33'; x.fillRect(262, 332, 90, 10);
    x.strokeStyle = 'rgba(90,100,110,0.7)'; x.lineWidth = 3;
    for (const [gx, gy] of [[600, 120], [650, 150], [560, 170]]) { x.beginPath(); x.moveTo(gx - 16, gy); x.quadraticCurveTo(gx - 8, gy - 10, gx, gy); x.quadraticCurveTo(gx + 8, gy - 10, gx + 16, gy); x.stroke(); }
    x.fillStyle = '#f4f1ea';
    x.fillRect(0, 0, Wd, 16); x.fillRect(0, Ht - 16, Wd, 16); x.fillRect(0, 0, 16, Ht); x.fillRect(Wd - 16, 0, 16, Ht);
    x.fillRect(Wd / 3 - 6, 0, 12, Ht); x.fillRect(Wd * 2 / 3 - 6, 0, 12, Ht);
    T.window = c;
  }
  // テーブル（白っぽい木）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), r = E.rnd(88);
    x.fillStyle = '#e6d6be'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 160; i++) {
      x.globalAlpha = 0.06 + r() * 0.08; x.fillStyle = r() > 0.5 ? '#fff6e6' : '#a88a66';
      x.fillRect(0, r() * S, S, 1 + r() * 2);
    }
    x.globalAlpha = 1;
    for (let i = 1; i < 4; i++) { x.fillStyle = 'rgba(120,90,60,0.35)'; x.fillRect(0, i * S / 4, S, 2); }
    T.wood = c;
  }
  // 地図（架空の島々・経緯線・方位記号）
  {
    const Wd = 1024, Ht = 690, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(2024);
    x.fillStyle = '#f1e6cc'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#bcd9da';
    x.fillRect(30, 30, Wd - 60, Ht - 60);
    x.strokeStyle = 'rgba(80,110,120,0.35)'; x.lineWidth = 1.5;
    for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(30 + i * (Wd - 60) / 8, 30); x.lineTo(30 + i * (Wd - 60) / 8, Ht - 30); x.stroke(); }
    for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(30, 30 + i * (Ht - 60) / 5); x.lineTo(Wd - 30, 30 + i * (Ht - 60) / 5); x.stroke(); }
    const land = (cx, cy, rad, seed) => {
      const rr = E.rnd(seed);
      x.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.2) {
        const k = rad * (0.7 + rr() * 0.5);
        x.lineTo(cx + Math.cos(a) * k * 1.3, cy + Math.sin(a) * k);
      }
      x.closePath(); x.fillStyle = '#e9d9a8'; x.fill();
      x.strokeStyle = '#8a7650'; x.lineWidth = 2.5; x.stroke();
    };
    land(250, 250, 120, 3); land(620, 200, 90, 5); land(760, 450, 140, 8); land(330, 520, 70, 11); land(900, 170, 40, 13);
    x.setLineDash([10, 10]); x.strokeStyle = '#c0392b'; x.lineWidth = 4;   // 航路
    x.beginPath(); x.moveTo(280, 260); x.quadraticCurveTo(480, 120, 740, 430); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#c0392b';
    for (const [px, py] of [[280, 260], [740, 430]]) { x.beginPath(); x.arc(px, py, 10, 0, 7); x.fill(); }
    x.fillStyle = '#5a4630'; x.font = E.font(500, 22, E.FONT.cond);
    for (const [t, px, py] of [['PORT MORNING', 200, 230], ['SUNRISE BAY', 690, 420], ['CLOUD ISLE', 560, 180], ['OHAYO ISL.', 300, 540]]) x.fillText(t, px, py);
    x.strokeStyle = 'rgba(70,110,130,0.4)'; x.lineWidth = 1.5;   // 波の記号
    for (let i = 0; i < 26; i++) { const wx = 60 + r() * (Wd - 120), wy = 60 + r() * (Ht - 120); x.beginPath(); x.moveTo(wx, wy); x.quadraticCurveTo(wx + 6, wy - 5, wx + 12, wy); x.quadraticCurveTo(wx + 18, wy + 5, wx + 24, wy); x.stroke(); }
    x.strokeStyle = '#5a4630'; x.lineWidth = 4; x.strokeRect(30, 30, Wd - 60, Ht - 60);
    x.save(); x.translate(Wd - 120, Ht - 120); x.fillStyle = '#5a4630';
    for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.beginPath(); x.moveTo(0, -60); x.lineTo(10, 0); x.lineTo(-10, 0); x.fill(); }
    x.restore();
    E.drawGrain(x, Wd, Ht, 0.12, 6, 2);
    T.map = c;
  }
  // パスポート
  {
    const Wd = 340, Ht = 480, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#1f2f5a'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = '#d8b865'; x.fillStyle = '#d8b865'; x.lineWidth = 5;
    x.beginPath(); x.arc(Wd / 2, Ht * 0.47, 62, 0, 7); x.stroke();
    x.beginPath(); x.arc(Wd / 2, Ht * 0.47, 40, 0, 7); x.stroke();
    x.textAlign = 'center';
    x.font = E.font(700, 44, E.FONT.cond); x.fillText('PASSPORT', Wd / 2, Ht * 0.24);
    x.font = E.font(500, 24, E.FONT.cond); x.fillText('TRAVEL DOCUMENT', Wd / 2, Ht * 0.78);
    T.passport = c;
  }


  // 絵はがき（海の絵と切手）
  const postcard = (sky, sea, seed) => {
    const Wd = 500, Ht = 340, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbf7ee'; x.fillRect(0, 0, Wd, Ht);
    const g = x.createLinearGradient(0, 20, 0, 320); g.addColorStop(0, sky); g.addColorStop(0.55, '#fff1d8'); g.addColorStop(0.56, sea); g.addColorStop(1, '#2d6f96');
    x.fillStyle = g; x.fillRect(20, 20, 300, 300);
    x.fillStyle = '#ffd36b'; x.beginPath(); x.arc(240, 140, 28, 0, 7); x.fill();
    x.fillStyle = '#e36b3f'; x.fillRect(370, 30, 90, 110);
    x.strokeStyle = '#fff'; x.setLineDash([4, 4]); x.lineWidth = 3; x.strokeRect(376, 36, 78, 98); x.setLineDash([]);
    x.strokeStyle = '#aaa'; x.lineWidth = 2;
    for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(345, 190 + i * 36); x.lineTo(480, 190 + i * 36); x.stroke(); }
    return c;
  };
  T.postcard = postcard('#8cc7ef', '#4fa3c7', 1);
  // カーテン（白いリネン）
  {
    const Wd = 128, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d');
    for (let i = 0; i < Wd; i++) { const v = 0.88 + 0.1 * Math.sin(i / Wd * Math.PI * 5); x.fillStyle = `rgb(${250 * v | 0},${248 * v | 0},${240 * v | 0})`; x.fillRect(i, 0, 1, Ht); }
    T.curtain = c;
  }
  // 革（シボ）：暗い地に細かい粒。色は材質で掛ける
  {
    const S = 256, c = C(S, S), x = c.getContext('2d'), r = E.rnd(71);
    x.fillStyle = '#909090'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 4000; i++) { x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)'; x.beginPath(); x.arc(r() * S, r() * S, 1 + r() * 1.8, 0, 7); x.fill(); }
    T.leather = c;
  }
  // スーツケースのシェル（縦のリブ）
  {
    const c = C(256, 64), x = c.getContext('2d');
    for (let i = 0; i < 256; i++) { const v = 0.86 + 0.14 * Math.pow(Math.abs(Math.sin(i / 256 * Math.PI * 6)), 0.5); x.fillStyle = `rgb(${255 * v | 0},${255 * v | 0},${255 * v | 0})`; x.fillRect(i, 0, 1, 64); }
    T.shell = c;
  }
  // ローレット（金属の細かい縦溝）
  {
    const c = C(64, 16), x = c.getContext('2d');
    for (let i = 0; i < 64; i++) { x.fillStyle = i % 4 < 2 ? '#d8d8dc' : '#9a9aa0'; x.fillRect(i, 0, 1, 16); }
    T.knurl = c;
  }
  // 荷札
  {
    const c = C(220, 140), x = c.getContext('2d');
    x.fillStyle = '#f5d76e'; x.fillRect(0, 0, 220, 140);
    x.fillStyle = '#333'; x.font = E.font(700, 40, E.FONT.cond); x.fillText('TRIP', 60, 88);
    T.tag = c;
  }
  // 方位磁針の文字盤
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#f8f3e6'; x.fillRect(0, 0, S, S);
    x.translate(S / 2, S / 2);
    x.strokeStyle = '#5a4630'; x.lineWidth = 4; x.beginPath(); x.arc(0, 0, 110, 0, 7); x.stroke();
    x.fillStyle = '#c0392b'; x.beginPath(); x.moveTo(0, -95); x.lineTo(14, 0); x.lineTo(-14, 0); x.fill();
    x.fillStyle = '#34495e'; x.beginPath(); x.moveTo(0, 95); x.lineTo(14, 0); x.lineTo(-14, 0); x.fill();
    x.fillStyle = '#5a4630'; x.font = E.font(700, 34, E.FONT.cond); x.textAlign = 'center'; x.fillText('N', 0, -58 + 60 - 120 + 12);
    T.compass = c;
  }
  return T;
}
})();
