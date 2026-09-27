/* =========================================================================
 *  10/14 鉄道の日（1872年のこの日、新橋〜横浜間で日本初の鉄道が開業）
 *  鉄道模型の飾り棚のある部屋。水色の壁に路線図のポスター、木のテーブル。
 *  主役は右奥の、展示用レールにのせた新幹線（流線形の先頭車）。左手前に踏切の模型。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'railway-day',
  title: '鉄道の日',
  dayName: 'Railway Day',
  caption: { fill: '#ffffff', outline: '#1d4f86' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f6f8fb', ink: '#1d2c44', accent: '#1d62b0', back: '#dfe5ee', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall', 'ballast'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.16, z: 0.1, yaw: 14 };
    const TRAIN = { x: 0.36, z: -1.05, yaw: 10, s: 0.8 };
    const XING = { x: 0.42, z: 0.26, yaw: -20 };
    const CAL = { x: -0.7, z: -0.52, yaw: 22 };
    const eye = [0.14, 1.32, 2.75], at = [-0.08, 0.48, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    /* 新幹線の先頭車：長さ 1.6（-0.8〜0.8, +x が先頭）。断面は下すぼまりの角丸、先頭は長く伸びた鼻 */
    const BODY_W = 0.2, BODY_H = 0.22;
    const bodyGeo = () => G.surface((u, v) => {
      const X = -0.8 + 1.6 * u, a = v * Math.PI * 2;
      let k = 1, dz = 0;
      const n0 = 0.25;                                  // 鼻の始まり（x）
      if (X > n0) { const t = (X - n0) / (0.8 - n0); k = Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.2))); dz = -0.07 * t * t; }
      const e = 0.3, sp = (w) => Math.sign(w) * Math.pow(Math.abs(w), e);
      const cy = Math.cos(a), sy = Math.sin(a);
      const yy = sp(cy) * BODY_H * 0.5, xx = sp(sy) * BODY_W * 0.5 * (cy < 0 ? 0.92 : 1);
      // 上側ほど鼻が低く（くちばし形）、下側は床の高さのまま
      const top = (yy + BODY_H * 0.5) / BODY_H;
      const hk = X > n0 ? k * (0.35 + 0.65 * (1 - top)) + top * k : 1;
      return [Math.max(-0.8, X), BODY_H * 0.5 + yy * (X > n0 ? Math.min(1, k * 1.05) : 1) + dz * top, xx * (X > n0 ? Math.max(0.02, Math.pow(k, 0.6)) : 1)];
    }, 96, 40, (u, v) => [u, v]);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.86, 0.92, 0.96], ambient: 0.56, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.05, 1.02],
      sky: [1.0, 1.01, 1.03], ground: [0.64, 0.58, 0.52], envTop: [1.02, 1.03, 1.05], envBot: [0.42, 0.4, 0.4],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* 壁と路線図ポスター */
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [5, 2], unlit: true });
        api.panel([0.9, 1.05, -2.97], [0, 0, 0], [1.5, 0.88], { tex: tex.map, spec: 0.05, sharp: true });
        /* テーブル */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.46, 0.32, 0.2], uvScale: [2, 1] }));

        /* --- 展示台：木の台座＋バラスト（砂利）＋枕木＋2本のレール --- */
        const Q = TRAIN.s, L = local(TRAIN.x, TRAIN.z, TRAIN.yaw, Q), yw = TRAIN.yaw;
        const sz3 = (a, b, c) => [a * Q, b * Q, c * Q];
        api.rbox(L(0, 0.03, 0), [0, yw, 0], sz3(1.9, 0.06, 0.4), mat(M.wood, { color: [0.4, 0.24, 0.14], round: 0.06 }));
        api.rbox(L(0, 0.065, 0), [0, yw, 0], sz3(1.78, 0.03, 0.26), mat(M.matte, { tex: tex.ballast, uvScale: [6, 1], round: 0.2 }));
        for (let i = 0; i < 16; i++) api.box(L(-0.82 + i * 0.11, 0.084, 0), [0, yw, 0], sz3(0.035, 0.012, 0.22), mat(M.wood, { color: [0.36, 0.26, 0.2] }));
        for (const rz of [-0.07, 0.07]) api.box(L(0, 0.098, rz), [0, yw, 0], sz3(1.76, 0.016, 0.012), mat(M.metal, { color: [0.7, 0.7, 0.72] }));
        // 車体（白に青い帯・窓）と台車
        const BODY = mat(M.plastic, { tex: tex.body, spec: 0.6, shin: 90, rim: 0.2 });
        const by = 0.13;
        api.mesh('rw:body', bodyGeo, L(-0.05, by, 0), [0, yw, 0], [Q, Q, Q], BODY);
        for (const bx of [-0.55, 0.25]) {
          api.rbox(L(bx, by - 0.01, 0), [0, yw, 0], sz3(0.26, 0.04, 0.15), mat(M.plastic, { color: [0.25, 0.26, 0.28], round: 0.2 }));
          for (const wx of [-0.07, 0.07]) for (const wz of [-0.075, 0.075])
            api.cylinder(L(bx + wx, 0.12, wz), [90, yw, 0], sz3(0.05, 0.012, 0.05), mat(M.metal, { color: [0.55, 0.55, 0.57] }));
        }
        api.box(L(-0.3, by + 0.005, 0), [0, yw, 0], sz3(1.0, 0.02, BODY_W * 0.94), mat(M.plastic, { color: [0.86, 0.88, 0.9] }));
        K.shadow(api, TRAIN.x, TRAIN.z, 2.0 * Q, 0.55 * Q, yw, 0.4);

        /* --- 踏切の模型（台座・柱・×印・警報灯・遮断かん） --- */
        const X = local(XING.x, XING.z, XING.yaw, 1), xy = XING.yaw;
        api.lathe('rw:base', [[0, 0], [0.5, 0], [0.5, 0.3, 1], [0.4, 0.4], [0, 0.4]], X(0, 0, 0), [0, 0, 0], [0.2, 0.06, 0.2], mat(M.plastic, { color: [0.3, 0.3, 0.32] }));
        api.cylinder(X(0, 0.3, 0), [0, 0, 0], [0.026, 0.5, 0.026], mat(M.plastic, { tex: tex.stripe, uvScale: [1, 5], spec: 0.4 }));
        const XB = mat(M.plastic, { tex: tex.stripe, spec: 0.4 });
        for (const a of [36, -36]) api.rbox(X(0, 0.5, 0.02), [0, xy, a], [0.26, 0.04, 0.012], mat(XB, { round: 0.1 }));
        // 警報灯（左右に丸い灯と、上にかぶさるひさし）
        api.rbox(X(0, 0.38, 0.02), [0, xy, 0], [0.2, 0.03, 0.02], mat(M.plastic, { color: [0.15, 0.15, 0.16], round: 0.2 }));
        for (const sx of [-0.08, 0.08]) {
          api.lathe('rw:lamp', [[0, 0], [0.5, 0.05], [0.5, 0.4, 1], [0, 0.42]], X(sx, 0.38, 0.03), [90, xy, 0], [0.07, 0.07, 0.07], mat(M.plastic, { color: [0.12, 0.12, 0.13] }));
          api.cylinder(X(sx, 0.38, 0.062), [90, xy, 0], [0.05, 0.004, 0.05], mat(M.glass, { color: [0.95, 0.2, 0.18], unlit: false, spec: 0.8 }));
        }
        K.shadow(api, XING.x, XING.z, 0.3, 0.3, 0, 0.45);

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();
    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.022, 114, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#cfe0ea'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(0, 0, 64, 128);
    T.wall = c;
  }
  T.table = woodTex(E, 23, [176, 128, 84], 5);
  // 路線図：白地に太い色の線と駅の丸（文字なし・粗く）
  {
    const Wd = 512, Ht = 300, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbfbf7'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = '#2a3a5a'; x.lineWidth = 10; x.strokeRect(5, 5, Wd - 10, Ht - 10);
    x.lineCap = 'round'; x.lineJoin = 'round';
    const line = (col, pts) => { x.strokeStyle = col; x.lineWidth = 14; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
      x.fillStyle = '#fff'; x.strokeStyle = '#333'; x.lineWidth = 4; for (const [a, b] of pts) { x.beginPath(); x.arc(a, b, 9, 0, 7); x.fill(); x.stroke(); } };
    line('#2f8ad8', [[40, 220], [140, 220], [220, 150], [340, 150], [470, 80]]);
    line('#e0553a', [[60, 70], [160, 70], [220, 150], [260, 240], [460, 240]]);
    line('#3aa864', [[340, 150], [340, 60]]);
    T.map = c;
  }
  // 車体：白地、窓の列（上）と青い帯（下）。u=長さ、v=断面の周（0=下, 0.25=側面, 0.5=上 …）
  {
    const Wd = 1024, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f7f8fa'; x.fillRect(0, 0, Wd, Ht);
    // 側面は v≒0.25 と 0.75。帯は側面の下寄り、窓は上寄り（それぞれ両側に）
    for (const vc of [0.25, 0.75]) {
      const yc = vc * Ht, dir = vc < 0.5 ? -1 : 1;
      x.fillStyle = '#1d5bb0'; x.fillRect(0, yc - dir * 20 - 5, Wd * 0.8, 10);
      x.fillStyle = '#1d5bb0'; x.fillRect(0, yc - dir * 30 - 3, Wd * 0.84, 5);
      x.fillStyle = '#2a3440';
      for (let i = 0; i < 9; i++) E.roundRect(x, 60 + i * 64, yc + dir * 14 - 6, 36, 12, 4), x.fill();
    }
    // 運転席の窓（先頭の上面）
    x.fillStyle = '#26303c'; E.roundRect(x, Wd * 0.8, -20, 70, 40, 16); x.fill(); E.roundRect(x, Wd * 0.8, Ht - 20, 70, 40, 16); x.fill();
    T.body = c;
  }
  // バラスト（砂利を粗い斑点で）
  {
    const c = C(128, 64), x = c.getContext('2d'), r = E.rnd(3);
    x.fillStyle = '#9a948a'; x.fillRect(0, 0, 128, 64);
    for (let i = 0; i < 70; i++) { x.fillStyle = r() > 0.5 ? 'rgba(70,66,60,0.4)' : 'rgba(200,196,188,0.4)'; x.beginPath(); x.arc(r() * 128, r() * 64, 3 + r() * 3, 0, 7); x.fill(); }
    T.ballast = c;
  }
  // 黄と黒のしま（太く）
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#f2c230'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#1e1e20';
    for (let i = -128; i < 256; i += 48) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 24, 0); x.lineTo(i + 24 + 128, 128); x.lineTo(i + 128, 128); x.fill(); }
    T.stripe = c;
  }
  return T;
}

