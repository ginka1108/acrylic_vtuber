/* =========================================================================
 *  10/15 人形の日（人形に感謝し、人形を愛する心を伝える日）
 *  和室。障子の壁、濃い色の座卓。主役は右奥に並べた大中小3体のこけし（頭・胴・描き彩色）。
 *  右手前に手まり。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'doll-day',
  title: '人形の日',
  dayName: 'Doll Day',
  caption: { fill: '#fffaf0', outline: '#8a2c3a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf6ea', ink: '#3a2a22', accent: '#b8323c', back: '#e6dcc6', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'shoji'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.2, z: 0.12, yaw: 10 };
    const DOLLS = [
      { x: 0.26, z: -1.0, h: 0.62, body: 'bodyA', ry: -18 },
      { x: 0.56, z: -0.86, h: 0.86, body: 'bodyB', ry: -24 },
      { x: 0.82, z: -0.62, h: 0.5, body: 'bodyC', ry: -30 }
    ];
    const BALL = { x: 0.5, z: 0.12 };
    const CAL = { x: -0.78, z: -0.66, yaw: 20 };
    const eye = [0.14, 1.3, 2.75], at = [-0.02, 0.48, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    // こけしの胴（高さ1あたり。裾が少し広がり、肩で丸く絞る）と頭（少し横長の球）
    const bodyProf = [[0, 0], [0.2, 0], [0.215, 0.012, 1], [0.21, 0.04], [0.19, 0.25], [0.18, 0.5], [0.185, 0.64], [0.175, 0.7], [0.14, 0.73], [0.08, 0.745], [0, 0.75]];
    const headProf = [];
    for (let i = 0; i <= 20; i++) { const f = -Math.PI / 2 + Math.PI * i / 20; headProf.push([Math.max(0, 0.22 * Math.cos(f)), 0.2 + 0.2 * Math.sin(f)]); }
    const WOOD = mat(M.wood, { color: [0.98, 0.9, 0.74] });
    const doll = (api, d) => {
      const s = d.h;
      api.lathe('dl:' + d.body, bodyProf, [d.x, 0, d.z], [0, d.ry + 180, 0], [s, s, s], mat(M.wood, { tex: tex[d.body], spec: 0.25, shin: 40 }));
      api.lathe('dl:head', headProf, [d.x, 0.7 * s, d.z], [0, d.ry + 180, 0], [s * 1.05, s, s], mat(M.wood, { tex: tex.head, spec: 0.25, shin: 40 }));
      K.shadow(api, d.x, d.z, 0.3 * s + 0.1, 0.3 * s + 0.1, 0, 0.5);
    };

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.94, 0.92, 0.86], ambient: 0.56, light: [0.4, 0.86, 0.55], lightCol: [1.06, 1.04, 1.0],
      sky: [1.02, 1.01, 0.98], ground: [0.62, 0.52, 0.42], envTop: [1.02, 1.0, 0.96], envBot: [0.42, 0.34, 0.28],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* 障子（組子の格子）と鴨居 */
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.shoji, uvScale: [6, 2.2], unlit: true });
        api.box([0, 3.2, -2.96], [0, 0, 0], [12, 0.14, 0.1], mat(M.wood, { color: [0.5, 0.34, 0.2] }));
        /* 座卓（濃い色） */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.3, 0.18, 0.1], uvScale: [2, 1] }));

        /* --- こけし3体 --- */
        for (const d of DOLLS) doll(api, d);

        /* --- 手まり（赤地に色糸の帯。球に帯を巻く） --- */
        const bs = 0.26;
        api.sphere([BALL.x, bs / 2, BALL.z], [0, 30, 0], [bs, bs, bs], mat(M.matte, { tex: tex.temari, spec: 0.15, shin: 20, rim: 0.1 }));
        K.shadow(api, BALL.x, BALL.z, 0.3, 0.3, 0, 0.5);

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
    E.drawGrain(ctx, W, H, 0.022, 115, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 障子：白い和紙に木の組子（粗い格子）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#f6f1e4'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#b89468';
    for (let i = 0; i < S; i += 64) x.fillRect(i, 0, 8, S);
    for (let j = 0; j < S; j += 86) x.fillRect(0, j, S, 8);
    T.shoji = c;
  }
  T.table = woodTex(E, 29, [96, 56, 32], 4);
  // こけしの頭：おかっぱの黒髪（上半分と後ろ）、赤い髪飾り、顔（u=0.5 が正面）
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f7e6c8'; x.fillRect(0, 0, Wd, Ht);
    // 髪：v（上=1）→ キャンバス上。正面の額は短く、横と後ろは長く
    x.fillStyle = '#1e1a1c';
    x.beginPath(); x.moveTo(0, 0); x.lineTo(Wd, 0); x.lineTo(Wd, Ht * 0.7);
    x.lineTo(Wd * 0.7, Ht * 0.7); x.quadraticCurveTo(Wd * 0.66, Ht * 0.34, Wd * 0.5, Ht * 0.34); x.quadraticCurveTo(Wd * 0.34, Ht * 0.34, Wd * 0.3, Ht * 0.7);
    x.lineTo(0, Ht * 0.7); x.fill();
    // 髪飾り（赤い花）を左右に
    for (const hx of [Wd * 0.28, Wd * 0.72]) { x.fillStyle = '#d23a3a'; for (let k = 0; k < 5; k++) { const a = k / 5 * 7; x.beginPath(); x.arc(hx + Math.cos(a) * 12, Ht * 0.3 + Math.sin(a) * 12, 9, 0, 7); x.fill(); } x.fillStyle = '#f5c040'; x.beginPath(); x.arc(hx, Ht * 0.3, 6, 0, 7); x.fill(); }
    // 顔：細い弓なりの目、小さな赤い口、ほお紅
    x.strokeStyle = '#1e1a1c'; x.lineWidth = 5; x.lineCap = 'round';
    for (const ex of [Wd * 0.46, Wd * 0.54]) { x.beginPath(); x.arc(ex, Ht * 0.47, 10, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }
    x.beginPath(); x.moveTo(Wd * 0.44, Ht * 0.4); x.quadraticCurveTo(Wd * 0.46, Ht * 0.38, Wd * 0.48, Ht * 0.4); x.stroke();
    x.beginPath(); x.moveTo(Wd * 0.52, Ht * 0.4); x.quadraticCurveTo(Wd * 0.54, Ht * 0.38, Wd * 0.56, Ht * 0.4); x.stroke();
    x.fillStyle = '#d23a3a'; x.beginPath(); x.ellipse(Wd * 0.5, Ht * 0.6, 7, 5, 0, 0, 7); x.fill();
    x.fillStyle = 'rgba(240,120,120,0.35)'; for (const ex of [Wd * 0.43, Wd * 0.57]) { x.beginPath(); x.arc(ex, Ht * 0.56, 12, 0, 7); x.fill(); }
    // 首の赤い線
    x.fillStyle = '#c23a3a'; x.fillRect(0, Ht * 0.96, Wd, Ht * 0.04);
        T.head = c;
  }
  // 胴：3種類（赤い菊、青い花、黄色の縞＋梅）
  const body = (base, draw) => {
    const Wd = 512, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f5e2bf'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = base; x.fillRect(0, Ht * 0.08, Wd, Ht * 0.8);
    draw(x, Wd, Ht);
    x.fillStyle = '#3a2a1e'; x.fillRect(0, Ht * 0.06, Wd, 10); x.fillRect(0, Ht * 0.88, Wd, 10);
        return c;
  };
  const flower = (x, cx, cy, r, c1, c2) => {
    x.fillStyle = c1;
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; x.beginPath(); x.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.42, r * 0.2, a, 0, 7); x.fill(); }
    x.fillStyle = c2; x.beginPath(); x.arc(cx, cy, r * 0.22, 0, 7); x.fill();
  };
  T.bodyA = body('#c83a3a', (x, Wd, Ht) => { for (const [fx, fy] of [[0.5, 0.35], [0.5, 0.7], [0.0, 0.5], [1.0, 0.5], [0.25, 0.55], [0.75, 0.3]]) flower(x, fx * Wd, fy * Ht, 70, '#f7e7c2', '#f2b83a'); });
  T.bodyB = body('#2f4f8a', (x, Wd, Ht) => { for (const [fx, fy] of [[0.5, 0.45], [0.2, 0.25], [0.8, 0.7], [0.0, 0.7], [1.0, 0.25]]) flower(x, fx * Wd, fy * Ht, 64, '#f0a0b0', '#f7e7c2'); x.fillStyle = '#6a8a4a'; x.fillRect(0, Ht * 0.8, Wd, 16); });
  T.bodyC = body('#e8b640', (x, Wd, Ht) => { x.fillStyle = '#c0412e'; for (let i = 0; i < 4; i++) x.fillRect(0, Ht * (0.2 + i * 0.17), Wd, 18); for (const [fx, fy] of [[0.5, 0.52], [0.0, 0.52]]) flower(x, fx * Wd, fy * Ht, 50, '#f7e7c2', '#c0412e'); });
  // 手まり：赤地に、赤道の白い帯と、上下から色糸の三角模様
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#c82e3a'; x.fillRect(0, 0, Wd, Ht);
    const cols = ['#f4d24a', '#3a7ac8', '#f7f0e0', '#4aa06a'];
    for (let i = 0; i < 8; i++) {
      x.fillStyle = cols[i % 4];
      const cx = (i + 0.5) / 8 * Wd;
      x.beginPath(); x.moveTo(cx - 28, 0); x.lineTo(cx + 28, 0); x.lineTo(cx, Ht * 0.44); x.fill();
      x.beginPath(); x.moveTo(cx - 28, Ht); x.lineTo(cx + 28, Ht); x.lineTo(cx, Ht * 0.56); x.fill();
    }
    x.fillStyle = '#f7f0e0'; x.fillRect(0, Ht * 0.47, Wd, Ht * 0.06);
    T.temari = c;
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
