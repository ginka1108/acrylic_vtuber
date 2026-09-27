/* =========================================================================
 *  10/17 貯蓄の日（五穀豊穣に感謝する神嘗祭の日にちなみ、勤労の成果を大切にする日）
 *  明るい子ども部屋風。ミントの水玉の壁、白っぽい木のテーブル。
 *  主役は右奥の陶器のぶたの貯金箱（背中に投入口・くるんとしたしっぽ）。
 *  右手前に硬貨を底にためたガラスの貯金瓶。左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'savings-day',
  title: '貯蓄の日',
  dayName: 'Savings Day',
  caption: { fill: '#ffffff', outline: '#c2507a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fffaf6', ink: '#4a2a36', accent: '#d0567e', back: '#ecdcd8', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.18, z: 0.12, yaw: 12 };
    const PIG = { x: 0.52, z: -0.95, yaw: 205, s: 0.46 };
    const JAR = { x: 0.5, z: -0.1 };
    const CAL = { x: -0.72, z: -0.72, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.06, 0.46, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    const PINK = mat(M.ceramic, { color: [0.98, 0.7, 0.76] });
    const PINKD = mat(M.ceramic, { color: [0.92, 0.56, 0.64] });
    // ぶたの胴：前後に長い楕円体（+x が頭）。直径 1 の球を基準に
    const bodyGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, ph = -Math.PI / 2 + v * Math.PI;
      const cx = Math.cos(ph) * Math.cos(th), cy = Math.sin(ph), cz = Math.cos(ph) * Math.sin(th);
      const k = 1 + 0.08 * Math.max(0, cx);                       // 頭側が少しふくらむ
      return [cx * 0.62 * k, cy * 0.46 + 0.02 * cx, cz * 0.5];
    }, 64, 32);
    const earGeo = () => G.surface((u, v) => {
      const s = v * 2 - 1, w = 0.5 * (1 - u) + 0.02;
      return [s * w, u, 0.25 * u * u - 0.12 * s * s];
    }, 12, 8);

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.9, 0.96, 0.94], ambient: 0.57, light: [0.42, 0.86, 0.55], lightCol: [1.06, 1.04, 1.02],
      sky: [1.02, 1.02, 1.02], ground: [0.7, 0.64, 0.58], envTop: [1.04, 1.04, 1.04], envBot: [0.5, 0.46, 0.44],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        api.panel([0, 1.7, -3.0], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [6, 2.2], unlit: true });
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.7, 0.6, 0.48], uvScale: [2, 1] }));

        /* --- ぶたの貯金箱 --- */
        const Q = PIG.s, L = local(PIG.x, PIG.z, PIG.yaw, Q), yw = PIG.yaw;
        const legH = 0.16, cy = legH + 0.4;
        api.mesh('pg:body', bodyGeo, L(0, cy, 0), [0, yw, 0], [Q, Q, Q], PINK);
        // 脚4本（ずんぐりした円すい台）
        for (const [lx, lz] of [[0.34, 0.22], [0.34, -0.22], [-0.32, 0.22], [-0.32, -0.22]])
          api.lathe('pg:leg', [[0, 0], [0.5, 0], [0.55, 0.1, 1], [0.6, 1], [0, 1]], L(lx, 0, lz), [0, 0, 0], [0.2 * Q, legH * Q + 0.06 * Q, 0.2 * Q], PINKD);
        // 鼻（平たい円柱）と鼻の穴
        const snout = L(0.7, cy - 0.02, 0);
        api.lathe('pg:snout', [[0, 0], [0.5, 0], [0.52, 0.1], [0.5, 0.9], [0.44, 1], [0, 1]], snout, [0, yw, -90], [0.3 * Q, 0.16 * Q, 0.26 * Q], PINKD);
        for (const nz of [-0.05, 0.05]) api.sphere(L(0.86, cy - 0.02, nz), [0, yw, 0], [0.02 * Q, 0.07 * Q, 0.05 * Q], mat(M.matte, { color: [0.5, 0.26, 0.3] }));
        // 目（黒い半球）
        for (const ez of [-0.2, 0.2]) api.sphere(L(0.6, cy + 0.17, ez), [0, yw, 0], [0.06 * Q, 0.07 * Q, 0.06 * Q], mat(M.ceramic, { color: [0.1, 0.08, 0.1] }));
        // 耳（前に少し倒れた三角の曲面）
        for (const ez of [-0.26, 0.26]) api.mesh('pg:ear', earGeo, L(0.36, cy + 0.34, ez), [0, yw + (ez > 0 ? 10 : -10), -32], [0.22 * Q, 0.22 * Q, 0.22 * Q], PINKD);
        // 背中の投入口（細長い溝）
        api.rbox(L(-0.02, cy + 0.455, 0), [0, yw, 0], [0.26 * Q, 0.03 * Q, 0.05 * Q], mat(M.matte, { color: [0.3, 0.16, 0.2], round: 0.4 }));
        // くるんとしたしっぽ
        api.mesh('pg:tail', () => G.tube((t) => { const a = t * Math.PI * 3; return [-0.02 * t - 0.06 * Math.sin(a) * t, 0.06 * Math.cos(a) * t + 0.04 * t, 0.06 * Math.sin(a * 0.5)]; }, (t) => 0.03 - 0.012 * t, 40, 10, true),
          L(-0.62, cy + 0.06, 0), [0, yw, 0], [Q, Q, Q], PINKD);
        // 胴の花の絵つけ（片側）
        api.panel(L(0.0, cy + 0.02, 0.505), [0, yw, 0], [0.34 * Q, 0.3 * Q], { tex: tex.flower, unlit: false, spec: 0.3, sharp: false });
        K.shadow(api, PIG.x, PIG.z, 0.9 * Q + 0.1, 0.7 * Q + 0.1, yw, 0.45);

        /* --- 硬貨の瓶（中身→瓶の順。瓶は半透明） --- */
        const jx = JAR.x, jz = JAR.z, js = 0.3;
        const r = E.rnd(7), COIN = [mat(M.gold, { color: [0.9, 0.72, 0.4] }), mat(M.metal, { color: [0.86, 0.86, 0.88] }), mat(M.gold, { color: [0.8, 0.52, 0.34] })];
        // 平らに寝かせた硬貨を底から層にして詰める（互いにめり込まない格子）
        for (let layer = 0; layer < 4; layer++) {
          const pts = [[0, 0], [0.09, 0], [-0.09, 0], [0.045, 0.078], [-0.045, 0.078], [0.045, -0.078], [-0.045, -0.078]];
          pts.forEach(([ox, oz], i) => {
            if (layer === 3 && i > 4) return;
            const off = layer % 2 ? 0.02 : 0;
            api.cylinder([jx + ox * js * 2.7 + off, 0.018 + layer * 0.02 + 0.01, jz + oz * js * 2.7 - off], [(r() - 0.5) * 8, r() * 90, (r() - 0.5) * 8], [0.075, 0.016, 0.075], COIN[(i + layer) % 3]);
          });
        }
        api.lathe('pg:lid', [[0, 0.95], [0.33, 0.95], [0.34, 0.97], [0.34, 1.06, 1], [0.31, 1.08], [0, 1.08]], [jx, 0, jz], [0, 0, 0], [js, js, js], mat(M.metal, { color: [0.78, 0.8, 0.82] }));
        K.shadow(api, jx, jz, 0.34, 0.34, 0, 0.35);

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        stand.shadow(api, P);
        api.blend(true);
        // ガラス瓶（アクスタより右手前だが、アクスタと重ならないので先に描く）
        api.lathe('pg:jar', [[0, 0.005], [0.36, 0.005], [0.4, 0.03, 1], [0.42, 0.2], [0.42, 0.8], [0.36, 0.92], [0.3, 0.96], [0.31, 0.99]], [jx, 0, jz], [0, 0, 0], [js, js, js],
          mat(M.glass, { color: [0.86, 0.95, 0.96], alpha: 0.28 }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();
    E.drawVignette(ctx, W, H, 0.1);
    E.drawGrain(ctx, W, H, 0.02, 117, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const S = 128, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#cdeee2'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#f6fcf8';
    for (const [a, b] of [[32, 32], [96, 96]]) { x.beginPath(); x.arc(a, b, 12, 0, 7); x.fill(); }
    T.wall = c;
  }
  T.table = woodTex(E, 37, [224, 204, 176], 5);
  // 貯金箱の絵つけ：白い小花と葉（透明地）
  {
    const c = C(256, 224), x = c.getContext('2d');
    const fl = (cx, cy, r) => {
      x.fillStyle = '#ffffff';
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; x.beginPath(); x.arc(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6, r * 0.48, 0, 7); x.fill(); }
      x.fillStyle = '#f2c14a'; x.beginPath(); x.arc(cx, cy, r * 0.35, 0, 7); x.fill();
    };
    x.fillStyle = '#6aa86a';
    for (const [lx, ly, a] of [[110, 150, -0.6], [160, 90, 0.8]]) { x.beginPath(); x.ellipse(lx, ly, 34, 14, a, 0, 7); x.fill(); }
    fl(90, 100, 50); fl(170, 150, 36);
    T.flower = c;
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
