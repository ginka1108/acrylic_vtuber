/* =========================================================================
 *  10/28 パンダの日（1972年のこの日、上野動物園にジャイアントパンダがやって来た）
 *  中国茶房風の部屋。朱色の丸窓のある白い壁、濃い木の卓。
 *  主役は右奥の、白黒に塗り分けた陶器のパンダの置物（座った姿）。その奥に青磁の花瓶と竹。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'panda-day',
  title: 'パンダの日',
  dayName: 'Panda Day',
  caption: { fill: '#ffffff', outline: '#222226' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbfaf6', ink: '#222226', accent: '#c0302a', back: '#e2e0d8', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.16, z: 0.12, yaw: 10 };
    const PANDA = { x: 0.4, z: -0.56, yaw: -26, s: 0.9 };
    const VASE = { x: 0.74, z: -1.3 };
    const CAL = { x: -0.74, z: -0.76, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.5, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    const WH = mat(M.ceramic, { color: [0.97, 0.96, 0.93] });
    const BK = mat(M.ceramic, { color: [0.12, 0.12, 0.14] });
    const limb = (len, r0, r1) => () => G.tube((t) => [0, 0, t * len], (t) => r0 + (r1 - r0) * t + 0.015 * Math.sin(t * Math.PI), 20, 20, true);
    const BAMBOO = mat(M.plastic, { color: [0.46, 0.66, 0.3], spec: 0.35, shin: 40 });
    const leafGeo = () => G.surface((u, v) => { const s = v * 2 - 1, w = 0.1 * Math.sin(Math.PI * Math.pow(u, 0.7)) + 0.003; return [s * w, -0.12 * u * u, u]; }, 16, 6);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.94, 0.92, 0.88], ambient: 0.56, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.04, 1.0],
      sky: [1.02, 1.01, 1.0], ground: [0.6, 0.5, 0.42], envTop: [1.04, 1.02, 1.0], envBot: [0.4, 0.32, 0.28],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.02], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [6, 2], unlit: true });
        api.panel([-0.3, 1.25, -2.98], [0, 0, 0], [1.6, 1.6], { tex: tex.window, unlit: true, sharp: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.3, 0.16, 0.1], uvScale: [2, 1] }));

        /* --- 陶器のパンダ（+z が正面。座った姿） --- */
        const Q = PANDA.s, L = local(PANDA.x, PANDA.z, PANDA.yaw, Q), yw = PANDA.yaw;
        const R = (a) => [a[0], yw + a[1], a[2]];
        api.sphere(L(0, 0.22, 0), R([0, 0, 0]), [0.38 * Q, 0.42 * Q, 0.34 * Q], WH);                      // 胴（白）
        api.lathe('pd:shoulder', [[0.5, 0], [0.52, 0.5], [0.5, 1]], L(0, 0.33, 0), R([0, 0, 0]), [0.37 * Q, 0.08 * Q, 0.33 * Q], BK);  // 肩の黒い帯
        api.sphere(L(0, 0.55, 0.02), R([0, 0, 0]), [0.32 * Q, 0.29 * Q, 0.29 * Q], WH);                   // 頭
        api.sphere(L(0, 0.52, 0.15), R([0, 0, 0]), [0.12 * Q, 0.09 * Q, 0.08 * Q], WH);                    // 鼻先
        api.sphere(L(0, 0.545, 0.19), R([0, 0, 0]), [0.045 * Q, 0.03 * Q, 0.03 * Q], BK);                  // 鼻
        for (const sx of [-1, 1]) {
          api.sphere(L(sx * 0.075, 0.585, 0.12), R([0, sx * 20, sx * 25]), [0.08 * Q, 0.1 * Q, 0.04 * Q], BK);      // 目のまわり
          api.sphere(L(sx * 0.078, 0.595, 0.14), R([0, 0, 0]), [0.024 * Q, 0.024 * Q, 0.012 * Q], WH);             // 目のつや
          api.sphere(L(sx * 0.13, 0.69, -0.01), R([0, 0, sx * -20]), [0.1 * Q, 0.09 * Q, 0.06 * Q], BK);          // 耳
          api.mesh('pd:arm', limb(0.17, 0.055, 0.05), L(sx * 0.16, 0.34, 0.03), R([45, sx * 18, 0]), [Q, Q, Q], BK);
          api.mesh('pd:leg', limb(0.18, 0.065, 0.065), L(sx * 0.11, 0.07, 0.04), R([-4, sx * 14, 0]), [Q, Q, Q], BK);
          const fz = 0.04 + Math.cos(14 * Math.PI / 180) * 0.22, fx = sx * (0.11 + Math.sin(14 * Math.PI / 180) * 0.22);
          api.sphere(L(fx, 0.08, fz), R([0, sx * 14, 0]), [0.13 * Q, 0.14 * Q, 0.07 * Q], BK);
        }
        K.shadow(api, PANDA.x, PANDA.z, 0.66, 0.62, yw, 0.5);

        /* --- 青磁の花瓶と竹 --- */
        const vx = VASE.x, vz = VASE.z, vs = 0.5;
        api.lathe('pd:vase', [[0, 0], [0.26, 0], [0.28, 0.03, 1], [0.36, 0.2], [0.38, 0.4], [0.3, 0.62], [0.18, 0.78], [0.16, 0.92], [0.22, 1.0], [0.2, 1.01], [0.13, 0.94], [0.12, 0.5], [0, 0.5]],
          [vx, 0, vz], [0, 0, 0], [vs, vs, vs], mat(M.ceramic, { color: [0.66, 0.8, 0.72] }));
        [[0, 1.2, 0], [0.04, 1.0, 0.03], [-0.04, 0.9, -0.02]].forEach(([dx, h, dz], i) => {
          const base = [vx + dx * 0.4, 0.3, vz + dz * 0.4], top = [vx + dx * 3, h, vz + dz * 3];
          api.mesh('pd:culm' + i, () => G.tube((t) => [(top[0] - base[0]) * t, (top[1] - base[1]) * t, (top[2] - base[2]) * t], () => 0.016, 24, 10, true), base, [0, 0, 0], [1, 1, 1], BAMBOO);
          for (let k = 1; k < 4; k++) {
            const t = k / 4, p = [base[0] + (top[0] - base[0]) * t, base[1] + (top[1] - base[1]) * t, base[2] + (top[2] - base[2]) * t];
            api.cylinder(p, [0, 0, 0], [0.04, 0.012, 0.04], mat(BAMBOO, { color: [0.4, 0.58, 0.26] }));
            if (k >= 2) for (const ry of [30 + i * 50 + k * 70, 200 + i * 40 + k * 60])
              api.mesh('pd:leaf', leafGeo, p, [-20, ry, 0], [0.6, 0.6, 0.6], mat(M.plastic, { color: [0.36, 0.58, 0.26], spec: 0.25 }));
          }
        });
        K.shadow(api, vx, vz, 0.32, 0.32, 0, 0.45);

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
    E.drawGrain(ctx, W, H, 0.02, 128, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#f2eee4'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(200,190,170,0.18)'; x.fillRect(0, 0, 128, 4);
    T.wall = c;
  }
  // 丸窓：朱色の枠、格子（粗く）、外は淡い空と遠い山（外は透明ではなく絵）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d');
    x.save(); x.beginPath(); x.arc(256, 256, 236, 0, 7); x.clip();
    const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#cfe4ee'); g.addColorStop(1, '#eef4f0');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.fillStyle = '#a9c4b4'; x.beginPath(); x.moveTo(0, 380); x.lineTo(140, 280); x.lineTo(260, 350); x.lineTo(380, 260); x.lineTo(S, 360); x.lineTo(S, S); x.lineTo(0, S); x.fill();
    x.strokeStyle = '#b0402e'; x.lineWidth = 12;
    for (let i = 128; i < S; i += 128) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(S, i); x.stroke(); }
    x.restore();
    x.strokeStyle = '#b0402e'; x.lineWidth = 28; x.beginPath(); x.arc(256, 256, 236, 0, 7); x.stroke();
    T.window = c;
  }
  T.table = woodTex(E, 89, [98, 50, 30], 4);
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