/* =========================================================================
 *  共通の下請け（このテーマ専用。基幹には手を入れない）
 * ====================================================================== */
/* 位置・向き・倍率つきのローカル座標 → ワールド座標 */
function local(ox, oz, yawDeg, s, oy) {
  const r = yawDeg * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r), k = s || 1, y0 = oy || 0;
  return (lx, ly, lz) => [ox + (c * lx + sn * lz) * k, y0 + ly * k, oz + (-sn * lx + c * lz) * k];
}
/* 板張りの木目（横方向の板 n 枚。粗く淡い木目） */
function woodTex(E, seed, rgb, n, S) {
  S = S || 1024; n = n || 5;
  const c = E.newCanvas(S, S), x = c.getContext('2d'), r = E.rnd(seed), pw = S / n;
  for (let i = 0; i < n; i++) {
    const b = 0.93 + r() * 0.12;
    x.fillStyle = `rgb(${rgb[0] * b | 0},${rgb[1] * b | 0},${rgb[2] * b | 0})`; x.fillRect(0, i * pw, S, pw);
    for (let k = 0; k < 6; k++) {
      x.strokeStyle = r() > 0.5 ? 'rgba(80,45,20,0.2)' : 'rgba(255,230,190,0.16)'; x.lineWidth = 3 + r() * 4;
      const y0 = i * pw + 8 + r() * (pw - 16); x.beginPath();
      for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k * 1.7 + i) * 6);
      x.stroke();
    }
    x.fillStyle = 'rgba(50,28,12,0.35)'; x.fillRect(0, i * pw, S, 3);
  }
  return c;
}

/* =========================================================================
 *  メッシュを初めて描くときの保険（既存テーマと同じ）
 *   基幹の api.mesh / lathe / rbox は、その描画で初めて使う形のとき、
 *   最初のパス（影）で直前の形の頂点設定のまま描いてしまう。形ごとに1回だけ
 *   大きさほぼ0で描いて別の形（box）を挟み、正しい頂点設定で描かれるようにする。
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
