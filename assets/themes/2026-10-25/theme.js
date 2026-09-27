/* =========================================================================
 *  10/25 民間航空記念日（1951年のこの日、戦後初の国内民間航空の定期便が就航した）
 *  空港のラウンジ風。空色の壁に大きな窓の枠、明るい木の机。
 *  主役は右奥の、台座の支柱にのせて少し機首を上げた旅客機の模型（胴体・後退翼・尾翼・エンジン）。
 *  右手前に紙飛行機。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'civil-aviation-day',
  title: '民間航空記念日',
  dayName: 'Civil Aviation Day',
  caption: { fill: '#ffffff', outline: '#1f5a9a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f7fafd', ink: '#1a2a40', accent: '#2a6ac0', back: '#dde4ee', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.14, z: 0.12, yaw: 10 };
    const PLANE = { x: 0.42, z: -1.0, yaw: 22 };
    const PAPER = { x: 0.6, z: -0.3, yaw: 40 };
    const CAL = { x: -0.74, z: -0.76, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.5, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    /* 胴体：x 方向に長さ1（-0.5〜0.5、+x が機首）。半径は機首で丸く、尾で細く上へ */
    const R0 = 0.055;
    const rad = (u) => {
      if (u > 0.88) { const t = (u - 0.88) / 0.12; return R0 * Math.sqrt(Math.max(0, 1 - t * t)); }
      if (u < 0.25) { const t = (0.25 - u) / 0.25; return R0 * (1 - 0.7 * t); }
      return R0;
    };
    const fuseGeo = () => G.surface((u, v) => {
      const a = v * Math.PI * 2, r = rad(u) + 0.0004, lift = u < 0.25 ? (0.25 - u) / 0.25 * 0.03 : 0;
      return [u - 0.5, r * Math.cos(a) + lift, r * Math.sin(a)];
    }, 96, 32, (u, v) => [u, v]);
    // 翼：後退角のある薄い台形（根元 root、先端 tip の弦長）。z 方向へ伸びる
    const wingGeo = (span, root, tip, sweep) => () => G.surface((u, v) => {
      const s = u * span, chord = root + (tip - root) * u, x0 = -sweep * u;
      const th = 0.012 * (1 - 0.6 * u) * Math.sin(v * Math.PI * 2);
      return [x0 - chord * (0.5 - 0.5 * Math.cos(v * Math.PI * 2)), th, s];
    }, 16, 24);
    const WHITE = mat(M.plastic, { color: [0.96, 0.97, 0.98], spec: 0.6, shin: 90 });
    const BLUE = mat(M.plastic, { color: [0.18, 0.4, 0.74], spec: 0.5, shin: 70 });

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.84, 0.92, 0.98], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.05, 1.02],
      sky: [1.0, 1.02, 1.04], ground: [0.66, 0.62, 0.56], envTop: [1.04, 1.06, 1.08], envBot: [0.46, 0.44, 0.42],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.02], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [4, 1], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.62, 0.5, 0.36], uvScale: [2, 1] }));

        /* --- 模型の台座と支柱 --- */
        const px = PLANE.x, pz = PLANE.z, yw = PLANE.yaw, Sc = 1.05;
        api.lathe('av:base', [[0, 0], [0.5, 0], [0.5, 0.2, 1], [0.44, 0.3], [0, 0.3]], [px, 0, pz], [0, 0, 0], [0.34, 0.1, 0.34], mat(M.plastic, { color: [0.18, 0.2, 0.24], spec: 0.6 }));
        api.cylinder([px, 0.2, pz], [0, 0, 0], [0.024, 0.36, 0.024], mat(M.metal, { color: [0.78, 0.8, 0.82] }));
        /* --- 旅客機（機首を少し上げる） --- */
        const L = local(px, pz, yw, Sc, 0.4), rot = [0, yw, 8];
        api.mesh('av:fuse', fuseGeo, L(0, 0, 0), rot, [Sc, Sc, Sc], mat(WHITE, { tex: tex.livery, color: [1, 1, 1] }));
        const wing = wingGeo(0.42, 0.2, 0.06, 0.2), stab = wingGeo(0.14, 0.08, 0.035, 0.07);
        for (const sgn of [1, -1]) {
          api.mesh('av:wing', wing, L(0.06, -0.025, 0.02 * sgn), [0, yw, 8], [Sc, Sc, sgn * Sc], WHITE);
          api.mesh('av:stab', stab, L(-0.42, 0.02, 0.01 * sgn), [0, yw, 8], [Sc, Sc, sgn * Sc], WHITE);
          // エンジン（翼の下のナセル）
          api.lathe('av:eng', [[0.02, 0], [0.5, 0.02], [0.52, 0.2], [0.48, 0.9], [0.36, 1], [0, 1]], L(0.04, -0.048, 0.15 * sgn), [0, yw, 8 - 90], [0.05 * Sc, 0.13 * Sc, 0.05 * Sc], BLUE);
        }
        // 垂直尾翼（青）
        api.mesh('av:fin', () => G.surface((u, v) => { const c = 0.16 - 0.1 * u; return [-0.12 * u - c * (0.5 - 0.5 * Math.cos(v * Math.PI * 2)), u * 0.17, 0.008 * (1 - 0.6 * u) * Math.sin(v * Math.PI * 2)]; }, 12, 20),
          L(-0.36, 0.035, 0), rot, [Sc, Sc, Sc], BLUE);
        K.shadow(api, px, pz, 0.36, 0.36, 0, 0.45);
        K.shadow(api, px, pz, 1.1, 0.9, yw, 0.18);

        /* --- 紙飛行機（折り目で3枚の三角形） --- */
        const PL = local(PAPER.x, PAPER.z, PAPER.yaw, 0.5), py = PAPER.yaw;
        api.mesh('av:paper', () => {
          const tri = (a, b, c) => { const v = []; const n = [0, 1, 0]; for (const p of [a, b, c]) v.push(p[0], p[1], p[2], 0, 0, n[0], n[1], n[2]); return v; };
          const nose = [0.5, 0.06, 0], tail = [-0.5, 0.1, 0], keel = [-0.5, 0.0, 0], wl = [-0.5, 0.14, 0.28], wr = [-0.5, 0.14, -0.28];
          const d = [].concat(tri(nose, tail, wl), tri(nose, wr, tail), tri(nose, keel, tail), tri(nose, tail, keel));
          return { data: new Float32Array(d), parts: { all: [0, d.length / 8] } };
        }, PL(0, 0, 0), [0, py, 0], [0.5, 0.5, 0.5], mat(M.matte, { color: [0.98, 0.97, 0.94], spec: 0.1 }));
        K.shadow(api, PAPER.x, PAPER.z, 0.36, 0.2, py, 0.3);

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
    E.drawGrain(ctx, W, H, 0.02, 125, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 壁：大きな窓（空と雲、下に滑走路の地平）と白い枠
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#e8eef4'; x.fillRect(0, 0, Wd, Ht);
    const g = x.createLinearGradient(0, 0, 0, Ht); g.addColorStop(0, '#7fb6e6'); g.addColorStop(1, '#cfe6f6');
    x.fillStyle = g; x.fillRect(24, 16, Wd - 48, Ht - 40);
    x.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [cx, cy, r] of [[120, 70, 30], [150, 64, 38], [185, 74, 28], [380, 110, 26], [405, 104, 32]]) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
    x.fillStyle = '#9aa6a0'; x.fillRect(24, Ht - 60, Wd - 48, 36);
    x.fillStyle = '#e8eef4'; x.fillRect(Wd / 2 - 6, 16, 12, Ht - 40);
    T.wall = c;
  }
  T.table = woodTex(E, 73, [200, 164, 118], 5);
  // 胴体の塗装：u=長さ（0=尾, 1=機首）、v=周（0=上, 0.5=下）。白地・窓の列・青い帯・機首の操縦席窓
  {
    const Wd = 1024, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f6f8fa'; x.fillRect(0, 0, Wd, Ht);
    // v は canvas では上が 1。v=0.22/0.78 → y=(1-v)*Ht
    for (const v of [0.22, 0.78]) {
      const y = (1 - v) * Ht;
      x.fillStyle = '#2a4a7a'; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(270 + i * 24, y, 5, 0, 7); x.fill(); }
      const band = (1 - (v < 0.5 ? 0.3 : 0.7)) * Ht;
      x.fillStyle = '#2e66b4'; x.fillRect(120, band - 6, 860, 12);
    }
    x.fillStyle = '#1e2a3a';
    for (const v of [0.12, 0.88]) { x.beginPath(); x.ellipse(960, (1 - v) * Ht, 22, 10, 0, 0, 7); x.fill(); }
    T.livery = c;
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
