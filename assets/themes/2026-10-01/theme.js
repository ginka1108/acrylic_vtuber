/* =========================================================================
 *  10/01 コーヒーの日（全日本コーヒー協会が制定）
 *  朝のカフェのテーブル。ラテアートのカップ＆ソーサー、
 *  ミルクピッチャー、シュガーポット、豆の袋、卓上カレンダーの横にアクスタを置く。
 *  奥にはカウンターのエスプレッソマシン、黒板メニュー、窓の朝の緑。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'coffee-day',   // 英字の短い名前（保存するファイル名に使う）
  title: 'コーヒーの日',
  dayName: 'Coffee Day',
  caption: { fill: '#fffaf2', outline: '#4a2c17' },
  size: [1350, 1350],
  googleFonts: 'family=Caveat:wght@700',
  fonts: ['700 100px "Caveat"'],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D;

    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#d9c29b', ink: '#4a2e1a', accent: '#8a4b22', back: '#cdb58f' } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['wood', 'wall', 'counter'].includes(k) });

    /* ---------- 配置 ---------- */
    const P = { x: -0.22, z: 0.0, yaw: 10 };             // アクスタ
    const CUP = { x: 0.52, z: -0.42 };                    // カップ（右奥）
    const CAL = { x: -0.86, z: -1.05, yaw: 24 };          // 卓上カレンダー（左奥）
    const eye = [0.30, 1.30, 2.75], at = [0.02, 0.47, 0];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const yawToCam = (x, z) => Math.atan2(eye[0] - x, eye[2] - z) * 180 / Math.PI;
    const CREAM = [0.95, 0.93, 0.89];

    S.render(ctx, {
      W, H, clear: [0.93, 0.88, 0.80], ambient: 0.55, light: [-0.55, 0.85, 0.55],
      envTop: [1.05, 1.0, 0.94], envBot: [0.56, 0.47, 0.38], sky: [1.0, 0.97, 0.92], ground: [0.66, 0.55, 0.45],
      camera: { eye, at, fov: 31, focus, dofScale: 0.30, blur: 12 },
      draw(api) {
        /* --- 奥：店の壁・窓・カーテン --- */
        api.panel([0, 1.6, -5.0], [0, 0, 0], [16, 6], { tex: tex.wall, uvScale: [5, 2] });
        api.panel([-0.55, 2.0, -4.95], [0, 0, 0], [3.8, 2.9], { tex: tex.window, unlit: true });
        api.box([-0.55, 0.52, -4.9], [0, 0, 0], [4.1, 0.1, 0.25], { color: [0.55, 0.40, 0.28] });   // 窓台
        for (const cx of [-2.65, 1.55]) api.panel([cx, 2.0, -4.88], [0, 0, 0], [0.6, 3.1], { tex: tex.curtain });
        api.box([-0.55, 3.55, -4.85], [0, 0, 0], [4.8, 0.05, 0.05], { color: [0.3, 0.22, 0.16] });  // カーテンレール
        // 窓台の小さな鉢
        K.plant(api, { x: -1.6, y: 0.57, z: -4.85, s: 1.2, seed: 5 });
        K.plant(api, { x: 0.4, y: 0.57, z: -4.85, s: 0.9, seed: 9, pot: [0.9, 0.88, 0.84] });

        /* --- 奥：カウンター（棚の上に瓶・カップ・マシン）と黒板メニュー --- */
        api.box([0, 0.31, -2.8], [0, 0, 0], [6.5, 0.62, 0.7], { tex: tex.counter, face: S.FACE.FRONT, edge: [0.62, 0.5, 0.38], uvScale: [4, 1] });
        api.box([0, 0.645, -2.8], [0, 0, 0], [6.6, 0.05, 0.78], { color: [0.86, 0.84, 0.8], spec: 0.4 });
        // エスプレッソマシン（右）
        api.box([1.45, 0.97, -2.9], [0, 0, 0], [0.9, 0.6, 0.5], { color: [0.78, 0.8, 0.82], spec: 0.9 });
        api.box([1.45, 1.32, -2.9], [0, 0, 0], [0.92, 0.1, 0.52], { color: [0.2, 0.2, 0.22], spec: 0.5 });
        for (const gx of [1.25, 1.65]) {
          api.cylinder([gx, 0.82, -2.62], [0, 0, 0], [0.12, 0.08, 0.12], { color: [0.15, 0.15, 0.16], spec: 0.6 });
          api.cylinder([gx, 0.72, -2.6], [0, 0, 0], [0.14, 0.12, 0.14], { color: CREAM, spec: 0.3 });
        }
        for (let i = 0; i < 3; i++) api.cylinder([1.3 + i * 0.16, 1.42, -2.95], [0, 0, 0], [0.14, 0.12, 0.14], { color: [0.96, 0.95, 0.92], spec: 0.3 });  // 温めカップ
        // 豆の瓶（中央〜左）
        const jars = [[-1.9, 0.34, [0.62, 0.38, 0.20]], [-1.55, 0.26, [0.35, 0.22, 0.14]], [-1.2, 0.3, [0.70, 0.52, 0.30]], [0.35, 0.28, [0.45, 0.28, 0.16]], [0.7, 0.22, [0.85, 0.80, 0.70]]];
        for (const [jx, jh, jc] of jars) {
          api.cylinder([jx, 0.67 + jh / 2, -2.8], [0, 0, 0], [0.24, jh, 0.24], { color: jc, spec: 0.35 });
          api.cylinder([jx, 0.68 + jh, -2.8], [0, 0, 0], [0.26, 0.04, 0.26], { color: [0.3, 0.25, 0.22], spec: 0.4 });
        }
        K.plant(api, { x: -0.6, y: 0.67, z: -2.8, s: 1.1, seed: 12 });
        // 焼き菓子の台（中央）
        api.cylinder([0.05, 0.7, -2.75], [0, 0, 0], [0.5, 0.05, 0.5], { color: [0.95, 0.94, 0.92], spec: 0.4 });
        api.cylinder([0.05, 0.79, -2.75], [0, 0, 0], [0.36, 0.14, 0.36], { color: [0.86, 0.62, 0.42] });
        api.panel([2.2, 2.3, -4.94], [0, 0, 0], [1.4, 0.98], { tex: tex.menu });
        // ペンダントライト
        for (const [lx, lz] of [[-1.3, -2.6], [1.5, -3.0]]) {
          api.cylinder([lx, 3.4, lz], [0, 0, 0], [0.012, 1.4, 0.012], { color: [0.15, 0.13, 0.12] });
          api.cylinder([lx, 2.62, lz], [0, 0, 0], [0.34, 0.2, 0.34], { color: [0.22, 0.2, 0.18], spec: 0.5 });
          api.cylinder([lx, 2.515, lz], [0, 0, 0], [0.3, 0.01, 0.3], { color: [1, 0.86, 0.6], unlit: true });
        }

        /* --- テーブル（ランチョンマット付き） --- */
        api.box([0, -0.04, 0], [0, 0, 0], [7, 0.08, 5.2], { tex: tex.wood, face: S.FACE.TOP, edge: [0.42, 0.29, 0.19] });
        api.quad([0.6, 0.002, -0.5], [0, -8, 0], [1.35, 1.05], { tex: tex.runner });

        /* --- コーヒー豆の袋（右奥） --- */
        const bx = 1.05, bz = -1.55, br = -18;
        api.box([bx, 0.34, bz], [0, br, 0], [0.46, 0.68, 0.26], { tex: tex.bag, face: S.FACE.FRONT, edge: [0.72, 0.56, 0.38] });
        api.box([bx, 0.72, bz], [0, br, 0], [0.47, 0.08, 0.12], { color: [0.68, 0.52, 0.35] });   // 折り返し
        api.box([bx, 0.77, bz], [0, br, 0], [0.5, 0.02, 0.04], { color: [0.78, 0.68, 0.3], spec: 0.6 });   // 留め具
        /* --- ミルクジャグ（白い陶器）とシュガーポット（青い釉薬） --- */
        const mx = 0.08, mz = -1.1;
        K.pitcher(api, { x: mx, z: mz, h: 0.3, yaw: -30 });
        const SUGAR = [0.42, 0.6, 0.7];
        api.lathe('sugarpot', [[0, 0.004], [0.3, 0.004], [0.32, 0, 1], [0.35, 0.03], [0.44, 0.2], [0.47, 0.42], [0.45, 0.6], [0.42, 0.66, 1],
          [0.4, 0.66], [0, 0.66]], [-0.42, 0, -1.5], [0, 0, 0], [0.42, 0.42, 0.42], Object.assign({}, E.MAT.ceramic, { color: SUGAR }));
        api.lathe('sugarlid', [[0.44, 0], [0.45, 0.02], [0.4, 0.08], [0.25, 0.13], [0.1, 0.15], [0.08, 0.17, 1], [0.12, 0.22], [0.1, 0.26], [0, 0.27]],
          [-0.42, 0.66 * 0.42, -1.5], [0, 0, 0], [0.42, 0.42, 0.42], Object.assign({}, E.MAT.ceramic, { color: SUGAR }));

        /* --- ソーサーとカップ（ラテアート） --- */
        const sy = K.saucer(api, { x: CUP.x, z: CUP.z, d: 0.92, color: CREAM, band: [0.55, 0.38, 0.24] });
        K.cup(api, { x: CUP.x, z: CUP.z, y: sy, d: 0.52, h: 0.44, color: CREAM, handleYaw: -28, band: [0.55, 0.38, 0.24],
                     liquid: { tex: tex.latte, rot: -20, level: 0.9 } });

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 影 --- */
        K.shadow(api, CUP.x + 0.02, CUP.z, 1.05, 0.95, 0, 0.5);
        K.shadow(api, bx + 0.02, bz, 0.7, 0.45, br, 0.45);
        K.shadow(api, mx, mz, 0.34, 0.3, 0, 0.45);
        K.shadow(api, -0.42, -1.5, 0.4, 0.36, 0, 0.45);

        /* --- 半透明：湯気・灯り（アクスタより奥）→ アクスタ --- */
        stand.shadow(api, P);
        api.blend(true);
        if (api.mode === 0) {
          const ry = yawToCam(CUP.x, CUP.z), rimY = 0.05 + 0.44;
          api.panel([CUP.x - 0.03, rimY + 0.34, CUP.z], [0, ry, 0], [0.42, 0.66], { tex: tex.steam, unlit: true, alpha: 0.7 });
          api.panel([CUP.x + 0.05, rimY + 0.40, CUP.z - 0.03], [0, ry, 6], [0.34, 0.72], { tex: tex.steam, unlit: true, alpha: 0.45 });
          for (const [lx, lz] of [[-1.3, -2.6], [1.5, -3.0]]) api.panel([lx, 2.45, lz + 0.2], [0, yawToCam(lx, lz), 0], [1.3, 1.3], { tex: tex.glow, unlit: true, alpha: 0.8 });
        }
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    /* ---------- 2Dの仕上げ ---------- */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.05, -H * 0.05, 0, W * 0.05, -H * 0.05, W * 0.9);
    lg.addColorStop(0, 'rgba(255,236,200,0.30)');
    lg.addColorStop(0.5, 'rgba(255,236,200,0.08)');
    lg.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.22);
    E.drawGrain(ctx, W, H, 0.035, 31, 2);
  }
});

