/* =========================================================================
 *  10/22 図鑑の日（図鑑の楽しさを伝える日。株式会社学研の「学研の図鑑」が制定）
 *  博物館の資料室風。セージグリーンの壁と腰板、木の机。
 *  主役は右奥のガラスの覆い（クロッシュ）をかぶせた紫水晶の結晶。右手前に蝶の標本箱。
 *  左手前に大きな図鑑（閉じた本）、左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'encyclopedia-day',
  title: '図鑑の日',
  dayName: 'Picture Encyclopedia Day',
  caption: { fill: '#fffdf4', outline: '#2f5a3a' },
  size: [1350, 1350],
  fontText: '図鑑',
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f8f6ec', ink: '#22301f', accent: '#3a7a4a', back: '#dfe2d0', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.12, z: 0.12, yaw: -10 };
    const DOME = { x: 0.56, z: -0.95 };
    const BOXP = { x: 0.52, z: -0.2, yaw: -14 };
    const BOOK = { x: -0.62, z: -0.06, yaw: 16 };
    const CAL = { x: -0.72, z: -0.8, yaw: 20 };
    const eye = [0.12, 1.34, 2.75], at = [-0.04, 0.44, -0.18];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.84, 0.88, 0.82], ambient: 0.56, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.05, 1.0],
      sky: [1.02, 1.02, 1.0], ground: [0.62, 0.56, 0.46], envTop: [1.04, 1.04, 1.0], envBot: [0.42, 0.4, 0.34],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.9, -3.0], [0, 0, 0], [12, 3.6], { tex: tex.wall, uvScale: [6, 2], unlit: true });
        api.box([0, 0.35, -3.02], [0, 0, 0], [12, 0.7, 0.06], mat(M.wood, { color: [0.46, 0.32, 0.2], tex: tex.panel, face: S.FACE.FRONT, uvScale: [8, 1] }));
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.48, 0.34, 0.22], uvScale: [2, 1] }));

        /* --- クロッシュの台座と紫水晶 --- */
        const dx = DOME.x, dz = DOME.z;
        api.lathe('zk:base', [[0, 0], [0.5, 0], [0.5, 0.06, 1], [0.46, 0.1], [0.44, 0.14, 1], [0, 0.14]], [dx, 0, dz], [0, 0, 0], [0.5, 0.5, 0.5], mat(M.wood, { color: [0.4, 0.24, 0.14], spec: 0.3 }));
        api.sphere([dx, 0.08, dz], [0, 0, 0], [0.26, 0.1, 0.22], mat(M.matte, { color: [0.6, 0.56, 0.5] }));   // 母岩
        const r = E.rnd(22);
        const AMY = [mat(M.glass, { color: [0.62, 0.42, 0.78], alpha: 1, spec: 0.9, shin: 120 }), mat(M.glass, { color: [0.74, 0.56, 0.86], alpha: 1, spec: 0.9, shin: 120 })];
        const crystal = [[0, 0], [0.5, 0], [0.5, 0.7, 1], [0, 1]];
        [[0, 0, 0.22, 0, 0], [0.05, 0.03, 0.16, 22, 40], [-0.05, 0.02, 0.17, -24, -30], [0.02, -0.05, 0.13, 18, 150], [-0.03, -0.04, 0.12, -14, 200], [0.07, -0.02, 0.1, 30, 90]]
          .forEach(([ox, oz, h, tilt, ry], i) => api.lathe('zk:cr', crystal, [dx + ox, 0.1, dz + oz], [tilt, ry, tilt * 0.3], [0.06 + h * 0.1, h, 0.06 + h * 0.1], mat(AMY[i % 2], { seg: 6 })));
        K.shadow(api, dx, dz, 0.56, 0.56, 0, 0.45);

        /* --- 蝶の標本箱（木枠・白い台紙・ガラスのふた） --- */
        const L = local(BOXP.x, BOXP.z, BOXP.yaw, 1), yw = BOXP.yaw;
        const bw = 0.62, bd = 0.44, bh = 0.07;
        api.rbox(L(0, bh / 2, 0), [0, yw, 0], [bw, bh, bd], mat(M.wood, { color: [0.52, 0.34, 0.2], round: 0.06 }));
        api.box(L(0, bh + 0.001, 0), [0, yw, 0], [bw - 0.06, 0.002, bd - 0.06], mat(M.matte, { tex: tex.butterflies, face: S.FACE.TOP, edge: [0.96, 0.95, 0.9], sharp: true }));
        K.shadow(api, BOXP.x, BOXP.z, bw + 0.08, bd + 0.08, yw, 0.4);

        /* --- 大きな図鑑（閉じた本。表紙に題） --- */
        K.book(api, { x: BOOK.x, z: BOOK.z, yaw: BOOK.yaw, w: 0.44, d: 0.56, h: 0.09, col: [0.2, 0.46, 0.3], coverTex: tex.cover });
        K.shadow(api, BOOK.x, BOOK.z, 0.52, 0.64, BOOK.yaw, 0.4);

        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        stand.shadow(api, P);
        api.blend(true);
        // 標本箱のガラス → クロッシュ（奥から）
        api.lathe('zk:dome', [[0.4, 0.14], [0.4, 0.5], [0.36, 0.66], [0.26, 0.76], [0.12, 0.8], [0.08, 0.84], [0.06, 0.9], [0, 0.92]], [dx, 0, dz], [0, 0, 0], [0.5, 0.5, 0.5],
          mat(M.glass, { color: [0.94, 0.97, 0.98], alpha: 0.2 }));
        api.box(L(0, bh + 0.006, 0), [0, yw, 0], [bw - 0.04, 0.004, bd - 0.04], mat(M.glass, { color: [0.94, 0.97, 0.98], alpha: 0.12 }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();
    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.022, 122, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#b7c7ae'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, 0, 64, 128);
    T.wall = c;
  }
  {
    const c = C(256, 128), x = c.getContext('2d');
    x.fillStyle = '#6a4a30'; x.fillRect(0, 0, 256, 128);
    x.strokeStyle = 'rgba(30,18,10,0.45)'; x.lineWidth = 6; x.strokeRect(20, 16, 216, 96);
    T.panel = c;
  }
  T.table = woodTex(E, 61, [176, 132, 90], 5);
  // 標本：白い台紙に大きな蝶を6匹（2列×3）、下に小さなラベル
  {
    const Wd = 512, Ht = 368, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f6f3ea'; x.fillRect(0, 0, Wd, Ht);
    const cols = [['#2a78c8', '#1a2a4a'], ['#f2a42a', '#3a2412'], ['#e8e2d2', '#2a2a2a'], ['#6ab04a', '#23361a'], ['#d8453a', '#2a1410'], ['#8a5ac8', '#221a3a']];
    cols.forEach(([c1, c2], i) => {
      const cx = 96 + (i % 3) * 160, cy = 110 + Math.floor(i / 3) * 150;
      for (const sx of [-1, 1]) {
        x.fillStyle = c1;
        x.beginPath(); x.ellipse(cx + sx * 34, cy - 16, 36, 26, sx * -0.5, 0, 7); x.fill();
        x.beginPath(); x.ellipse(cx + sx * 24, cy + 22, 22, 18, sx * 0.5, 0, 7); x.fill();
        x.fillStyle = c2; x.beginPath(); x.ellipse(cx + sx * 50, cy - 26, 9, 7, 0, 0, 7); x.fill();
      }
      x.fillStyle = c2; x.beginPath(); x.ellipse(cx, cy, 5, 26, 0, 0, 7); x.fill();
      x.fillStyle = '#dcd4c0'; x.fillRect(cx - 26, cy + 48, 52, 10);
    });
    T.butterflies = c;
  }
  // 図鑑の表紙：緑地に大きな「図鑑」と鳥・葉の絵
  {
    const Wd = 360, Ht = 460, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#2f6a44'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#f4e9c8'; E.roundRect(x, 30, 40, Wd - 60, 120, 14); x.fill();
    x.fillStyle = '#2f4a2a'; x.font = '900 86px "Noto Sans JP",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('図鑑', Wd / 2, 102);
    x.fillStyle = '#9ad08a'; x.beginPath(); x.ellipse(120, 320, 70, 34, -0.6, 0, 7); x.fill();
    x.fillStyle = '#f2c14a'; x.beginPath(); x.ellipse(230, 300, 56, 40, 0, 0, 7); x.fill();
    x.beginPath(); x.arc(276, 268, 26, 0, 7); x.fill();
    x.fillStyle = '#d8653a'; x.beginPath(); x.moveTo(298, 266); x.lineTo(326, 272); x.lineTo(298, 278); x.fill();
    x.fillStyle = '#222'; x.beginPath(); x.arc(282, 262, 5, 0, 7); x.fill();
    T.cover = c;
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
