/* =========================================================================
 *  10/24 文鳥の日（「手(10)に幸せ(24)」の語呂から。手のりの文鳥にちなむ）
 *  日当たりのよい窓辺。レモン色の壁、白木の台。
 *  主役は右奥の真鍮の丸い鳥かご（丸い台・縦の格子・ドーム屋根・つり輪）の中、止まり木の桜文鳥。
 *  右手前に白い陶器の文鳥の置物。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'java-sparrow-day',
  title: '文鳥の日',
  dayName: 'Java Sparrow Day',
  caption: { fill: '#ffffff', outline: '#c0485a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fffcf2', ink: '#3a2a26', accent: '#d04a5a', back: '#ece4cc', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.16, z: 0.12, yaw: 10 };
    const CAGE = { x: 0.56, z: -0.86 };
    const FIG = { x: 0.52, z: -0.02, yaw: 150 };
    const CAL = { x: -0.72, z: -0.74, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.5, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const BRASS = mat(M.gold, { color: [0.88, 0.72, 0.42] });

    /* 文鳥（+x が頭）：胴は卵形、頭は丸、太い円すいのくちばし、尾は平たい曲面 */
    const bird = (api, pos, yaw, s, cols) => {
      const L = local(pos[0], pos[2], yaw, s, pos[1]);
      api.sphere(L(0, 0.2, 0), [0, yaw, -20], [0.46 * s, 0.34 * s, 0.32 * s], mat(M.matte, { color: cols.body, spec: 0.2, shin: 20, rim: 0.2 }));
      api.sphere(L(0.02, 0.1, 0), [0, yaw, -10], [0.34 * s, 0.2 * s, 0.26 * s], mat(M.matte, { color: cols.belly, spec: 0.15 }));
      api.sphere(L(0.17, 0.35, 0), [0, yaw, 0], [0.25 * s, 0.25 * s, 0.25 * s], mat(M.matte, { tex: cols.head, spec: 0.2, rim: 0.2 }));
      api.lathe('bd:beak', [[0, 0], [0.5, 0], [0.4, 0.6], [0, 1]], L(0.28, 0.33, 0), [0, yaw, -90], [0.12 * s, 0.13 * s, 0.1 * s], mat(M.plastic, { color: cols.beak, spec: 0.5 }));
      api.mesh('bd:tail', () => G.surface((u, v) => [-u * 0.2, -u * 0.06 + 0.02 * Math.sin(u * 3), (v - 0.5) * (0.1 + 0.05 * u)], 8, 4), L(-0.16, 0.2, 0), [0, yaw, 0], [s, s, s], mat(M.matte, { color: cols.tail }));
    };
    const JAVA = { body: [0.56, 0.58, 0.62], belly: [0.84, 0.74, 0.72], beak: [0.95, 0.42, 0.46], tail: [0.2, 0.2, 0.22] };
    const WHITE = { body: [0.97, 0.96, 0.94], belly: [0.98, 0.97, 0.95], beak: [0.95, 0.5, 0.52], tail: [0.92, 0.92, 0.9] };

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.98, 0.94, 0.78], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.08, 1.06, 1.0],
      sky: [1.02, 1.02, 0.98], ground: [0.72, 0.66, 0.56], envTop: [1.04, 1.04, 1.0], envBot: [0.5, 0.44, 0.36],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [6, 2], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.7, 0.62, 0.5], uvScale: [2, 1] }));

        /* --- 鳥かご --- */
        const cx = CAGE.x, cz = CAGE.z, R = 0.3, Hc = 0.62;
        api.lathe('bd:cbase', [[0, 0], [0.5, 0], [0.52, 0.02, 1], [0.52, 0.1, 1], [0.48, 0.12], [0, 0.12]], [cx, 0, cz], [0, 0, 0], [R * 2.1, 0.5, R * 2.1], mat(M.wood, { color: [0.95, 0.93, 0.88], spec: 0.3 }));
        const N = 20;
        for (let i = 0; i < N; i++) {
          const a = i / N * Math.PI * 2;
          api.mesh('bd:bar' + i, () => G.tube((t) => {
            // 柱：まっすぐ上がって、上でドームに沿って中心へ曲がる
            if (t < 0.7) return [Math.sin(a) * R, 0.06 + t / 0.7 * Hc, Math.cos(a) * R];
            const f = (t - 0.7) / 0.3 * Math.PI / 2;
            return [Math.sin(a) * R * Math.cos(f), 0.06 + Hc + Math.sin(f) * R * 0.7, Math.cos(a) * R * Math.cos(f)];
          }, () => 0.006, 40, 6, false), [cx, 0, cz], [0, 0, 0], [1, 1, 1], BRASS);
        }
        for (const hy of [0.12, 0.06 + Hc]) api.mesh('bd:ring' + hy, () => G.tube((t) => [Math.sin(t * Math.PI * 2) * R, hy, Math.cos(t * Math.PI * 2) * R], () => 0.011, 80, 8, false), [cx, 0, cz], [0, 0, 0], [1, 1, 1], BRASS);
        api.lathe('bd:knob', [[0, 0], [0.4, 0.2], [0.5, 0.5], [0.3, 0.8], [0, 1]], [cx, 0.06 + Hc + R * 0.7 - 0.01, cz], [0, 0, 0], [0.06, 0.06, 0.06], BRASS);
        api.mesh('bd:hang', () => G.tube((t) => [Math.sin(t * Math.PI * 2) * 0.06, 0.06 + Math.cos(t * Math.PI * 2) * 0.06, 0], () => 0.008, 40, 8, false), [cx, 0.06 + Hc + R * 0.7 + 0.04, cz], [0, 20, 0], [1, 1, 1], BRASS);
        // 止まり木と文鳥
        api.cylinder([cx, 0.3, cz], [0, 70, 90], [0.03, R * 1.96, 0.03], mat(M.wood, { color: [0.7, 0.5, 0.3] }));
        bird(api, [cx + 0.01, 0.315, cz], -60, 0.5, Object.assign({ head: tex.javaHead }, JAVA));
        K.shadow(api, cx, cz, 0.74, 0.74, 0, 0.45);

        /* --- 陶器の白文鳥の置物 --- */
        bird(api, [FIG.x, 0, FIG.z], FIG.yaw, 0.46, Object.assign({ head: tex.whiteHead }, WHITE));
        K.shadow(api, FIG.x, FIG.z, 0.26, 0.2, FIG.yaw, 0.45);

        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();
    E.drawVignette(ctx, W, H, 0.1);
    E.drawGrain(ctx, W, H, 0.02, 124, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#f5e7a8'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,0.3)'; for (const [a, b] of [[32, 32], [96, 96]]) { x.beginPath(); x.arc(a, b, 8, 0, 7); x.fill(); }
    T.wall = c;
  }
  T.table = woodTex(E, 71, [226, 206, 170], 5);
  // 頭：球の u は経度（u=0 が +z 向き）、v は下→上。黒い頭に白いほほ、赤い目のふち
  const head = (cap, cheek, eyeRing) => {
    const Wd = 256, Ht = 128, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = cap; x.fillRect(0, 0, Wd, Ht);
    // ほほ：頭の左右（u=0.25 と 0.75 付近は ±x。+x が前なので、ほほは ±z 側＝u≒0 と 0.5）
    for (const uc of [0, 0.5, 1]) {
      x.fillStyle = cheek; x.beginPath(); x.ellipse(uc * Wd, Ht * 0.62, 34, 26, 0, 0, 7); x.fill();
      x.fillStyle = eyeRing; x.beginPath(); x.arc(uc * Wd + (uc === 0.5 ? -24 : 24) * (uc === 1 ? -1 : 1), Ht * 0.38, 9, 0, 7); x.fill();
      x.fillStyle = '#111'; x.beginPath(); x.arc(uc * Wd + (uc === 0.5 ? -24 : 24) * (uc === 1 ? -1 : 1), Ht * 0.38, 5, 0, 7); x.fill();
    }
    return c;
  };
  T.javaHead = head('#1e1e22', '#f7f6f2', '#e0485a');
  T.whiteHead = head('#f7f6f2', '#f7f6f2', '#e0485a');
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
