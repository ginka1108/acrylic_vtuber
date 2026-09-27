/* =========================================================================
 *  10/18 統計の日（1870年のこの日、統計の始まりとされる「府県物産表」の太政官布告が出た）
 *  明るい書斎。壁に折れ線グラフを描いたホワイトボード、木の机。
 *  主役は右奥の立体の円グラフ（ひと切れを引き出した扇形の柱）。その手前に木の棒グラフの模型、
 *  左奥に卓上カレンダーと電卓。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'statistics-day',
  title: '統計の日',
  dayName: 'Statistics Day',
  caption: { fill: '#ffffff', outline: '#23507a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f8fafc', ink: '#1e2a3a', accent: '#2a6ab0', back: '#dde3ea', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.16, z: 0.12, yaw: -8 };
    const PIE = { x: 0.5, z: -0.3 };
    const PIE_R = 0.27;
    const BARS = { x: 0.46, z: -1.2, yaw: -14 };
    const CALC = { x: -0.62, z: -0.12, yaw: 14 };
    const CAL = { x: -0.74, z: -0.72, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.46, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    const COLS = [[0.24, 0.5, 0.82], [0.95, 0.62, 0.22], [0.36, 0.7, 0.44], [0.92, 0.36, 0.38], [0.66, 0.5, 0.82]];
    const PLASTIC = (c) => mat(M.plastic, { color: c, spec: 0.45, shin: 60 });

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.92, 0.93, 0.94], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.05, 1.02],
      sky: [1.02, 1.02, 1.03], ground: [0.66, 0.6, 0.54], envTop: [1.04, 1.04, 1.04], envBot: [0.46, 0.42, 0.4],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.05], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [5, 2], unlit: true });
        api.panel([0.6, 1.3, -3.0], [0, 0, 0], [2.4, 1.4], { tex: tex.board, spec: 0.1, sharp: true });
        api.box([0.6, 0.58, -2.95], [0, 0, 0], [2.4, 0.04, 0.12], mat(M.metal, { color: [0.78, 0.8, 0.82] }));
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.6, 0.44, 0.3], uvScale: [2, 1] }));

        /* --- 立体の円グラフ（扇形の柱。いちばん大きい切れを外へ引き出す） --- */
        const shares = [0.38, 0.24, 0.18, 0.12, 0.08], R = PIE_R, Hh = 0.12;
        let a0 = -30;
        shares.forEach((sh, i) => {
          const ang = sh * 360, mid = a0 + ang / 2, out = i === 0 ? 0.07 : 0;
          const mr = mid * Math.PI / 180;
          const key = 'st:w' + Math.round(ang);
          api.mesh(key, () => G.wedge(ang - 0.6, 32), [PIE.x + Math.sin(mr) * out, 0.004, PIE.z + Math.cos(mr) * out], [0, mid, 0], [R, Hh, R], PLASTIC(COLS[i]));
          a0 += ang;
        });
        K.shadow(api, PIE.x, PIE.z, 0.7, 0.7, 0, 0.45);

        /* --- 棒グラフの模型（台座に高さの違う角柱を5本） --- */
        const L = local(BARS.x, BARS.z, BARS.yaw, 1), by = BARS.yaw;
        api.rbox(L(0, 0.02, 0), [0, by, 0], [0.62, 0.04, 0.2], mat(M.wood, { color: [0.86, 0.72, 0.52], round: 0.1 }));
        [0.14, 0.24, 0.2, 0.34, 0.42].forEach((h, i) => {
          api.rbox(L(-0.24 + i * 0.12, 0.04 + h / 2, 0), [0, by, 0], [0.085, h, 0.085], mat(PLASTIC(COLS[i % 5]), { round: 0.12 }));
        });
        K.shadow(api, BARS.x, BARS.z, 0.7, 0.3, by, 0.4);

        /* --- 電卓（本体・液晶・キー） --- */
        const C2 = local(CALC.x, CALC.z, CALC.yaw, 1), cy2 = CALC.yaw;
        api.rbox(C2(0, 0.025, 0), [0, cy2, 0], [0.3, 0.05, 0.42], mat(M.plastic, { color: [0.26, 0.28, 0.32], round: 0.14 }));
        api.box(C2(0, 0.051, -0.13), [0, cy2, 0], [0.24, 0.004, 0.09], mat(M.matte, { tex: tex.lcd, face: S.FACE.TOP, edge: [0.2, 0.2, 0.2], sharp: true }));
        for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
          const orange = c === 3;
          api.rbox(C2(-0.09 + c * 0.06, 0.056, -0.04 + r * 0.05), [0, cy2, 0], [0.046, 0.016, 0.038],
            mat(M.plastic, { color: orange ? [0.95, 0.6, 0.26] : (r === 0 ? [0.7, 0.72, 0.76] : [0.92, 0.92, 0.94]), round: 0.3 }));
        }
        K.shadow(api, CALC.x, CALC.z, 0.36, 0.48, cy2, 0.45);

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
    E.drawGrain(ctx, W, H, 0.02, 118, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#e4e8ec'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,0.4)'; x.fillRect(0, 0, 128, 6);
    T.wall = c;
  }
  // ホワイトボード：枠、方眼（淡く粗く）、折れ線2本と点
  {
    const Wd = 640, Ht = 380, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbfcfd'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = 'rgba(120,140,170,0.25)'; x.lineWidth = 2;
    for (let i = 60; i < Wd - 20; i += 64) { x.beginPath(); x.moveTo(i, 30); x.lineTo(i, Ht - 50); x.stroke(); }
    for (let j = 40; j < Ht - 40; j += 56) { x.beginPath(); x.moveTo(50, j); x.lineTo(Wd - 30, j); x.stroke(); }
    x.strokeStyle = '#333a44'; x.lineWidth = 5; x.beginPath(); x.moveTo(50, 24); x.lineTo(50, Ht - 50); x.lineTo(Wd - 24, Ht - 50); x.stroke();
    const line = (col, pts) => { x.strokeStyle = col; x.lineWidth = 8; x.lineJoin = 'round'; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
      x.fillStyle = col; for (const [a, b] of pts) { x.beginPath(); x.arc(a, b, 10, 0, 7); x.fill(); } };
    line('#2a6ab0', [[90, 280], [180, 240], [270, 250], [360, 180], [450, 150], [560, 90]]);
    line('#e0703a', [[90, 300], [180, 290], [270, 230], [360, 240], [450, 210], [560, 190]]);
    x.strokeStyle = '#8a929c'; x.lineWidth = 12; x.strokeRect(6, 6, Wd - 12, Ht - 12);
    T.board = c;
  }
  T.table = woodTex(E, 43, [196, 150, 104], 5);
  {
    const c = C(256, 96), x = c.getContext('2d');
    x.fillStyle = '#b8c8a8'; x.fillRect(0, 0, 256, 96);
    x.fillStyle = '#2a3226'; x.font = '700 64px "Oswald",sans-serif'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText('1018', 236, 52);
    T.lcd = c;
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
