/* =========================================================================
 *  10/08 木の日（「十」と「八」を組み合わせると「木」になることから）
 *  杉板の壁と森の見える窓。木のテーブルに、松の盆栽、木の器に入れた松ぼっくり、
 *  積み木の家、卓上カレンダーの横にアクスタを置く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'tree-day',
  title: '木の日',
  dayName: 'Tree Day',
  caption: { fill: '#fffbef', outline: '#3a5528' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f5eedc', ink: '#3a5528', accent: '#9a5a2a', back: '#e2d6ba', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'cedar', 'bark'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.04, z: 0.04, yaw: 10 };            // アクスタ
    const BONSAI = { x: 0.7, z: -1.25, yaw: -14 };        // 盆栽（右奥）
    const BOWL = { x: 0.62, z: -0.06 };                    // 木の器と松ぼっくり（右手前）
    const BLOCKS = { x: -0.56, z: 0.1, yaw: 30 };        // 積み木の家（左手前）
    const CAL = { x: -0.8, z: -1.05, yaw: 24 };          // 卓上カレンダー（左奥）
    const eye = [0.32, 1.3, 2.75], at = [0.03, 0.48, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    /* ---------- 形 ---------- */
    const bez = (a, b, c, d) => (t) => { const u = 1 - t; return [0, 1, 2].map(k => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]); };
    // 盆栽の幹（S字にうねって細くなる）と枝
    const trunkPath = bez([0, 0, 0], [-0.22, 0.2, 0.04], [0.26, 0.34, -0.04], [0.02, 0.6, 0.0]);
    const branches = [
      { p: bez([0.03, 0.26, 0], [0.18, 0.3, 0.05], [0.3, 0.3, 0.06], [0.42, 0.34, 0.08]), r: 0.022, pad: [0.4, 0.38, 0.08, 0.36, 0.2, 0.3] },
      { p: bez([0.0, 0.4, 0], [-0.14, 0.44, 0.02], [-0.26, 0.44, -0.02], [-0.36, 0.48, 0.0]), r: 0.02, pad: [-0.34, 0.52, 0.0, 0.34, 0.19, 0.28] },
      { p: bez([0.02, 0.54, 0], [0.1, 0.58, -0.04], [0.18, 0.6, -0.06], [0.22, 0.64, -0.06]), r: 0.016, pad: [0.2, 0.67, -0.06, 0.28, 0.17, 0.24] }
    ];
    const topPad = [0.02, 0.74, 0.0, 0.34, 0.2, 0.3];
    // 葉の塊：でこぼこした平たい楕円体（松の葉のかたまり）
    const padGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, ph = (v - 0.5) * Math.PI;
      const n = 1 + 0.12 * Math.sin(th * 6) * Math.cos(ph) + 0.08 * Math.sin(th * 11 + 1) * Math.cos(ph);
      const y = Math.sin(ph) * (ph > 0 ? 0.62 : 0.34);
      return [0.5 * Math.cos(ph) * Math.sin(th) * n, y, 0.5 * Math.cos(ph) * Math.cos(th) * n];
    }, 64, 20);
    // 木の器（ろくろ挽きの浅い鉢）
    const bowlProf = [[0, 0.01], [0.2, 0.01], [0.22, 0, 1], [0.26, 0, 1], [0.28, 0.02], [0.4, 0.1], [0.48, 0.22], [0.5, 0.3], [0.49, 0.32],
      [0.46, 0.31], [0.45, 0.24], [0.38, 0.14], [0.24, 0.07], [0, 0.06]];
    // 松ぼっくり（卵形。うろこはテクスチャ）
    const coneProf = [[0, 0], [0.12, 0.02], [0.3, 0.12], [0.42, 0.3], [0.44, 0.5], [0.38, 0.72], [0.24, 0.9], [0.1, 0.98], [0, 1.0]].map(q => [q[0], q[1] - 0.5]);
    // 三角屋根（積み木）
    const prism = () => {
      const v = [], push = (p, uv, n) => v.push(p[0], p[1], p[2], uv[0], uv[1], n[0], n[1], n[2]);
      const A = [-0.5, 0, 0.5], B = [0.5, 0, 0.5], Cp = [0, 0.6, 0.5], A2 = [-0.5, 0, -0.5], B2 = [0.5, 0, -0.5], C2 = [0, 0.6, -0.5];
      const tri = (a, b, c, n) => { push(a, [0, 0], n); push(b, [1, 0], n); push(c, [0.5, 1], n); };
      const quad = (a, b, c, d, n) => { push(a, [0, 0], n); push(b, [1, 0], n); push(c, [1, 1], n); push(a, [0, 0], n); push(c, [1, 1], n); push(d, [0, 1], n); };
      const nl = [-0.768, 0.64, 0], nr = [0.768, 0.64, 0];
      tri(A, B, Cp, [0, 0, 1]); tri(B2, A2, C2, [0, 0, -1]);
      quad(A2, A, Cp, C2, nl); quad(B, B2, C2, Cp, nr); quad(A2, B2, B, A, [0, -1, 0]);
      return new Float32Array(v);
    };

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.9, 0.88, 0.82], ambient: 0.55, light: [-0.45, 0.86, 0.5], lightCol: [1.08, 1.06, 1.0],
      sky: [1.0, 1.02, 0.98], ground: [0.66, 0.58, 0.46], envTop: [1.04, 1.04, 0.98], envBot: [0.46, 0.4, 0.3],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：杉板の壁と、森の見える窓 --- */
        api.panel([0, 1.6, -3.0], [0, 0, 0], [12, 5], { tex: tex.cedar, uvScale: [8, 1], unlit: true });
        api.panel([0.2, 1.5, -2.98], [0, 0, 0], [2.6, 1.5], { tex: tex.window, unlit: true });
        api.box([0.2, 0.72, -2.9], [0, 0, 0], [2.8, 0.06, 0.2], mat(M.wood, { color: [0.62, 0.44, 0.28] }));
        /* --- テーブル --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.6, 0.44, 0.28], uvScale: [2, 1] }));

        /* --- 松の盆栽 --- */
        const bx = BONSAI.x, bz = BONSAI.z, by = BONSAI.yaw, s = 0.78, ry = by * Math.PI / 180;
        const at3 = (lx, ly, lz) => [bx + (Math.cos(ry) * lx + Math.sin(ry) * lz) * s, ly * s, bz + (-Math.sin(ry) * lx + Math.cos(ry) * lz) * s];
        const POT = mat(M.ceramic, { color: [0.24, 0.3, 0.46], spec: 0.55, shin: 80 });
        api.rbox(at3(0, 0.1, 0), [0, by, 0], [0.62 * s, 0.16 * s, 0.4 * s], mat(POT, { round: 0.16 }));
        for (const [fx, fz] of [[-0.24, -0.14], [0.24, -0.14], [-0.24, 0.14], [0.24, 0.14]]) api.rbox(at3(fx, 0.012, fz), [0, by, 0], [0.08 * s, 0.024, 0.06 * s], mat(POT, { round: 0.3 }));
        api.box(at3(0, 0.178, 0), [0, by, 0], [0.54 * s, 0.004, 0.32 * s], mat(M.matte, { tex: tex.moss, face: S.FACE.TOP, edge: [0.3, 0.42, 0.2] }));
        const BARK = mat(M.wood, { tex: tex.bark, uvScale: [4, 1] });
        const base = at3(-0.04, 0.18, 0);
        api.mesh('tree:trunk', () => G.tube(trunkPath, (t) => 0.06 - 0.04 * t + 0.02 * Math.pow(1 - t, 6), 40, 16, true), base, [0, by, 0], [s, s, s], BARK);
        branches.forEach((b, i) => api.mesh('tree:branch' + i, () => G.tube(b.p, (t) => b.r * (1 - 0.5 * t), 24, 10, true), base, [0, by, 0], [s, s, s], BARK));
        const LEAF = mat(M.plastic, { tex: tex.needles, spec: 0.2, shin: 30, rim: 0.12 });
        for (const pd of branches.map(b => b.pad).concat([topPad])) {
          const [px, py, pz, pw, ph, pdp] = pd;
          const lx = -0.04 + px, lz = pz;
          api.mesh('tree:pad', padGeo, at3(lx, 0.18 + py, lz), [0, by + px * 90, 0], [pw * s, ph * s, pdp * s], LEAF);
        }

        /* --- 木の器と松ぼっくり --- */
        const ws = 0.58, wx = BOWL.x, wz = BOWL.z;
        api.lathe('tree:bowl', bowlProf, [wx, 0, wz], [0, 0, 0], [ws, ws, ws], mat(M.wood, { tex: tex.bowl, spec: 0.3, shin: 40 }));
        const CONE = mat(M.matte, { tex: tex.cone, spec: 0.12 });
        for (const [cx, cy, cz, rx, ryy, rz, cs] of [[-0.08, 0.11, 0.02, 0, 30, 80, 0.2], [0.09, 0.11, -0.04, 0, -50, 96, 0.19], [0.0, 0.15, 0.1, -70, 10, 0, 0.18]])
          api.lathe('tree:cone', coneProf, [wx + cx, cy, wz + cz], [rx, ryy, rz], [cs * 0.8, cs, cs * 0.8], CONE);

        /* --- 積み木の家 --- */
        const kx = BLOCKS.x, kz = BLOCKS.z, ky = BLOCKS.yaw, kr = ky * Math.PI / 180;
        const kat = (lx, ly, lz) => [kx + Math.cos(kr) * lx + Math.sin(kr) * lz, ly, kz - Math.sin(kr) * lx + Math.cos(kr) * lz];
        const WOOD = mat(M.wood, { tex: tex.block, spec: 0.2, shin: 30 });
        api.rbox(kat(-0.08, 0.075, 0), [0, ky, 0], [0.15, 0.15, 0.15], mat(WOOD, { round: 0.08 }));
        api.rbox(kat(0.08, 0.075, 0), [0, ky, 0], [0.15, 0.15, 0.15], mat(M.plastic, { color: [0.78, 0.3, 0.24], round: 0.08, spec: 0.3 }));
        api.rbox(kat(0, 0.19, 0), [0, ky, 0], [0.3, 0.075, 0.15], mat(WOOD, { round: 0.08 }));
        api.mesh('tree:roof', prism, kat(0, 0.2275, 0), [0, ky, 0], [0.32, 0.3, 0.15], mat(M.plastic, { color: [0.3, 0.5, 0.7], spec: 0.3 }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, bx, bz, 0.62, 0.44, by, 0.45);
        K.shadow(api, wx, wz, 0.62, 0.58, 0, 0.45);
        K.shadow(api, kx + 0.05, kz, 0.6, 0.36, ky, 0.4);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    // 窓からの朝の光（ごく弱く）
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.2, W * 0.7);
    lg.addColorStop(0, 'rgba(255,246,220,0.14)'); lg.addColorStop(1, 'rgba(255,246,220,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    E.drawVignette(ctx, W, H, 0.14);
    E.drawGrain(ctx, W, H, 0.025, 108, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // テーブル：明るいパイン材（節がはっきり、木目は粗く）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(88);
    const n = 5, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.94 + r() * 0.1;
      x.fillStyle = `rgb(${222 * b | 0},${182 * b | 0},${128 * b | 0})`; x.fillRect(0, i * pw, S, pw);
      for (let k = 0; k < 6; k++) {
        x.strokeStyle = 'rgba(170,110,60,0.22)'; x.lineWidth = 3 + r() * 4;
        const y0 = i * pw + 10 + r() * (pw - 20); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.005 + k * 1.7 + i) * 8);
        x.stroke();
      }
      const kx = r() * S, ky = i * pw + pw * 0.5;
      x.fillStyle = 'rgba(130,78,40,0.55)'; x.beginPath(); x.ellipse(kx, ky, 16, 9, 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(150,95,50,0.35)'; x.lineWidth = 3;
      for (let k = 1; k < 4; k++) { x.beginPath(); x.ellipse(kx, ky, 16 + k * 12, 9 + k * 6, 0, 0, 7); x.stroke(); }
      x.fillStyle = 'rgba(110,70,40,0.4)'; x.fillRect(0, i * pw, S, 4);
    }
    T.table = c;
  }
  // 杉板の壁（縦張り、赤身と白太）
  {
    const c = C(128, 256), x = c.getContext('2d');
    x.fillStyle = '#c99a70'; x.fillRect(0, 0, 128, 256);
    x.fillStyle = '#b8835a'; x.fillRect(20, 0, 60, 256);
    x.fillStyle = 'rgba(90,55,30,0.5)'; x.fillRect(0, 0, 4, 256);
    T.cedar = c;
  }
  // 窓：朝の森（奥ほど淡い木々）と窓枠
  {
    const Wd = 1024, Ht = 600, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(19);
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#c7e3f2'); g.addColorStop(1, '#f5f0d8');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (const [base, col, n, hh] of [[360, '#a9c79a', 40, 160], [460, '#7fae6c', 36, 220], [560, '#5a8f52', 30, 260]]) {
      x.fillStyle = col;
      for (let i = 0; i < n; i++) {
        const tx = r() * Wd, th = hh * (0.6 + r() * 0.5);
        x.beginPath(); x.moveTo(tx, base - th); x.lineTo(tx - th * 0.3, base + 40); x.lineTo(tx + th * 0.3, base + 40); x.fill();
      }
      x.fillRect(0, base + 30, Wd, Ht);
    }
    x.fillStyle = '#7a5334'; const fw = 26;
    x.fillRect(0, 0, Wd, fw); x.fillRect(0, Ht - fw, Wd, fw); x.fillRect(0, 0, fw, Ht); x.fillRect(Wd - fw, 0, fw, Ht); x.fillRect(Wd / 2 - 10, 0, 20, Ht);
    T.window = c;
  }
  // 樹皮（盆栽の幹。縦に粗いひび）
  {
    const c = C(128, 128), x = c.getContext('2d'), r = E.rnd(6);
    x.fillStyle = '#6a4a34'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 14; i++) { x.fillStyle = r() > 0.5 ? 'rgba(50,32,22,0.45)' : 'rgba(150,110,80,0.35)'; x.fillRect(0, r() * 128, 128, 4 + r() * 6); }
    T.bark = c;
  }
  // 松の葉のかたまり：濃淡の緑に、放射状の短い線（粗く）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d'), r = E.rnd(4);
    x.fillStyle = '#3f6b36'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 26; i++) {
      const cx = r() * S, cy = r() * S;
      x.strokeStyle = r() > 0.5 ? '#6f9c56' : '#2f5428'; x.lineWidth = 4;
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16); x.stroke(); }
    }
    T.needles = c;
  }
  // 苔
  {
    const c = C(128, 128), x = c.getContext('2d'), r = E.rnd(2);
    x.fillStyle = '#5f8a3e'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 40; i++) { x.fillStyle = r() > 0.5 ? '#7ea452' : '#4a7232'; x.beginPath(); x.arc(r() * 128, r() * 128, 6 + r() * 6, 0, 7); x.fill(); }
    T.moss = c;
  }
  // 木の器：ケヤキの挽き目（同心の輪になるよう v 方向に縞）
  {
    const c = C(64, 512), x = c.getContext('2d');
    x.fillStyle = '#a9703f'; x.fillRect(0, 0, 64, 512);
    for (let i = 0; i < 512; i += 28) { x.fillStyle = 'rgba(110,62,30,0.35)'; x.fillRect(0, i, 64, 7); }
    T.bowl = c;
  }
  // 松ぼっくり：ひし形のうろこ（粗く）
  {
    const Wd = 256, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#5a3a22'; x.fillRect(0, 0, Wd, Ht);
    const cw = 32, ch = 28;
    for (let j = 0; j < Ht / ch + 1; j++) for (let i = -1; i < Wd / cw + 1; i++) {
      const cx = i * cw + (j % 2) * cw / 2, cy = j * ch;
      x.fillStyle = '#9a6a3e'; x.beginPath(); x.moveTo(cx, cy - ch * 0.45); x.lineTo(cx + cw * 0.45, cy); x.lineTo(cx, cy + ch * 0.45); x.lineTo(cx - cw * 0.45, cy); x.fill();
      x.fillStyle = '#b8864f'; x.beginPath(); x.moveTo(cx, cy - ch * 0.2); x.lineTo(cx + cw * 0.2, cy); x.lineTo(cx, cy + ch * 0.2); x.lineTo(cx - cw * 0.2, cy); x.fill();
    }
    T.cone = c;
  }
  // 積み木（白木）
  {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = '#e8cfa2'; x.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 64; i += 12) { x.fillStyle = 'rgba(190,150,100,0.3)'; x.fillRect(0, i, 64, 3); }
    T.block = c;
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
