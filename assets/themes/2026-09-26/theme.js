/* =========================================================================
 *  9/26 風呂の日（毎月26日「ふろ」の語呂合わせ）
 *  朝風呂のバスルーム。湯船に渡した木のバストレーにアクスタを置く。
 *  檜の湯桶、アヒル、防水の卓上カレンダー。奥の縁にはボトル・石けん・バスソルト・
 *  たたんだタオル、壁には蛇口とシャワー、湯には泡。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'bath-day',   // 英字の短い名前（保存するファイル名に使う）
  title: '風呂の日',
  dayName: 'Bath Day',
  caption: { fill: '#ffffff', outline: '#1f4e5c' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['tile', 'slat', 'hinoki', 'towel', 'towel2'].includes(k) });

    const P = { x: -0.08, z: 0.02, yaw: -18 };          // アクスタ（左に振る）
    const DUCK = { x: 0.5, z: 0.1 };
    const CAL = { x: -0.6, z: -0.32, yaw: 28, w: 0.54 };  // 卓上カレンダー（トレーの左奥）
    const cal = E.dateProp(env, { style: { paper: '#eef8f6', ink: '#1f4e5c', accent: '#2f9a93', back: '#d5ebe7', grain: 0.06 } });
    const eye = [-0.42, 1.28, 2.7], at = [0.02, 0.5, 0];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const WHITE = [0.96, 0.97, 0.98];
    const CHROME = Object.assign({}, M.metal, { color: [0.9, 0.92, 0.95] });
    const rb = E.rnd(626), bubbles = [];                  // 湯の泡（2パスで同じ位置）
    for (let i = 0; i < 26; i++) bubbles.push([-1.6 + rb() * 3.4, -0.115, -0.35 - rb() * 0.8, 0.035 + rb() * 0.06]);

    /* ---------- 形 ---------- */
    // アヒルの胴：卵形の楕円体の後ろを持ち上げてしっぽにする
    const duckBody = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, ph = (v - 0.5) * Math.PI;
      let x = 0.5 * Math.cos(ph) * Math.sin(th), y = 0.36 * Math.sin(ph), z = 0.62 * Math.cos(ph) * Math.cos(th);
      if (y < 0) y *= 0.7;                                   // 底は平たく
      const back = Math.max(0, -z - 0.15);
      y += 0.9 * back * back * (0.5 + 0.5 * Math.sin(ph));  // しっぽがはね上がる
      z -= 0.25 * back * back;
      return [x, y, z];
    }, 64, 32);
    // くちばし：平たいへら形（上下2枚で少し開く）
    const beakGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, ph = (v - 0.5) * Math.PI;
      const x = 0.5 * Math.cos(ph) * Math.sin(th), y = 0.16 * Math.sin(ph), z = 0.5 * Math.cos(ph) * Math.cos(th);
      return [x * (0.75 + 0.25 * Math.max(0, z / 0.5)), y, z];
    }, 32, 16);
    // ポンプボトル：肩の丸い胴
    const bottleGeo = () => G.lathe([[0, 0], [0.46, 0], [0.5, 0.03], [0.5, 0.78], [0.46, 0.88], [0.3, 0.95], [0.18, 0.97], [0.17, 1.0], [0, 1.0]], 64);
    const pumpGeo = () => G.lathe([[0, 0], [0.2, 0], [0.22, 0.04], [0.2, 0.08], [0.1, 0.1], [0.09, 0.3], [0.2, 0.32], [0.21, 0.4], [0.18, 0.42], [0, 0.42]], 48);
    // 湯桶：檜の側板（少し裾広がり）と底。たがは銅
    const okeGeo = () => G.lathe([[0, 0.02], [0.47, 0.02], [0.47, 0, 1], [0.5, 0, 1], [0.52, 0.5], [0.52, 1.0, 1], [0.47, 1.0, 1], [0.45, 0.06], [0, 0.06]], 96);
    const hoopGeo = () => G.lathe([[0.508, 0], [0.522, 0.02], [0.522, 0.1], [0.508, 0.12]], 96);

    S.render(ctx, {
      W, H, clear: [0.86, 0.92, 0.93], ambient: 0.48, light: [0.5, 0.85, 0.5], lightCol: [1.12, 1.1, 1.05],
      sky: [1.0, 1.02, 1.03], ground: [0.66, 0.72, 0.72], envTop: [1.1, 1.12, 1.12], envBot: [0.5, 0.56, 0.58],
      camera: { eye, at, fov: 31, focus, dofScale: 0.34, blur: 12 },
      draw(api) {
        /* 奥：タイルの壁と窓 */
        api.panel([0, 1.4, -2.2], [0, 0, 0], [10, 5], Object.assign({}, M.ceramic, { tex: tex.tile, uvScale: [10, 5], bump: 0.6, spec: 0.35 }));
        api.panel([0.95, 1.75, -2.18], [0, 0, 0], [1.5, 1.1], { tex: tex.window, unlit: true });
        api.rbox([0.95, 1.17, -2.12], [0, 0, 0], [1.6, 0.05, 0.14], Object.assign({}, M.ceramic, { color: WHITE, round: 0.2 }));   // 窓台
        K.plant(api, { x: 0.55, y: 1.195, z: -2.12, s: 0.8, seed: 4, pot: [0.95, 0.95, 0.95], leaves: 9 });
        // 混合水栓（右の壁ぎわ）
        api.lathe('faucetbase', [[0, 0], [0.1, 0], [0.1, 0.03], [0.06, 0.05], [0, 0.05]], [1.75, 0.45, -2.2], [90, 0, 0], [1, 1, 1], CHROME);
        api.mesh('spout', () => G.tube((t) => [0, 0.02 * Math.sin(t * Math.PI), t * 0.36], () => 0.034, 24, 16, true), [1.75, 0.45, -2.15], [0, 0, 0], [1, 1, 1], CHROME);
        for (const kx of [1.45, 2.05]) api.lathe('faucetknob', [[0, 0], [0.07, 0], [0.075, 0.03], [0.05, 0.08], [0, 0.085]], [kx, 0.62, -2.2], [90, 0, 0], [1, 1, 1], CHROME);
        // シャワーヘッドとホルダー（左の壁）
        api.cylinder([-1.75, 1.45, -2.17], [0, 0, 0], [0.04, 1.4, 0.04], CHROME);
        api.lathe('showerhead', [[0, 0], [0.12, 0], [0.13, 0.02], [0.1, 0.05], [0.04, 0.09], [0.035, 0.2], [0, 0.2]], [-1.75, 1.95, -2.05], [-110, 0, 0], [1, 1, 1], CHROME);

        /* 浴槽：奥の縁・湯 */
        api.rbox([0, -0.2, -1.55], [0, 0, 0], [6, 0.42, 0.5], Object.assign({}, M.ceramic, { color: WHITE, round: 0.12 }));
        api.quad([0, -0.12, -0.7], [0, 0, 0], [6, 1.6], { tex: tex.water, unlit: true, receiveShadow: false });
        // 奥の縁：ポンプボトル2本とバスソルトの瓶
        const bottles = [[-1.25, 0.46, [0.55, 0.78, 0.8], tex.labelA], [-0.95, 0.4, [0.96, 0.9, 0.8], tex.labelB]];
        for (const [bx, bh, bc, lab] of bottles) {
          api.mesh('bottle', bottleGeo, [bx, 0.01, -1.5], [0, 20, 0], [0.22, bh, 0.22], Object.assign({}, M.plastic, { color: bc, spec: 0.5, shin: 70 }));
          api.lathe('label', [[0.505, 0.2], [0.505, 0.62]], [bx, 0.01, -1.5], [0, 200, 0], [0.22, bh, 0.22], Object.assign({}, M.matte, { tex: lab }));
          api.mesh('pump', pumpGeo, [bx, 0.01 + bh, -1.5], [0, 0, 0], [0.22, 0.22, 0.22], Object.assign({}, M.plastic, { color: [0.96, 0.96, 0.96] }));
          api.mesh('nozzle', () => G.tube((t) => [t * 0.35, 0, 0], () => 0.05, 8, 12, true), [bx, 0.01 + bh + 0.08, -1.5], [0, 200, 0], [0.22, 0.22, 0.22],
            Object.assign({}, M.plastic, { color: [0.96, 0.96, 0.96] }));
        }
        api.lathe('saltjar', [[0, 0], [0.45, 0], [0.5, 0.04], [0.5, 0.85], [0.44, 0.92], [0.44, 1.0], [0, 1.0]], [-0.58, 0.01, -1.5], [0, 0, 0], [0.24, 0.24, 0.24],
          Object.assign({}, M.glossyFood, { color: [0.96, 0.74, 0.8], spec: 0.8, shin: 120, rim: 0.4 }));
        api.lathe('jarlid', [[0, 0], [0.5, 0], [0.52, 0.03], [0.52, 0.2], [0.49, 0.24], [0, 0.24]], [-0.58, 0.25, -1.5], [0, 0, 0], [0.24, 0.24, 0.24],
          Object.assign({}, M.wood, { tex: tex.hinoki }));
        // たたんだタオル（角の丸い2枚重ね）
        api.rbox([1.3, 0.065, -1.5], [0, -6, 0], [0.62, 0.11, 0.4], Object.assign({}, M.matte, { tex: tex.towel, round: 0.35, bump: 0.35 }));
        api.rbox([1.28, 0.17, -1.5], [0, 4, 0], [0.6, 0.11, 0.38], Object.assign({}, M.matte, { tex: tex.towel2, round: 0.35, bump: 0.35 }));
        // 湯に浮かぶ小さいアヒル
        duck(api, 1.35, -0.13, -1.0, 0.5, 30);

        /* バストレー（檜のすのこ） */
        api.box([0, -0.03, 0], [0, 0, 0], [6, 0.06, 0.95], Object.assign({}, M.wood, { tex: tex.slat, face: S.FACE.TOP, edge: [0.62, 0.46, 0.30], uvScale: [6, 1] }));

        /* 檜の湯桶（銅のたが） */
        const ox = 0.98, oz = -0.25, os = 0.56;
        api.mesh('oke', okeGeo, [ox, 0, oz], [0, 0, 0], [os, os * 0.6, os], Object.assign({}, M.wood, { tex: tex.hinoki, uvScale: [2, 1], spec: 0.15, bump: 0 }));
        for (const hy of [0.1, 0.4]) api.mesh('hoop', hoopGeo, [ox, hy * os, oz], [0, 0, 0], [os, os * 0.6, os], Object.assign({}, M.gold, { color: [0.78, 0.5, 0.32] }));

        cal.draw(api, CAL);
        cal.shadow(api, CAL);
        duck(api, DUCK.x, 0, DUCK.z, 0.62, -35);

        K.shadow(api, DUCK.x, DUCK.z, 0.46, 0.4, 0, 0.4);
        K.shadow(api, ox, oz, 0.75, 0.7, 0, 0.45);
        stand.shadow(api, P);
        api.blend(true);
        if (api.mode === 0) {   // 湯の泡（光を映す薄い膜）
          for (const [bx, by, bz, bs] of bubbles) api.sphere([bx, by, bz], [0, 0, 0], [bs, bs * 0.6, bs],
            Object.assign({}, M.glass, { color: [0.9, 0.97, 1.0], alpha: 0.35, rim: 1.0 }));
        }
        if (api.mode === 0) {   // 湯気（アクスタより奥なので先に描く）
          for (const [sx, sy, sz, a] of [[-0.7, 0.9, -1.1, 0.55], [0.4, 1.1, -1.3, 0.45], [1.3, 0.8, -0.9, 0.4]])
            api.panel([sx, sy, sz], [0, -8, 0], [1.4, 1.6], { tex: tex.steam, unlit: true, alpha: a });
        }
        stand.draw(api, P);
        api.blend(false);

        /* ラバーダック：胴（しっぽ付き）・頭・くちばし・目・羽 */
        function duck(api, x, y, z, s, ry) {
          const YEL = Object.assign({}, M.plastic, { color: [1.0, 0.8, 0.12], spec: 0.55, shin: 70, rim: 0.2 });
          const ORG = Object.assign({}, M.plastic, { color: [0.98, 0.45, 0.08], spec: 0.55, shin: 70, rim: 0.15 });
          const r = ry * Math.PI / 180;
          const at3 = (fx, fy, side) => [x + (Math.sin(r) * fx + Math.cos(r) * side) * s, y + fy * s, z + (Math.cos(r) * fx - Math.sin(r) * side) * s];
          api.mesh('duckbody', duckBody, at3(0, 0.16, 0), [0, ry, 0], [0.46 * s, 0.46 * s, 0.46 * s], YEL);
          api.sphere(at3(0.13, 0.38, 0), [0, ry, 0], [0.26 * s, 0.25 * s, 0.25 * s], YEL);              // 頭
          api.sphere(at3(0.02, 0.2, 0.17), [0, ry - 10, 0], [0.06 * s, 0.1 * s, 0.2 * s], YEL);          // 羽（右）
          api.sphere(at3(0.02, 0.2, -0.17), [0, ry + 10, 0], [0.06 * s, 0.1 * s, 0.2 * s], YEL);         // 羽（左）
          api.mesh('beak', beakGeo, at3(0.27, 0.36, 0), [8, ry, 0], [0.13 * s, 0.13 * s, 0.13 * s], ORG);
          api.mesh('beak', beakGeo, at3(0.26, 0.33, 0), [-6, ry, 0], [0.11 * s, 0.1 * s, 0.11 * s], ORG);
          for (const side of [-1, 1]) {
            api.sphere(at3(0.21, 0.43, side * 0.075), [0, 0, 0], [0.045 * s, 0.05 * s, 0.045 * s], Object.assign({}, M.glossyFood, { color: [0.05, 0.04, 0.04], spec: 0.9, shin: 120 }));
          }
        }
      }
    });
    stand.free(); cal.free(); K.free();

    // 窓からの朝の光（弱め）
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, W * 0.8);
    lg.addColorStop(0, 'rgba(255,248,230,0.2)'); lg.addColorStop(1, 'rgba(255,248,230,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.2);
    E.drawGrain(ctx, W, H, 0.025, 41, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // タイル（白とミントの小口タイル。目地・ツヤ・わずかなムラ）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d'), r = E.rnd(9);
    x.fillStyle = '#b9c8c6'; x.fillRect(0, 0, S, S);
    const n = 4, t = S / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const k = r(), px = i * t + 3, py = j * t + 3, w = t - 6;
      const base = k > 0.8 ? [159, 211, 204] : (k > 0.6 ? [227, 241, 238] : [244, 248, 247]);
      const g = x.createLinearGradient(px, py, px + w, py + w);
      g.addColorStop(0, `rgb(${base.map(v => Math.min(255, v + 8)).join(',')})`);
      g.addColorStop(1, `rgb(${base.map(v => v - 10).join(',')})`);
      x.fillStyle = g; E.roundRect(x, px, py, w, w, 5); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.55)'; x.fillRect(px + 6, py + 5, w * 0.45, 3);   // ツヤ
    }
    T.tile = c;
  }
  // 窓（すりガラス越しの朝）
  {
    const c = C(512, 384), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 384);
    g.addColorStop(0, '#fffdf4'); g.addColorStop(1, '#e8f4f6');
    x.fillStyle = g; x.fillRect(0, 0, 512, 384);
    x.fillStyle = '#b8c8c8'; x.fillRect(0, 0, 512, 14); x.fillRect(0, 370, 512, 14); x.fillRect(0, 0, 14, 384); x.fillRect(498, 0, 14, 384); x.fillRect(249, 0, 14, 384);
    T.window = c;
  }
  // 檜（縦に並ぶ側板。板ごとに色味と木目が違う）
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(81);
    const n = 8, w = Wd / n;
    for (let i = 0; i < n; i++) {
      const k = 0.94 + r() * 0.1;
      x.fillStyle = `rgb(${230 * k | 0},${202 * k | 0},${158 * k | 0})`; x.fillRect(i * w, 0, w, Ht);
      for (let g = 0; g < 5; g++) {
        x.strokeStyle = `rgba(${r() > 0.5 ? '186,142,92' : '248,230,198'},${0.18 + r() * 0.15})`; x.lineWidth = 1.5 + r() * 2.5;
        const x0 = i * w + r() * w; x.beginPath(); x.moveTo(x0, 0);
        for (let y = 0; y <= Ht; y += 16) x.lineTo(x0 + Math.sin(y * 0.03 + g) * 2, y);
        x.stroke();
      }
      x.fillStyle = 'rgba(120,80,40,0.55)'; x.fillRect(i * w, 0, 2, Ht);
    }
    T.hinoki = c;
  }
  // タオル地（パイルの粒々＋端のライン）
  const towel = (base, stripe, seed) => {
    const Wd = 256, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(seed);
    x.fillStyle = base; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 1400; i++) { x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.05)'; x.beginPath(); x.arc(r() * Wd, r() * Ht, 2 + r() * 2, 0, 7); x.fill(); }
    x.fillStyle = stripe; x.fillRect(0, Ht * 0.44, Wd, 14);
    x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(0, Ht * 0.44 + 14, Wd, 2);
    return c;
  };
  T.towel = towel('#9fd3cc', '#ffffff', 5);
  T.towel2 = towel('#faf6ee', '#e9a9a0', 6);
  // ボトルのラベル（シャンプー／コンディショナー）
  const label = (bg, ink, t1, t2) => {
    const c = C(512, 256), x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, 512, 256);
    x.fillStyle = ink; x.textAlign = 'center';
    x.font = E.font(700, 40, E.FONT.cond); x.fillText(t1, 256, 118);
    x.font = E.font(500, 22, E.FONT.cond); x.fillText(t2, 256, 158);
    x.fillRect(206, 176, 100, 3);
    return c;
  };
  T.labelA = label('#eaf6f5', '#2c6c69', 'SHAMPOO', 'MORNING HERB');
  T.labelB = label('#fbf5ea', '#8a6a3a', 'TREATMENT', 'MORNING HERB');
  // シャワーヘッドの面（穴）
  {
    const S = 128, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#c9ced4'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#6a7078';
    for (let a = 0; a < 3; a++) for (let i = 0; i < 6 + a * 6; i++) {
      const ang = i / (6 + a * 6) * Math.PI * 2, rr = 12 + a * 16;
      x.beginPath(); x.arc(S / 2 + Math.cos(ang) * rr, S / 2 + Math.sin(ang) * rr, 3, 0, 7); x.fill();
    }
    T.showerFace = c;
  }
  // 湯（水色＋ゆらめき）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), r = E.rnd(33);
    const g = x.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, '#9fd6dc'); g.addColorStop(1, '#6fbac6');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.strokeStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 60; i++) {
      x.lineWidth = 1 + r() * 3;
      x.beginPath(); const y0 = r() * S;
      for (let px = 0; px <= S; px += 16) x.lineTo(px, y0 + Math.sin(px * 0.03 + i) * 6);
      x.stroke();
    }
    x.strokeStyle = 'rgba(255,255,255,0.25)'; x.lineWidth = 2;   // 光のゆらめき（網目）
    for (let i = 0; i < 90; i++) { x.beginPath(); x.ellipse(r() * S, r() * S, 10 + r() * 22, 6 + r() * 12, r() * 3, 0, 7); x.stroke(); }
    T.water = c;
  }
  // すのこ（横方向の板）
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(71);
    x.fillStyle = '#5e4630'; x.fillRect(0, 0, Wd, Ht);
    const n = 5, h = Ht / n;
    for (let i = 0; i < n; i++) {
      const g = x.createLinearGradient(0, i * h, 0, (i + 1) * h);
      g.addColorStop(0, '#d9b98f'); g.addColorStop(1, '#c29e73');
      x.fillStyle = g; x.fillRect(0, i * h + 4, Wd, h - 8);
      for (let k = 0; k < 20; k++) {
        x.globalAlpha = 0.1; x.fillStyle = r() > 0.5 ? '#f3dcb8' : '#8a6a48';
        x.fillRect(0, i * h + 4 + r() * (h - 8), Wd, 1 + r() * 2);
      }
      x.globalAlpha = 1;
    }
    T.slat = c;
  }
  // 湯気
  {
    const Wd = 256, Ht = 320, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(5);
    x.filter = 'blur(22px)';
    for (let i = 0; i < 10; i++) {
      x.globalAlpha = 0.18 + r() * 0.12; x.fillStyle = '#ffffff';
      x.beginPath(); x.ellipse(60 + r() * 136, 60 + r() * 200, 40 + r() * 30, 50 + r() * 30, 0, 0, 7); x.fill();
    }
    T.steam = c;
  }
  return T;
}
})();
