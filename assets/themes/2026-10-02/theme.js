/* =========================================================================
 *  10/02 望遠鏡の日（1608年のこの日、オランダの眼鏡職人リッペルハイが望遠鏡の特許を申請した）
 *  星好きの部屋の机。真鍮の屈折望遠鏡（卓上三脚）、天球儀、星座早見盤、
 *  卓上カレンダーの横にアクスタを置く。奥は星柄の壁紙と、朝の空に白い月が残る窓。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'telescope-day',
  title: '望遠鏡の日',
  dayName: 'Telescope Day',
  caption: { fill: '#ffffff', outline: '#233a6b' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f5f1e6', ink: '#233a6b', accent: '#c8923a', back: '#e2dccb', grain: 0.06 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['desk', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.04, z: 0.04, yaw: 12 };            // アクスタ
    const SCOPE = { x: 0.72, z: -1.2, yaw: 18 };         // 望遠鏡（右奥。窓のほうへ向ける）
    const GLOBE = { x: -0.92, z: -1.4 };                  // 天球儀（左奥）
    const CAL = { x: -0.66, z: -0.5, yaw: 20 };           // 卓上カレンダー（左）
    const DISC = { x: 0.62, z: -0.02 };                   // 星座早見盤（右手前）
    const eye = [0.3, 1.3, 2.75], at = [0.02, 0.5, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const BRASS = mat(M.gold, { color: [0.88, 0.7, 0.4] });
    const DARK = mat(M.plastic, { color: [0.14, 0.15, 0.2], spec: 0.5, shin: 70 });

    /* ---------- 形 ---------- */
    // 鏡筒（+Y が前）：接眼部 → 胴 → 対物レンズのフード（少し太い）
    const tubeProf = [[0, 0], [0.05, 0], [0.05, 0.08], [0.09, 0.1], [0.1, 0.14], [0.11, 0.2], [0.12, 0.25], [0.12, 0.84], [0.14, 0.86], [0.14, 1.0], [0.125, 1.0], [0.125, 0.9], [0, 0.9]];
    // 天球儀の台（木）
    const globeBase = [[0, 0.004], [0.4, 0.004], [0.44, 0, 1], [0.46, 0.04], [0.42, 0.08], [0.2, 0.1], [0.08, 0.14], [0.06, 0.4], [0.1, 0.44], [0, 0.44]];
    // 星座早見盤（丸い台紙・回る星図・縁）
    const discProf = [[0, 0], [0.48, 0], [0.5, 0.02], [0.5, 0.05], [0.47, 0.06], [0, 0.06]];

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.84, 0.88, 0.95], ambient: 0.55, light: [0.4, 0.86, 0.55], lightCol: [1.08, 1.06, 1.02],
      sky: [1.0, 1.02, 1.06], ground: [0.62, 0.56, 0.5], envTop: [1.04, 1.04, 1.06], envBot: [0.42, 0.38, 0.34],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：星柄の壁紙と、朝の空の窓 --- */
        api.panel([0, 1.6, -3.2], [0, 0, 0], [12, 5], { tex: tex.wall, uvScale: [5, 2], unlit: true });
        api.panel([0.6, 1.5, -3.18], [0, 0, 0], [2.4, 1.6], { tex: tex.window, unlit: true });
        /* --- 机 --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.desk, face: S.FACE.TOP, edge: [0.46, 0.3, 0.2], uvScale: [2, 1] }));

        /* --- 真鍮の屈折望遠鏡と卓上三脚 --- */
        const sx = SCOPE.x, sz = SCOPE.z, head = 0.52;
        for (let i = 0; i < 3; i++) {                     // 三本脚（頭から机へ開く）
          const a = (i / 3) * Math.PI * 2 + 0.3, fx = Math.sin(a) * 0.26, fz = Math.cos(a) * 0.26;
          api.mesh('tel:leg' + i, () => G.tube((t) => [fx * t, head - 0.04 - (head - 0.04) * t, fz * t], () => 0.016, 12, 8, true), [sx, 0, sz], [0, 0, 0], [1, 1, 1], DARK);
          api.lathe('tel:foot', [[0, 0], [0.5, 0], [0.4, 1], [0, 1]], [sx + fx, 0, sz + fz], [0, 0, 0], [0.05, 0.03, 0.05], BRASS);
        }
        api.lathe('tel:head', [[0, 0], [0.5, 0], [0.5, 0.5], [0.3, 1], [0, 1]], [sx, head - 0.06, sz], [0, 0, 0], [0.12, 0.1, 0.12], BRASS);
        api.rbox([sx, head + 0.07, sz], [0, SCOPE.yaw, 0], [0.08, 0.1, 0.1], mat(DARK, { round: 0.25 }));
        // 鏡筒：前（+Y）を上向き 25°、yaw の方向へ。支点が胴の中ほどに来るよう少し後ろへずらす
        const pitch = 28, L = 0.82, yr = SCOPE.yaw * Math.PI / 180, pr = pitch * Math.PI / 180;
        const dir = [-Math.sin(yr) * Math.cos(pr), Math.sin(pr), -Math.cos(yr) * Math.cos(pr)];   // lathe の +Y 軸が向く方向
        const back = 0.42 * L, o = [sx - dir[0] * back, head + 0.12 - dir[1] * back, sz - dir[2] * back];
        // lathe の軸(+Y)を dir に向ける：X 回転で前へ倒し（-90+pitch）、Y 回転で向きを合わせる
        api.lathe('tel:tube', tubeProf, o, [-(90 - pitch), SCOPE.yaw, 0], [L, L, L], mat(BRASS, { tex: tex.tube, metal: 0.45, color: [1, 1, 1] }));
        api.lathe('tel:lens', [[0, 0], [0.5, 0], [0.5, 0.2], [0, 0.2]], [o[0] + dir[0] * 0.9 * L, o[1] + dir[1] * 0.9 * L, o[2] + dir[2] * 0.9 * L], [-(90 - pitch), SCOPE.yaw, 0],
          [0.25 * L, 0.02, 0.25 * L], mat(M.glass, { color: [0.3, 0.42, 0.6], spec: 1, shin: 160, rim: 0.8 }));
        // ファインダー（小さな筒を上に）
        const fo = [o[0] + dir[0] * 0.55 * L, o[1] + dir[1] * 0.55 * L + 0.2, o[2] + dir[2] * 0.55 * L];
        api.lathe('tel:finder', [[0, 0], [0.5, 0], [0.5, 1], [0.6, 1], [0.6, 1.1], [0, 1.1]], [fo[0] - dir[0] * 0.14, fo[1] - dir[1] * 0.14, fo[2] - dir[2] * 0.14],
          [-(90 - pitch), SCOPE.yaw, 0], [0.05, 0.26, 0.05], BRASS);
        for (const k of [0.3, 0.7]) api.cylinder([fo[0] + dir[0] * (k - 0.5) * 0.24, fo[1] - 0.06 + dir[1] * (k - 0.5) * 0.24, fo[2] + dir[2] * (k - 0.5) * 0.24], [0, 0, 0], [0.018, 0.1, 0.018], BRASS);

        /* --- 天球儀 --- */
        const gx = GLOBE.x, gz = GLOBE.z, gs = 0.6;
        api.lathe('tel:gbase', globeBase, [gx, 0, gz], [0, 0, 0], [gs, gs, gs], mat(M.wood, { color: [0.42, 0.26, 0.16], spec: 0.35, shin: 50 }));
        const gy = 0.44 * gs + 0.2;
        api.sphere([gx, gy, gz], [23, 20, 0], [0.38, 0.38, 0.38], mat(M.ceramic, { tex: tex.sky, spec: 0.4, shin: 60 }));
        api.mesh('tel:ring', () => G.tube((t) => [Math.cos(t * Math.PI * 2) * 0.5, Math.sin(t * Math.PI * 2) * 0.5, 0], () => 0.02, 96, 10, false), [gx, gy, gz], [0, 25, 0], [0.44, 0.44, 0.44], BRASS);

        /* --- 星座早見盤（机に寝かせる） --- */
        api.lathe('tel:disc', discProf, [DISC.x, 0, DISC.z], [0, 0, 0], [0.44, 0.44, 0.44], mat(M.matte, { color: [0.2, 0.26, 0.46] }));
        api.cylinder([DISC.x, 0.027, DISC.z], [0, -20, 0], [0.4, 0.002, 0.4], mat(M.matte, { tex: tex.planisphere, part: 'TOP' }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, sx, sz, 0.66, 0.62, 0, 0.35);
        K.shadow(api, gx, gz, 0.4, 0.38, 0, 0.45);
        K.shadow(api, DISC.x, DISC.z, 0.52, 0.5, 0, 0.35);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.024, 102, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  const star = (x, cx, cy, s) => { x.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? s * 0.45 : s; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); };

  // 星柄の壁紙：深い紺に金の小さな星（粗く大きめ）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), r = E.rnd(22);
    x.fillStyle = '#2a3a66'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#e8c878';
    for (let i = 0; i < 14; i++) star(x, r() * S, r() * S, 8 + r() * 8);
    x.fillStyle = 'rgba(232,200,120,0.6)';
    for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(r() * S, r() * S, 2.5, 0, 7); x.fill(); }
    T.wall = c;
  }
  // 窓：朝の空に白い月、下に街の屋根
  {
    const Wd = 900, Ht = 600, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#9cc6ea'); g.addColorStop(0.7, '#e6eef4'); g.addColorStop(1, '#fbeedc');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.arc(640, 150, 46, 0, 7); x.fill();
    x.fillStyle = '#bcd6ee'; x.beginPath(); x.arc(662, 138, 42, 0, 7); x.fill();
    x.fillStyle = '#8a9ab4';
    for (let i = 0; i < 9; i++) { const px = i * 110 - 20, h = 60 + (i * 37) % 70; x.fillRect(px, Ht - h, 90, h); x.beginPath(); x.moveTo(px - 8, Ht - h); x.lineTo(px + 45, Ht - h - 34); x.lineTo(px + 98, Ht - h); x.fill(); }
    x.fillStyle = '#f5f2ea'; const fw = 22;
    x.fillRect(0, 0, Wd, fw); x.fillRect(0, Ht - fw, Wd, fw); x.fillRect(0, 0, fw, Ht); x.fillRect(Wd - fw, 0, fw, Ht); x.fillRect(Wd / 2 - 8, 0, 16, Ht);
    T.window = c;
  }
  // 机：オーク
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(61);
    const n = 6, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.94 + r() * 0.1;
      x.fillStyle = `rgb(${186 * b | 0},${138 * b | 0},${96 * b | 0})`; x.fillRect(0, i * pw, S, pw);
      for (let k = 0; k < 6; k++) {
        x.strokeStyle = r() > 0.5 ? 'rgba(120,78,46,0.22)' : 'rgba(225,185,140,0.2)'; x.lineWidth = 3 + r() * 4;
        const y0 = i * pw + 8 + r() * (pw - 16); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k + i) * 6);
        x.stroke();
      }
      x.fillStyle = 'rgba(80,50,28,0.4)'; x.fillRect(0, i * pw, S, 3);
    }
    T.desk = c;
  }
  // 鏡筒：真鍮に黒い帯（接眼側・フード）（v=後→前）
  {
    const c = C(32, 256), x = c.getContext('2d');
    x.fillStyle = '#e8c27a'; x.fillRect(0, 0, 32, 256);
    x.fillStyle = '#2a2a30'; x.fillRect(0, 256 - 40, 32, 40); x.fillRect(0, 0, 32, 26);
    x.fillStyle = '#b08a48'; x.fillRect(0, 120, 32, 8); x.fillRect(0, 60, 32, 8);
    T.tube = c;
  }
  // 天球儀：紺の天球に金の星と星座の線、黄道の帯
  {
    const Wd = 1024, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(8);
    x.fillStyle = '#1f3566'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = 'rgba(232,200,120,0.5)'; x.lineWidth = 3;
    for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, i * Ht / 6); x.lineTo(Wd, i * Ht / 6); x.stroke(); }
    for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(i * Wd / 12, 0); x.lineTo(i * Wd / 12, Ht); x.stroke(); }
    x.strokeStyle = '#c8923a'; x.lineWidth = 16; x.beginPath();
    for (let px = 0; px <= Wd; px += 16) x.lineTo(px, Ht / 2 + Math.sin(px / Wd * Math.PI * 2) * 90); x.stroke();
    x.strokeStyle = 'rgba(255,240,200,0.7)'; x.lineWidth = 3; x.fillStyle = '#ffe8a8';
    for (let k = 0; k < 7; k++) {
      let px = 60 + r() * (Wd - 120), py = 80 + r() * (Ht - 160);
      x.beginPath(); x.moveTo(px, py);
      const pts = [[px, py]];
      for (let j = 0; j < 4; j++) { px += (r() - 0.5) * 120; py += (r() - 0.5) * 90; x.lineTo(px, py); pts.push([px, py]); }
      x.stroke();
      for (const [qx, qy] of pts) star(x, qx, qy, 9);
    }
    T.sky = c;
  }
  // 星座早見盤：紺の星図、窓の楕円、外周の目盛り
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), cx = S / 2, r = E.rnd(5);
    x.fillStyle = '#e9e1cc'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#1f3566'; x.beginPath(); x.ellipse(cx, cx + 10, S * 0.36, S * 0.3, 0, 0, 7); x.fill();
    x.fillStyle = '#ffe8a8';
    for (let i = 0; i < 26; i++) star(x, cx + (r() - 0.5) * S * 0.6, cx + 10 + (r() - 0.5) * S * 0.48, 5 + r() * 5);
    x.strokeStyle = '#233a6b'; x.lineWidth = 4;
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * S * 0.44, cx + Math.sin(a) * S * 0.44); x.lineTo(cx + Math.cos(a) * S * 0.49, cx + Math.sin(a) * S * 0.49); x.stroke(); }
    x.fillStyle = '#233a6b'; x.font = '700 30px "Oswald",sans-serif'; x.textAlign = 'center'; x.fillText('STAR FINDER', cx, S * 0.14);
    T.planisphere = c;
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
