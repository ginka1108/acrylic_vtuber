/* =========================================================================
 *  10/30 初恋の日（1896年のこの日、島崎藤村が詩「初恋」を雑誌に発表した）
 *  やわらかな窓辺。淡いピンクの小花柄の壁、白木の机。
 *  主役は右奥のハート形の箱（ふたにリボン）。右手前に一輪のチューリップを挿したガラスの一輪挿し。
 *  左手前にハートの封蝋をした封筒を1通、左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'first-love-day',
  title: '初恋の日',
  dayName: 'First Love Day',
  caption: { fill: '#ffffff', outline: '#d0507a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fffafb', ink: '#4a2230', accent: '#d8507a', back: '#f0dde2', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.14, z: 0.12, yaw: 10 };
    const HEART = { x: 0.54, z: -0.86, yaw: -18 };
    const VASE = { x: 0.62, z: -0.14 };
    const ENV = { x: -0.62, z: -0.24, yaw: 14 };
    const CAL = { x: -0.74, z: -0.8, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.48, -0.16];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    // ハートの輪郭（上から見た形。-z が奥、+z が手前の先端）
    const heartPt = (t) => { const a = t * Math.PI * 2; return [0.5 * Math.pow(Math.sin(a), 3), -(0.4 * Math.cos(a) - 0.15 * Math.cos(2 * a) - 0.06 * Math.cos(3 * a) - 0.03 * Math.cos(4 * a))]; };
    // 押し出した側面＋上面（中心からの扇）
    const heartGeo = (h, bulge) => () => {
      const v = [], N = 128, push = (p, n, uv) => v.push(p[0], p[1], p[2], uv[0], uv[1], n[0], n[1], n[2]);
      for (let i = 0; i < N; i++) {
        const a = heartPt(i / N), b = heartPt((i + 1) / N);
        const nx = b[1] - a[1], nz = -(b[0] - a[0]), l = Math.hypot(nx, nz) || 1, n = [nx / l, 0, nz / l];
        const q = [[a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], h, b[1]], [a[0], h, a[1]]];
        for (const k of [0, 1, 2, 0, 2, 3]) push(q[k], n, [i / N, q[k][1] / h]);
        // 上面：中心を少し盛り上げる
        const c = [0, h + bulge, -0.05];
        for (const p of [c, [a[0], h, a[1]], [b[0], h, b[1]]]) push(p, [0, 1, 0], [p[0] + 0.5, 0.5 - p[2]]);
      }
      return { data: new Float32Array(v), parts: { all: [0, v.length / 8] } };
    };
    const RIB = mat(M.plastic, { color: [0.98, 0.9, 0.92], spec: 0.6, shin: 70, rim: 0.2 });
    const loopGeo = () => G.tube((t) => { const a = t * Math.PI * 2; return [0.5 * (1 - Math.cos(a)) * 0.9, 0.3 * Math.sin(a) + 0.16 * (1 - Math.cos(a)), 0]; }, () => 0.06, 40, 12, false);
    // チューリップの花：花びら6枚（カップ形の曲面）
    const petalGeo = () => G.surface((u, v) => { const s = v * 2 - 1, w = 0.34 * Math.sin(Math.PI * Math.min(1, u * 1.1)) + 0.02; return [s * w, u, 0.18 * Math.sin(u * Math.PI * 0.8) - 0.1 * s * s + 0.1]; }, 16, 8);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.98, 0.92, 0.93], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.04, 1.02],
      sky: [1.02, 1.01, 1.01], ground: [0.74, 0.64, 0.62], envTop: [1.04, 1.02, 1.02], envBot: [0.52, 0.44, 0.44],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [8, 3], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.76, 0.68, 0.58], uvScale: [2, 1] }));

        /* --- ハートの箱（本体＋少し大きいふた＋リボンの蝶結び） --- */
        const L = local(HEART.x, HEART.z, HEART.yaw, 1), yw = HEART.yaw, hs = 0.66;
        api.mesh('hl:box', heartGeo(0.26, 0), L(0, 0, 0), [0, yw, 0], [hs, 1, hs], mat(M.matte, { color: [0.94, 0.36, 0.46], spec: 0.3, shin: 40 }));
        api.mesh('hl:lid', heartGeo(0.1, 0.05), L(0, 0.2, 0), [0, yw, 0], [hs * 1.05, 1, hs * 1.05], mat(M.plastic, { color: [0.98, 0.46, 0.56], spec: 0.5, shin: 60, rim: 0.2 }));
        const top = L(0, 0.34, -0.06 * hs);
        api.mesh('hl:loop', loopGeo, top, [0, yw + 25, 0], [0.16, 0.16, 0.45], RIB);
        api.mesh('hl:loop', loopGeo, top, [0, yw + 205, 0], [0.16, 0.16, 0.45], RIB);
        api.sphere(top, [0, yw, 0], [0.05, 0.04, 0.05], RIB);
        K.shadow(api, HEART.x, HEART.z, 0.76, 0.66, yw, 0.45);

        /* --- 一輪挿しとチューリップ --- */
        const vx = VASE.x, vz = VASE.z, vs = 0.36;
        api.mesh('hl:stem', () => G.tube((t) => [0.01 * Math.sin(t * 2), t * 0.44, 0.02 * t * t], () => 0.008, 20, 8, true), [vx, 0.02, vz], [0, 0, 0], [1, 1, 1], mat(M.plastic, { color: [0.36, 0.58, 0.28] }));
        const fl = [vx + 0.01 * Math.sin(2), 0.45, vz + 0.02];
        for (let k = 0; k < 6; k++) api.mesh('hl:petal', petalGeo, fl, [0, k * 60 + (k % 2) * 15, 0], [0.16, 0.17, 0.16], mat(M.plastic, { color: k % 2 ? [1.0, 0.66, 0.74] : [0.98, 0.52, 0.64], spec: 0.35, shin: 40, rim: 0.2 }));
        api.mesh('hl:tleaf', () => G.surface((u, v) => { const s = v * 2 - 1, w = 0.06 * Math.sin(Math.PI * u) + 0.004; return [s * w, u * 0.34, 0.08 * u * u - 0.02 * s * s]; }, 16, 6), [vx + 0.004, 0.36, vz + 0.006], [0, 120, 0], [0.55, 0.55, 0.55], mat(M.plastic, { color: [0.4, 0.62, 0.32] }));
        K.shadow(api, vx, vz, 0.22, 0.22, 0, 0.35);

        /* --- 封筒（ハートの封蝋）。机に1通だけ平らに置く --- */
        api.box([ENV.x, 0.004, ENV.z], [0, ENV.yaw, 0], [0.44, 0.006, 0.3], mat(M.matte, { tex: tex.envelope, face: S.FACE.TOP, edge: [0.96, 0.92, 0.88], sharp: true }));
        K.shadow(api, ENV.x, ENV.z, 0.5, 0.36, ENV.yaw, 0.25);

        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        stand.shadow(api, P);
        api.blend(true);
        api.lathe('hl:vase', [[0, 0.004], [0.3, 0.004], [0.34, 0.04, 1], [0.4, 0.3], [0.36, 0.56], [0.16, 0.8], [0.13, 0.98], [0.16, 1.0]], [vx, 0, vz], [0, 0, 0], [vs, vs, vs],
          mat(M.glass, { color: [0.9, 0.96, 0.98], alpha: 0.4 }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();
    E.drawVignette(ctx, W, H, 0.1);
    E.drawGrain(ctx, W, H, 0.02, 130, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const S = 128, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#f8e4e8'; x.fillRect(0, 0, S, S);
    const fl = (cx, cy) => { x.fillStyle = '#f2b8c6'; for (let k = 0; k < 5; k++) { const a = k / 5 * 7; x.beginPath(); x.arc(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, 6, 0, 7); x.fill(); } x.fillStyle = '#fbe6a8'; x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill(); };
    fl(32, 32); fl(96, 96);
    T.wall = c;
  }
  T.table = woodTex(E, 101, [232, 214, 188], 5);
  // 封筒：生成りの紙、ふたの三角の線、赤いハートの封蝋
  {
    const Wd = 440, Ht = 300, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbf4ea'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = 'rgba(180,150,130,0.6)'; x.lineWidth = 4;
    x.beginPath(); x.moveTo(8, 8); x.lineTo(Wd / 2, Ht * 0.58); x.lineTo(Wd - 8, 8); x.stroke();
    x.strokeRect(4, 4, Wd - 8, Ht - 8);
    x.fillStyle = '#c0283a';
    const hx = Wd / 2, hy = Ht * 0.56, r = 30;
    x.beginPath(); x.arc(hx, hy, r + 8, 0, 7); x.fill();
    x.fillStyle = '#e04858';
    x.beginPath(); x.moveTo(hx, hy + r * 0.7);
    x.bezierCurveTo(hx - r * 1.2, hy - r * 0.1, hx - r * 0.5, hy - r * 0.9, hx, hy - r * 0.3);
    x.bezierCurveTo(hx + r * 0.5, hy - r * 0.9, hx + r * 1.2, hy - r * 0.1, hx, hy + r * 0.7); x.fill();
    T.envelope = c;
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
