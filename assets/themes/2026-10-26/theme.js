/* =========================================================================
 *  10/26 柿の日（1895年のこの日、正岡子規が「柿食へば鐘が鳴るなり法隆寺」の句を詠んだ旅に出たとされる）
 *  秋の縁側の部屋。土壁、濃い木の座卓。主役は右奥の竹かごに盛った柿（ヘタ・軸つき）。
 *  右手前にひとつだけ置いた柿と、湯のみ。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'persimmon-day',
  title: '柿の日',
  dayName: 'Persimmon Day',
  caption: { fill: '#fff8ea', outline: '#b0501a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf5e8', ink: '#3a2418', accent: '#d0662a', back: '#e6d6bc', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall', 'weave'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.16, z: 0.12, yaw: 10 };
    const BASKET = { x: 0.56, z: -0.86 };
    const ONE = { x: 0.34, z: -0.1 };
    const CUP = { x: 0.66, z: -0.24 };
    const CAL = { x: -0.74, z: -0.76, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.46, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    // 柿：上から見て4つのゆるい山のある、平たい丸（直径1・高さ≒0.72）
    const kakiGeo = () => G.surface((u, v) => {
      const a = u * Math.PI * 2, f = -Math.PI / 2 + v * Math.PI;
      const lobe = 1 + 0.05 * Math.cos(a * 4) * Math.cos(f);
      const r = 0.5 * Math.cos(f) * lobe;
      let y = 0.36 + 0.34 * Math.sin(f);
      if (f > 1.1) y -= (f - 1.1) * 0.08;                 // ヘタのくぼみ
      return [Math.sin(a) * r, y, Math.cos(a) * r];
    }, 48, 24);
    // ヘタ：4枚のがく（反った四角い葉）
    const calyxGeo = () => G.surface((u, v) => {
      const a = Math.floor(u * 4) / 4 * Math.PI * 2 + (u * 4 % 1 - 0.5) * 1.3, r = v * 0.34 * (1 - 0.3 * Math.abs(u * 4 % 1 - 0.5) * 2);
      return [Math.sin(a) * r, 0.02 + 0.08 * v * v, Math.cos(a) * r];
    }, 64, 6);
    const KAKI = mat(M.glossyFood, { tex: tex.kaki, spec: 0.55, shin: 70, rim: 0.2 });
    const CALYX = mat(M.matte, { color: [0.4, 0.42, 0.22], spec: 0.2 });
    const kaki = (api, x, y, z, s, ry, tilt) => {
      api.mesh('kk:fruit', kakiGeo, [x, y, z], [tilt || 0, ry, 0], [s, s, s], KAKI);
      const tr = (tilt || 0) * Math.PI / 180, yr = ry * Math.PI / 180, h = 0.68 * s;
      const top = [x + Math.sin(tr) * Math.sin(yr) * h, y + Math.cos(tr) * h, z + Math.sin(tr) * Math.cos(yr) * h];
      api.mesh('kk:calyx', calyxGeo, top, [tilt || 0, ry + 20, 0], [s, s, s], CALYX);
      api.cylinder([top[0], top[1] + 0.03 * s, top[2]], [tilt || 0, ry, 0], [0.05 * s, 0.07 * s, 0.05 * s], mat(M.wood, { color: [0.36, 0.26, 0.14] }));
    };

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.9, 0.84, 0.72], ambient: 0.56, light: [0.42, 0.86, 0.55], lightCol: [1.08, 1.05, 0.98],
      sky: [1.02, 1.0, 0.95], ground: [0.62, 0.52, 0.4], envTop: [1.04, 1.0, 0.92], envBot: [0.42, 0.32, 0.24],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [4, 1.5], unlit: true });
        api.box([0, 2.9, -2.96], [0, 0, 0], [12, 0.12, 0.08], mat(M.wood, { color: [0.4, 0.26, 0.16] }));
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.3, 0.18, 0.1], uvScale: [2, 1] }));

        /* --- 竹かご（浅い鉢形＋太い縁）に柿を5つ --- */
        const bx = BASKET.x, bz = BASKET.z, bs = 0.86;
        api.lathe('kk:basket', [[0, 0.02], [0.3, 0.02], [0.42, 0.06], [0.5, 0.18], [0.49, 0.185], [0.41, 0.075], [0.3, 0.04], [0, 0.04]], [bx, 0, bz], [0, 0, 0], [bs, bs, bs],
          mat(M.matte, { tex: tex.weave, uvScale: [12, 3], spec: 0.12 }));
        api.mesh('kk:rim', () => G.tube((t) => [Math.sin(t * Math.PI * 2) * 0.5, 0.18, Math.cos(t * Math.PI * 2) * 0.5], () => 0.016, 96, 10, false), [bx, 0, bz], [0, 0, 0], [bs, bs, bs], mat(M.wood, { color: [0.7, 0.54, 0.3] }));
        const ks = 0.24, by = 0.035 * bs;
        kaki(api, bx - 0.12, by, bz + 0.1, ks, 10, 6);
        kaki(api, bx + 0.13, by, bz + 0.08, ks, 50, -6);
        kaki(api, bx, by, bz - 0.14, ks, 80, 4);
        kaki(api, bx + 0.01, by + 0.13, bz + 0.0, ks, 30, 0);
        K.shadow(api, bx, bz, 0.96, 0.9, 0, 0.45);

        /* --- ひとつの柿と湯のみ --- */
        kaki(api, ONE.x, 0, ONE.z, 0.26, 40, 0);
        K.shadow(api, ONE.x, ONE.z, 0.3, 0.3, 0, 0.45);
        const cs = 0.26;
        api.lathe('kk:yunomi', [[0, 0.01], [0.28, 0.01], [0.3, 0, 1], [0.34, 0.02], [0.36, 0.06, 1], [0.38, 0.5], [0.42, 1.0], [0.4, 1.02], [0.37, 1.0], [0.34, 0.5], [0.3, 0.14], [0, 0.12]],
          [CUP.x, 0, CUP.z], [0, 0, 0], [cs, cs, cs], mat(M.ceramic, { tex: tex.yunomi, color: [1, 1, 1] }));
        api.cylinder([CUP.x, 0.86 * cs, CUP.z], [0, 0, 0], [0.72 * cs, 0.0006, 0.72 * cs], mat(M.glossyFood, { part: 'TOP', color: [0.56, 0.62, 0.26], spec: 0.3 }));
        K.shadow(api, CUP.x, CUP.z, 0.24, 0.24, 0, 0.45);

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
    E.drawGrain(ctx, W, H, 0.022, 126, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const S = 256, c = C(S, S), x = c.getContext('2d'), r = E.rnd(11);
    x.fillStyle = '#d8c4a0'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${r() > 0.5 ? '240,226,200' : '180,156,120'},0.2)`; x.beginPath(); x.arc(r() * S, r() * S, 16 + r() * 34, 0, 7); x.fill(); }
    T.wall = c;
  }
  T.table = woodTex(E, 79, [96, 58, 34], 4);
  // 柿の皮：朱色、上（ヘタ側）はやや濃く、下はやや黄色（v=下→上）
  {
    const c = C(128, 128), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 128, 0, 0);
    g.addColorStop(0, '#f2a030'); g.addColorStop(0.5, '#ec7a1e'); g.addColorStop(1, '#d8601a');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    T.kaki = c;
  }
  {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = '#d4b47c'; x.fillRect(0, 0, 64, 64);
    x.fillStyle = 'rgba(130,95,45,0.35)'; x.fillRect(0, 0, 32, 32); x.fillRect(32, 32, 32, 32);
    T.weave = c;
  }
  // 湯のみ：生成りの地に藍の線と丸い模様
  {
    const Wd = 512, Ht = 128, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#efe6d4'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#2f4a7a'; x.fillRect(0, Ht * 0.12, Wd, 6);
    for (let i = 0; i < 6; i++) { x.strokeStyle = '#2f4a7a'; x.lineWidth = 5; x.beginPath(); x.arc(40 + i * 86, Ht * 0.5, 18, 0, 7); x.stroke(); }
    T.yunomi = c;
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
