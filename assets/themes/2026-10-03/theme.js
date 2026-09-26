/* =========================================================================
 *  10/03 登山の日（「と(10)ざん(3)」の語呂合わせ）
 *  山小屋のテラス。丸太の手すりの向こうに朝の山並み。
 *  木のテーブルにホーローのマグ（コーヒー）、ランタン、山用の保温ボトル、
 *  小ぶりのザック、卓上カレンダー。その真ん中にアクスタを置く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'mountain-day',
  title: '登山の日',
  dayName: 'Hiking Day',
  caption: { fill: '#ffffff', outline: '#2c4b3a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f3ecdc', ink: '#2c4b3a', accent: '#c4552b', back: '#ddd2ba', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['deck', 'bark'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.06, z: 0.04, yaw: -14 };           // アクスタ（右へ振る）
    const MUG = { x: -0.6, z: -0.26 };                   // ホーローマグ（左手前）
    const LAMP = { x: -0.8, z: -1.3 };                  // ランタン（左奥）
    const BOTTLE = { x: 0.5, z: -1.4 };                 // 保温ボトル（奥）
    const PACK = { x: 1.15, z: -1.95, yaw: -24 };           // ザック（右奥）
    const CAL = { x: 0.74, z: -0.6, yaw: -22 };           // 卓上カレンダー（右）
    const eye = [-0.36, 1.3, 2.75], at = [0.02, 0.5, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    /* ---------- 形 ---------- */
    // ホーローマグ：まっすぐな胴・巻き込んだ縁・薄い肉厚（外→縁→内）
    const mugProf = [[0, 0.004], [0.42, 0.004], [0.45, 0, 1], [0.47, 0.02], [0.5, 0.6], [0.52, 0.615], [0.515, 0.64], [0.495, 0.635],
      [0.48, 0.6], [0.455, 0.06], [0.42, 0.045], [0, 0.04]];
    // 保温ボトル（胴）とカップを兼ねたふた
    const bottleProf = [[0, 0.004], [0.3, 0.004], [0.33, 0, 1], [0.36, 0.02], [0.37, 0.05, 1], [0.37, 0.78], [0.35, 0.82], [0.3, 0.84], [0.28, 0.86], [0, 0.86]];
    const capProf = [[0, 0], [0.37, 0], [0.38, 0.02, 1], [0.385, 0.06], [0.385, 0.26], [0.37, 0.28], [0, 0.28]];
    // ランタン：台座（燃料タンク）・ほや（ガラス）・かさ
    const tankProf = [[0, 0.004], [0.4, 0.004], [0.44, 0, 1], [0.5, 0.04], [0.52, 0.12], [0.48, 0.2], [0.3, 0.24], [0.26, 0.28], [0, 0.28]];
    const globeProf = [[0.22, 0.28], [0.3, 0.34], [0.36, 0.48], [0.36, 0.62], [0.3, 0.76], [0.22, 0.82]];
    const hoodProf = [[0, 0.8], [0.24, 0.8], [0.44, 0.86], [0.46, 0.89, 1], [0.3, 0.95], [0.12, 1.0], [0.1, 1.04], [0, 1.05]];

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.78, 0.88, 0.96], ambient: 0.54, light: [0.45, 0.86, 0.5], lightCol: [1.1, 1.07, 1.0],
      sky: [0.98, 1.02, 1.08], ground: [0.6, 0.55, 0.45], envTop: [1.0, 1.04, 1.1], envBot: [0.42, 0.38, 0.3],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 遠景：朝の山並み --- */
        api.panel([0, -1.1, -7.5], [0, 0, 0], [20, 8], { tex: tex.mountains, unlit: true, receiveShadow: false });
        /* --- テラスの丸太の手すり --- */
        const LOG = mat(M.wood, { tex: tex.bark, uvScale: [1, 4] });
        for (const px of [-3, -1.2, 0.6, 2.4]) api.cylinder([px, -0.05, -3.2], [0, 0, 0], [0.16, 1.4, 0.16], LOG);
        for (const py of [0.2, 0.6]) api.cylinder([0, py, -3.15], [0, 0, 90], [0.12, 9, 0.12], mat(LOG, { uvScale: [1, 12] }));
        /* --- テーブル（板張り） --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.6], mat(M.wood, { tex: tex.deck, face: S.FACE.TOP, edge: [0.5, 0.36, 0.24], uvScale: [2, 1] }));

        /* --- ホーローのマグ（紺の外・白い内・紺の縁）とコーヒー --- */
        const ms = 0.3, ENAMEL = mat(M.ceramic, { tex: tex.enamel, spec: 0.7, shin: 110 });
        api.lathe('mtn:mug', mugProf, [MUG.x, 0, MUG.z], [0, 0, 0], [ms, ms, ms], ENAMEL);
        api.mesh('mtn:mugHandle', () => G.tube((t) => { const a = -Math.PI / 2 + t * Math.PI; return [0.49 + Math.cos(a) * 0.2, 0.34 - Math.sin(a) * 0.19, 0]; },
          () => 0.04, 32, 14, true), [MUG.x, 0, MUG.z], [0, 200, 0], [ms, ms, ms], mat(M.ceramic, { color: [0.16, 0.24, 0.42], spec: 0.7, shin: 110 }));
        api.cylinder([MUG.x, 0.5 * ms, MUG.z], [0, 0, 0], [0.95 * ms, 0.001, 0.95 * ms], mat(M.glossyFood, { part: 'TOP', color: [0.26, 0.14, 0.07], spec: 0.5 }));

        /* --- ランタン（赤い台座・ガラスのほや・かさ・つる） --- */
        const ls = 0.56, RED = mat(M.plastic, { color: [0.72, 0.18, 0.14], spec: 0.6, shin: 70 }), BRASS = mat(M.gold, { color: [0.85, 0.66, 0.36] });
        api.lathe('mtn:tank', tankProf, [LAMP.x, 0, LAMP.z], [0, 0, 0], [ls, ls, ls], RED);
        api.lathe('mtn:hood', hoodProf, [LAMP.x, 0, LAMP.z], [0, 0, 0], [ls, ls, ls], RED);
        for (let i = 0; i < 4; i++) {                    // ほやを守る針金の柱
          const a = i * Math.PI / 2 + Math.PI / 4;
          api.cylinder([LAMP.x + Math.sin(a) * 0.39 * ls, 0.55 * ls, LAMP.z + Math.cos(a) * 0.39 * ls], [0, 0, 0], [0.018, 0.54 * ls, 0.018], BRASS);
        }
        api.mesh('mtn:bail', () => G.tube((t) => { const a = t * Math.PI; return [Math.cos(a) * 0.45, 0.875 + Math.sin(a) * 0.46, 0]; }, () => 0.018, 32, 10, true),
          [LAMP.x, 0, LAMP.z], [0, 30, 0], [ls, ls, ls], BRASS);
        // ほや（すりガラス。乳白で柔らかく光る）
        api.lathe('mtn:globe', globeProf, [LAMP.x, 0, LAMP.z], [0, 0, 0], [ls, ls, ls], mat(M.ceramic, { tex: tex.globe, spec: 0.8, shin: 120, rim: 0.35 }));
        api.lathe('mtn:burner', [[0, 0.28], [0.08, 0.28], [0.08, 0.38], [0.04, 0.42], [0, 0.42]], [LAMP.x, 0, LAMP.z], [0, 0, 0], [ls, ls, ls], BRASS);

        /* --- 保温ボトル（オリーブの粉体塗装・ステンレスの帯・カップ兼用のふた） --- */
        const bs = 0.52;
        api.lathe('mtn:bottle', bottleProf, [BOTTLE.x, 0, BOTTLE.z], [0, 0, 0], [bs * 0.8, bs * 1.35, bs * 0.8], mat(M.plastic, { tex: tex.bottle, spec: 0.35, shin: 40 }));
        api.lathe('mtn:cap', capProf, [BOTTLE.x, 0.855 * bs * 1.35, BOTTLE.z], [0, 0, 0], [bs * 0.8, bs, bs * 0.8], mat(M.metal, { color: [0.82, 0.84, 0.86] }));
        api.lathe('mtn:capBand', [[0.387, 0.03], [0.39, 0.06], [0.39, 0.2], [0.387, 0.23]], [BOTTLE.x, 0.855 * bs * 1.35, BOTTLE.z], [0, 0, 0], [bs * 0.8, bs, bs * 0.8],
          mat(M.plastic, { color: [0.33, 0.38, 0.24], spec: 0.3 }));

        /* --- 小ぶりのザック（本体・雨ぶた・前ポケット・ショルダーは背中側） --- */
        const px = PACK.x, pz = PACK.z, pr = PACK.yaw * Math.PI / 180;
        const at3 = (lx, ly, lz) => [px + Math.cos(pr) * lx + Math.sin(pr) * lz, ly, pz - Math.sin(pr) * lx + Math.cos(pr) * lz];
        const PACKC = mat(M.matte, { tex: tex.nylon, spec: 0.12, shin: 20 });
        api.rbox(at3(0, 0.5, 0), [0, PACK.yaw, 0], [0.72, 1.0, 0.44], mat(PACKC, { round: 0.32 }));
        api.rbox(at3(0, 1.0, 0.02), [0, PACK.yaw, -2], [0.74, 0.18, 0.5], mat(M.matte, { color: [0.2, 0.3, 0.42], round: 0.45 }));
        api.rbox(at3(0, 0.36, 0.22), [0, PACK.yaw, 0], [0.5, 0.46, 0.14], mat(M.matte, { color: [0.2, 0.3, 0.42], round: 0.4 }));
        api.rbox(at3(0, 0.04, 0), [0, PACK.yaw, 0], [0.7, 0.08, 0.42], mat(M.matte, { color: [0.18, 0.18, 0.2], round: 0.3 }));
        for (const sx of [-0.18, 0.18]) {                // 雨ぶたを留めるベルトとバックル
          api.rbox(at3(sx, 0.8, 0.225), [0, PACK.yaw, 0], [0.05, 0.36, 0.02], mat(M.matte, { color: [0.14, 0.14, 0.16], round: 0.1 }));
          api.rbox(at3(sx, 0.72, 0.24), [0, PACK.yaw, 0], [0.08, 0.06, 0.03], mat(M.plastic, { color: [0.12, 0.12, 0.13], round: 0.3 }));
        }

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, MUG.x, MUG.z, 0.4, 0.38, 0, 0.45);
        K.shadow(api, LAMP.x, LAMP.z, 0.5, 0.46, 0, 0.45);
        K.shadow(api, BOTTLE.x, BOTTLE.z, 0.44, 0.4, 0, 0.45);
        K.shadow(api, px, pz, 0.95, 0.65, PACK.yaw, 0.45);

        stand.shadow(api, P);
        api.blend(true);
        if (api.mode === 0) {
        }
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    // 山の朝の光（右上から、ごく弱く）
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.9, 0, 0, W * 0.9, 0, W * 0.8);
    lg.addColorStop(0, 'rgba(255,244,220,0.18)'); lg.addColorStop(1, 'rgba(255,244,220,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.025, 103, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 遠景：朝の空と三重の山並み（奥ほど淡い）、雪をかぶった主峰、手前は針葉樹の森
  {
    const Wd = 2048, Ht = 820, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(3);
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#8fc4ec'); g.addColorStop(0.5, '#cfe6f4'); g.addColorStop(0.72, '#fbeedb'); g.addColorStop(1, '#fbeedb');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = 'rgba(255,255,255,0.8)';
    for (const [cx, cy, w] of [[300, 140, 220], [900, 90, 280], [1600, 160, 240]]) { x.beginPath(); x.ellipse(cx, cy, w, 34, 0, 0, 7); x.ellipse(cx + w * 0.35, cy - 22, w * 0.5, 30, 0, 0, 7); x.fill(); }
    const ridge = (base, amp, seed, col, peaks) => {
      const rr = E.rnd(seed);
      x.fillStyle = col; x.beginPath(); x.moveTo(0, Ht);
      for (let px = 0; px <= Wd; px += 16) {
        let y = base + Math.sin(px * 0.004 + seed) * amp * 0.3 + Math.sin(px * 0.011 + seed * 2) * amp * 0.12;
        for (const [pcx, ph, pw] of peaks) y -= ph * Math.max(0, 1 - Math.abs(px - pcx) / pw);
        x.lineTo(px, y + (rr() - 0.5) * 3);
      }
      x.lineTo(Wd, Ht); x.fill();
    };
    ridge(470, 80, 11, '#a9bfd6', [[500, 120, 380], [1500, 90, 340]]);
    // 主峰（雪）
    ridge(520, 60, 5, '#7f9bbb', [[1050, 330, 520]]);
    x.save(); x.beginPath();
    x.moveTo(1050, 190); x.lineTo(935, 300); x.lineTo(980, 290); x.lineTo(1010, 318); x.lineTo(1050, 292); x.lineTo(1090, 322); x.lineTo(1120, 294); x.lineTo(1165, 300); x.closePath();
    x.fillStyle = '#f7fbff'; x.fill(); x.restore();
    ridge(600, 70, 9, '#5f8a6e', [[300, 90, 420], [1750, 110, 460]]);
    // 手前の針葉樹
    for (let i = 0; i < 90; i++) {
      const tx = r() * Wd, ty = 640 + r() * 120, th = 50 + r() * 60;
      x.fillStyle = r() > 0.5 ? '#3f6b52' : '#4a7a5c';
      x.beginPath(); x.moveTo(tx, ty - th); x.lineTo(tx - th * 0.28, ty); x.lineTo(tx + th * 0.28, ty); x.fill();
    }
    x.fillStyle = '#3f6b52'; x.fillRect(0, 740, Wd, Ht - 740);
    T.mountains = c;
  }
  // テーブルの板張り：幅広の板・すき間・ゆるい木目（粗く）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(71);
    const n = 5, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.92 + r() * 0.12;
      x.fillStyle = `rgb(${176 * b | 0},${132 * b | 0},${90 * b | 0})`; x.fillRect(0, i * pw, S, pw);
      for (let k = 0; k < 7; k++) {
        x.strokeStyle = r() > 0.5 ? 'rgba(120,80,48,0.22)' : 'rgba(214,176,130,0.25)'; x.lineWidth = 3 + r() * 4;
        const y0 = i * pw + 10 + r() * (pw - 20); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.005 + k * 2 + i) * 7);
        x.stroke();
      }
      x.fillStyle = 'rgba(60,38,20,0.75)'; x.fillRect(0, i * pw, S, 7);
    }
    E.drawGrain(x, S, S, 0.04, 8, 3);
    T.deck = c;
  }
  // 丸太の樹皮（縦に粗いすじ）
  {
    const c = C(128, 256), x = c.getContext('2d'), r = E.rnd(4);
    x.fillStyle = '#8a6440'; x.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 18; i++) { x.fillStyle = r() > 0.5 ? 'rgba(90,60,36,0.4)' : 'rgba(170,130,90,0.35)'; x.fillRect(r() * 128, 0, 5 + r() * 8, 256); }
    T.bark = c;
  }
  // ホーロー：外は紺（v 下半分）、縁で紺の巻き、内は白
  {
    const c = C(32, 512), x = c.getContext('2d');
    x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, 32, 512);
    x.fillStyle = '#2a3e6a'; x.fillRect(0, 512 * 0.44, 32, 512 * 0.56);
    x.fillStyle = '#1c2a4a'; x.fillRect(0, 512 * 0.42, 32, 512 * 0.05);
    x.fillStyle = '#1c2a4a'; x.fillRect(0, 512 * 0.97, 32, 16);
    T.enamel = c;
  }
  // 保温ボトルの胴：オリーブの塗装、下端と肩はステンレス、小さなロゴの帯
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#5f6b3e'; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#c9ced3'; x.fillRect(0, 230, 256, 26); x.fillRect(0, 0, 256, 22);
    x.fillStyle = '#e9e4d2'; x.fillRect(96, 100, 64, 40);
    x.fillStyle = '#5f6b3e'; x.beginPath(); x.moveTo(104, 134); x.lineTo(120, 110); x.lineTo(130, 122); x.lineTo(138, 114); x.lineTo(152, 134); x.fill();
    T.bottle = c;
  }
  // ランタンのほや：乳白のすりガラス、中ほどがほんのり暖かい
  {
    const c = C(32, 256), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, '#eef3f4'); g.addColorStop(0.5, '#fff6df'); g.addColorStop(1, '#eef3f4');
    x.fillStyle = g; x.fillRect(0, 0, 32, 256);
    T.globe = c;
  }
  // ザックのナイロン：朱色、粗いリップストップの格子（淡く）
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#d0582c'; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(150,50,20,0.18)'; x.lineWidth = 2;
    for (let i = 0; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); }
    T.nylon = c;
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
