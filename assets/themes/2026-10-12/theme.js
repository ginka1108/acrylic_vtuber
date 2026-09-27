/* =========================================================================
 *  10/12 芝居の日（1629年のこの日、江戸で初めて歌舞伎が上演されたとされる）
 *  劇場のロビー風の部屋。赤いダマスク柄の壁と腰板、濃い色の木のテーブル。
 *  主役は右奥のトイシアター（額縁舞台・赤いビロードの幕・書き割り）。右手前にバラを挿した花瓶。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'theater-day',
  title: '芝居の日',
  dayName: 'Theater Day',
  caption: { fill: '#fff6e6', outline: '#7a1622' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f8f1e2', ink: '#4a1a1e', accent: '#b3202c', back: '#e6d6bb', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.18, z: 0.12, yaw: 12 };
    const TH = { x: 0.6, z: -1.05, yaw: -26, s: 0.86 };
    const VASE = { x: 0.56, z: 0.14 };
    const CAL = { x: -0.74, z: -0.72, yaw: 22 };
    const eye = [0.12, 1.3, 2.75], at = [-0.08, 0.5, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    const VELVET = mat(M.matte, { color: [0.62, 0.08, 0.12], spec: 0.18, shin: 14, rim: 0.3 });
    const GOLD = mat(M.gold, { color: [0.92, 0.72, 0.36] });
    const DARKWOOD = mat(M.wood, { color: [0.36, 0.2, 0.12] });

    /* 幕（左右）：上は広く、途中をタッセルで束ねて絞り、裾で少し広がる。ひだは正弦波 */
    const TIE = 0.38;
    const curtainGeo = () => G.surface((u, v) => {
      let wv;
      if (v > TIE) { const t = (v - TIE) / (1 - TIE); wv = 0.2 + 0.8 * Math.pow(t, 1.3); }
      else { const t = (TIE - v) / TIE; wv = 0.2 + 0.2 * t; }
      const x = u * wv;
      const amp = 0.018 + 0.03 * (1 - wv);
      const z = amp * Math.sin(u * Math.PI * 9) + 0.02 * u;
      return [x, v, z];
    }, 72, 48);
    // 上の飾り幕（波形の裾）
    const valanceGeo = () => G.surface((u, v) => {
      const sc = Math.abs(Math.sin(u * Math.PI * 5));
      const y = -v * (0.7 + 0.3 * sc);
      return [u - 0.5, y, 0.012 * Math.sin(u * Math.PI * 30) * (1 - v * 0.5)];
    }, 120, 8);

    const roseProf = (k) => [[0, 0], [0.18, 0.02], [0.34, 0.14], [0.44, 0.34], [0.47, 0.56], [0.44, 0.7], [0.4, 0.72], [0.36, 0.66], [0.3, 0.7],
      [0.25, 0.62], [0.2, 0.7], [0.12, 0.64], [0.05, 0.62], [0, 0.58]].map(q => [q[0], q[1] * k]);
    const leafGeo = () => G.surface((u, v) => {
      const s = v * 2 - 1, w = 0.4 * Math.pow(Math.sin(Math.PI * u), 0.8) + 0.004;
      return [s * w, 0.12 * u - 0.06 * s * s, u];
    }, 20, 8);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.5, 0.18, 0.18], ambient: 0.56, light: [0.4, 0.86, 0.55], lightCol: [1.08, 1.04, 0.98],
      sky: [1.02, 0.98, 0.94], ground: [0.6, 0.42, 0.36], envTop: [1.02, 0.96, 0.9], envBot: [0.4, 0.22, 0.2],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* 壁：赤いダマスク柄＋濃い木の腰板と金の見切り */
        api.panel([0, 1.9, -3.0], [0, 0, 0], [12, 3.6], { tex: tex.wall, uvScale: [6, 2], unlit: true });
        api.box([0, 0.3, -3.02], [0, 0, 0], [12, 0.6, 0.06], mat(DARKWOOD, { tex: tex.panel, face: S.FACE.FRONT, uvScale: [8, 1] }));
        api.box([0, 0.62, -2.98], [0, 0, 0], [12, 0.05, 0.06], mat(GOLD, {}));
        /* テーブル */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.3, 0.17, 0.1], uvScale: [2, 1] }));

        /* --- トイシアター --- */
        const L = local(TH.x, TH.z, TH.yaw, TH.s), Q = TH.s, yw = TH.yaw;
        const fw = 1.04, fd = 0.5;
        // 台座（黒い箱＋金の縁取り）と舞台の床
        api.rbox(L(0, 0.06, 0), [0, yw, 0], [fw * Q, 0.12 * Q, fd * Q], mat(DARKWOOD, { round: 0.08 }));
        api.box(L(0, 0.125, 0.02), [0, yw, 0], [(fw - 0.12) * Q, 0.012, (fd - 0.08) * Q], mat(M.wood, { tex: tex.stage, face: S.FACE.TOP, edge: [0.5, 0.34, 0.2] }));
        api.box(L(0, 0.1, fd / 2 + 0.004), [0, yw, 0], [fw * Q, 0.025 * Q, 0.01 * Q], GOLD);
        // 書き割り（奥の背景画）
        api.panel(L(0, 0.46, -fd / 2 + 0.03), [0, yw, 0], [(fw - 0.16) * Q, 0.66 * Q], { tex: tex.backdrop, spec: 0.04, sharp: true });
        // 左右の袖（黒い壁）
        for (const sx of [-1, 1]) api.box(L(sx * (fw / 2 - 0.05), 0.47, -0.04), [0, yw, 0], [0.1 * Q, 0.7 * Q, (fd - 0.1) * Q], mat(M.matte, { color: [0.14, 0.1, 0.1] }));
        // 額縁（前面の金の枠：アーチの板＋柱）
        api.panel(L(0, 0.47, fd / 2 - 0.03), [0, yw, 0], [(fw + 0.08) * Q, 0.78 * Q], { tex: tex.frame, spec: 0.35, shin: 60 });
        // 額縁の厚み（左右の柱と上の梁を金で）
        for (const sx of [-1, 1]) api.rbox(L(sx * (fw / 2 + 0.01), 0.47, fd / 2 - 0.045), [0, yw, 0], [0.1 * Q, 0.78 * Q, 0.04 * Q], mat(GOLD, { round: 0.1 }));
        api.rbox(L(0, 0.89, fd / 2 - 0.045), [0, yw, 0], [(fw + 0.12) * Q, 0.08 * Q, 0.05 * Q], mat(GOLD, { round: 0.1 }));
        // 幕（額縁のすぐ内側、左右から）
        const cw = (fw - 0.2) / 2, ch = 0.6;
        api.mesh('th:curtain', curtainGeo, L(-fw / 2 + 0.1, 0.13, fd / 2 - 0.08), [0, yw, 0], [cw * Q, ch * Q, Q], VELVET);
        api.mesh('th:curtain', curtainGeo, L(fw / 2 - 0.1, 0.13, fd / 2 - 0.08), [0, yw + 180, 0], [cw * Q, ch * Q, -Q], VELVET);
        api.mesh('th:valance', valanceGeo, L(0, 0.74, fd / 2 - 0.06), [0, yw, 0], [(fw - 0.16) * Q, 0.1 * Q, Q], VELVET);
        // タッセル（金の房：丸い頭＋すそ広がり）
        for (const sx of [-1, 1]) {
          const tx = sx * (fw / 2 - 0.1 - cw * 0.2);
          api.lathe('th:tassel', [[0, 0], [0.5, 0.05], [0.6, 0.4], [0.35, 0.55], [0.5, 0.75], [0.3, 1], [0, 1]], L(tx, 0.13 + ch * TIE - 0.07, fd / 2 - 0.05), [0, 0, 0], [0.045 * Q, 0.1 * Q, 0.045 * Q], GOLD);
        }
        K.shadow(api, TH.x, TH.z, 1.2, 0.7, yw, 0.45);

        /* --- 花瓶とバラ --- */
        const vx = VASE.x, vz = VASE.z;
        api.lathe('th:vase', [[0, 0], [0.34, 0], [0.36, 0.02, 1], [0.44, 0.2], [0.46, 0.4], [0.38, 0.62], [0.24, 0.8], [0.22, 0.92], [0.27, 1], [0.25, 1.01], [0.19, 0.95], [0.18, 0.5], [0, 0.5]],
          [vx, 0, vz], [0, 0, 0], [0.24, 0.3, 0.24], mat(M.ceramic, { color: [0.95, 0.93, 0.88] }));
        api.lathe('th:vband', [[0.463, 0.3], [0.468, 0.36], [0.463, 0.42]], [vx, 0, vz], [0, 0, 0], [0.24, 0.3, 0.24], GOLD);
        const roses = [[0, 0.52, 0, 0, 0], [0.06, 0.46, 0.03, 18, 60], [-0.06, 0.45, -0.02, -16, -80], [0.01, 0.43, -0.07, 8, 150]];
        roses.forEach(([dx, hy, dz, tilt, ry], i) => {
          const top = [vx + dx, hy, vz + dz];
          api.mesh('th:stem' + i, () => G.tube((t) => [dx * t * 0.8, 0.28 + (hy - 0.28) * t, dz * t * 0.8], () => 0.008, 16, 8, true), [vx, 0, vz], [0, 0, 0], [1, 1, 1], mat(M.plastic, { color: [0.26, 0.45, 0.22], spec: 0.2 }));
          const RM = mat(M.plastic, { color: i === 2 ? [0.86, 0.3, 0.38] : [0.74, 0.08, 0.14], spec: 0.25, shin: 30, rim: 0.2 });
          api.lathe('th:rose', roseProf(1), top, [tilt, ry, tilt * 0.4], [0.1, 0.1, 0.1], RM);
          api.lathe('th:rose2', roseProf(1.25), [top[0], top[1] + 0.002, top[2]], [tilt, ry + 30, tilt * 0.4], [0.07, 0.07, 0.07], RM);
          api.lathe('th:sepal', [[0, 0], [0.3, 0.1], [0.5, 0.3], [0.2, 0.35], [0, 0.3]], [top[0], top[1] - 0.012, top[2]], [tilt, ry, 0], [0.07, 0.05, 0.07], mat(M.plastic, { color: [0.3, 0.48, 0.24] }));
        });
        api.mesh('th:leaf', leafGeo, [vx + 0.03, 0.34, vz + 0.02], [-40, 50, 0], [0.09, 0.09, 0.1], mat(M.plastic, { color: [0.3, 0.52, 0.26], spec: 0.25 }));
        api.mesh('th:leaf', leafGeo, [vx - 0.03, 0.36, vz], [-35, -120, 0], [0.08, 0.08, 0.09], mat(M.plastic, { color: [0.28, 0.48, 0.24], spec: 0.25 }));
        K.shadow(api, vx, vz, 0.3, 0.3, 0, 0.45);

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
    E.drawVignette(ctx, W, H, 0.14);
    E.drawGrain(ctx, W, H, 0.024, 112, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 壁：深い赤に、ひと回り明るい赤の菱形の花模様（粗く大きく）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#8e2430'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#a3323c';
    const motif = (cx, cy, r) => {
      x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx + r * 0.6, cy - r * 0.2, cx + r * 0.7, cy);
      x.quadraticCurveTo(cx + r * 0.6, cy + r * 0.2, cx, cy + r); x.quadraticCurveTo(cx - r * 0.6, cy + r * 0.2, cx - r * 0.7, cy);
      x.quadraticCurveTo(cx - r * 0.6, cy - r * 0.2, cx, cy - r); x.fill();
    };
    motif(64, 64, 52); motif(192, 192, 52); motif(192, 64, 26); motif(64, 192, 26);
    T.wall = c;
  }
  // 腰板
  {
    const c = C(256, 128), x = c.getContext('2d');
    x.fillStyle = '#4a2a18'; x.fillRect(0, 0, 256, 128);
    x.strokeStyle = 'rgba(20,10,6,0.5)'; x.lineWidth = 6; x.strokeRect(20, 16, 216, 96);
    x.strokeStyle = 'rgba(200,150,100,0.18)'; x.lineWidth = 3; x.strokeRect(28, 24, 200, 80);
    T.panel = c;
  }
  T.table = woodTex(E, 41, [110, 64, 38], 5);
  // 舞台の床板
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#b98a58'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 32) { x.fillStyle = 'rgba(80,50,26,0.35)'; x.fillRect(i, 0, 3, 256); }
    T.stage = c;
  }
  // 書き割り：夜の森と大きな月、手前に丘（ベタ塗り・粗く）
  {
    const Wd = 512, Ht = 384, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, Ht); g.addColorStop(0, '#2c3e6e'); g.addColorStop(1, '#6a7fb0');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#f5e7b0'; x.beginPath(); x.arc(360, 110, 56, 0, 7); x.fill();
    x.fillStyle = '#fff6d8';
    for (const [sx, sy] of [[80, 60], [150, 110], [240, 50], [460, 70], [420, 190], [60, 170]]) { x.beginPath(); x.arc(sx, sy, 4, 0, 7); x.fill(); }
    const tree = (tx, ty, s, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(tx, ty - s * 1.6); x.lineTo(tx + s * 0.7, ty); x.lineTo(tx - s * 0.7, ty); x.fill(); };
    tree(70, 330, 90, '#1f3a34'); tree(150, 340, 70, '#26473e'); tree(440, 330, 100, '#1f3a34'); tree(500, 345, 60, '#26473e');
    x.fillStyle = '#34584a'; x.beginPath(); x.moveTo(0, Ht); x.quadraticCurveTo(Wd * 0.5, Ht * 0.7, Wd, Ht); x.fill();
    T.backdrop = c;
  }
  // 額縁：金の枠、中央は抜き（透明）、上に「THEATRE」の銘板
  {
    const Wd = 512, Ht = 384, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, Ht); g.addColorStop(0, '#e9c46a'); g.addColorStop(0.5, '#c79a3e'); g.addColorStop(1, '#e2b85a');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.moveTo(40, Ht); x.lineTo(40, 110); x.quadraticCurveTo(40, 60, 100, 60); x.lineTo(Wd - 100, 60); x.quadraticCurveTo(Wd - 40, 60, Wd - 40, 110); x.lineTo(Wd - 40, Ht); x.fill();
    x.globalCompositeOperation = 'source-over';
    x.strokeStyle = '#8a6424'; x.lineWidth = 5;
    x.beginPath(); x.moveTo(40, Ht); x.lineTo(40, 110); x.quadraticCurveTo(40, 60, 100, 60); x.lineTo(Wd - 100, 60); x.quadraticCurveTo(Wd - 40, 60, Wd - 40, 110); x.lineTo(Wd - 40, Ht); x.stroke();
    x.strokeRect(6, 6, Wd - 12, Ht - 6);
    x.fillStyle = '#6e1420'; E.roundRect(x, 176, 12, 160, 40, 8); x.fill();
    x.fillStyle = '#f3dc9a'; x.font = '700 28px "Oswald",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('THEATRE', 256, 33);
    T.frame = c;
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
