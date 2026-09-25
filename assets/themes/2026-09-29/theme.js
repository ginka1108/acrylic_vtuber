/* =========================================================================
 *  9/29 洋菓子の日（菓子職人の守護聖人・大天使ミカエルの祝日にちなむ）
 *  朝のパティスリーのカウンター。
 *   - ケーキスタンドにいちごのショートケーキ（星口の絞り＋いちご）
 *   - ひと切れのショートケーキ（断面にスポンジ・クリーム・いちごの層）
 *   - 円すいに並べたマカロンのタワー（ピエ＝足のフリル、ガナッシュ）
 *   - カップケーキ（ひだの紙カップ＋うず巻きのクリーム）
 *   - ティーポットとティーカップ、卓上カレンダー
 *  すべて断面（回転体）や曲面から形を作り、質感はテクスチャと材質で出す。
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'sweets-day',   // 英字の短い名前（保存するファイル名に使う）
  title: '洋菓子の日',
  dayName: 'Sweets Day',
  caption: { fill: '#ffffff', outline: '#8c3b5c' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fff7f8', ink: '#7a2f4c', accent: '#d0648a', back: '#f3dde3', grain: 0.05 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['cloth', 'stripe', 'liner', 'foot'].includes(k) });

    /* ---------- 配置 ---------- */
    const P = { x: 0.12, z: 0.1, yaw: -20 };             // アクスタ
    const CAL = { x: 0.8, z: -0.3, yaw: -20 };            // 卓上カレンダー（右・マカロンの手前）
    const eye = [-0.45, 1.32, 2.7], at = [0.05, 0.5, 0];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const PINK = [0.93, 0.55, 0.64], WHITE = [0.97, 0.96, 0.94];
    const CREAM = [0.99, 0.97, 0.92];
    const MAC = [[0.97, 0.7, 0.78], [0.72, 0.87, 0.68], [0.98, 0.88, 0.58], [0.78, 0.72, 0.93], [0.66, 0.84, 0.95], [0.98, 0.8, 0.66]];

    /* ---------- 形（ページ内で1回だけ作る） ---------- */
    // いちご：丸みのある円すい。上（ヘタを取った面）は平ら
    const strawberryGeo = () => G.lathe([[0, 0], [0.12, 0.03], [0.26, 0.14], [0.36, 0.32], [0.4, 0.5], [0.39, 0.66], [0.33, 0.8], [0.22, 0.86, 1], [0, 0.87]], 48);
    // 星口金で絞ったクリーム（ねじれた8本の稜）
    const rosetteGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, tip = Math.pow(Math.max(0, 1 - v), 0.55) * (1 - 0.25 * v);
      const rr = 0.5 * tip * (0.88 + 0.12 * Math.cos(8 * th + v * 4.5)) + 0.002;
      const yy = 0.75 * Math.sin(v * Math.PI / 2);
      return [Math.sin(th) * rr, yy, Math.cos(th) * rr];
    }, 96, 28);
    // カップケーキのうず巻きクリーム（らせん状のふくらみ）
    const swirlGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, env = Math.pow(1 - v, 0.75);
      const ridge = 0.5 + 0.5 * Math.cos(th - v * Math.PI * 2 * 3.2);
      const rr = 0.5 * env * (0.8 + 0.2 * ridge) + 0.003;
      const yy = v * 0.95 + 0.05 * ridge * (1 - v);
      return [Math.sin(th) * rr, yy, Math.cos(th) * rr];
    }, 120, 48);
    // ひだのある紙カップ（下すぼまり）
    const linerGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, rr = (0.38 + 0.12 * v) * (1 + 0.035 * Math.cos(th * 28));
      return [Math.sin(th) * rr, v * 0.62, Math.cos(th) * rr];
    }, 224, 8, (u, v) => [u * 28, v]);
    // マカロン：ドーム形の生地（上下で2枚使う）
    const shellGeo = () => G.lathe([[0, 0], [0.4, 0], [0.47, 0.015], [0.5, 0.04], [0.49, 0.08], [0.44, 0.14], [0.32, 0.19], [0.16, 0.215], [0, 0.22]], 48);
    // ピエ（足）：外側にふくらむ短い帯
    const footGeo = () => G.lathe([[0.46, 0], [0.505, 0.012], [0.515, 0.03], [0.5, 0.05], [0.46, 0.06]], 48);
    // ケーキスタンド（白磁）：足・軸・皿
    const standGeo = () => G.lathe([[0, 0.004], [0.3, 0.004], [0.32, 0, 1], [0.33, 0.03], [0.22, 0.07], [0.08, 0.11], [0.055, 0.16], [0.05, 0.3],
      [0.07, 0.36], [0.12, 0.38], [0.44, 0.4], [0.5, 0.42], [0.505, 0.435], [0.495, 0.44], [0.46, 0.43], [0.12, 0.415], [0, 0.415]], 96);
    // ホールケーキ本体（生クリームで覆った円柱。上の縁は丸く）
    const cakeGeo = () => G.lathe([[0, 0], [0.5, 0], [0.505, 0.02], [0.505, 0.9], [0.495, 0.97], [0.47, 1.0], [0, 1.0]], 96);

    /* 小物の描き方 */
    const strawberry = (x, y, z, s, ry, tilt) => api0.mesh('strawberry', strawberryGeo, [x, y, z], [tilt || 180, ry || 0, 0], [s, s, s],
      Object.assign({}, M.glossyFood, { tex: tex.berry, spec: 0.6, shin: 110, rim: 0.12, bump: 0.3 }));
    const rosette = (x, y, z, s, ry) => api0.mesh('rosette', rosetteGeo, [x, y, z], [0, ry || 0, 0], [s, s * 0.9, s],
      Object.assign({}, M.cream, { color: CREAM, spec: 0.22, shin: 24 }));
    let api0 = null;

    S.render(ctx, {
      W, H, clear: [0.93, 0.8, 0.82], ambient: 0.56, light: [-0.3, 0.9, 0.6], lightCol: [1.02, 1.0, 0.97],   // 通常の室内照明（強いスポットにしない）
      sky: [1.02, 1.01, 1.02], ground: [0.74, 0.7, 0.7], envTop: [1.05, 1.0, 1.0], envBot: [0.5, 0.42, 0.44],
      camera: { eye, at, fov: 31, focus, dofScale: 0.32, blur: 12 },
      draw(api) {
        api0 = api;
        /* 奥：ストライプの壁、ガーランド、棚の焼き菓子の箱、ペンダントライト（ぼける） */
        api.panel([0, 1.6, -3.6], [0, 0, 0], [14, 6], Object.assign({}, M.matte, { tex: tex.stripe, uvScale: [7, 1] }));
        api.panel([0.2, 2.35, -3.55], [0, 0, 0], [4.4, 0.45], { tex: tex.garland });
        for (const sy of [1.1, 1.8]) {
          api.box([0.4, sy, -3.45], [0, 0, 0], [4, 0.06, 0.35], Object.assign({}, M.matte, { color: [0.96, 0.94, 0.91] }));
          for (let i = 0; i < 6; i++) api.box([-1.1 + i * 0.6, sy + 0.14, -3.45], [0, 0, 0], [0.4, 0.22, 0.26],
            Object.assign({}, M.matte, { color: MAC[i % 6].map(v => v * 0.97) }));
        }
        for (const lx of [-1.4, 1.2]) {
          api.cylinder([lx, 3.3, -2.4], [0, 0, 0], [0.01, 1.4, 0.01], { color: [0.7, 0.6, 0.4] });
          api.lathe('shade', [[0.05, 0.3], [0.12, 0.28], [0.3, 0.1], [0.36, 0]], [lx, 2.5, -2.4], [0, 0, 0], [1, 1, 1],
            Object.assign({}, M.ceramic, { color: [0.95, 0.9, 0.86] }));
          api.sphere([lx, 2.52, -2.4], [0, 0, 0], [0.16, 0.16, 0.16], { color: [1, 0.93, 0.78], unlit: true, castShadow: false });
        }

        /* テーブル：ピンクのギンガムチェックのクロス */
        api.box([0, -0.04, 0], [0, 0, 0], [7, 0.08, 5.2], Object.assign({}, M.matte, { tex: tex.cloth, face: S.FACE.TOP, edge: [0.93, 0.8, 0.82], uvScale: [3, 3], spec: 0.04, shin: 12 }));

        /* ケーキスタンドとショートケーキ（左奥） */
        const kx = -0.62, kz = -0.95, ks = 1.0;
        api.mesh('cakestand', standGeo, [kx, 0, kz], [0, 0, 0], [ks, ks, ks], Object.assign({}, M.ceramic, { color: WHITE }));
        const cy = 0.415 * ks, cr = 0.78, ch = 0.36;
        api.mesh('cake', cakeGeo, [kx, cy, kz], [0, 0, 0], [cr, ch, cr], Object.assign({}, M.cream, { tex: tex.cakeSide, uvScale: [3, 1] }));
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * Math.PI * 2, rx = kx + Math.sin(a) * cr * 0.4, rz = kz + Math.cos(a) * cr * 0.4;
          rosette(rx, cy + ch, rz, 0.13, i * 23);
          strawberry(rx, cy + ch + 0.14, rz, 0.12, i * 37, 188 + (i % 3) * 6);
        }
        // 側面の下のふち飾り（小さな絞り）
        for (let i = 0; i < 36; i++) {
          const a = i / 36 * Math.PI * 2;
          api.mesh('rosette', rosetteGeo, [kx + Math.sin(a) * cr * 0.5, cy, kz + Math.cos(a) * cr * 0.5], [0, i * 23, 0], [0.075, 0.06, 0.075],
            Object.assign({}, M.cream, { color: CREAM }));
        }

        /* マカロンのタワー（右奥）：白い円すいに、外向きに立てて並べる */
        const tx = 1.0, tz = -0.95, th = 0.9;
        api.lathe('cone', [[0, 0], [0.3, 0], [0.02, 1], [0, 1]], [tx, 0, tz], [0, 0, 0], [1, th, 1], Object.assign({}, M.matte, { color: WHITE }));
        const rows = [[0.08, 9, 0.29], [0.25, 8, 0.24], [0.42, 7, 0.19], [0.59, 5, 0.135], [0.75, 4, 0.085]];
        rows.forEach(([hy, n, rr], ri) => {
          for (let i = 0; i < n; i++) {
            const a = (i / n + ri * 0.13) * 360, ar = a * Math.PI / 180, c = MAC[(i + ri * 2) % 6];
            const px = tx + Math.sin(ar) * (rr + 0.04), pz = tz + Math.cos(ar) * (rr + 0.04);
            macaron(api, px, hy * th + 0.08, pz, [72, a, 0], 0.17, c);
          }
        });
        macaron(api, tx, th + 0.02, tz, [0, 30, 0], 0.17, MAC[0]);

        /* ティーポットとティーカップ（奥・中央） */
        teapot(api, 0.3, -1.75, 0.62, 200);
        const tsy = K.saucer(api, { x: -0.18, z: -1.35, d: 0.46, color: WHITE, band: PINK });
        K.cup(api, { x: -0.18, z: -1.35, y: tsy, d: 0.32, h: 0.19, color: WHITE, band: PINK, handleYaw: -35,
                     liquid: { color: [0.55, 0.26, 0.1], level: 0.8 } });

        /* ひと切れのショートケーキ（アクスタの左） */
        const sx = -0.46, sz = -0.28;
        const py = K.plate(api, { x: sx, z: sz, d: 0.56, color: WHITE });
        // 切り口の片方をカメラに向ける（中心角40°の扇形。先端が皿の中央寄り）
        const wr = 0.34, wh = 0.24, wy = -112, wa = wy * Math.PI / 180;
        const ax = sx - Math.sin(wa) * wr * 0.42, az = sz - Math.cos(wa) * wr * 0.42;   // 先端の位置
        for (const [part, mat] of [['cut', { tex: tex.slice, spec: 0.05, shin: 10 }], ['top', { color: CREAM }], ['side', { tex: tex.cakeSide, uvScale: [0.35, 1] }]])
          api.mesh('wedge40', () => G.wedge(40), [ax, py, az], [0, wy, 0], [wr, wh, wr], Object.assign({}, M.cream, { part }, mat));
        { const mx = ax + Math.sin(wa) * wr * 0.7, mz = az + Math.cos(wa) * wr * 0.7;
          rosette(mx, py + wh, mz, 0.1, 40);
          strawberry(mx, py + wh + 0.1 + 0.087 * 0.12, mz, 0.1, 10, 186); }


        /* 卓上カレンダー */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* 接地の暗がり */
        K.shadow(api, kx, kz, 0.75, 0.7, 0, 0.35);
        K.shadow(api, tx, tz, 0.8, 0.75, 0, 0.35);
        K.shadow(api, 0.3, -1.75, 0.6, 0.55, 0, 0.35);
        K.shadow(api, sx, sz, 0.6, 0.55, 0, 0.35);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);

        /* ---- 部品 ---- */
        function macaron(api, x, y, z, rot, d, c) {
          const shell = Object.assign({}, M.matte, { color: c, spec: 0.18, shin: 22, rim: 0.05 });
          const m = E.M4.compose([x, y, z], rot, [1, 1, 1]);
          const local = (lx, ly, lz) => [m[0] * lx + m[4] * ly + m[8] * lz + x, m[1] * lx + m[5] * ly + m[9] * lz + y, m[2] * lx + m[6] * ly + m[10] * lz + z];
          const s = d, f = 0.065 * s, foot = 0.06 * s;            // f: ガナッシュの半分の厚み
          const footMat = Object.assign({}, shell, { tex: tex.foot, tint: true, uvScale: [3, 1], spec: 0.02, rim: 0 });
          api.cylinder(local(0, 0, 0), rot, [s * 0.86, f * 2, s * 0.86], Object.assign({}, M.cream, { color: [0.98, 0.95, 0.88], part: 'SIDE' }));  // ガナッシュ
          api.mesh('mfoot', footGeo, local(0, f, 0), rot, [s, s, s], footMat);                                 // 上のピエ
          api.mesh('mshell', shellGeo, local(0, f + foot * 0.85, 0), rot, [s, s * 0.95, s], shell);            // 上の生地
          const r2 = [rot[0] + 180, rot[1], rot[2]];
          api.mesh('mfoot', footGeo, local(0, -f, 0), r2, [s, s, s], footMat);
          api.mesh('mshell', shellGeo, local(0, -f - foot * 0.85, 0), r2, [s, s * 0.95, s], shell);
        }
        function cupcake(api, x, z, frost, variant) {
          api.mesh('liner', linerGeo, [x, 0, z], [0, 0, 0], [0.42, 0.42, 0.42],
            Object.assign({}, M.matte, { tex: variant ? tex.linerB : tex.liner, bump: 0.8 }));
          api.lathe('muffin', [[0, 0.24], [0.25, 0.25], [0.3, 0.3], [0.26, 0.34], [0, 0.35]], [x, 0, z], [0, 0, 0], [0.42, 0.42, 0.42],
            Object.assign({}, M.matte, { color: [0.78, 0.55, 0.3] }));
          api.mesh('swirl', swirlGeo, [x, 0.27 * 0.42 + 0.01, z], [0, variant * 70, 0], [0.34, 0.32, 0.34],
            Object.assign({}, M.cream, { color: frost, spec: 0.25, shin: 28 }));
          strawberry(x, 0.27 * 0.42 + 0.33, z, 0.09, variant * 40, 180);
        }
        function teapot(api, x, z, s, yaw) {
          const mat = Object.assign({}, M.ceramic, { color: WHITE });
          api.lathe('potbody', [[0, 0.004], [0.26, 0.004], [0.28, 0, 1], [0.3, 0.03], [0.4, 0.12], [0.47, 0.26], [0.48, 0.38], [0.44, 0.5],
            [0.35, 0.6], [0.27, 0.64], [0.26, 0.66, 1], [0.24, 0.66], [0, 0.66]], [x, 0, z], [0, yaw, 0], [s, s, s], mat);
          api.lathe('potband', [[0.482, 0.34], [0.486, 0.38], [0.482, 0.42]], [x, 0, z], [0, 0, 0], [s, s, s], Object.assign({}, M.ceramic, { color: PINK }));
          api.lathe('potlid', [[0.27, 0.64], [0.275, 0.66], [0.22, 0.72], [0.12, 0.76], [0.06, 0.77], [0.05, 0.79, 1], [0.08, 0.83], [0.07, 0.87], [0, 0.88]],
            [x, 0, z], [0, 0, 0], [s, s, s], mat);
          const sp = (t) => { const u = 1 - t; return [0.4 * u * u + 0.62 * 2 * u * t + 0.78 * t * t, 0.22 * u * u + 0.3 * 2 * u * t + 0.6 * t * t, 0]; };
          api.mesh('potspout', () => E.GEN.tube(sp, (t) => 0.1 - 0.06 * t, 32, 18, false), [x, 0, z], [0, yaw + 180, 0], [s, s, s], mat);
          const hp = (t) => { const a = -Math.PI / 2 + t * Math.PI; return [-0.47 - Math.cos(a) * 0.18, 0.36 - Math.sin(a) * 0.17, 0]; };
          api.mesh('pothandle', () => E.GEN.tube(hp, () => 0.035, 32, 14, true), [x, 0, z], [0, yaw + 180, 0], [s, s, s], mat);
        }
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.14);
    E.drawGrain(ctx, W, H, 0.025, 29, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  const blurInto = (dst, src, px) => { const x = dst.getContext('2d'); x.save(); x.filter = `blur(${px}px)`; x.drawImage(src, 0, 0); x.restore(); };

  // テーブルクロス：ピンクのギンガムチェック（縦横の帯が重なる所が濃い）＋うっすら織り目
  {
    const S = 512, N = 8, c = C(S, S), x = c.getContext('2d'), cell = S / N;
    x.fillStyle = '#fbf6f4'; x.fillRect(0, 0, S, S);
    x.fillStyle = 'rgba(232,150,168,0.45)';
    for (let i = 0; i < N; i += 2) { x.fillRect(i * cell, 0, cell, S); x.fillRect(0, i * cell, S, cell); }
    x.fillStyle = 'rgba(214,120,142,0.35)';
    for (let i = 0; i < N; i += 2) for (let j = 0; j < N; j += 2) x.fillRect(i * cell, j * cell, cell, cell);
    E.drawGrain(x, S, S, 0.04, 3, 2);
    T.cloth = c;
  }
  // ピンクのストライプ壁
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#fbe3e6'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#f6cdd4'; x.fillRect(0, 0, 64, 128);
    T.stripe = c;
  }
  // 旗のガーランド
  {
    const Wd = 1024, Ht = 104, c = C(Wd, Ht), x = c.getContext('2d');
    x.strokeStyle = '#8c6a4a'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 10); x.quadraticCurveTo(Wd / 2, 34, Wd, 10); x.stroke();
    const cols = ['#f4a3b5', '#fff', '#a8d8ea', '#ffe08a', '#b8e0b0'];
    for (let i = 0; i < 16; i++) {
      const px = 20 + i * 62, py = 10 + Math.sin(i / 15 * Math.PI) * 22;
      x.fillStyle = cols[i % 5]; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 46, py); x.lineTo(px + 23, py + 62); x.fill();
    }
    T.garland = c;
  }
  // 生クリームの側面：パレットナイフでならした、ゆるい横すじ
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(41);
    x.fillStyle = '#fdf8ef'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 14; i++) {
      x.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(230,218,202,0.22)';
      x.lineWidth = 1 + r() * 3; x.beginPath();
      const y0 = r() * Ht; x.moveTo(0, y0);
      for (let px = 0; px <= Wd; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.02 + i) * 2);
      x.stroke();
    }
    E.drawGrain(x, Wd, Ht, 0.04, 5, 2);
    T.cakeSide = c;
  }
  // いちごの皮：赤のグラデーション＋互い違いの種（くぼみの影つき）。上端（ヘタ側）は白っぽい
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(7);
    const g = x.createLinearGradient(0, Ht, 0, 0);    // テクスチャの上 = 輪郭の終わり（ヘタ側）
    g.addColorStop(0, '#b3121f'); g.addColorStop(0.55, '#d81e2c'); g.addColorStop(0.85, '#e8454a'); g.addColorStop(0.95, '#f2b0a6'); g.addColorStop(1, '#f7e2d6');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let row = 0; row < 9; row++) for (let col = 0; col < 13; col++) {
      const px = (col + (row % 2) * 0.5) * Wd / 13 + (r() - 0.5) * 6, py = Ht - 18 - row * (Ht - 50) / 9 + (r() - 0.5) * 4;
      x.fillStyle = 'rgba(120,0,15,0.28)'; x.beginPath(); x.ellipse(px, py, 5, 6.5, 0, 0, 7); x.fill();
      x.fillStyle = '#efd27a'; x.beginPath(); x.ellipse(px, py - 1, 1.8, 2.8, 0, 0, 7); x.fill();
    }
    T.berry = c;
  }
  // ケーキの断面：u=中心→外、v=下→上。
  //   下から スポンジ / クリーム＋縦半分に切ったいちご / スポンジ / クリーム（上面の塗り）。外周は側面のクリームの厚み
  {
    const Wd = 512, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(314);
    const Y = (v) => Ht - v * Ht;                              // v（下=0）→ canvas の y
    const sponge = (v0, v1) => {
      const g = x.createLinearGradient(0, Y(v1), 0, Y(v0));
      g.addColorStop(0, '#f6d898'); g.addColorStop(1, '#f1ca80');
      x.fillStyle = g; x.fillRect(0, Y(v1), Wd, Y(v0) - Y(v1));
      for (let i = 0; i < 1400; i++) {                         // 細かい気泡
        const px = r() * Wd, py = Y(v0 + r() * (v1 - v0)), rr = 0.8 + r() * 2.2;
        x.fillStyle = `rgba(196,146,70,${0.18 + r() * 0.2})`; x.beginPath(); x.ellipse(px, py, rr, rr * 0.8, 0, 0, 7); x.fill();
        x.fillStyle = 'rgba(255,245,215,0.35)'; x.beginPath(); x.arc(px + rr * 0.4, py - rr * 0.4, rr * 0.4, 0, 7); x.fill();
      }
    };
    const cream = (v0, v1) => {
      x.fillStyle = '#fffaf1'; x.fillRect(0, Y(v1), Wd, Y(v0) - Y(v1));
      x.fillStyle = 'rgba(235,222,205,0.5)';
      for (let i = 0; i < 60; i++) x.fillRect(r() * Wd, Y(v0 + r() * (v1 - v0)), 10 + r() * 30, 1);
    };
    // いちごの縦断面（涙形。外側が赤、内側は白っぽいピンクで中心に筋）
    const berryCut = (cx, cy, h) => {
      const w = h * 0.5;               // 面が横に引き伸ばされる分、細めに描く
      const tear = (s) => {
        x.beginPath();
        x.moveTo(cx, cy - h * 0.5 * s);
        x.bezierCurveTo(cx + w * 0.55 * s, cy - h * 0.35 * s, cx + w * 0.55 * s, cy + h * 0.45 * s, cx, cy + h * 0.5 * s);
        x.bezierCurveTo(cx - w * 0.55 * s, cy + h * 0.45 * s, cx - w * 0.55 * s, cy - h * 0.35 * s, cx, cy - h * 0.5 * s);
        x.fill();
      };
      x.fillStyle = '#c8141f'; tear(1);
      x.fillStyle = '#e8545a'; tear(0.86);
      x.fillStyle = '#f6b8b0'; tear(0.66);
      x.fillStyle = '#fbe4dc'; tear(0.34);
      x.strokeStyle = 'rgba(214,60,70,0.45)'; x.lineWidth = 1.2;
      for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(cx, cy + h * 0.3); x.quadraticCurveTo(cx + k * w * 0.1, cy, cx + k * w * 0.16, cy - h * 0.34); x.stroke(); }
    };
    sponge(0, 0.34);
    cream(0.34, 0.52);
    for (const [bx, bs] of [[48, 0.95], [140, 1.05], [238, 0.9], [330, 1.08], [428, 0.85]]) berryCut(bx, Y(0.43) + (1 - bs) * 14, Ht * 0.19 * bs);
    sponge(0.52, 0.84);
    cream(0.84, 1.0);
    // 上下の焼き色は付けない（ショートケーキはスポンジの焼き面を落とす）。外周は側面クリームの厚み
    const g = x.createLinearGradient(Wd * 0.9, 0, Wd, 0);
    g.addColorStop(0, 'rgba(255,250,241,0)'); g.addColorStop(0.35, '#fffaf1'); g.addColorStop(1, '#fff7ec');
    x.fillStyle = g; x.fillRect(Wd * 0.9, 0, Wd * 0.1, Ht);
    T.slice = c;
  }
  // マカロンのピエ（細かい気泡のフリル）
  {
    const Wd = 256, Ht = 64, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(88);
    x.fillStyle = '#e4e4e4'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 400; i++) {
      x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(190,190,190,0.35)';
      x.beginPath(); x.ellipse(r() * Wd, r() * Ht, 1 + r() * 2, 1.5 + r() * 4, 0, 0, 7); x.fill();
    }
    T.foot = c;
  }
  // カップケーキの紙カップ（ひだの明暗＋柄）
  const liner = (a, b, dots) => {
    const Wd = 64, Ht = 128, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, Wd, 0);
    g.addColorStop(0, a); g.addColorStop(0.5, b); g.addColorStop(1, a);
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    if (dots) { x.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(Wd / 2, 16 + i * 32, 5, 0, 7); x.fill(); } }
    return c;
  };
  T.liner = liner('#e59aac', '#f7cdd6', true);
  T.linerB = liner('#9a6a4a', '#c89a74', false);
  return T;
}
})();
