/* =========================================================================
 *  10/27 テディベアズ・デー（テディベアの名の由来とされるセオドア・ルーズベルトの誕生日）
 *  子ども部屋。水色とクリームの縦じまの壁、明るい木の棚板。
 *  主役は右奥に座ったテディベア（首に赤いリボン、足の裏に肉球）。右手前に木のオルゴール。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'teddy-bear-day',
  title: 'テディベアの日',
  dayName: 'Teddy Bear Day',
  caption: { fill: '#fffaf0', outline: '#8a4a2a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fffaf0', ink: '#3a2618', accent: '#c0462a', back: '#eadcc4', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.16, z: 0.12, yaw: 10 };
    const BEAR = { x: 0.52, z: -0.86, yaw: -24, s: 0.95 };
    const MBOX = { x: 0.42, z: -0.06, yaw: -20 };
    const CAL = { x: -0.74, z: -0.76, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.5, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    const FUR = mat(M.matte, { tex: tex.fur, color: [1, 1, 1], spec: 0.08, shin: 12, rim: 0.35 });
    const LIGHT = mat(M.matte, { color: [0.94, 0.8, 0.6], spec: 0.08, rim: 0.2 });
    const DARK = mat(M.plastic, { color: [0.12, 0.08, 0.06], spec: 0.8, shin: 90 });
    const RIB = mat(M.plastic, { color: [0.82, 0.14, 0.18], spec: 0.5, shin: 60 });
    const limb = (len, r0, r1) => () => G.tube((t) => [0, 0, t * len], (t) => r0 + (r1 - r0) * t + 0.02 * Math.sin(t * Math.PI), 20, 20, true);
    const loopGeo = () => G.tube((t) => { const a = t * Math.PI * 2; return [0.5 * (1 - Math.cos(a)) * 0.9, 0.35 * Math.sin(a), 0]; }, () => 0.07, 40, 12, false);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.9, 0.94, 0.96], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.04, 1.0],
      sky: [1.02, 1.02, 1.02], ground: [0.7, 0.62, 0.52], envTop: [1.04, 1.03, 1.0], envBot: [0.5, 0.44, 0.38],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [10, 1], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.7, 0.58, 0.42], uvScale: [2, 1] }));

        /* --- テディベア（+z が正面。座って脚を前に投げ出す） --- */
        const Q = BEAR.s, L = local(BEAR.x, BEAR.z, BEAR.yaw, Q), yw = BEAR.yaw;
        const R = (a) => [a[0], yw + a[1], a[2]];
        api.sphere(L(0, 0.24, 0), R([0, 0, 0]), [0.34 * Q, 0.4 * Q, 0.3 * Q], FUR);                       // 胴
        api.sphere(L(0, 0.22, 0.1), R([0, 0, 0]), [0.22 * Q, 0.26 * Q, 0.14 * Q], LIGHT);                 // おなか
        api.sphere(L(0, 0.56, 0.02), R([0, 0, 0]), [0.3 * Q, 0.28 * Q, 0.27 * Q], FUR);                  // 頭
        api.sphere(L(0, 0.53, 0.14), R([0, 0, 0]), [0.13 * Q, 0.1 * Q, 0.1 * Q], LIGHT);                  // 鼻先
        api.sphere(L(0, 0.56, 0.19), R([0, 0, 0]), [0.045 * Q, 0.032 * Q, 0.03 * Q], DARK);               // 鼻
        for (const sx of [-1, 1]) {
          api.sphere(L(sx * 0.07, 0.61, 0.13), R([0, 0, 0]), [0.03 * Q, 0.03 * Q, 0.02 * Q], DARK);     // 目
          api.sphere(L(sx * 0.12, 0.68, -0.01), R([0, 0, sx * -20]), [0.11 * Q, 0.1 * Q, 0.05 * Q], FUR);  // 耳
          api.sphere(L(sx * 0.12, 0.675, 0.012), R([0, 0, sx * -20]), [0.07 * Q, 0.06 * Q, 0.02 * Q], LIGHT);
          // 腕（肩から前下へ）
          api.mesh('tb:arm', limb(0.16, 0.05, 0.045), L(sx * 0.15, 0.36, 0.02), R([40, sx * 20, 0]), [Q, Q, Q], FUR);
          // 脚（前へ投げ出す）と足の裏
          api.mesh('tb:leg', limb(0.2, 0.06, 0.06), L(sx * 0.1, 0.07, 0.04), R([-4, sx * 12, 0]), [Q, Q, Q], FUR);
          const fz = 0.04 + Math.cos(12 * Math.PI / 180) * 0.24, fx = sx * (0.1 + Math.sin(12 * Math.PI / 180) * 0.24);
          api.sphere(L(fx, 0.08, fz), R([0, sx * 12, 0]), [0.12 * Q, 0.13 * Q, 0.06 * Q], FUR);
          api.sphere(L(fx, 0.08, fz + 0.022), R([0, sx * 12, 0]), [0.08 * Q, 0.09 * Q, 0.02 * Q], LIGHT);
          // 首のリボン（蝶結びのループ）
          api.mesh('tb:loop', loopGeo, L(0, 0.42, 0.14), R([0, sx > 0 ? 0 : 180, 0]), [0.1 * Q, 0.1 * Q, 0.4 * Q], RIB);
        }
        api.sphere(L(0, 0.42, 0.15), R([0, 0, 0]), [0.05 * Q, 0.05 * Q, 0.04 * Q], RIB);
        api.lathe('tb:band', [[0.5, 0], [0.52, 0.5], [0.5, 1]], L(0, 0.4, 0.01), R([0, 0, 0]), [0.3 * Q, 0.04 * Q, 0.27 * Q], RIB);
        K.shadow(api, BEAR.x, BEAR.z, 0.62, 0.62, yw, 0.5);

        /* --- 木のオルゴール（箱・ふたの段・真鍮の角金具・横のねじ） --- */
        const B = local(MBOX.x, MBOX.z, MBOX.yaw, 1), by = MBOX.yaw;
        const WOOD = mat(M.wood, { tex: tex.box, color: [1, 1, 1], spec: 0.35, shin: 40 });
        api.rbox(B(0, 0.07, 0), [0, by, 0], [0.34, 0.14, 0.24], mat(WOOD, { round: 0.06 }));
        api.rbox(B(0, 0.155, 0), [0, by, 0], [0.35, 0.04, 0.25], mat(WOOD, { round: 0.1 }));
        api.box(B(0, 0.178, 0), [0, by, 0], [0.2, 0.004, 0.12], mat(M.gold, { color: [0.88, 0.72, 0.42], tex: tex.inlay, face: S.FACE.TOP, edge: [0.8, 0.64, 0.36] }));
        api.lathe('tb:key', [[0, 0], [0.3, 0], [0.3, 0.6], [0.5, 0.7], [0.5, 1], [0, 1]], B(0.17, 0.07, 0), [0, by, -90], [0.04, 0.06, 0.04], mat(M.gold, { color: [0.86, 0.7, 0.4] }));
        api.rbox(B(0.235, 0.07, 0), [0, by, 0], [0.012, 0.07, 0.1], mat(M.gold, { color: [0.86, 0.7, 0.4], round: 0.4 }));
        K.shadow(api, MBOX.x, MBOX.z, 0.42, 0.32, by, 0.45);

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
    E.drawGrain(ctx, W, H, 0.02, 127, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = '#fbf3e2'; x.fillRect(0, 0, 64, 64);
    x.fillStyle = '#bfe0ea'; x.fillRect(0, 0, 32, 64);
    T.wall = c;
  }
  T.table = woodTex(E, 83, [214, 180, 132], 5);
  // 毛並み：キャラメル色に、ごく淡いムラ（筋は描かない）
  {
    const S = 128, c = C(S, S), x = c.getContext('2d'), r = E.rnd(4);
    x.fillStyle = '#b77a44'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 30; i++) { x.fillStyle = r() > 0.5 ? 'rgba(210,150,90,0.18)' : 'rgba(140,86,44,0.18)'; x.beginPath(); x.arc(r() * S, r() * S, 8 + r() * 14, 0, 7); x.fill(); }
    T.fur = c;
  }
  // オルゴールの木（赤みの濃い木）
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#7a3e22'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(160,90,50,0.3)'; for (let i = 0; i < 128; i += 24) x.fillRect(0, i, 128, 8);
    T.box = c;
  }
  // ふたの象嵌：楕円の枠に音符
  {
    const c = C(256, 160), x = c.getContext('2d');
    x.fillStyle = '#6a3420'; x.fillRect(0, 0, 256, 160);
    x.strokeStyle = '#e8c878'; x.lineWidth = 8; x.beginPath(); x.ellipse(128, 80, 110, 64, 0, 0, 7); x.stroke();
    x.fillStyle = '#e8c878'; x.beginPath(); x.ellipse(110, 104, 18, 13, -0.4, 0, 7); x.fill(); x.fillRect(124, 40, 7, 64); x.fillRect(124, 40, 30, 10);
    T.inlay = c;
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
