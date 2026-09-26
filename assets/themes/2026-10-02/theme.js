/* =========================================================================
 *  10/02 豆腐の日（「とう(10)ふ(2)」の語呂合わせ。日本豆腐協会が制定）
 *  障子から朝の光が入る和室のちゃぶ台。土鍋の湯豆腐（昆布と豆腐）、
 *  藍色の皿に青じそを敷いた冷奴（おろし生姜と刻みねぎ）、白磁の醤油差し、
 *  青磁の湯のみ、卓上カレンダーの横にアクスタを置く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'tofu-day',
  title: '豆腐の日',
  dayName: 'Tofu Day',
  caption: { fill: '#ffffff', outline: '#2c3e63' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f4efe2', ink: '#2c3e63', accent: '#b0413e', back: '#e2dac6', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'shoji', 'tatami'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: 0.0, z: 0.05, yaw: 12 };            // アクスタ
    const NABE = { x: 0.86, z: -1.22 };                   // 土鍋（右奥）
    const YAKKO = { x: 0.74, z: -0.04 };                  // 冷奴（右手前）
    const CAL = { x: -0.74, z: -0.78, yaw: 24 };          // 卓上カレンダー（左奥）
    const YUNOMI = { x: 0.12, z: -1.85 };                  // 湯のみ（左）
    const SHOYU = { x: 0.3, z: -0.98 };                    // 醤油差し（奥）
    const eye = [0.48, 1.32, 2.72], at = [0.1, 0.46, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const WHITE = [0.97, 0.96, 0.93];
    const AI = [0.2, 0.3, 0.52];                          // 藍

    /* ---------- 形 ---------- */
    // 土鍋：ぽってりした胴、口縁は厚く、内側はなだらかに底へ
    const nabeOut = [[0, 0.012], [0.28, 0.012], [0.3, 0, 1], [0.34, 0.004], [0.36, 0.03, 1], [0.44, 0.1], [0.49, 0.2], [0.505, 0.29],
      [0.5, 0.36], [0.49, 0.385], [0.475, 0.395, 1], [0.455, 0.39]];
    const nabeIn = [[0.455, 0.39], [0.45, 0.36], [0.44, 0.28], [0.41, 0.18], [0.33, 0.1], [0.18, 0.075], [0, 0.07]];
    // 醤油差し：丸い胴・細い首・注ぎ口
    const shoyuProf = [[0, 0.004], [0.2, 0.004], [0.22, 0, 1], [0.25, 0.02], [0.34, 0.12], [0.37, 0.24], [0.33, 0.38], [0.22, 0.46],
      [0.14, 0.5], [0.13, 0.56], [0.15, 0.58], [0.15, 0.6, 1], [0, 0.6]];
    const lidProf = [[0, 0], [0.16, 0], [0.165, 0.02], [0.12, 0.05], [0.06, 0.07], [0.07, 0.1], [0.05, 0.14], [0, 0.145]];
    // 湯のみ：少し胴のしまった筒、厚い口縁
    const yunomiProf = [[0, 0.01], [0.3, 0.01], [0.32, 0, 1], [0.37, 0, 1], [0.38, 0.03], [0.4, 0.3], [0.38, 0.62], [0.41, 0.9], [0.42, 1.0],
      [0.405, 1.02], [0.385, 1.0], [0.37, 0.9], [0.345, 0.62], [0.36, 0.3], [0.34, 0.1], [0, 0.09]];
    // 青じそ：ぎざぎざの縁・中心が少し盛り上がる葉
    const shisoGeo = () => G.surface((u, v) => {
      const s = v * 2 - 1, len = 1;
      const w = 0.42 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.02)), 0.75) * (1 + 0.06 * Math.sin(u * 60)) + 0.004;
      return [s * w, 0.05 * (1 - s * s) * Math.sin(Math.PI * u) - 0.03 * s * s, (u - 0.5) * len];
    }, 48, 12);
    // おろし生姜：ふんわりした小山
    const gingerGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, ph = v * Math.PI / 2, n = 1 + 0.08 * Math.sin(th * 5) * Math.cos(ph);
      return [0.5 * Math.cos(ph) * Math.sin(th) * n, 0.4 * Math.sin(ph), 0.5 * Math.cos(ph) * Math.cos(th) * n];
    }, 40, 12);

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.93, 0.91, 0.86], ambient: 0.54, light: [0.12, 0.9, 0.55], lightCol: [1.1, 1.07, 1.02],
      sky: [1.02, 1.0, 0.96], ground: [0.66, 0.56, 0.44], envTop: [1.05, 1.03, 0.98], envBot: [0.45, 0.36, 0.28],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：障子と長押、足元に畳 --- */
        api.panel([0, 1.7, -4.2], [0, 0, 0], [12, 4.4], { tex: tex.shoji, uvScale: [6, 1], unlit: true });
        api.box([0, 3.95, -4.15], [0, 0, 0], [12, 0.14, 0.12], mat(M.wood, { color: [0.55, 0.4, 0.27] }));
        api.box([0, -0.48, -4.15], [0, 0, 0], [12, 0.1, 0.14], mat(M.wood, { color: [0.5, 0.36, 0.24] }));
        api.quad([0, -0.52, -2.5], [0, 0, 0], [12, 4], { tex: tex.tatami, uvScale: [3, 1] });

        /* --- ちゃぶ台（丸い天板・厚みのある縁） --- */
        api.lathe('tofu:table', [[0, -0.09], [2.6, -0.09], [2.62, -0.07], [2.62, -0.02], [2.6, 0], [0, 0]], [0.1, 0, -0.5], [0, 0, 0], [1, 1, 1],
          mat(M.wood, { color: [0.62, 0.42, 0.26], seg: 160 }));
        api.cylinder([0.1, 0.0005, -0.5], [0, 0, 0], [5.2, 0.001, 5.2], mat(M.wood, { tex: tex.table, part: 'TOP', uvScale: [1, 1] }));

        /* --- 土鍋の湯豆腐（右奥） --- */
        const ns = 0.86, nx = NABE.x, nz = NABE.z;
        api.lathe('tofu:nabeOut', nabeOut, [nx, 0, nz], [0, 0, 0], [ns, ns, ns], mat(M.ceramic, { tex: tex.nabe, spec: 0.35, shin: 50 }));
        api.lathe('tofu:nabeIn', nabeIn, [nx, 0, nz], [0, 0, 0], [ns, ns, ns], mat(M.ceramic, { color: [0.93, 0.88, 0.78], spec: 0.3 }));
        // 耳（左右の小さな持ち手）
        for (const sgn of [-1, 1]) {
          api.mesh('tofu:ear', () => G.tube((t) => { const a = t * Math.PI; return [0, 0.03 * Math.sin(a), -0.09 * Math.cos(a)]; }, () => 0.028, 20, 12, true),
            [nx + sgn * 0.5 * ns, 0.33 * ns, nz], [0, sgn > 0 ? 0 : 180, -8 * sgn], [1, 1, 1], mat(M.ceramic, { color: [0.3, 0.2, 0.16], spec: 0.35, shin: 50 }));
          api.rbox([nx + sgn * 0.475 * ns, 0.33 * ns, nz], [0, 0, 0], [0.05, 0.05, 0.2], mat(M.ceramic, { color: [0.3, 0.2, 0.16], round: 0.3 }));
        }
        // 底の昆布（だしの中に沈む）
        api.rbox([nx - 0.04, 0.085 * ns, nz + 0.02], [0, 18, 0], [0.5, 0.008, 0.2], mat(M.matte, { color: [0.2, 0.26, 0.16], round: 0.2 }));
        // 豆腐（だしから頭を出す角切り）
        const cubes = [[-0.14, -0.08, 12], [0.1, -0.1, -8], [-0.02, 0.12, 30], [0.17, 0.1, 4], [-0.18, 0.13, -20]];
        for (const [cx, cz, ry] of cubes)
          api.rbox([nx + cx, 0.315 * ns, nz + cz], [0, ry, 0], [0.15, 0.1, 0.15], mat(M.cream, { tex: tex.tofu, round: 0.14, spec: 0.3, shin: 30 }));
        // 三つ葉（だしに浮かぶ）
        for (const [lx, lz, ry] of [[0.02, -0.02, 40], [-0.1, 0.02, -60]])
          api.mesh('tofu:mitsuba', shisoGeo, [nx + lx, 0.36 * ns, nz + lz], [0, ry, 0], [0.12, 0.1, 0.12], mat(M.plastic, { color: [0.38, 0.62, 0.3], spec: 0.25 }));

        /* --- 冷奴（藍の丸皿・青じそ・豆腐・生姜・ねぎ） --- */
        const py = K.plate(api, { x: YAKKO.x, z: YAKKO.z, d: 0.72, color: [0.94, 0.93, 0.9], mat: { tex: tex.aiPlate } });
        api.mesh('tofu:shiso', shisoGeo, [YAKKO.x - 0.03, py + 0.012, YAKKO.z - 0.02], [0, 64, 0], [0.34, 0.3, 0.44],
          mat(M.plastic, { tex: tex.shiso, spec: 0.2, shin: 30 }));
        const ty = py + 0.018, th = 0.13;
        api.rbox([YAKKO.x, ty + th / 2, YAKKO.z], [0, -18, 0], [0.25, th, 0.2], mat(M.cream, { tex: tex.tofu, round: 0.12, spec: 0.35, shin: 34 }));
        api.mesh('tofu:ginger', gingerGeo, [YAKKO.x - 0.02, ty + th - 0.005, YAKKO.z + 0.01], [0, 0, 0], [0.085, 0.07, 0.085],
          mat(M.cream, { color: [0.95, 0.8, 0.46], spec: 0.25 }));
        api.mesh('tofu:negi', gingerGeo, [YAKKO.x + 0.06, ty + th - 0.005, YAKKO.z - 0.03], [0, 30, 0], [0.07, 0.04, 0.07],
          mat(M.cream, { tex: tex.negi, spec: 0.25 }));

        /* --- 醤油差し（白磁・朱の蓋） --- */
        const ss = 0.34;
        api.lathe('tofu:shoyu', shoyuProf, [SHOYU.x, 0, SHOYU.z], [0, 0, 0], [ss, ss, ss], mat(M.ceramic, { tex: tex.shoyuSide, spec: 0.55 }));
        api.lathe('tofu:shoyuLid', lidProf, [SHOYU.x, 0.6 * ss, SHOYU.z], [0, 0, 0], [ss, ss, ss], mat(M.ceramic, { color: [0.7, 0.2, 0.16] }));
        api.mesh('tofu:spout', () => G.tube((t) => [0.3 + t * 0.2, 0.36 + t * 0.14 + 0.05 * t * t, 0], (t) => 0.05 - 0.02 * t, 16, 14, true),
          [SHOYU.x, 0, SHOYU.z], [0, 150, 0], [ss, ss, ss], mat(M.ceramic, { color: WHITE }));

        /* --- 湯のみ（青磁・緑茶） --- */
        const ys = 0.27;
        api.lathe('tofu:yunomi', yunomiProf, [YUNOMI.x, 0, YUNOMI.z], [0, 0, 0], [ys, ys, ys], mat(M.ceramic, { tex: tex.seiji, spec: 0.55 }));
        api.cylinder([YUNOMI.x, 0.84 * ys, YUNOMI.z], [0, 0, 0], [0.72 * ys, 0.001, 0.72 * ys], mat(M.glossyFood, { color: [0.62, 0.66, 0.28], part: 'TOP', spec: 0.4 }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, nx, nz, 1.05, 1.0, 0, 0.45);
        K.shadow(api, YAKKO.x, YAKKO.z, 0.8, 0.72, 0, 0.35);
        K.shadow(api, SHOYU.x, SHOYU.z, 0.3, 0.28, 0, 0.4);
        K.shadow(api, YUNOMI.x, YUNOMI.z, 0.36, 0.34, 0, 0.4);

        /* --- 半透明：だし（奥）→ 湯気 → アクスタ --- */
        stand.shadow(api, P);
        api.blend(true);
        if (api.mode === 0) {
          api.cylinder([nx, 0.3 * ns, nz], [0, 0, 0], [0.878 * ns, 0.001, 0.878 * ns], { part: 'TOP', color: [0.86, 0.78, 0.58], alpha: 0.55, spec: 0.6, shin: 80 });
          const ry = Math.atan2(eye[0] - nx, eye[2] - nz) * 180 / Math.PI;
          api.panel([nx - 0.05, 0.75, nz], [0, ry, 0], [0.7, 0.8], { tex: tex.steam, unlit: true, alpha: 0.55 });
          api.panel([nx + 0.12, 0.85, nz - 0.05], [0, ry, 8], [0.5, 0.8], { tex: tex.steam, unlit: true, alpha: 0.4 });
        }
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    // 障子ごしのやわらかい朝の光（左上から、ごく弱く）
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.1, H * 0.05, 0, W * 0.1, H * 0.05, W * 0.85);
    lg.addColorStop(0, 'rgba(255,246,225,0.18)'); lg.addColorStop(1, 'rgba(255,246,225,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.14);
    E.drawGrain(ctx, W, H, 0.025, 102, 2);
  }
});

