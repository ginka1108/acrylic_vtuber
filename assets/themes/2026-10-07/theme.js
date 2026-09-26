/* =========================================================================
 *  10/07 ミステリー記念日（推理小説の祖エドガー・アラン・ポーの命日）
 *  探偵の書斎の机。緑の革を張った天板に、緑のシェードのバンカーズランプ、
 *  平積みの古い推理小説、封蝋で閉じた手紙、真鍮の虫眼鏡、卓上カレンダーの横にアクスタを置く。
 *  奥は本棚の壁。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'mystery-day',
  title: 'ミステリー記念日',
  dayName: 'Mystery Day',
  caption: { fill: '#fbf3df', outline: '#2c2a3e' },
  size: [1350, 1350],
  googleFonts: 'family=Playfair+Display:wght@700',
  fonts: ['700 100px "Playfair Display"'],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#efe4cc', ink: '#2c2a3e', accent: '#8a2a2a', back: '#d9ccb0', grain: 0.12 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['desk', 'shelf', 'leather'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: 0.02, z: 0.04, yaw: 12 };             // アクスタ
    const LAMP = { x: -0.95, z: -1.45 };                    // バンカーズランプ（右奥）
    const BOOKS = { x: 0.9, z: -1.3, yaw: -16 };         // 平積みの本（左奥）
    const CAL = { x: -0.62, z: -0.4, yaw: 20 };          // 卓上カレンダー（左）
    const LOUPE = { x: 0.6, z: -0.14, yaw: 245 };        // 虫眼鏡（右手前）
    const LETTER = { x: 0.34, z: -0.72, yaw: -8 };         // 封筒（中央奥）
    const eye = [0.3, 1.3, 2.75], at = [0.03, 0.48, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const BRASS = mat(M.gold, { color: [0.86, 0.68, 0.38] });

    /* ---------- 形 ---------- */
    const lampBase = [[0, 0.004], [0.46, 0.004], [0.5, 0, 1], [0.52, 0.03], [0.5, 0.06], [0.36, 0.1], [0.14, 0.13], [0.07, 0.16], [0, 0.16]];
    // 緑のガラスシェード：横長の半円筒、両端はふさぐ
    const shadeGeo = () => G.surface((u, v) => {
      const a = Math.PI * (0.08 + 0.84 * u), L = 1;
      const endCap = Math.min(1, Math.min(v, 1 - v) * 14);          // 端はすぼめてふさぐ
      const r = 0.5 * Math.sqrt(endCap);
      return [(v - 0.5) * L, Math.sin(a) * r, Math.cos(a) * r];
    }, 32, 48);
    const shadeIn = () => G.surface((u, v) => {
      const a = Math.PI * (0.08 + 0.84 * u), r = 0.47;
      return [(v - 0.5) * 0.9, Math.sin(a) * r, -Math.cos(a) * r];
    }, 24, 12);
    // 虫眼鏡：真鍮の枠（輪）、木の柄
    const rimGeo = () => G.tube((t) => [Math.cos(t * Math.PI * 2) * 0.5, 0, Math.sin(t * Math.PI * 2) * 0.5], () => 0.045, 96, 14, false);
    const handleProf = [[0, 0], [0.05, 0], [0.07, 0.06], [0.08, 0.3], [0.09, 0.62], [0.1, 0.8], [0.11, 0.9], [0.1, 0.96], [0.06, 1.0], [0, 1.0]];

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.3, 0.24, 0.2], ambient: 0.52, light: [-0.45, 0.86, 0.5], lightCol: [1.08, 1.04, 0.98],
      sky: [1.0, 0.97, 0.92], ground: [0.56, 0.45, 0.36], envTop: [1.0, 0.96, 0.9], envBot: [0.36, 0.28, 0.22],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：本棚の壁 --- */
        api.panel([0, 1.6, -3.4], [0, 0, 0], [12, 5], { tex: tex.shelf, uvScale: [4, 2], unlit: true });
        /* --- 机：ウォルナットの天板に緑の革 --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.desk, face: S.FACE.TOP, edge: [0.34, 0.22, 0.15], uvScale: [2, 1] }));
        api.box([0.1, 0.004, -0.55], [0, 0, 0], [3.2, 0.008, 2.3], mat(M.matte, { tex: tex.leather, face: S.FACE.TOP, edge: [0.16, 0.3, 0.22], spec: 0.15, shin: 20 }));

        /* --- バンカーズランプ --- */
        const lx = LAMP.x, lz = LAMP.z, ls = 0.52;
        api.lathe('mys:lampBase', lampBase, [lx, 0.008, lz], [0, 0, 0], [ls, ls, ls], BRASS);
        api.cylinder([lx, 0.008 + 0.36, lz], [0, 0, 0], [0.035, 0.66, 0.035], BRASS);
        // シェードを支える腕とシェード
        api.cylinder([lx, 0.66, lz], [0, 20, 90], [0.03, 0.3, 0.03], BRASS);
        api.mesh('mys:shade', shadeGeo, [lx, 0.66, lz + 0.04], [0, 20, 0], [0.62, 0.34, 0.34], mat(M.glossyFood, { color: [0.16, 0.46, 0.3], spec: 0.8, shin: 110, rim: 0.3 }));
        api.mesh('mys:shadeIn', shadeIn, [lx, 0.66, lz + 0.04], [0, 20, 0], [0.62, 0.33, 0.33], mat(M.ceramic, { color: [1.0, 0.95, 0.82], unlit: true }));
        api.lathe('mys:pull', [[0, 0], [0.02, 0.01], [0.024, 0.05], [0.012, 0.08], [0, 0.08]], [lx - 0.02, 0.47, lz + 0.18], [0, 0, 0], [1, 1, 1], BRASS);
        api.cylinder([lx - 0.02, 0.53, lz + 0.18], [0, 0, 0], [0.006, 0.1, 0.006], BRASS);

        /* --- 平積みの古い推理小説 --- */
        const bk = BOOKS, cols = [[0.42, 0.12, 0.12], [0.16, 0.26, 0.2], [0.2, 0.22, 0.36]];
        let by = 0.008;
        [[0.62, 0.46, 0.11, 0], [0.56, 0.42, 0.09, -6], [0.5, 0.38, 0.1, 5]].forEach(([w, d, h, ry], i) => {
          K.book(api, { x: bk.x, y: by, z: bk.z, w, d, h, yaw: bk.yaw + ry, col: cols[i], coverTex: i === 2 ? tex.cover : undefined });
          by += h;
        });

        /* --- 封蝋の手紙 --- */
        api.box([LETTER.x, 0.012, LETTER.z], [0, LETTER.yaw, 0], [0.46, 0.008, 0.3], mat(M.matte, { tex: tex.envelope, face: S.FACE.TOP, edge: [0.86, 0.8, 0.66] }));
        api.lathe('mys:seal', [[0, 0], [0.5, 0], [0.5, 0.2], [0.4, 0.34], [0, 0.36]], [LETTER.x + 0.02, 0.016, LETTER.z + 0.02], [0, 0, 0], [0.09, 0.08, 0.09],
          mat(M.glossyFood, { color: [0.62, 0.1, 0.12], spec: 0.5 }));

        /* --- 真鍮の虫眼鏡（机に寝かせる） --- */
        const ox = LOUPE.x, oz = LOUPE.z, oy = LOUPE.yaw * Math.PI / 180, lr = 0.36;
        api.mesh('mys:rim', rimGeo, [ox, 0.03, oz], [0, LOUPE.yaw, 0], [lr, lr, lr], BRASS);
        const hx = ox + Math.cos(oy) * lr * 0.5, hz = oz - Math.sin(oy) * lr * 0.5;
        api.lathe('mys:handle', handleProf, [hx, 0.035, hz], [0, LOUPE.yaw, -90], [0.36, 0.34, 0.36], mat(M.wood, { color: [0.36, 0.18, 0.1], spec: 0.4, shin: 60 }));
        api.cylinder([hx + Math.cos(oy) * 0.02, 0.035, hz - Math.sin(oy) * 0.02], [0, LOUPE.yaw, -90], [0.06, 0.05, 0.06], BRASS);

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, lx, lz, 0.6, 0.55, 0, 0.45, 0.008);
        K.shadow(api, bk.x, bk.z, 0.8, 0.62, bk.yaw, 0.45, 0.008);
        K.shadow(api, ox, oz, 0.5, 0.46, 0, 0.3, 0.008);

        stand.shadow(api, P);
        api.blend(true);
        // レンズ（半透明。影は落とさない）
        api.cylinder([ox, 0.03, oz], [0, 0, 0], [lr * 0.96, 0.02, lr * 0.96], mat(M.glass, { color: [0.86, 0.94, 0.96], alpha: 0.28, rim: 1.0, castShadow: false }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.18);
    E.drawGrain(ctx, W, H, 0.028, 107, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 本棚の壁：棚板3段に色とりどりの背表紙（粗く、奥なのでぼける前提）
  {
    const Wd = 1024, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(71);
    x.fillStyle = '#3a2618'; x.fillRect(0, 0, Wd, Ht);
    const cols = ['#7a2a24', '#284a3a', '#2c3a5e', '#8a6a3a', '#5a3a52', '#a8894e', '#3e2e22', '#6e4a2c'];
    const rows = 3, rh = Ht / rows;
    for (let j = 0; j < rows; j++) {
      let px = 8;
      while (px < Wd - 10) {
        const w = 18 + r() * 26, h = rh * (0.62 + r() * 0.28), col = cols[(r() * cols.length) | 0];
        x.fillStyle = col; x.fillRect(px, (j + 1) * rh - 14 - h, w, h);
        x.fillStyle = 'rgba(230,200,140,0.55)';
        x.fillRect(px + 3, (j + 1) * rh - 14 - h + h * 0.15, w - 6, 4); x.fillRect(px + 3, (j + 1) * rh - 14 - h * 0.2, w - 6, 4);
        px += w + 2;
        if (r() > 0.93) px += 30;
      }
      x.fillStyle = '#5a3a24'; x.fillRect(0, (j + 1) * rh - 14, Wd, 14);
    }
    T.shelf = c;
  }
  // ウォルナットの天板
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(9);
    x.fillStyle = '#5a3a26'; x.fillRect(0, 0, S, S);
    for (let k = 0; k < 40; k++) {
      x.strokeStyle = r() > 0.5 ? 'rgba(40,24,14,0.3)' : 'rgba(130,90,60,0.25)'; x.lineWidth = 3 + r() * 5;
      const y0 = r() * S; x.beginPath();
      for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k) * 10);
      x.stroke();
    }
    T.desk = c;
  }
  // 緑の革の天板（縁に金の押し線）
  {
    const S = 1024, c = C(S, S * 0.72), x = c.getContext('2d');
    x.fillStyle = '#2f5a44'; x.fillRect(0, 0, S, S * 0.72);
    E.drawGrain(x, S, S * 0.72, 0.06, 3, 3);
    x.strokeStyle = '#c9a25a'; x.lineWidth = 6; x.strokeRect(22, 22, S - 44, S * 0.72 - 44);
    x.lineWidth = 2; x.strokeRect(36, 36, S - 72, S * 0.72 - 72);
    T.leather = c;
  }
  // 本の表紙（題字と飾り枠）
  {
    const Wd = 512, Ht = 400, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#343a5c'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = '#d6b36a'; x.lineWidth = 6; x.strokeRect(24, 24, Wd - 48, Ht - 48);
    x.fillStyle = '#d6b36a'; x.textAlign = 'center';
    x.font = '700 58px "Playfair Display"'; x.fillText('The Case', Wd / 2, 170);
    x.font = '700 40px "Playfair Display"'; x.fillText('of the Morning', Wd / 2, 240);
    x.beginPath(); x.arc(Wd / 2, 310, 16, 0, 7); x.fill();
    T.cover = c;
  }
  // 封筒（生成り・フラップの線）
  {
    const Wd = 460, Ht = 300, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#efe4c8'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = 'rgba(120,96,60,0.5)'; x.lineWidth = 4;
    x.beginPath(); x.moveTo(8, 10); x.lineTo(Wd / 2, Ht * 0.58); x.lineTo(Wd - 8, 10); x.stroke();
    T.envelope = c;
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
