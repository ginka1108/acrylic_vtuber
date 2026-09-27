/* =========================================================================
 *  10/23 電信電話記念日（1869年のこの日、東京〜横浜間で電信線の架設工事が始まった）
 *  昭和の電話台。からし色の壁と腰板、濃い木の台にレースの敷物。
 *  主役は右奥の黒いダイヤル式電話（本体・回転ダイヤル・受話器・カールコード）。
 *  右手前に観葉植物。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'telephone-day',
  title: '電信電話記念日',
  dayName: 'Telephone Day',
  caption: { fill: '#fffaea', outline: '#5a3a1a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf6e6', ink: '#3a2a18', accent: '#b0702a', back: '#e4d6b8', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.06, z: 0.12, yaw: 10 };
    const PHONE = { x: 0.52, z: -0.6, yaw: -26, s: 1.3 };
    const PLANT = { x: 0.84, z: -1.2 };
    const CAL = { x: -0.72, z: -0.74, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.46, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const BLACK = mat(M.plastic, { color: [0.1, 0.1, 0.11], spec: 0.8, shin: 90, rim: 0.3 });

    // 本体：底が広く上がすぼまる、角の丸い台形の塊（幅1・奥行1・高さ1の正規化）
    const bodyGeo = () => G.surface((u, v) => {
      const a = u * Math.PI * 2, e = 0.35, sp = (w) => Math.sign(w) * Math.pow(Math.abs(w), e);
      const y = v, k = 1 - 0.32 * y - 0.1 * y * y;
      const round = v > 0.85 ? Math.sqrt(Math.max(0, 1 - Math.pow((v - 0.85) / 0.15, 2))) : 1;
      return [sp(Math.sin(a)) * 0.5 * k * (0.4 + 0.6 * round), y, sp(Math.cos(a)) * 0.5 * k * (0.4 + 0.6 * round) + 0.08 * y];
    }, 64, 24);
    // 受話器：両端が膨らんだ弓なりの持ち手。端に耳当て／送話口
    const handleGeo = () => G.tube((t) => [(t - 0.5) * 0.9, 0.06 * Math.sin(t * Math.PI), 0], (t) => 0.05 + 0.02 * Math.pow(Math.abs(t - 0.5) * 2, 4), 48, 16, true);
    const cupProf = [[0, 0], [0.5, 0], [0.55, 0.2], [0.5, 0.8], [0.4, 1], [0, 1]];
    // カールコード：ゆるい弧に沿った螺旋
    const cordGeo = () => G.tube((t) => {
      const base = [0.12 - 0.5 * t, 0.06 - 0.05 * Math.sin(t * Math.PI), 0.26 + 0.1 * Math.sin(t * Math.PI)];
      const a = t * Math.PI * 2 * 18;
      return [base[0], base[1] + 0.018 * Math.cos(a), base[2] + 0.018 * Math.sin(a)];
    }, () => 0.006, 720, 6, true);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.9, 0.82, 0.6], ambient: 0.56, light: [0.42, 0.86, 0.55], lightCol: [1.08, 1.05, 1.0],
      sky: [1.02, 1.0, 0.95], ground: [0.62, 0.52, 0.4], envTop: [1.04, 1.0, 0.94], envBot: [0.4, 0.32, 0.24],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.9, -3.0], [0, 0, 0], [12, 3.6], { tex: tex.wall, uvScale: [6, 2], unlit: true });
        api.box([0, 0.3, -3.02], [0, 0, 0], [12, 0.6, 0.06], mat(M.wood, { color: [0.4, 0.26, 0.16] }));
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.34, 0.2, 0.12], uvScale: [2, 1] }));
        // レースの敷物（電話の下）
        api.cylinder([PHONE.x, 0.002, PHONE.z], [0, 0, 0], [1.0, 0.002, 1.0], mat(M.matte, { tex: tex.doily, part: 'TOP', color: [1, 1, 1] }));

        /* --- ダイヤル式電話 --- */
        const Q = PHONE.s, L = local(PHONE.x, PHONE.z, PHONE.yaw, Q), yw = PHONE.yaw;
        api.mesh('tp:body', bodyGeo, L(0, 0.004, 0), [0, yw, 0], [0.44 * Q, 0.27 * Q, 0.46 * Q], BLACK);
        // 前面の傾斜にダイヤル（白い文字盤＋透明の指穴板のかわりに黒い輪＋指止め）
        const tilt = 22, dc = L(0, 0.13, 0.214);
        api.cylinder(dc, [90 - tilt, yw, 0], [0.17 * Q, 0.008 * Q, 0.17 * Q], mat(M.plastic, { tex: tex.dial, part: 'TOP', color: [1, 1, 1], spec: 0.5, sharp: true }));
        api.cylinder(dc, [90 - tilt, yw, 0], [0.175 * Q, 0.006 * Q, 0.175 * Q], mat(M.metal, { color: [0.75, 0.76, 0.78], part: 'SIDE' }));
        // 受話器のかけ台（上の2本の爪）
        for (const sx of [-0.17, 0.17]) api.rbox(L(sx, 0.275, -0.02), [0, yw, 0], [0.05 * Q, 0.06 * Q, 0.12 * Q], mat(BLACK, { round: 0.4 }));
        // 受話器（かけ台にのせる）
        const hy = 0.33;
        api.mesh('tp:handle', handleGeo, L(0, hy, -0.02), [0, yw, 0], [0.5 * Q, 0.5 * Q, 0.5 * Q], BLACK);
        for (const sx of [-1, 1]) api.lathe('tp:cup', cupProf, L(sx * 0.225, hy - 0.035, -0.02), [0, yw, 0], [0.11 * Q, 0.07 * Q, 0.11 * Q], BLACK);
        // カールコード（本体の横から受話器の端へ）
        api.mesh('tp:cord', cordGeo, L(0, 0, 0), [0, yw, 0], [Q, Q, Q], BLACK);
        K.shadow(api, PHONE.x, PHONE.z, 0.7 * Q, 0.7 * Q, yw, 0.5);

        /* --- 観葉植物 --- */
        K.plant(api, { x: PLANT.x, z: PLANT.z, s: 1.3, seed: 12, leaves: 12, pot: [0.86, 0.84, 0.8] });
        K.shadow(api, PLANT.x, PLANT.z, 0.46, 0.46, 0, 0.45);

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
    E.drawGrain(ctx, W, H, 0.022, 123, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#d9b75a'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, 0, 128, 64);
    T.wall = c;
  }
  T.table = woodTex(E, 67, [110, 66, 38], 4);
  // 文字盤：白い円に 1〜0 の数字を円周に、中央に赤い丸
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#111'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#f4f1e8'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill();
    x.fillStyle = '#1a1a1c'; x.beginPath(); x.arc(128, 128, 110, 0, 7); x.fill();
    const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    nums.forEach((n, i) => {
      const a = -Math.PI / 3 - i * (Math.PI * 1.55 / 9);
      const hx = 128 + Math.cos(a) * 80, hy = 128 - Math.sin(a) * 80;
      x.fillStyle = '#f4f1e8'; x.beginPath(); x.arc(hx, hy, 20, 0, 7); x.fill();
      x.fillStyle = '#222'; x.font = '700 22px "Oswald",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, hx, hy + 1);
    });
    x.fillStyle = '#f4f1e8'; x.beginPath(); x.arc(128, 128, 38, 0, 7); x.fill();
    x.fillStyle = '#c8322a'; x.beginPath(); x.arc(128, 128, 20, 0, 7); x.fill();
    x.fillStyle = '#c9ccd0'; x.fillRect(200, 190, 34, 10);
    T.dial = c;
  }
  // レースの敷物（白い円に透かしの輪と花弁、外周はスカラップ。外は透明）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#fbf8f0';
    x.beginPath();
    for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, r = 120 + 6 * Math.cos(a * 16); x.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); }
    x.fill();
    x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; x.beginPath(); x.arc(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100, 7, 0, 7); x.fill(); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.beginPath(); x.ellipse(128 + Math.cos(a) * 60, 128 + Math.sin(a) * 60, 16, 7, a, 0, 7); x.fill(); }
    x.globalCompositeOperation = 'source-over';
    T.doily = c;
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