/* =========================================================================
 *  テクスチャ（すべてコードで描く）
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // ちゃぶ台の天板：栗色の木目（同心の年輪をゆるく）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(21);
    x.fillStyle = '#9a6a42'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 46; i++) {
      x.strokeStyle = i % 3 === 0 ? 'rgba(92,56,30,0.28)' : 'rgba(196,146,98,0.22)';
      x.lineWidth = 3 + r() * 6;
      x.beginPath();
      for (let px = -20; px <= S + 20; px += 24) x.lineTo(px, i * 23 + Math.sin(px * 0.006 + i * 0.7) * 16);
      x.stroke();
    }
    E.drawGrain(x, S, S, 0.05, 4, 3);
    T.table = c;
  }
  // 障子：白い和紙と木の組子（粗めの格子）。下は板の腰
  {
    const Wd = 512, Ht = 768, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#fbf7ec'); g.addColorStop(1, '#f1e9d6');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#b08a62';
    const cols = 4, rows = 5, top = 0, bot = Ht * 0.8;
    for (let i = 0; i <= cols; i++) x.fillRect(i * Wd / cols - (i === 0 || i === cols ? 0 : 5), top, i === 0 || i === cols ? 14 : 10, bot);
    for (let j = 0; j <= rows; j++) x.fillRect(0, top + j * (bot - top) / rows - 5, Wd, 10);
    x.fillStyle = '#9c7650'; x.fillRect(0, bot, Wd, Ht - bot);
    x.fillStyle = 'rgba(70,45,25,0.25)'; x.fillRect(0, bot, Wd, 6);
    x.fillStyle = '#8a6644'; x.fillRect(0, 0, 18, Ht);
    T.shoji = c;
  }
  // 畳：い草の目（淡く）と縁
  {
    const Wd = 512, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#c9c28a'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < Ht; i += 8) { x.fillStyle = 'rgba(140,130,70,0.18)'; x.fillRect(0, i, Wd, 3); }
    x.fillStyle = '#3d4a3a'; x.fillRect(0, 0, 24, Ht);
    T.tatami = c;
  }
  // 土鍋の外側：飴色の釉薬が上から流れ、下は土の色（v=下→上）
  {
    const c = C(256, 256), x = c.getContext('2d'), r = E.rnd(33);
    const g = x.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, '#c8a47a'); g.addColorStop(0.12, '#c8a47a'); g.addColorStop(0.2, '#5c3a26'); g.addColorStop(0.7, '#4a2c1c'); g.addColorStop(0.92, '#6a4630'); g.addColorStop(1, '#e8dcc4');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) {                       // 釉薬のたれ（粗く）
      const px = r() * 256, len = 30 + r() * 40;
      x.fillStyle = 'rgba(120,80,50,0.35)'; E.roundRect(x, px, 256 * 0.66, 6 + r() * 6, len, 4); x.fill();
    }
    T.nabe = c;
  }
  // 豆腐の肌：ほんのり黄みのある白
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, 128, 128);
    E.drawGrain(x, 128, 128, 0.03, 9, 2);
    T.tofu = c;
  }
  // 藍の丸皿：白地に藍の縁と見込みの輪、中央に青海波を粗く（lathe の v=輪郭方向）
  {
    const c = C(64, 512), x = c.getContext('2d');
    x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, 64, 512);
    x.fillStyle = '#2e4478';
    x.fillRect(0, 0, 64, 120);                           // 見込み〜内側（上側 = 輪郭の後半）
    x.fillStyle = '#f2f0ea'; x.fillRect(0, 44, 64, 10);
    x.fillStyle = '#3a5590'; x.fillRect(0, 170, 64, 60);  // 縁
    T.aiPlate = c;
  }
  // 青じそ：緑に葉脈（中心線と左右の支脈）
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#4f8a3c'; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(190,225,160,0.7)'; x.lineWidth = 4;
    x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 256); x.stroke();
    x.lineWidth = 2.5;
    for (let i = 1; i < 7; i++) { const y = i * 36; x.beginPath(); x.moveTo(128, y); x.quadraticCurveTo(170, y - 10, 250, y - 30); x.moveTo(128, y); x.quadraticCurveTo(86, y - 10, 6, y - 30); x.stroke(); }
    T.shiso = c;
  }
  // 刻みねぎ：黄緑と濃い緑の小さな輪（粗く大きめに）
  {
    const c = C(128, 128), x = c.getContext('2d'), r = E.rnd(5);
    x.fillStyle = '#9cc46a'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 30; i++) {
      x.strokeStyle = r() > 0.5 ? '#3f7a2c' : '#dfeec0'; x.lineWidth = 4;
      x.beginPath(); x.arc(r() * 128, r() * 128, 6 + r() * 4, 0, 7); x.stroke();
    }
    T.negi = c;
  }
  // 醤油差しの胴：白磁に藍の線（v=下→上）
  {
    const c = C(64, 256), x = c.getContext('2d');
    x.fillStyle = '#f7f6f1'; x.fillRect(0, 0, 64, 256);
    x.fillStyle = '#2e4478'; x.fillRect(0, 118, 64, 8); x.fillRect(0, 150, 64, 4);
    T.shoyuSide = c;
  }
  // 湯のみ：青磁（下ほど濃い釉だまり）、口縁は薄く
  {
    const c = C(64, 256), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, '#b89a78'); g.addColorStop(0.05, '#6f9a8a'); g.addColorStop(0.3, '#8fb8a6'); g.addColorStop(0.55, '#b4d2c2'); g.addColorStop(0.62, '#e2eee6'); g.addColorStop(1, '#8fb8a6');
    x.fillStyle = g; x.fillRect(0, 0, 64, 256);
    T.seiji = c;
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
