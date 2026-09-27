/* =========================================================================
 *  10/31 ハロウィン
 *  ハロウィンの飾りつけをした部屋。紫の壁にこうもりとお月さまの柄、木の机に橙のチェックのクロス。
 *  主役は右奥のジャック・オー・ランタン（くり抜いた顔。灯りはともさず、室内照明のまま）。
 *  右手前に曲がった先の魔女の帽子。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'halloween',
  title: 'ハロウィン',
  dayName: 'Halloween',
  caption: { fill: '#fff4dc', outline: '#4a2a6a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf5e6', ink: '#2e1e3e', accent: '#e0701e', back: '#e2d6c4', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall', 'cloth'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.16, z: 0.12, yaw: 10 };
    const PUMP = { x: 0.6, z: -0.96, yaw: -20 };
    const HAT = { x: 0.44, z: -0.26, yaw: 30 };
    const CAL = { x: -0.74, z: -0.78, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.48, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    // かぼちゃ：縦のうね（12本）のある平たい球。直径1・高さ≒0.72。顔は u=0.5 側（テクスチャ）
    const pumpGeo = () => G.surface((u, v) => {
      const a = u * Math.PI * 2, f = -Math.PI / 2 + v * Math.PI;
      const rib = 1 - 0.07 * Math.pow(Math.abs(Math.cos(a * 6)), 0.6) * Math.cos(f);
      const r = 0.5 * Math.cos(f) * rib;
      let y = 0.36 + 0.34 * Math.sin(f);
      if (f > 1.0) y -= (f - 1.0) * 0.12;
      if (f < -1.0) y += (-1.0 - f) * 0.06;
      return [Math.sin(a) * r, y, Math.cos(a) * r];
    }, 96, 40);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.46, 0.36, 0.56], ambient: 0.56, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.04, 1.0],
      sky: [1.0, 0.98, 1.02], ground: [0.6, 0.48, 0.4], envTop: [1.02, 1.0, 1.04], envBot: [0.4, 0.3, 0.3],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [5, 2], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.matte, { tex: tex.cloth, face: S.FACE.TOP, edge: [0.8, 0.5, 0.26], uvScale: [5, 3.5] }));

        /* --- ジャック・オー・ランタン --- */
        const px = PUMP.x, pz = PUMP.z, ps = 0.62;
        api.mesh('hw:pump', pumpGeo, [px, 0, pz], [0, PUMP.yaw + 180, 0], [ps, ps, ps], mat(M.plastic, { tex: tex.pumpkin, color: [1, 1, 1], spec: 0.35, shin: 40, rim: 0.2 }));
        api.mesh('hw:stem', () => G.tube((t) => [0.04 * t * t, t * 0.16, 0.01 * t], (t) => 0.05 - 0.018 * t, 16, 10, true), [px, 0.64 * ps, pz], [0, 30, 0], [ps, ps, ps], mat(M.wood, { color: [0.4, 0.34, 0.18] }));
        K.shadow(api, px, pz, 0.66, 0.66, 0, 0.5);

        /* --- 魔女の帽子（つば＋先の曲がった円すい＋帯） --- */
        const hx = HAT.x, hz = HAT.z, hs = 0.5;
        const HATM = mat(M.matte, { color: [0.2, 0.14, 0.26], spec: 0.15, shin: 20, rim: 0.3 });
        api.lathe('hw:brim', [[0.12, 0.02], [0.5, 0.0], [0.52, 0.012, 1], [0.12, 0.04]], [hx, 0.004, hz], [0, 0, 0], [hs, hs, hs], HATM);
        api.mesh('hw:cone', () => G.tube((t) => [0.12 * Math.pow(t, 3), 0.03 + t * 0.62 - 0.08 * Math.pow(t, 4), 0], (t) => 0.2 * Math.pow(1 - t, 0.9) + 0.004, 40, 32, true), [hx, 0, hz], [0, HAT.yaw, 0], [hs, hs, hs], HATM);
        api.lathe('hw:band', [[0.195, 0.05], [0.2, 0.07], [0.19, 0.12]], [hx, 0, hz], [0, 0, 0], [hs, hs, hs], mat(M.plastic, { color: [0.9, 0.48, 0.14], spec: 0.4 }));
        api.rbox([hx + 0.0, 0.045 * hs + 0.01, hz + 0.1 * hs], [0, 0, 0], [0.05, 0.045, 0.012], mat(M.gold, { color: [0.92, 0.76, 0.4], round: 0.2 }));
        K.shadow(api, hx, hz, 0.56, 0.56, 0, 0.45);

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
    E.drawGrain(ctx, W, H, 0.022, 131, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  // 壁：紫に、黄色い三日月と黒いこうもり（大きく粗く）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#6a4f86'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#f2d27a'; x.beginPath(); x.arc(70, 70, 30, 0, 7); x.fill();
    x.fillStyle = '#6a4f86'; x.beginPath(); x.arc(84, 60, 26, 0, 7); x.fill();
    const bat = (cx, cy, s) => {
      x.fillStyle = '#2e2240'; x.beginPath(); x.moveTo(cx, cy);
      x.quadraticCurveTo(cx - s * 0.6, cy - s * 0.5, cx - s * 1.2, cy - s * 0.2); x.quadraticCurveTo(cx - s * 0.9, cy + s * 0.05, cx - s * 0.8, cy + s * 0.3);
      x.quadraticCurveTo(cx - s * 0.5, cy + s * 0.1, cx, cy + s * 0.3); x.quadraticCurveTo(cx + s * 0.5, cy + s * 0.1, cx + s * 0.8, cy + s * 0.3);
      x.quadraticCurveTo(cx + s * 0.9, cy + s * 0.05, cx + s * 1.2, cy - s * 0.2); x.quadraticCurveTo(cx + s * 0.6, cy - s * 0.5, cx, cy); x.fill();
    };
    bat(180, 170, 36); bat(80, 200, 22);
    T.wall = c;
  }
  // クロス：橙と黒の大きめのチェック（淡く）
  {
    const c = C(64, 64), x = c.getContext('2d');
    x.fillStyle = '#f4d8b0'; x.fillRect(0, 0, 64, 64);
    x.fillStyle = 'rgba(224,112,30,0.45)'; x.fillRect(0, 0, 32, 64); x.fillRect(0, 0, 64, 32);
    x.fillStyle = 'rgba(160,70,20,0.25)'; x.fillRect(0, 0, 32, 32);
    T.cloth = c;
  }
  // かぼちゃの皮と顔：橙に縦の濃淡、顔（三角の目・鼻、ぎざぎざの口）は暗い茶で（u=0.5 が正面）
  {
    const Wd = 1024, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#ec8a22'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 12; i++) { const g = x.createLinearGradient(i * Wd / 12, 0, (i + 1) * Wd / 12, 0); g.addColorStop(0, 'rgba(180,80,10,0.35)'); g.addColorStop(0.5, 'rgba(255,190,90,0.18)'); g.addColorStop(1, 'rgba(180,80,10,0.35)'); x.fillStyle = g; x.fillRect(i * Wd / 12, 0, Wd / 12, Ht); }
    const cx = Wd * 0.5, D = '#3a1a08';
    x.fillStyle = D;
    const tri = (ax, ay, bx, by, qx, qy) => { x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.lineTo(qx, qy); x.fill(); };
    // v（下→上）はキャンバスの下→上。目は上寄り（y 小）、口は下寄り
    tri(cx - 110, Ht * 0.42, cx - 30, Ht * 0.42, cx - 70, Ht * 0.28);
    tri(cx + 30, Ht * 0.42, cx + 110, Ht * 0.42, cx + 70, Ht * 0.28);
    tri(cx - 22, Ht * 0.52, cx + 22, Ht * 0.52, cx, Ht * 0.45);
    x.beginPath(); x.moveTo(cx - 130, Ht * 0.58);
    const teeth = [[-95, 0.66], [-70, 0.6], [-40, 0.68], [-10, 0.62], [20, 0.68], [50, 0.6], [80, 0.66], [130, 0.58]];
    for (const [dx, yy] of teeth) x.lineTo(cx + dx, Ht * yy);
    x.quadraticCurveTo(cx, Ht * 0.8, cx - 130, Ht * 0.58); x.fill();
    T.pumpkin = c;
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
