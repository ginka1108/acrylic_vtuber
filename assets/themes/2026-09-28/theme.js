/* =========================================================================
 *  9/28 パソコンの日（1979年のこの日、国産パソコンの草分けが発売）
 *  朝の自室のデスク。レトロなパソコンの画面が「GOOD MORNING」と光る横に
 *  アクスタを置く。キーボード、マウス、フロッピー、ヘッドホン、ペン立て、スピーカー、
 *  付箋だらけのモニター、マグカップ、卓上カレンダー。壁にはドット絵のポスター。
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'pc-day',   // 英字の短い名前（保存するファイル名に使う）
  title: 'パソコンの日',
  dayName: 'Personal Computer Day',
  caption: { fill: '#f3fff4', outline: '#173a33' },
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
    for (const k in T) tex[k] = K.texture(T[k], { repeat: k === 'desk' });

    const P = { x: -0.3, z: 0.2, yaw: 16 };
    const eye = [0.12, 1.3, 2.75], at = [0.0, 0.5, 0];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const CAL = { x: 0.0, z: -1.1, yaw: 4, w: 0.48 };   // 卓上カレンダー（キーボードの奥、本の手前）
    const cal = E.dateProp(env, { style: { paper: '#f4f1e8', ink: '#1f2a2a', accent: '#2c7a62', back: '#dcd6c6', grain: 0.06 } });
    const BEIGE = Object.assign({}, M.plastic, { color: [0.86, 0.83, 0.74], spec: 0.3, shin: 40, rim: 0.1 });
    const BEIGE2 = Object.assign({}, BEIGE, { color: [0.74, 0.71, 0.62] });
    const DARK = Object.assign({}, M.plastic, { color: [0.12, 0.12, 0.13], spec: 0.4, shin: 50 });

    /* 形 */
    const cactusGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, prof = 0.5 * Math.sin(Math.PI * Math.min(1, 0.12 + v * 0.95)) ** 0.6;
      const rr = prof * (1 + 0.1 * Math.abs(Math.cos(5 * th)) - 0.05);
      return [Math.sin(th) * rr, v, Math.cos(th) * rr];
    }, 120, 30);

    S.render(ctx, {
      W, H, clear: [0.36, 0.4, 0.46], ambient: 0.44, light: [-0.45, 0.8, 0.6], lightCol: [1.2, 1.12, 1.0],
      sky: [0.95, 0.98, 1.05], ground: [0.52, 0.5, 0.48], envTop: [1.0, 1.0, 1.02], envBot: [0.35, 0.36, 0.38],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        /* 奥：壁・ブラインド越しの朝日・ポスター・棚（ぼける） */
        api.panel([0, 1.6, -3.4], [0, 0, 0], [14, 6], Object.assign({}, M.matte, { color: [0.4, 0.46, 0.54] }));
        api.panel([-1.6, 1.9, -3.35], [0, 0, 0], [2.4, 2.2], { tex: tex.blind, unlit: true });
        api.panel([1.9, 1.7, -3.35], [0, 0, 0], [1.6, 1.1], Object.assign({}, M.matte, { tex: tex.cork }));
        api.panel([0.2, 2.05, -3.36], [0, 0, 0], [1.0, 1.35], Object.assign({}, M.matte, { tex: tex.poster }));
        api.rbox([-0.1, 1.05, -3.25], [0, 0, 0], [1.8, 0.05, 0.25], Object.assign({}, M.wood, { color: [0.85, 0.82, 0.75], round: 0.2 }));
        for (let i = 0; i < 5; i++) K.book(api, { x: -0.8 + i * 0.12, y: 1.075, z: -3.25, w: 0.09, d: 0.22, h: 0.36, yaw: 90,
          col: [[0.7, 0.3, 0.25], [0.25, 0.4, 0.6], [0.85, 0.7, 0.3], [0.3, 0.5, 0.35], [0.5, 0.3, 0.55]][i] });

        /* 机 */
        api.box([0, -0.04, 0], [0, 0, 0], [7, 0.08, 5.2], Object.assign({}, M.plastic, { tex: tex.desk, face: S.FACE.TOP, edge: [0.3, 0.27, 0.24], uvScale: [2, 2], spec: 0.2, shin: 30 }));

        /* パソコン本体とCRTモニター（右奥） */
        const mx = 0.95, mz = -1.35, mr = -20, k2 = 0.82, rr = mr * Math.PI / 180;
        const fw = (d, h, sd) => [mx + Math.sin(rr) * d + Math.cos(rr) * (sd || 0), h, mz + Math.cos(rr) * d - Math.sin(rr) * (sd || 0)];
        api.rbox(fw(0, 0.14 * k2, 0), [0, mr, 0], [1.5 * k2, 0.28 * k2, 1.1 * k2], Object.assign({}, BEIGE, { round: 0.1 }));        // 本体
        api.rbox(fw(0.55 * k2, 0.14 * k2, -0.3 * k2), [0, mr, 0], [0.5 * k2, 0.05 * k2, 0.02], Object.assign({}, DARK, { round: 0.3 }));  // FDDの口
        api.sphere(fw(0.55 * k2 + 0.008, 0.14 * k2, 0.45 * k2), [0, 0, 0], [0.025, 0.025, 0.025], { color: [0.3, 1.0, 0.45], unlit: true });  // 電源ランプ
        api.rbox(fw(-0.2 * k2, 0.83 * k2, 0), [0, mr, 0], [1.0 * k2, 0.86 * k2, 0.7 * k2], Object.assign({}, BEIGE2, { round: 0.25 }));   // ブラウン管の後ろ
        api.rbox(fw(0.1 * k2, 0.83 * k2, 0), [0, mr, 0], [1.2 * k2, 1.0 * k2, 0.34 * k2], Object.assign({}, BEIGE, { round: 0.12 }));    // 前面の枠
        const sf = 0.1 * k2 + 0.17 * k2 + 0.003;
        api.panel(fw(sf, 0.85 * k2, 0), [0, mr, 0], [0.96 * k2, 0.76 * k2], { tex: tex.screen, unlit: true, castShadow: false });

        /* キーボード：ケース＋キーを1つずつ（手前中央） */
        const kx = 0.66, kz = -0.12, ky = -12, kyr = ky * Math.PI / 180, tilt = 0;
        const kp = (u, v, h) => [kx + Math.cos(kyr) * u + Math.sin(kyr) * v, h, kz - Math.sin(kyr) * u + Math.cos(kyr) * v];
        api.rbox(kp(0, 0.035, 0), [tilt, ky, 0], [1.3, 0.07, 0.48], Object.assign({}, BEIGE2, { round: 0.18 }));
        const kw = 0.078, cols = 14;
        for (let row = 0; row < 5; row++) for (let c = 0; c < cols; c++) {
          let w = kw * 0.86, u = -0.56 + c * kw;
          if (row === 4) { if (c < 3 || c > 9) { } else if (c === 3) { w = kw * 6.86; u = -0.56 + 6 * kw; } else continue; }
          const v = -0.17 + row * 0.085, h = 0.07 + 0.016;
          const mod = c === 0 || c === cols - 1 || row === 4 && c !== 3;
          api.rbox(kp(u, v, h), [tilt, ky, 0], [w, 0.03, 0.072], Object.assign({}, mod ? BEIGE2 : BEIGE, { round: 0.3 }));
        }
        /* マウスとケーブル */
        api.rbox([1.45, 0.04, -0.08], [0, -12, 0], [0.18, 0.08, 0.28], Object.assign({}, BEIGE, { round: 0.75 }));
        api.mesh('mcable', () => G.tube((t) => [0.02 * Math.sin(t * 7), 0.01, -t * 0.5], () => 0.008, 40, 8, true), [1.45, 0.005, -0.21], [0, -12, 0], [1, 1, 1], DARK);

        /* モニターの付箋 */
        for (const [nx, ny, col, rz] of [[-0.49, 0.28, '#fff176', 6], [-0.49, 0.08, '#f8bbd0', -4], [0.47, 0.34, '#b3e5fc', -8]]) {
          api.panel(fw(0.1 * k2 + 0.175 * k2, (0.83 + ny) * k2, nx * k2), [0, mr, rz], [0.14, 0.14], Object.assign({}, M.matte, { tex: tex['note_' + col], castShadow: false }));
        }
        /* スピーカー（モニターの右） */
        api.rbox([1.75, 0.3, -1.25], [0, -24, 0], [0.34, 0.6, 0.34], Object.assign({}, BEIGE, { round: 0.12 }));
        api.panel([1.75 + Math.sin(-24 * Math.PI / 180) * 0.172, 0.3, -1.25 + Math.cos(-24 * Math.PI / 180) * 0.172], [0, -24, 0], [0.26, 0.5], Object.assign({}, M.matte, { tex: tex.speaker }));
        /* マニュアル本（モニターの左奥） */
        K.book(api, { x: 0.05, z: -1.75, w: 0.55, d: 0.72, h: 0.08, yaw: 6, col: [0.2, 0.35, 0.6], coverTex: tex.manual });
        K.book(api, { x: 0.07, y: 0.08, z: -1.76, w: 0.5, d: 0.68, h: 0.06, yaw: -3, col: [0.75, 0.3, 0.2] });
        /* サボテン（左奥） */
        api.lathe('terracotta', [[0, 0], [0.4, 0], [0.5, 0.8], [0.52, 0.82], [0.54, 1], [0.48, 1], [0.46, 0.85], [0, 0.85]], [-1.35, 0, -1.05], [0, 0, 0], [0.24, 0.24, 0.24],
          Object.assign({}, M.matte, { color: [0.78, 0.46, 0.3] }));
        api.mesh('cactus', cactusGeo, [-1.35, 0.19, -1.05], [0, 0, 0], [0.18, 0.3, 0.18], Object.assign({}, M.plastic, { color: [0.3, 0.55, 0.34], spec: 0.2, shin: 20 }));

        /* フロッピー（左手前）とマグカップ（左奥） */
        api.box([-0.72, 0.012, 0.52], [0, 12, 0], [0.34, 0.024, 0.34], Object.assign({}, M.plastic, { tex: tex.floppy, face: S.FACE.TOP, edge: [0.18, 0.2, 0.25] }));
        cal.draw(api, CAL);
        cal.shadow(api, CAL);
        K.cup(api, { x: -1.3, z: -1.2, d: 0.3, h: 0.36, color: [0.85, 0.28, 0.22], handleYaw: -40, liquid: { color: [0.25, 0.14, 0.07], level: 0.85 } });

        K.shadow(api, mx, mz + 0.05, 1.5, 1.1, mr, 0.4);
        K.shadow(api, kx, kz + 0.02, 1.45, 0.62, ky, 0.35);
        K.shadow(api, 1.75, -1.25, 0.5, 0.5, -24, 0.35);
        if (api.mode === 0) {   // モニターの光だまり
          api.blend(true);
          api.quad([mx - 0.1, 0.006, mz + 0.8], [0, mr, 0], [1.4, 0.8], { tex: tex.glowFloor, unlit: true, alpha: 0.5 });
          api.panel(fw(sf + 0.002, 0.85 * k2, 0), [0, mr, 0], [0.96 * k2, 0.76 * k2], { tex: tex.glass, unlit: true, alpha: 0.9 });   // 画面のガラスの映り込み
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
    const lg = ctx.createRadialGradient(W * 0.1, H * 0.2, 0, W * 0.1, H * 0.2, W * 0.75);
    lg.addColorStop(0, 'rgba(255,238,205,0.3)'); lg.addColorStop(1, 'rgba(255,238,205,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.26);
    E.drawGrain(ctx, W, H, 0.035, 28, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 机（グレーの天板）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), r = E.rnd(4);
    x.fillStyle = '#b9b3a8'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 400; i++) { x.globalAlpha = 0.06; x.fillStyle = r() > 0.5 ? '#fff' : '#555'; x.fillRect(r() * S, r() * S, 3, 3); }
    x.globalAlpha = 1;
    T.desk = c;
  }
  // ブラインド越しの朝日
  {
    const Wd = 512, Ht = 470, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#fff6df'); g.addColorStop(1, '#ffe2b0');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let y = 0; y < Ht; y += 26) { x.fillStyle = 'rgba(160,140,110,0.45)'; x.fillRect(0, y, Wd, 9); }
    x.fillStyle = '#e9e6df'; x.fillRect(0, 0, Wd, 14); x.fillRect(0, Ht - 14, Wd, 14); x.fillRect(0, 0, 14, Ht); x.fillRect(Wd - 14, 0, 14, Ht);
    T.blind = c;
  }
  // コルクボード（メモ）
  {
    const Wd = 480, Ht = 330, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(17);
    x.fillStyle = '#b98a57'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 900; i++) { x.fillStyle = r() > 0.5 ? '#a3764a' : '#cfa06a'; x.fillRect(r() * Wd, r() * Ht, 2, 2); }
    const notes = ['#fff59d', '#b3e5fc', '#f8bbd0', '#c8e6c9'];
    for (let i = 0; i < 5; i++) { x.save(); x.translate(40 + i * 85, 60 + r() * 150); x.rotate((r() - 0.5) * 0.3); x.fillStyle = notes[i % 4]; x.fillRect(0, 0, 80, 80); x.restore(); }
    x.strokeStyle = '#6d4b2b'; x.lineWidth = 16; x.strokeRect(0, 0, Wd, Ht);
    T.cork = c;
  }
  // CRT画面（緑の文字でおはよう）
  {
    const Wd = 640, Ht = 500, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createRadialGradient(Wd / 2, Ht / 2, 40, Wd / 2, Ht / 2, Wd * 0.62);
    g.addColorStop(0, '#0f3a28'); g.addColorStop(1, '#03140d');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#7dffb0'; x.shadowColor = '#3dff8a'; x.shadowBlur = 12;
    x.font = E.font(500, 34, '"Courier New",monospace');
    const lines = ['READY.', '> BOOT', '> LOADING ....... OK', '', '  GOOD MORNING!', '', '> _'];
    lines.forEach((t, i) => x.fillText(t, 36, 70 + i * 52));
    x.shadowBlur = 0;
    for (let y = 0; y < Ht; y += 4) { x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, y, Wd, 2); }
    T.screen = c;
  }
  // キーボード天面
  {
    const Wd = 1024, Ht = 360, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#c9c4b3'; x.fillRect(0, 0, Wd, Ht);
    const rows = 5, cols = 15, kw = (Wd - 60) / cols, kh = (Ht - 50) / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (j === 4 && i > 3 && i < 11) continue;
      x.fillStyle = (i === 0 || i === cols - 1) ? '#a59f8c' : '#ebe7da';
      E.roundRect(x, 30 + i * kw + 4, 25 + j * kh + 4, kw - 8, kh - 8, 8); x.fill();
      x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(30 + i * kw + 8, 25 + (j + 1) * kh - 10, kw - 16, 4);
    }
    x.fillStyle = '#ebe7da'; E.roundRect(x, 30 + 4 * kw + 4, 25 + 4 * kh + 4, kw * 7 - 8, kh - 8, 8); x.fill();
    T.keys = c;
  }
  // フロッピー
  const floppy = (body, label) => {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = body; x.fillRect(0, 0, S, S);
    x.fillStyle = '#b8bec6'; x.fillRect(70, 0, 120, 80);
    x.fillStyle = body; x.fillRect(150, 10, 26, 60);
    x.fillStyle = label; x.fillRect(30, 120, 196, 120);
    x.fillStyle = '#555'; for (let i = 0; i < 3; i++) x.fillRect(45, 150 + i * 30, 160, 3);
    return c;
  };
  T.floppy = floppy('#2b3240', '#f5f1e6');
  // 付箋
  for (const col of ['#fff176', '#f8bbd0', '#b3e5fc']) {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = col; x.fillRect(0, 0, 64, 64);
    x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, 0, 64, 10);
    x.fillStyle = '#555'; for (let i = 0; i < 3; i++) x.fillRect(8, 22 + i * 12, 30 + (i * 13) % 20, 3);
    T['note_' + col] = c;
  }
  // スピーカーの網
  {
    const c = C(128, 224), x = c.getContext('2d');
    x.fillStyle = '#d6d1c2'; x.fillRect(0, 0, 128, 224);
    x.fillStyle = '#3a3a3a'; E.roundRect(x, 14, 20, 100, 184, 10); x.fill();
    x.fillStyle = '#4a4a4a'; for (let y = 26; y < 200; y += 6) for (let xx = 20; xx < 110; xx += 6) x.fillRect(xx, y, 3, 3);
    T.speaker = c;
  }
  // マニュアルの表紙
  {
    const c = C(256, 320), x = c.getContext('2d');
    x.fillStyle = '#2a4f86'; x.fillRect(0, 0, 256, 320);
    x.fillStyle = '#fff'; x.font = E.font(700, 40, E.FONT.cond); x.fillText('BASIC', 30, 80);
    x.font = E.font(500, 22, E.FONT.cond); x.fillText('USER MANUAL', 30, 112);
    x.fillStyle = '#f5c542'; x.fillRect(30, 140, 196, 8);
    T.manual = c;
  }
  // 画面のガラスの映り込み（斜めの淡い光）
  {
    const c = C(256, 200), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 256, 200);
    g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(0.35, 'rgba(255,255,255,0.05)'); g.addColorStop(0.36, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 200);
    const v = x.createRadialGradient(128, 100, 60, 128, 100, 170);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
    x.fillStyle = v; x.fillRect(0, 0, 256, 200);
    T.glass = c;
  }
  // ドット絵のポスター（朝日と山）
  {
    const c = C(200, 270), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const px = 10;
    x.fillStyle = '#ffe6b3'; x.fillRect(0, 0, 200, 270);
    const g = [[0, '#7fc8f8'], [60, '#a8dcfa'], [110, '#ffd9a0']];
    for (const [y, col] of g) { x.fillStyle = col; x.fillRect(0, y, 200, 60); }
    x.fillStyle = '#ff9f43';
    for (let yy = -3; yy <= 3; yy++) for (let xx = -3; xx <= 3; xx++) if (xx * xx + yy * yy <= 10) x.fillRect(100 + xx * px, 150 + yy * px, px, px);
    x.fillStyle = '#4a7b5c';
    for (let i = 0; i < 20; i++) { const h = Math.abs(10 - i) < 6 ? 6 - Math.abs(10 - i) : 0; for (let k = 0; k <= h + 2; k++) x.fillRect(i * px, 190 - k * px, px, px); }
    x.fillStyle = '#35604a'; x.fillRect(0, 200, 200, 70);
    x.fillStyle = '#fff'; x.font = E.font(700, 22, E.FONT.cond); x.textAlign = 'center'; x.fillText('GOOD MORNING', 100, 245);
    x.strokeStyle = '#222'; x.lineWidth = 8; x.strokeRect(0, 0, 200, 270);
    T.poster = c;
  }
  // モニターの光だまり
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(120,255,170,0.5)'); g.addColorStop(1, 'rgba(120,255,170,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    T.glowFloor = c;
  }
  return T;
}
})();
