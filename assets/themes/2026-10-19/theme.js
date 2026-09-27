/* =========================================================================
 *  10/19 バーゲンの日（1895年のこの日、大阪の呉服店が日本で初めて「大売出し」をした）
 *  ブティックの一角。淡いピンクの幅広ストライプの壁、白っぽい木の台。
 *  主役は右奥の、ひも持ち手の紙袋ふたつ（「SALE」の柄）。右手前に丸い帽子箱。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'bargain-day',
  title: 'バーゲンの日',
  dayName: 'Bargain Day',
  caption: { fill: '#ffffff', outline: '#c0364e' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fffafa', ink: '#3a2226', accent: '#d0344c', back: '#eedcdc', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.1, z: 0.12, yaw: 10 };
    const BAGS = [
      { x: 0.44, z: -1.0, yaw: -14, w: 0.56, h: 0.64, d: 0.2, tex: 'bagA', rope: [0.9, 0.9, 0.88] },
      { x: 0.7, z: -0.66, yaw: -34, w: 0.46, h: 0.52, d: 0.18, tex: 'bagB', rope: [0.2, 0.2, 0.22] }
    ];
    const HAT = { x: 0.36, z: -0.06 };
    const CAL = { x: -0.72, z: -0.74, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.04, 0.48, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    // 紙袋：上が少し開いた箱。前後の面はテクスチャ、側面は折り目のあるマチ
    const bag = (api, b) => {
      const L = local(b.x, b.z, b.yaw, 1), yw = b.yaw;
      const PAPER = mat(M.matte, { tex: tex[b.tex], spec: 0.15, shin: 20 });
      const SIDE = mat(M.matte, { tex: tex[b.tex + 's'], spec: 0.12 });
      api.box(L(0, b.h / 2, 0), [0, yw, 0], [b.w, b.h, b.d], mat(SIDE, { tex: tex[b.tex], face: S.FACE.FRONT, edgeTex: tex[b.tex + 's'], edge: [1, 1, 1] }));
      api.panel(L(0, b.h / 2, -b.d / 2 - 0.001), [0, yw + 180, 0], [b.w, b.h], PAPER);
      // 口の内側（暗い面）
      api.quad(L(0, b.h - 0.004, 0), [0, yw, 0], [b.w - 0.01, b.d - 0.01], mat(M.matte, { color: [0.3, 0.26, 0.24] }));
      // ひもの持ち手（前後に1本ずつ、口からアーチ状に）
      for (const sz of [b.d / 2 - 0.01, -b.d / 2 + 0.01]) {
        api.mesh('bg:rope' + b.tex, () => G.tube((t) => { const a = Math.PI * t; return [-Math.cos(a) * 0.1, Math.sin(a) * 0.16 - 0.02, 0]; }, () => 0.008, 32, 8, true),
          L(0, b.h, sz), [0, yw, 0], [1, 1, 1], mat(M.matte, { color: b.rope, spec: 0.2 }));
      }
      K.shadow(api, b.x, b.z, b.w + 0.12, b.d + 0.2, yw, 0.45);
    };

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.96, 0.9, 0.9], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.04, 1.02],
      sky: [1.02, 1.01, 1.01], ground: [0.72, 0.62, 0.6], envTop: [1.04, 1.02, 1.02], envBot: [0.5, 0.44, 0.44],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [6, 1], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.8, 0.74, 0.68], uvScale: [2, 1] }));

        for (const b of BAGS) bag(api, b);

        /* --- 丸い帽子箱（ふたつきの円筒。ふたの縁とリボン） --- */
        const hx = HAT.x, hz = HAT.z, hr = 0.34, hh = 0.2;
        const HB = mat(M.matte, { tex: tex.hat, spec: 0.18, uvScale: [1, 1] });
        api.lathe('bg:hatbox', [[0, 0], [0.5, 0], [0.5, 0.86, 1], [0, 0.86]], [hx, 0, hz], [0, 20, 0], [hr, hh, hr], HB);
        api.lathe('bg:hatlid', [[0, 0.82], [0.52, 0.82], [0.52, 1.0, 1], [0.5, 1.02], [0, 1.02]], [hx, 0, hz], [0, 0, 0], [hr, hh, hr], mat(M.matte, { color: [0.2, 0.2, 0.22], spec: 0.2 }));
        api.lathe('bg:hatband', [[0.503, 0.3], [0.506, 0.34], [0.506, 0.46], [0.503, 0.5]], [hx, 0, hz], [0, 0, 0], [hr, hh, hr], mat(M.plastic, { color: [0.86, 0.22, 0.32], spec: 0.5 }));
        K.shadow(api, hx, hz, 0.42, 0.42, 0, 0.45);

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
    E.drawGrain(ctx, W, H, 0.02, 119, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 64), x = c.getContext('2d');
    x.fillStyle = '#f6dfe0'; x.fillRect(0, 0, 128, 64);
    x.fillStyle = '#fbeeee'; x.fillRect(0, 0, 64, 64);
    T.wall = c;
  }
  T.table = woodTex(E, 47, [236, 226, 212], 5);
  // 紙袋A：赤地に白で「SALE」「50% OFF」
  const bagFace = (bg, fg, sub) => {
    const Wd = 256, Ht = 300, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, 0, Wd, 16);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '700 78px "Oswald",sans-serif'; x.fillText('SALE', Wd / 2, Ht * 0.48);
    x.font = '700 30px "Oswald",sans-serif'; x.fillText(sub, Wd / 2, Ht * 0.7);
    x.strokeStyle = fg; x.lineWidth = 4; x.strokeRect(30, Ht * 0.28, Wd - 60, Ht * 0.52);
    return c;
  };
  T.bagA = bagFace('#d0344c', '#ffffff', '50% OFF');
  T.bagB = bagFace('#f7efe2', '#2a2a2e', 'SPECIAL');
  const side = (bg) => { const c = C(64, 64), x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(30, 0, 3, 64); return c; };
  T.bagAs = side('#c02e44'); T.bagBs = side('#ebe3d4');
  // 帽子箱：黒と白の太い縦じま
  {
    const c = C(256, 64), x = c.getContext('2d');
    x.fillStyle = '#f6f2ea'; x.fillRect(0, 0, 256, 64);
    x.fillStyle = '#2a2a2e'; for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 16, 64);
    T.hat = c;
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