/* =========================================================================
 *  テクスチャ生成（すべてコードで描く＝画像ファイル不要）
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // テーブル天板（明るいオーク、横方向の板目・節）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(101);
    const planks = 6, ph = S / planks;
    for (let i = 0; i < planks; i++) {
      const base = 0.92 + r() * 0.12;
      const g = x.createLinearGradient(0, i * ph, 0, (i + 1) * ph);
      g.addColorStop(0, `rgb(${196 * base | 0},${150 * base | 0},${106 * base | 0})`);
      g.addColorStop(1, `rgb(${178 * base | 0},${133 * base | 0},${92 * base | 0})`);
      x.fillStyle = g; x.fillRect(0, i * ph, S, ph);
      for (let k = 0; k < 90; k++) {
        x.globalAlpha = 0.05 + r() * 0.10;
        x.strokeStyle = r() > 0.5 ? '#f3d9b4' : '#6b4526';
        x.lineWidth = 0.6 + r() * 1.6;
        const y0 = i * ph + r() * ph, amp = 2 + r() * 6, f = 0.004 + r() * 0.01;
        x.beginPath();
        for (let px = 0; px <= S; px += 16) x.lineTo(px, y0 + Math.sin(px * f + k) * amp);
        x.stroke();
      }
      if (r() > 0.4) {                                   // 節
        const kx = r() * S, ky = i * ph + ph * (0.3 + r() * 0.4);
        x.globalAlpha = 0.35; x.strokeStyle = '#5a3a20';
        for (let k = 0; k < 5; k++) { x.lineWidth = 1.2; x.beginPath(); x.ellipse(kx, ky, 8 + k * 7, 3 + k * 2.5, 0, 0, 7); x.stroke(); }
      }
      x.globalAlpha = 1;
      x.fillStyle = 'rgba(70,42,20,0.55)'; x.fillRect(0, i * ph, S, 2);
    }
    E.drawGrain(x, S, S, 0.08, 5, 2);
    T.wood = c;
  }
  // 壁（白い塗り壁のムラ）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), r = E.rnd(7);
    x.fillStyle = '#e9e0d3'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 80; i++) {
      x.globalAlpha = 0.03 + r() * 0.05; x.fillStyle = r() > 0.5 ? '#fff8ee' : '#cbbca8';
      x.beginPath(); x.ellipse(r() * S, r() * S, 40 + r() * 120, 20 + r() * 60, r() * 3, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    E.drawGrain(x, S, S, 0.06, 71, 2);
    T.wall = c;
  }
  // 窓（朝の空と木々。桟つき）
  {
    const Wd = 1024, Ht = 780, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(55);
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#bcdcf0'); g.addColorStop(0.55, '#f4eedd'); g.addColorStop(1, '#ffe8c2');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(r() * Wd, 40 + r() * 150, 60 + r() * 70, 14 + r() * 10, 0, 0, 7); x.fill(); }
    for (let i = 0; i < 110; i++) {
      x.globalAlpha = 0.25 + r() * 0.35;
      x.fillStyle = ['#8fb573', '#a9c98a', '#6f9a5c', '#c9dca5'][i % 4];
      x.beginPath(); x.arc(r() * Wd, Ht * 0.55 + r() * Ht * 0.5, 30 + r() * 80, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    x.fillStyle = '#6a4a33';
    const fw = 22;
    x.fillRect(0, 0, Wd, fw); x.fillRect(0, Ht - fw, Wd, fw); x.fillRect(0, 0, fw, Ht); x.fillRect(Wd - fw, 0, fw, Ht);
    x.fillRect(Wd / 2 - 9, 0, 18, Ht); x.fillRect(0, Ht * 0.42, Wd, 14);
    T.window = c;
  }
  // カーテン（リネンのひだ）
  {
    const Wd = 128, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d');
    for (let i = 0; i < Wd; i++) {
      const v = 0.86 + 0.1 * Math.sin(i / Wd * Math.PI * 6);
      x.fillStyle = `rgb(${244 * v | 0},${236 * v | 0},${222 * v | 0})`; x.fillRect(i, 0, 1, Ht);
    }
    T.curtain = c;
  }
  // カウンターの前板（縦張りの羽目板）
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#8a6a4c'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#a78463' : '#9c7a5a'; x.fillRect(i * 32 + 2, 0, 28, Ht); }
    T.counter = c;
  }
  // 黒板メニュー（チョーク）
  {
    const Wd = 600, Ht = 420, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#26332d'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = '#8a6a48'; x.lineWidth = 22; x.strokeRect(0, 0, Wd, Ht);
    x.fillStyle = '#eef3ec'; x.textAlign = 'center';
    x.font = E.font(700, 64, E.FONT.script); x.fillText('Menu', Wd / 2, 90);
    x.textAlign = 'left'; x.font = E.font(700, 36, E.FONT.script);
    const items = [['Blend', '450'], ['Cafe Latte', '520'], ['Espresso', '400'], ['Toast Set', '680']];
    items.forEach(([n, p], i) => { x.fillText(n, 60, 160 + i * 58); x.textAlign = 'right'; x.fillText(p, Wd - 60, 160 + i * 58); x.textAlign = 'left'; });
    E.drawGrain(x, Wd, Ht, 0.12, 8, 2);
    T.menu = c;
  }
  // ランチョンマット（リネン・縁に刺繍ライン）
  {
    const Wd = 256, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(19);
    x.fillStyle = '#e7dccb'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < Wd; i += 3) { x.fillStyle = `rgba(150,130,100,${0.06 + r() * 0.06})`; x.fillRect(i, 0, 1, Ht); x.fillRect(0, i, Wd, 1); }
    x.strokeStyle = '#9a6b45'; x.lineWidth = 5; x.strokeRect(14, 14, Wd - 28, Ht - 28);
    x.fillStyle = '#e7dccb'; for (let i = 0; i < Wd; i += 8) { x.fillRect(i, 0, 3, 5); x.fillRect(i, Ht - 5, 3, 5); }
    T.runner = c;
  }
  // コーヒー豆の袋（クラフト紙・ラベル）
  {
    const Wd = 460, Ht = 680, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#b98f62'; x.fillRect(0, 0, Wd, Ht);
    E.drawGrain(x, Wd, Ht, 0.25, 4, 2);
    x.fillStyle = '#f6efe2'; E.roundRect(x, 60, 180, Wd - 120, 330, 14); x.fill();
    x.strokeStyle = '#4a2e1a'; x.lineWidth = 3; E.roundRect(x, 72, 192, Wd - 144, 306, 10); x.stroke();
    x.fillStyle = '#4a2e1a'; x.textAlign = 'center';
    x.font = E.font(700, 44, E.FONT.cond); x.fillText('OHAYO', Wd / 2, 262);
    x.font = E.font(500, 30, E.FONT.cond); x.fillText('ROASTERS', Wd / 2, 300);
    x.beginPath(); x.arc(Wd / 2, 372, 34, 0, 7); x.fillStyle = '#8a4b22'; x.fill();
    x.fillStyle = '#f6efe2'; x.beginPath(); x.ellipse(Wd / 2, 372, 12, 20, 0.5, 0, 7); x.fill();
    x.fillStyle = '#4a2e1a'; x.font = E.font(700, 34, E.FONT.script); x.fillText('Morning Blend', Wd / 2, 460);
    T.bag = c;
  }
  // ラテアート（チューリップ）：クレマのグラデーションと細かい泡、ふちの濃いリング、柔らかい輪郭のミルク
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(808);
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, '#b27a48'); g.addColorStop(0.55, '#9b6435'); g.addColorStop(0.86, '#7a4521'); g.addColorStop(0.97, '#5a2e14'); g.addColorStop(1, '#4a2410');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) {                       // クレマのまだら
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * S * 0.48;
      x.fillStyle = r() > 0.5 ? 'rgba(210,160,110,0.10)' : 'rgba(70,35,15,0.10)';
      x.beginPath(); x.arc(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, 2 + r() * 7, 0, 7); x.fill();
    }
    // ミルク：別キャンバスに描いてぼかし、柔らかい縁にする
    const m = C(S, S), mx = m.getContext('2d');
    mx.fillStyle = '#f7ecdc';
    const heart = (cx, cy, w, h) => {
      mx.beginPath();
      mx.moveTo(cx, cy + h * 0.55);
      mx.bezierCurveTo(cx - w * 0.62, cy + h * 0.05, cx - w * 0.5, cy - h * 0.62, cx, cy - h * 0.22);
      mx.bezierCurveTo(cx + w * 0.5, cy - h * 0.62, cx + w * 0.62, cy + h * 0.05, cx, cy + h * 0.55);
      mx.fill();
    };
    heart(S / 2, S * 0.60, S * 0.56, S * 0.42);            // 下の大きい層
    mx.globalCompositeOperation = 'destination-out';
    heart(S / 2, S * 0.49, S * 0.47, S * 0.3);             // 層のすき間（コーヒー色が見える）
    mx.globalCompositeOperation = 'source-over';
    heart(S / 2, S * 0.47, S * 0.42, S * 0.27);
    mx.globalCompositeOperation = 'destination-out';
    heart(S / 2, S * 0.38, S * 0.33, S * 0.2);
    mx.globalCompositeOperation = 'source-over';
    heart(S / 2, S * 0.36, S * 0.28, S * 0.19);
    // 最後に引き抜いた線（ハートを縦に割る）
    mx.globalCompositeOperation = 'destination-out';
    mx.lineCap = 'round'; mx.lineWidth = 10;
    mx.beginPath(); mx.moveTo(S / 2, S * 0.2); mx.quadraticCurveTo(S / 2 + 6, S * 0.55, S / 2, S * 0.86); mx.stroke();
    mx.globalCompositeOperation = 'source-over';
    x.save(); x.filter = 'blur(5px)'; x.drawImage(m, 0, 0); x.restore();
    x.globalAlpha = 0.55; x.drawImage(m, 0, 0); x.globalAlpha = 1;     // 芯はくっきり
    for (let i = 0; i < 900; i++) {                        // ミルクの細かい泡
      const px = r() * S, py = r() * S;
      x.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.08})`;
      x.beginPath(); x.arc(px, py, 1 + r() * 2.5, 0, 7); x.fill();
    }
    T.latte = c;
  }
  // 湯気
  {
    const Wd = 256, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(3);
    x.filter = 'blur(14px)';
    for (let i = 0; i < 14; i++) {
      const t = i / 14, y = Ht * (0.92 - t * 0.85), cx = Wd / 2 + Math.sin(t * 6 + 1) * 40;
      x.globalAlpha = 0.42 * Math.sin(t * Math.PI) + 0.06;
      x.fillStyle = '#ffffff';
      x.beginPath(); x.ellipse(cx + (r() - 0.5) * 20, y, 26 + t * 30, 40, 0, 0, 7); x.fill();
    }
    x.filter = 'none';
    T.steam = c;
  }
  // 電球の光だまり
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,220,160,0.9)'); g.addColorStop(0.3, 'rgba(255,210,150,0.35)'); g.addColorStop(1, 'rgba(255,200,140,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    T.glow = c;
  }
  return T;
}
})();
