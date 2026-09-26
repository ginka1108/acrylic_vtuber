/* =========================================================================
 *  10/06 夢をかなえる日
 *  雲柄の壁紙の部屋の机。小さな気球の置物、星の折り紙を詰めた願いごとの瓶、
 *  金のトロフィー、卓上カレンダーの横にアクスタを置く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'dream-day',
  title: '夢をかなえる日',
  dayName: 'Dream Day',
  caption: { fill: '#ffffff', outline: '#54478a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf8ff', ink: '#54478a', accent: '#e07a9a', back: '#e6def5', grain: 0.05 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['desk', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: 0.0, z: 0.04, yaw: -12 };             // アクスタ（右へ振る）
    const BALLOON = { x: -0.78, z: -1.7 };                // 気球の置物（左奥）
    const CAL = { x: -0.5, z: -0.5, yaw: 18 };           // 卓上カレンダー（左）
    const JAR = { x: 0.72, z: -0.22 };                      // 願いごとの瓶（右手前）
    const CUP = { x: 0.62, z: -1.5 };                    // トロフィー（右奥）
    const eye = [-0.18, 1.3, 2.75], at = [0.02, 0.5, -0.12];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    /* ---------- 形 ---------- */
    // 気球：しずく形の球皮（下がすぼまる）、ゴンドラ（籐のかご）
    const envelope = [[0, 0.02], [0.08, 0]];
    for (let i = 1; i <= 28; i++) {                      // 下はすぼまり、上は丸いしずく形
      const f = -Math.PI / 2 + Math.PI * i / 28, lo = f < 0 ? Math.pow(-Math.sin(f), 1.6) : 0;
      envelope.push([Math.max(0.08 * (1 - i / 28), 0.5 * Math.cos(f) * (1 - 0.72 * lo)), 0.6 + 0.42 * Math.sin(f) * (f < 0 ? 1.43 : 1)]);
    }
    const basket = [[0, 0], [0.4, 0], [0.43, 0.02], [0.5, 0.5], [0.52, 0.56], [0.5, 0.6], [0.46, 0.56], [0.44, 0.1], [0, 0.08]];
    // 瓶（ガラス）とコルク
    const jarProf = [[0, 0.004], [0.4, 0.004], [0.44, 0, 1], [0.47, 0.03], [0.48, 0.2], [0.48, 0.78], [0.42, 0.88], [0.34, 0.92], [0.33, 1.0], [0.3, 1.0], [0.31, 0.92], [0.4, 0.87], [0.455, 0.78], [0.455, 0.2], [0.44, 0.05], [0, 0.04]];
    const corkProf = [[0, 0], [0.29, 0], [0.3, 0.04], [0.33, 0.16], [0.34, 0.2], [0.32, 0.22], [0, 0.22]];
    // トロフィー：台座・脚・カップ・左右の取っ手
    const cupProf = [[0, 0], [0.34, 0], [0.34, 0.08, 1], [0.3, 0.1], [0.22, 0.1], [0.2, 0.14, 1], [0.1, 0.18], [0.07, 0.3], [0.06, 0.42], [0.1, 0.46],
      [0.12, 0.5], [0.22, 0.56], [0.3, 0.66], [0.34, 0.8], [0.36, 0.94], [0.38, 0.96], [0.35, 0.97], [0.33, 0.94], [0.3, 0.8], [0.2, 0.62], [0, 0.58]];
    // ぷっくりした星（折り紙のラッキースター）
    const starGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, ph = (v - 0.5) * Math.PI;
      const r = 0.2 + 0.3 * Math.pow((Math.cos(5 * th) + 1) / 2, 3), c = Math.pow(Math.cos(ph), 0.35);
      return [Math.sin(th) * r * c, 0.13 * Math.sin(ph), Math.cos(th) * r * c];
    }, 120, 16);

    // 瓶の中の星：大きめに7つ、ほぼ平らに重ねる
    const stars = [];
    { const r = E.rnd(606), cols = [[0.98, 0.66, 0.74], [0.99, 0.84, 0.42], [0.62, 0.8, 0.98], [0.72, 0.88, 0.62], [0.82, 0.7, 0.96]];
      const at = [[-0.13, 0.08, 0.06], [0.14, 0.08, 0.1], [0.0, 0.08, -0.16], [-0.06, 0.2, 0.14], [0.12, 0.21, -0.06], [-0.13, 0.22, -0.1], [0.02, 0.33, 0.02]];
      at.forEach(([sx, sy, sz], i) => stars.push({ x: sx, y: sy, z: sz, rot: [r() * 24 - 12, r() * 72, r() * 24 - 12], c: cols[i % 5] })); }

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.86, 0.9, 0.98], ambient: 0.58, light: [0.4, 0.86, 0.55], lightCol: [1.1, 1.08, 1.05],
      sky: [1.02, 1.02, 1.06], ground: [0.84, 0.8, 0.8], envTop: [1.05, 1.05, 1.1], envBot: [0.55, 0.5, 0.56],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：雲柄の壁紙 --- */
        api.panel([0, 1.6, -2.8], [0, 0, 0], [12, 5], { tex: tex.wall, uvScale: [3, 1.25], unlit: true });
        /* --- 机（白く塗った木） --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.desk, face: S.FACE.TOP, edge: [0.9, 0.88, 0.9], uvScale: [2, 1] }));

        /* --- 気球の置物 --- */
        const bx = BALLOON.x, bz = BALLOON.z, bs = 0.5;
        const gy = 0.0, ey = 0.3;                      // かごの底・球皮の下端
        api.lathe('dream:basket', basket, [bx, gy, bz], [0, 0, 0], [0.16, 0.16, 0.16], mat(M.matte, { tex: tex.wicker, spec: 0.1 }));
        api.lathe('dream:env', envelope, [bx, ey, bz], [0, 20, 0], [bs, bs, bs], mat(M.plastic, { tex: tex.stripes, spec: 0.3, shin: 40 }));
        // 吊り索（かごの四隅から球皮の口へ）
        const ROPE = mat(M.matte, { color: [0.72, 0.58, 0.42] });
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2 + Math.PI / 4, x0 = Math.sin(a) * 0.075, z0 = Math.cos(a) * 0.075, x1 = Math.sin(a) * 0.08 * bs, z1 = Math.cos(a) * 0.08 * bs;
          api.mesh('dream:rope' + i, () => G.tube((t) => [x0 + (x1 - x0) * t, 0.09 + (ey + 0.02 * bs - 0.09) * t, z0 + (z1 - z0) * t], () => 0.004, 8, 6, false), [bx, 0, bz], [0, 0, 0], [1, 1, 1], ROPE);
        }

        /* --- 金のトロフィー（星のプレート） --- */
        const cs = 0.62;
        api.rbox([CUP.x, 0.06, CUP.z], [0, -20, 0], [0.34, 0.12, 0.34], mat(M.ceramic, { color: [0.36, 0.34, 0.6], round: 0.1 }));
        api.lathe('dream:cup', cupProf, [CUP.x, 0.12, CUP.z], [0, 0, 0], [cs, cs, cs], mat(M.gold, { color: [0.95, 0.76, 0.34] }));
        for (const sg of [-1, 1])
          api.mesh('dream:cupHandle', () => G.tube((t) => { const a = -Math.PI / 2 + t * Math.PI; return [0.33 + Math.cos(a) * 0.14, 0.78 - Math.sin(a) * 0.14 - 0.02, 0]; }, () => 0.025, 24, 10, true),
            [CUP.x, 0.12, CUP.z], [0, sg > 0 ? 0 : 180, 0], [cs, cs, cs], mat(M.gold, { color: [0.95, 0.76, 0.34] }));
        api.mesh('dream:star', starGeo, [CUP.x + 0.06, 0.07, CUP.z + 0.16], [90, -20, 0], [0.12, 0.12, 0.12], mat(M.gold, { color: [0.98, 0.85, 0.45] }));

        /* --- 願いごとの瓶：中の星 → コルク（ガラスは半透明で後から） --- */
        const js = 0.46, jx = JAR.x, jz = JAR.z;
        for (const st of stars)
          api.mesh('dream:star', starGeo, [jx + st.x * js, st.y * js, jz + st.z * js], st.rot, [0.44 * js, 0.44 * js, 0.44 * js], mat(M.matte, { color: st.c, spec: 0.25, shin: 30 }));
        api.lathe('dream:cork', corkProf, [jx, 0.9 * js, jz], [0, 0, 0], [js, js, js], mat(M.matte, { tex: tex.cork }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, bx, bz, 0.26, 0.24, 0, 0.45);
        K.shadow(api, CUP.x, CUP.z, 0.46, 0.44, -20, 0.4);
        K.shadow(api, jx, jz, 0.56, 0.52, 0, 0.4);

        stand.shadow(api, P);
        api.blend(true);
        api.lathe('dream:jar', jarProf, [jx, 0, jz], [0, 0, 0], [js, js, js], mat(M.glass, { color: [0.9, 0.95, 1.0], alpha: 0.3, rim: 1.0, castShadow: false }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.1);
    E.drawGrain(ctx, W, H, 0.02, 106, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 雲柄の壁紙：淡い空色に白いもくもく雲と小さな星
  {
    const S = 1024, c = C(S, S / 2), x = c.getContext('2d'), r = E.rnd(16);
    const g = x.createLinearGradient(0, 0, 0, S / 2);
    g.addColorStop(0, '#cfe3fb'); g.addColorStop(1, '#e3ecfb');
    x.fillStyle = g; x.fillRect(0, 0, S, S / 2);
    const cloud = (cx, cy, s) => {
      x.fillStyle = '#ffffff';
      for (const [dx, dy, rr] of [[0, 0, 1], [-0.9, 0.25, 0.7], [0.9, 0.25, 0.75], [-0.4, -0.3, 0.75], [0.45, -0.25, 0.7]]) { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, rr * s, 0, 7); x.fill(); }
      x.fillRect(cx - 1.5 * s, cy + 0.2 * s, 3 * s, 0.75 * s);
    };
    for (const [cx, cy, s] of [[140, 130, 38], [520, 90, 30], [820, 190, 44], [340, 360, 34], [700, 420, 28], [980, 380, 30]]) cloud(cx, cy, s);
    x.fillStyle = '#fbe39a';
    for (let i = 0; i < 16; i++) {
      const cx = r() * S, cy = r() * S / 2, s = 8 + r() * 6;
      x.beginPath();
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? s * 0.45 : s; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      x.fill();
    }
    T.wall = c;
  }
  // 机：白く塗った木（木目がうっすら透ける）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(26);
    x.fillStyle = '#f4f1ee'; x.fillRect(0, 0, S, S);
    const n = 6, pw = S / n;
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 4; k++) {
        x.strokeStyle = 'rgba(190,170,160,0.16)'; x.lineWidth = 3 + r() * 3;
        const y0 = i * pw + 8 + r() * (pw - 16); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k + i) * 5);
        x.stroke();
      }
      x.fillStyle = 'rgba(160,140,150,0.28)'; x.fillRect(0, i * pw, S, 3);
    }
    T.desk = c;
  }
  // 気球の球皮：縦のパステルストライプ（u=周方向）と、口元の濃い帯
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    const cols = ['#f49ab0', '#fff2d2', '#8ec5ef', '#fff2d2', '#ffd36e', '#fff2d2', '#b7a3e8', '#fff2d2'];
    for (let i = 0; i < 16; i++) { x.fillStyle = cols[i % 8]; x.fillRect(i * Wd / 16, 0, Wd / 16 + 1, Ht); }
    x.fillStyle = '#e86b8a'; x.fillRect(0, Ht * 0.52, Wd, 14);
    x.fillStyle = '#6a5aa8'; x.fillRect(0, Ht - 26, Wd, 26);
    T.stripes = c;
  }
  // 籐のかご
  {
    const c = C(128, 64), x = c.getContext('2d');
    x.fillStyle = '#c99a62'; x.fillRect(0, 0, 128, 64);
    for (let i = 0; i < 128; i += 12) { x.fillStyle = 'rgba(130,90,50,0.35)'; x.fillRect(i, 0, 4, 64); }
    for (let j = 0; j < 64; j += 10) { x.fillStyle = 'rgba(240,210,160,0.35)'; x.fillRect(0, j, 128, 3); }
    T.wicker = c;
  }
  // コルク
  {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = '#c69a6a'; x.fillRect(0, 0, 64, 64);
    E.drawGrain(x, 64, 64, 0.25, 2, 3);
    T.cork = c;
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
