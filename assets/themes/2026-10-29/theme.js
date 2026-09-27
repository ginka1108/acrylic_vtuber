/* =========================================================================
 *  10/29 インターネット記念日（1969年のこの日、インターネットの起源となるARPANETで初めて通信が行われた）
 *  明るい在宅ワークの机。淡いグレーの壁に地球のポスター、白木の机。
 *  主役は右の開いたノートパソコン（画面に地球と「www」）。右奥に3本アンテナのWi-Fiルーター。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'internet-day',
  title: 'インターネット記念日',
  dayName: 'Internet Day',
  caption: { fill: '#ffffff', outline: '#2a4a8a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f8fafc', ink: '#1a2438', accent: '#3a6ad0', back: '#dde2ea', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.06, z: 0.12, yaw: 12 };
    const LAP = { x: 0.48, z: -0.62, yaw: -26 };
    const ROUTER = { x: 0.2, z: -1.3, yaw: -8 };
    const CAL = { x: -0.72, z: -0.8, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.48, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const ALU = mat(M.metal, { color: [0.82, 0.83, 0.86], metal: 0.6, spec: 0.7 });

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.92, 0.93, 0.95], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.05, 1.05, 1.04],
      sky: [1.02, 1.02, 1.03], ground: [0.68, 0.64, 0.58], envTop: [1.06, 1.06, 1.08], envBot: [0.46, 0.44, 0.44],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.02], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [6, 2], unlit: true });
        api.panel([0.9, 1.3, -2.98], [0, 0, 0], [1.3, 0.9], { tex: tex.poster, spec: 0.05, sharp: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.74, 0.66, 0.54], uvScale: [2, 1] }));

        /* --- ノートパソコン（本体・キーボード面・ヒンジで開いた画面） --- */
        const L = local(LAP.x, LAP.z, LAP.yaw, 1), yw = LAP.yaw;
        const lw = 0.78, ld = 0.54;
        api.rbox(L(0, 0.02, 0), [0, yw, 0], [lw, 0.04, ld], mat(ALU, { round: 0.06 }));
        api.box(L(0, 0.0405, 0.02), [0, yw, 0], [lw - 0.06, 0.002, ld - 0.08], mat(M.matte, { tex: tex.keys, face: S.FACE.TOP, edge: [0.8, 0.8, 0.82], sharp: true }));
        const open = 104, orr = open * Math.PI / 180;       // 画面の開き角（机から）
        const hz = -ld / 2 + 0.01, sh = 0.5;
        const cy = 0.04 + Math.sin(orr) * sh / 2, cz = hz - Math.cos(orr) * sh / 2 * -1;
        const lean = open - 90;
        api.rbox(L(0, cy, hz - Math.cos(orr) * sh / 2), [-lean, yw, 0], [lw, sh, 0.02], mat(ALU, { round: 0.1 }));
        api.panel(L(0, cy, hz - Math.cos(orr) * sh / 2 + 0.0115), [lean, yw, 0], [lw - 0.05, sh - 0.05], { tex: tex.screen, unlit: true, sharp: true });
        K.shadow(api, LAP.x, LAP.z, lw + 0.1, ld + 0.1, yw, 0.4);

        /* --- Wi-Fiルーター（白い本体・3本のアンテナ・ランプ） --- */
        const R = local(ROUTER.x, ROUTER.z, ROUTER.yaw, 1), ry = ROUTER.yaw;
        api.rbox(R(0, 0.05, 0), [0, ry, 0], [0.46, 0.1, 0.3], mat(M.plastic, { color: [0.96, 0.96, 0.97], round: 0.3 }));
        api.box(R(0, 0.06, 0.151), [0, ry, 0], [0.3, 0.02, 0.004], mat(M.plastic, { tex: tex.leds, face: S.FACE.FRONT, color: [1, 1, 1], edge: [0.9, 0.9, 0.9], sharp: true }));
        [[-0.17, -14], [0, 0], [0.17, 14]].forEach(([ax, tilt]) => {
          api.lathe('in:ant', [[0, 0], [0.5, 0], [0.5, 0.9], [0.3, 1], [0, 1]], R(ax, 0.08, -0.12), [0, ry, tilt], [0.036, 0.34, 0.036], mat(M.plastic, { color: [0.2, 0.2, 0.22], spec: 0.5 }));
        });
        K.shadow(api, ROUTER.x, ROUTER.z, 0.54, 0.4, ry, 0.45);

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
    E.drawGrain(ctx, W, H, 0.02, 129, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#dfe3e8'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(0, 0, 64, 128);
    T.wall = c;
  }
  T.table = woodTex(E, 97, [228, 208, 176], 5);
  // 地球と通信の線のポスター
  const globe = (x, cx, cy, r) => {
    x.fillStyle = '#3a7ad0'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.fillStyle = '#6ac07a';
    for (const [a, b, rx, ry, rt] of [[-0.35, -0.2, 0.3, 0.22, 0.4], [0.3, 0.1, 0.24, 0.36, -0.3], [-0.2, 0.42, 0.18, 0.1, 0]]) { x.beginPath(); x.ellipse(cx + a * r, cy + b * r, rx * r, ry * r, rt, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = Math.max(2, r * 0.03);
    x.beginPath(); x.ellipse(cx, cy, r, r * 0.35, 0, 0, 7); x.stroke();
    x.beginPath(); x.ellipse(cx, cy, r * 0.35, r, 0, 0, 7); x.stroke();
  };
  {
    const Wd = 390, Ht = 270, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#1e2a4a'; x.fillRect(0, 0, Wd, Ht);
    globe(x, Wd / 2, Ht / 2, 90);
    x.strokeStyle = '#f2c14a'; x.lineWidth = 4;
    for (const [a0, a1] of [[0.4, 2.2], [3.0, 4.6], [5.0, 0.2]]) { x.beginPath(); x.arc(Wd / 2, Ht / 2, 115, a0, a1); x.stroke(); }
    x.fillStyle = '#f2c14a'; for (const a of [0.4, 2.2, 3.0, 4.6, 5.0]) { x.beginPath(); x.arc(Wd / 2 + Math.cos(a) * 115, Ht / 2 + Math.sin(a) * 115, 8, 0, 7); x.fill(); }
    T.poster = c;
  }
  // 画面：ブラウザ風の窓（上にタブとアドレス欄「www」、中央に地球）
  {
    const Wd = 640, Ht = 400, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#16181c'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#f4f6fa'; x.fillRect(16, 16, Wd - 32, Ht - 32);
    x.fillStyle = '#d6dce6'; x.fillRect(16, 16, Wd - 32, 56);
    x.fillStyle = '#ffffff'; E.roundRect(x, 90, 30, Wd - 200, 30, 15); x.fill();
    x.fillStyle = '#3a6ad0'; x.font = '700 22px "Oswald",sans-serif'; x.textBaseline = 'middle'; x.fillText('https://www.', 108, 46);
    for (const [cx, col] of [[36, '#e0605a'], [56, '#f2c14a'], [76, '#5ac07a']]) { x.fillStyle = col; x.beginPath(); x.arc(cx, 44, 7, 0, 7); x.fill(); }
    globe(x, Wd / 2, 225, 100);
    x.fillStyle = '#3a6ad0'; x.font = '700 40px "Oswald",sans-serif'; x.textAlign = 'center'; x.fillText('WWW', Wd / 2, 355);
    T.screen = c;
  }
  // キーボード面（キーの格子を粗く）
  {
    const Wd = 512, Ht = 320, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#c9ccd2'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#2a2c30';
    for (let r = 0; r < 5; r++) for (let k = 0; k < 12; k++) E.roundRect(x, 24 + k * 39, 16 + r * 36, 32, 30, 5), x.fill();
    x.fillStyle = '#b4b8c0'; E.roundRect(x, 176, 208, 160, 96, 10); x.fill();
    T.keys = c;
  }
  {
    const c = C(256, 32), x = c.getContext('2d');
    x.fillStyle = '#e8eaee'; x.fillRect(0, 0, 256, 32);
    for (let i = 0; i < 6; i++) { x.fillStyle = i < 4 ? '#3ac06a' : '#3a8ad0'; x.beginPath(); x.arc(40 + i * 36, 16, 7, 0, 7); x.fill(); }
    T.leds = c;
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
