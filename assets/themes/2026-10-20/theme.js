/* =========================================================================
 *  10/20 リサイクルの日（ごみを減らし、資源をもう一度めぐらせることを考える日）
 *  明るいキッチンの一角。白いタイル壁、木の台。主役は右奥の緑の分別ごみ箱（ふた・リサイクルマーク）。
 *  右手前に洗って並べたガラス瓶3本。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'recycling-day',
  title: 'リサイクルの日',
  dayName: 'Recycling Day',
  caption: { fill: '#ffffff', outline: '#2b7a4a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f8fbf6', ink: '#1f2f24', accent: '#2b8a52', back: '#dfe8dc', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.08, z: 0.12, yaw: 12 };
    const BIN = { x: 0.6, z: -0.95, yaw: -20 };
    const BOTTLES = [
      { x: 0.36, z: -0.22, h: 0.5, c: [0.3, 0.62, 0.4], key: 'wine' },
      { x: 0.54, z: -0.3, h: 0.4, c: [0.36, 0.5, 0.78], key: 'milk' },
      { x: 0.66, z: -0.12, h: 0.34, c: [0.62, 0.4, 0.22], key: 'jar' }
    ];
    const CAL = { x: -0.74, z: -0.76, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.47, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    const PROF = {
      wine: [[0, 0.004], [0.36, 0.004], [0.4, 0.03, 1], [0.4, 0.56], [0.36, 0.64], [0.2, 0.74], [0.14, 0.8], [0.13, 0.96], [0.15, 0.97], [0.15, 1.0], [0.11, 1.0]],
      milk: [[0, 0.004], [0.4, 0.004], [0.44, 0.03, 1], [0.44, 0.5], [0.4, 0.62], [0.3, 0.8], [0.28, 0.9], [0.32, 0.93], [0.32, 1.0], [0.26, 1.0]],
      jar: [[0, 0.004], [0.46, 0.004], [0.5, 0.04, 1], [0.5, 0.78], [0.44, 0.86], [0.4, 0.88], [0.4, 1.0], [0.36, 1.0]]
    };

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.94, 0.95, 0.94], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.05, 1.02],
      sky: [1.02, 1.02, 1.02], ground: [0.66, 0.62, 0.56], envTop: [1.04, 1.04, 1.04], envBot: [0.46, 0.44, 0.4],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [12, 4.4], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.6, 0.48, 0.34], uvScale: [2, 1] }));

        /* --- 分別ごみ箱（ややすぼまった角筒・ふたと取っ手・正面にマーク） --- */
        const L = local(BIN.x, BIN.z, BIN.yaw, 1), by = BIN.yaw;
        const GREEN = mat(M.plastic, { color: [0.24, 0.6, 0.38], spec: 0.4, shin: 50 });
        const bw = 0.5, bd = 0.42, bh = 0.62;
        api.mesh('rc:bin', () => G.surface((u, v) => {
          // 角の丸い四角の断面を下から上へ。上ほど少し広い
          const a = u * Math.PI * 2, e = 0.25, sp = (w) => Math.sign(w) * Math.pow(Math.abs(w), e);
          const k = 0.9 + 0.1 * v;
          return [sp(Math.sin(a)) * 0.5 * k, v, sp(Math.cos(a)) * 0.5 * k];
        }, 64, 8), L(0, 0, 0), [0, by, 0], [bw, bh, bd], GREEN);
        api.rbox(L(0, bh + 0.03, 0), [0, by, 0], [bw * 1.04, 0.06, bd * 1.04], mat(GREEN, { color: [0.2, 0.52, 0.32], round: 0.2 }));
        api.rbox(L(0, bh + 0.075, 0), [0, by, 0], [0.18, 0.03, 0.06], mat(M.plastic, { color: [0.16, 0.4, 0.26], round: 0.4 }));
        api.panel(L(0, bh * 0.5, bd * 0.5 * 0.95 + 0.003), [-1.5, by, 0], [0.3, 0.3], { tex: tex.mark, spec: 0.2, sharp: true });
        K.shadow(api, BIN.x, BIN.z, 0.66, 0.56, by, 0.45);

        /* --- ガラス瓶3本（色つきの半透明。中身は空） --- */
        for (const b of BOTTLES) K.shadow(api, b.x, b.z, b.h * 0.5, b.h * 0.5, 0, 0.3);

        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        stand.shadow(api, P);
        api.blend(true);
        // 瓶はアクスタより右（重ならない）。奥から順に
        for (const b of [...BOTTLES].sort((p, q) => p.z - q.z)) {
          api.lathe('rc:' + b.key, PROF[b.key], [b.x, 0, b.z], [0, 0, 0], [b.h * 0.5, b.h, b.h * 0.5], mat(M.glass, { color: b.c, alpha: 0.5, spec: 1.0, shin: 160, rim: 0.6 }));
        }
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();
    E.drawVignette(ctx, W, H, 0.1);
    E.drawGrain(ctx, W, H, 0.02, 120, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 白いタイル（1枚＝1タイル。目地は淡いグレー）
  {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = '#c9cfcc'; x.fillRect(0, 0, 64, 64);
    x.fillStyle = '#f5f7f5'; x.fillRect(2, 2, 60, 60);
    T.wall = c;
  }
  T.table = woodTex(E, 53, [200, 160, 112], 5);
  // リサイクルマーク：白い丸に、緑の3つの矢印の三角形
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill();
    x.strokeStyle = '#2b8a52'; x.lineWidth = 22; x.lineJoin = 'round'; x.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const a0 = -Math.PI / 2 + k * Math.PI * 2 / 3, a1 = a0 + Math.PI * 2 / 3 - 0.55;
      const p = (a, r) => [128 + Math.cos(a) * r, 136 + Math.sin(a) * r];
      const [x0, y0] = p(a0 + 0.3, 72), [x1, y1] = p(a1, 72);
      x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
      // 矢じり
      const ang = Math.atan2(y1 - y0, x1 - x0);
      x.fillStyle = '#2b8a52'; x.beginPath();
      x.moveTo(x1 + Math.cos(ang) * 26, y1 + Math.sin(ang) * 26);
      x.lineTo(x1 + Math.cos(ang + 2.3) * 26, y1 + Math.sin(ang + 2.3) * 26);
      x.lineTo(x1 + Math.cos(ang - 2.3) * 26, y1 + Math.sin(ang - 2.3) * 26); x.fill();
    }
    T.mark = c;
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
