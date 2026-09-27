/* =========================================================================
 *  10/21 あかりの日（1879年のこの日、エジソンが実用的な白熱電球を完成させた）
 *  落ち着いた書斎。生成りの縦じまの壁紙、ウォルナットの机。
 *  主役は右奥の、木の台座のソケットに立てた大きなエジソン電球（ガラス球の中にフィラメント）。
 *  右奥に真鍮の燭台とろうそく。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'light-day',
  title: 'あかりの日',
  dayName: 'Light Day',
  caption: { fill: '#fff8e8', outline: '#7a4a1a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf5e6', ink: '#3a2a18', accent: '#b8742a', back: '#e6d8bc', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.14, z: 0.12, yaw: 10 };
    const BULB = { x: 0.42, z: -0.5 };
    const LAMP = { x: 0.84, z: -1.3 };
    const CAL = { x: -0.72, z: -0.74, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.5, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const BRASS = mat(M.gold, { color: [0.86, 0.68, 0.38] });
    const GLASS = mat(M.glass, { color: [0.92, 0.9, 0.84], alpha: 0.5, rim: 0.9 });

    // 電球のガラス（首が細く、先が丸い）。高さ1あたり
    const bulbProf = [[0.14, 0], [0.15, 0.08]];
    for (let i = 0; i <= 16; i++) { const t = i / 16; bulbProf.push([0.15 + 0.25 * Math.sin(Math.min(1, t * 1.6) * Math.PI / 2), 0.08 + 0.5 * t]); }
    for (let i = 1; i <= 14; i++) { const f = i / 14 * Math.PI / 2; bulbProf.push([0.4 * Math.cos(f), 0.58 + 0.42 * Math.sin(f)]); }
    // 口金（ねじ山を波で）
    const capProf = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; capProf.push([0.145 + 0.012 * Math.sin(t * Math.PI * 10), -0.16 + 0.16 * t]); }
    capProf.unshift([0, -0.2], [0.07, -0.2], [0.1, -0.17, 1]);
    // フィラメント：支柱の間をジグザグに
    const filGeo = () => G.tube((t) => { const k = t * 6; const z = Math.sin(k * Math.PI) * 0.1; return [(t - 0.5) * 0.3, 0.6 + 0.06 * Math.abs(Math.sin(k * Math.PI * 0.5)), z]; }, () => 0.006, 96, 6, true);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.9, 0.86, 0.78], ambient: 0.55, light: [0.42, 0.86, 0.55], lightCol: [1.08, 1.05, 0.98],
      sky: [1.02, 1.0, 0.95], ground: [0.6, 0.5, 0.4], envTop: [1.04, 1.0, 0.92], envBot: [0.4, 0.32, 0.24],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [8, 1], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.3, 0.2, 0.14], uvScale: [2, 1] }));

        /* --- 電球の台座とソケット --- */
        const bx = BULB.x, bz = BULB.z, bs = 0.64;
        api.rbox([bx, 0.05, bz], [0, -18, 0], [0.4, 0.1, 0.4], mat(M.wood, { color: [0.42, 0.26, 0.14], round: 0.2 }));
        api.lathe('lt:socket', [[0, 0], [0.5, 0], [0.5, 0.7, 1], [0.44, 0.8], [0.44, 1], [0, 1]], [bx, 0.1, bz], [0, 0, 0], [0.2, 0.12, 0.2], mat(M.plastic, { color: [0.14, 0.13, 0.12], spec: 0.5 }));
        const by = 0.22 + 0.2 * bs;
        api.lathe('lt:cap', capProf, [bx, by, bz], [0, 0, 0], [bs, bs, bs], BRASS);
        // 中の支柱（ガラスの茎）とフィラメント
        for (const sx of [-0.15, 0.15]) api.mesh('lt:wire' + sx, () => G.tube((t) => [sx * t, 0.46 + t * 0.14, 0], () => 0.005, 8, 6, true), [bx, by, bz], [0, 0, 0], [bs, bs, bs], mat(M.metal, { color: [0.7, 0.7, 0.7] }));
        api.mesh('lt:fil', filGeo, [bx, by, bz], [0, 0, 0], [bs, bs, bs], mat(M.metal, { color: [1.0, 0.72, 0.36], spec: 0.8, rim: 0.4 }));
        K.shadow(api, bx, bz, 0.5, 0.5, -18, 0.45);

        /* --- 真鍮の燭台（受け皿・柱・ろうそく） --- */
        const lx = LAMP.x, lz = LAMP.z, ls = 0.62;
        api.lathe('lt:holder', [[0, 0], [0.34, 0], [0.36, 0.03, 1], [0.3, 0.06], [0.1, 0.1], [0.08, 0.16], [0.1, 0.2], [0.07, 0.26], [0.07, 0.46], [0.11, 0.5],
          [0.2, 0.52], [0.21, 0.55, 1], [0.12, 0.55], [0.1, 0.6], [0, 0.6]], [lx, 0, lz], [0, 0, 0], [ls, ls, ls], BRASS);
        api.lathe('lt:candle', [[0, 0.58], [0.085, 0.58], [0.085, 1.02], [0.07, 1.04], [0, 1.04]], [lx, 0, lz], [0, 0, 0], [ls, ls, ls], mat(M.matte, { color: [0.97, 0.95, 0.9], spec: 0.2 }));
        api.lathe('lt:wick', [[0, 1.03], [0.01, 1.03], [0.01, 1.08], [0, 1.08]], [lx, 0, lz], [0, 0, 0], [ls, ls, ls], mat(M.matte, { color: [0.2, 0.16, 0.12] }));
        K.shadow(api, lx, lz, 0.4, 0.4, 0, 0.45);

        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        stand.shadow(api, P);
        api.blend(true);
        // 電球のガラス（アクスタとは重ならない）
        api.lathe('lt:stem', [[0, 0], [0.04, 0], [0.02, 0.3], [0.012, 0.46], [0, 0.47]], [bx, by, bz], [0, 0, 0], [bs, bs, bs], mat(M.glass, { color: [0.9, 0.92, 0.9], alpha: 0.35 }));
        api.lathe('lt:bulb', bulbProf, [bx, by, bz], [0, 0, 0], [bs, bs, bs], GLASS);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();
    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.022, 121, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 64), x = c.getContext('2d');
    x.fillStyle = '#eadcc0'; x.fillRect(0, 0, 128, 64);
    x.fillStyle = '#e0cfae'; x.fillRect(0, 0, 40, 64);
    x.fillStyle = 'rgba(180,140,80,0.25)'; x.fillRect(58, 0, 6, 64);
    T.wall = c;
  }
  T.table = woodTex(E, 59, [104, 70, 46], 4);
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
