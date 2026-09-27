/* =========================================================================
 *  10/13 さつまいもの日（十三里＝「栗(九里)より(四里)うまい」から）
 *  秋の台所。クリーム色のしっくいの壁と木の棚、明るい木のテーブル。
 *  右奥に竹のざるに盛った生のさつまいも、右手前に白い皿の焼き芋（ひとつは半分に割って黄色い中身）。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'sweet-potato-day',
  title: 'さつまいもの日',
  dayName: 'Sweet Potato Day',
  caption: { fill: '#fff8ea', outline: '#6b2a4a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf5e8', ink: '#4a2a3a', accent: '#8e3a6a', back: '#e8dcc4', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall', 'weave'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.2, z: 0.1, yaw: -12 };
    const ZARU = { x: 0.3, z: -1.3 };
    const PLATE = { x: 0.5, z: -0.42 };
    const CAL = { x: -0.78, z: -0.7, yaw: 20 };
    const eye = [0.1, 1.34, 2.75], at = [-0.04, 0.4, -0.2];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    /* さつまいも：紡錘形、少し反り、表面にゆるいでこぼこ。長さ1（x方向）・太さ≒0.34 */
    const radius = (u) => 0.17 * Math.pow(Math.sin(Math.PI * u), 0.75) * (1 + 0.12 * Math.sin(u * 7.3)) + 0.004;
    const potatoGeo = (from, to, seed) => () => G.surface((u0, v) => {
      const u = from + (to - from) * u0, a = v * Math.PI * 2;
      const bump = 1 + 0.05 * Math.sin(a * 3 + u * 11 + seed) + 0.03 * Math.sin(a * 5 - u * 17);
      const r = radius(u) * bump, bend = -0.06 * Math.sin(Math.PI * u);
      return [u - 0.5, r * Math.sin(a) + bend + 0.17, r * Math.cos(a)];
    }, 48, 24, (u0, v) => [from + (to - from) * u0, v]);
    const SKIN = mat(M.plastic, { tex: tex.skin, spec: 0.3, shin: 30, rim: 0.12 });
    const ROAST = mat(M.plastic, { tex: tex.roast, spec: 0.22, shin: 24, rim: 0.1 });
    const FLESH = mat(M.cream, { tex: tex.flesh, color: [1, 1, 1], spec: 0.2, shin: 20 });
    const potato = (api, key, pos, ry, s, m, from, to, tilt) => api.mesh('sp:' + key, potatoGeo(from || 0, to || 1, key.length), pos, [tilt || 0, ry, 0], [s, s, s], m);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.94, 0.9, 0.82], ambient: 0.56, light: [-0.45, 0.86, 0.5], lightCol: [1.08, 1.05, 1.0],
      sky: [1.02, 1.0, 0.96], ground: [0.7, 0.6, 0.48], envTop: [1.02, 1.0, 0.95], envBot: [0.46, 0.38, 0.3],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* 壁と棚（奥） */
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [4, 1.5], unlit: true });
        api.box([0, 1.05, -2.82], [0, 0, 0], [5, 0.06, 0.36], mat(M.wood, { color: [0.62, 0.44, 0.28] }));
        for (const [jx, c] of [[-1.3, [0.72, 0.5, 0.3]], [-0.95, [0.86, 0.8, 0.66]], [1.1, [0.5, 0.62, 0.48]]])
          api.lathe('sp:jar', [[0, 0], [0.4, 0], [0.45, 0.06], [0.45, 0.8], [0.36, 0.9], [0.36, 1], [0, 1]], [jx, 1.08, -2.82], [0, 0, 0], [0.26, 0.36, 0.26], mat(M.ceramic, { color: c }));
        /* テーブル */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.55, 0.4, 0.26], uvScale: [2, 1] }));

        /* --- 竹のざる（浅い鉢形、縁は太い輪） --- */
        const zx = ZARU.x, zz = ZARU.z, zs = 0.9;
        const ZM = mat(M.matte, { tex: tex.weave, spec: 0.12, uvScale: [10, 3] });
        api.lathe('sp:zaru', [[0, 0.02], [0.3, 0.03], [0.44, 0.09], [0.5, 0.16], [0.49, 0.165], [0.43, 0.1], [0.3, 0.045], [0, 0.035]], [zx, 0, zz], [0, 0, 0], [zs, zs, zs], ZM);
        api.mesh('sp:rim', () => G.tube((t) => [Math.sin(t * Math.PI * 2) * 0.5, 0.16, Math.cos(t * Math.PI * 2) * 0.5], () => 0.016, 96, 10, false), [zx, 0, zz], [0, 0, 0], [zs, zs, zs], mat(M.wood, { color: [0.72, 0.56, 0.32] }));
        // 生のさつまいも3本（ざるの中に横たえる。互いに重ならない向き）
        potato(api, 'rawA', [zx - 0.02, 0.03, zz + 0.13], 8, 0.56, SKIN);
        potato(api, 'rawB', [zx + 0.03, 0.03, zz - 0.13], -10, 0.52, SKIN);
        K.shadow(api, zx, zz, 1.0, 0.9, 0, 0.45);

        /* --- 焼き芋の皿：1本はそのまま、1本は半分に割って中身を見せる --- */
        const px = PLATE.x, pz = PLATE.z;
        const py = K.plate(api, { x: px, z: pz, d: 0.66, color: [0.97, 0.96, 0.93] });
        potato(api, 'roastA', [px + 0.02, py, pz - 0.1], 8, 0.5, ROAST);
        // 割った片方（u 0〜0.52）と、断面（黄色い中身）
        const s2 = 0.46, ry = -24, rr = ry * Math.PI / 180, cx = px - 0.08, cz = pz + 0.13;
        potato(api, 'roastH', [cx, py, cz], ry, s2, ROAST, 0, 0.52);
        const cutR = radius(0.52) * s2, cutX = (0.52 - 0.5) * s2;
        api.cylinder([cx + Math.cos(rr) * cutX, py + (0.17 - 0.06 * Math.sin(Math.PI * 0.52)) * s2, cz - Math.sin(rr) * cutX], [0, ry, 90], [cutR * 2, 0.004, cutR * 2], mat(FLESH, { part: 'TOP' }));
        K.shadow(api, px, pz, 0.72, 0.66, 0, 0.4);

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
    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.024, 113, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // しっくいの壁（クリーム色に淡いムラ。筋は描かない）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d'), r = E.rnd(5);
    x.fillStyle = '#efe3cc'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${r() > 0.5 ? '255,250,240' : '214,196,166'},0.18)`; x.beginPath(); x.arc(r() * S, r() * S, 20 + r() * 40, 0, 7); x.fill(); }
    T.wall = c;
  }
  T.table = woodTex(E, 17, [206, 162, 112], 5);
  // さつまいもの皮：赤紫、縦（u方向）にゆるい濃淡、まばらな浅い筋
  {
    const c = C(256, 128), x = c.getContext('2d'), r = E.rnd(9);
    x.fillStyle = '#9a2e5a'; x.fillRect(0, 0, 256, 128);
    const g = x.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, 'rgba(60,10,30,0.35)'); g.addColorStop(0.2, 'rgba(0,0,0,0)'); g.addColorStop(0.8, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,10,30,0.35)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(200,110,140,0.3)'; x.fillRect(r() * 256, r() * 128, 14 + r() * 20, 4); }
    T.skin = c;
  }
  // 焼き芋の皮：焼けて暗くなった赤紫、ところどころ焦げ
  {
    const c = C(256, 128), x = c.getContext('2d'), r = E.rnd(19);
    x.fillStyle = '#6e2440'; x.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(40,14,16,0.45)'; x.beginPath(); x.ellipse(r() * 256, r() * 128, 10 + r() * 16, 5 + r() * 6, 0, 0, 7); x.fill(); }
    for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(180,90,110,0.3)'; x.fillRect(r() * 256, r() * 128, 18, 4); }
    T.roast = c;
  }
  // 断面：黄金色、外周に薄く皮の縁、中心へ明るく
  {
    const S = 128, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#6e2440'; x.fillRect(0, 0, S, S);
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 60);
    g.addColorStop(0, '#ffd978'); g.addColorStop(0.75, '#f2b640'); g.addColorStop(1, '#e09a2c');
    x.fillStyle = g; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill();
    T.flesh = c;
  }
  // 竹の編み目（粗い市松）
  {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = '#d8bb84'; x.fillRect(0, 0, 64, 64);
    x.fillStyle = 'rgba(140,100,50,0.35)'; x.fillRect(0, 0, 32, 32); x.fillRect(32, 32, 32, 32);
    x.fillStyle = 'rgba(90,60,30,0.3)'; x.fillRect(0, 30, 64, 3); x.fillRect(30, 0, 3, 64);
    T.weave = c;
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
