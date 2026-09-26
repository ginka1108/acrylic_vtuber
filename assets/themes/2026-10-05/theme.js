/* =========================================================================
 *  10/05 レモンの日（1938年のこの日、高村光太郎の妻・智恵子が亡くなった。『レモン哀歌』にちなむ）
 *  朝のキッチンカウンター。白いタイルの壁、ガラスのピッチャーのレモネード、
 *  白い鉢に盛ったレモン、まな板の上の半分に切ったレモン、卓上カレンダーの横にアクスタを置く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'lemon-day',
  title: 'レモンの日',
  dayName: 'Lemon Day',
  caption: { fill: '#fffdf0', outline: '#3f6a2a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fffbe8', ink: '#3f6a2a', accent: '#d9a400', back: '#efe7c8', grain: 0.06 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['tile', 'counter'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.06, z: 0.04, yaw: 18 };            // アクスタ
    const BOWL = { x: -0.6, z: -0.02 };                  // レモンの鉢（左手前）
    const CAL = { x: -0.7, z: -1.05, yaw: 20 };          // 卓上カレンダー（左奥）
    const JUG = { x: 0.62, z: -1.2 };                     // ピッチャー（右奥）
    const BOARD = { x: 0.56, z: -0.12, yaw: -12 };        // まな板（右手前）
    const eye = [0.34, 1.3, 2.75], at = [0.03, 0.48, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const LEMON = mat(M.glossyFood, { tex: tex.peel, receiveShadow: false, spec: 0.45, shin: 50, rim: 0.14 });

    /* ---------- 形 ---------- */
    // レモン：両端に小さなへそのある紡錘形（軸は +Y）
    const lemonProf = [[0, 0], [0.04, 0.01], [0.07, 0.04], [0.16, 0.1], [0.3, 0.2], [0.38, 0.34], [0.41, 0.5], [0.38, 0.66], [0.3, 0.8],
      [0.16, 0.9], [0.07, 0.96], [0.035, 0.99], [0, 1.0]];
    const halfProf = lemonProf.slice(0, 7);
    // 白い鉢（厚みのある縁）
    const bowlProf = [[0, 0.01], [0.2, 0.01], [0.21, 0, 1], [0.26, 0, 1], [0.27, 0.03], [0.4, 0.12], [0.48, 0.26], [0.5, 0.34], [0.49, 0.36],
      [0.475, 0.355], [0.46, 0.28], [0.38, 0.15], [0.24, 0.08], [0, 0.07]];
    // ガラスのピッチャー（外側）と、中身（外側より少し内）
    const jugProf = [[0, 0.004], [0.36, 0.004], [0.4, 0, 1], [0.43, 0.03], [0.45, 0.2], [0.45, 0.62], [0.41, 0.78], [0.4, 0.86], [0.43, 0.96], [0.44, 1.0],
      [0.42, 1.0], [0.41, 0.96], [0.38, 0.86], [0.39, 0.78], [0.43, 0.62], [0.43, 0.2], [0.41, 0.05], [0, 0.04]];
    const liquidProf = [[0, 0.045], [0.39, 0.05], [0.415, 0.2], [0.415, 0.62], [0.39, 0.7], [0, 0.7]];

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.95, 0.96, 0.94], ambient: 0.55, light: [-0.45, 0.85, 0.55], lightCol: [1.08, 1.06, 1.0],
      sky: [1.0, 1.02, 1.02], ground: [0.72, 0.66, 0.54], envTop: [1.05, 1.05, 1.02], envBot: [0.5, 0.46, 0.38],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：白いタイルの壁・窓・棚 --- */
        api.panel([0, 1.6, -2.6], [0, 0, 0], [12, 5], { tex: tex.tile, uvScale: [6, 3], unlit: true });
        api.panel([-1.0, 1.55, -2.58], [0, 0, 0], [1.9, 1.3], { tex: tex.window, unlit: true });
        K.plant(api, { x: 1.3, z: -2.25, s: 1.4, seed: 21, pot: [0.93, 0.9, 0.82], leaf: [0.34, 0.56, 0.28] });
        /* --- カウンター --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.2], mat(M.wood, { tex: tex.counter, face: S.FACE.TOP, edge: [0.8, 0.7, 0.55], uvScale: [2, 1] }));

        /* --- 白い鉢に盛ったレモン --- */
        const bs = 0.52, bx = BOWL.x, bz = BOWL.z;
        api.lathe('lem:bowl', bowlProf, [bx, 0, bz], [0, 0, 0], [bs, bs, bs], mat(M.ceramic, { tex: tex.bowl, spec: 0.6 }));
        const ls = 0.26;   // レモンの長さ
        const lemonC = lemonProf.map(q => [q[0], q[1] - 0.5]);      // 中心を原点に
        for (const [lx, ly, lz, ry, rz] of [[-0.08, 0.17, 0.0, 10, 88], [0.08, 0.17, -0.03, -30, 94], [0.0, 0.245, 0.07, 75, 84]])
          api.lathe('lem:lemonC', lemonC, [bx + lx, ly, bz + lz], [0, ry, rz], [ls * 0.8, ls, ls * 0.8], LEMON);
        // 鉢に添えた葉
        const leaf = () => G.surface((u, v) => {
          const s = v * 2 - 1, w = 0.3 * Math.pow(Math.sin(Math.PI * u), 0.8) + 0.004;
          return [s * w, 0.06 * Math.sin(Math.PI * u) - 0.04 * s * s, u - 0.5];
        }, 32, 8);
        api.mesh('lem:leaf', leaf, [bx + 0.12, 0.21, bz + 0.1], [-8, 50, 0], [0.16, 0.16, 0.2], mat(M.plastic, { tex: tex.leaf, spec: 0.35, shin: 50 }));

        /* --- まな板と半分に切ったレモン --- */
        const brd = BOARD, br = brd.yaw;
        api.rbox([brd.x, 0.025, brd.z], [0, br, 0], [0.72, 0.05, 0.5], mat(M.wood, { tex: tex.board, round: 0.1 }));
        const halfs = [[-0.11, 0.03, 0, 0], [0.14, -0.07, 0, 0]];
        for (let i = 0; i < halfs.length; i++) {
          const [hx, hz] = halfs[i], a = br * Math.PI / 180;
          const px = brd.x + Math.cos(a) * hx + Math.sin(a) * hz, pz = brd.z - Math.sin(a) * hx + Math.cos(a) * hz;
          const tilt = i ? 22 : 14, hs = 0.32;
          // 皮（下半分）と切り口
                    api.lathe('lem:half', halfProf, [px, 0.05 - 0.03, pz], [tilt, 30 * i, 0], [hs, hs, hs], LEMON);
          const r = 0.41 * hs;
          const ta = tilt * Math.PI / 180, ya = 30 * i * Math.PI / 180;
          const off = hs * 0.5 + 0.002;
          api.cylinder([px + Math.sin(ta) * Math.sin(ya) * off, 0.02 + Math.cos(ta) * off, pz + Math.sin(ta) * Math.cos(ya) * off], [tilt, 30 * i, 0], [r * 2, 0.002, r * 2],
            mat(M.glossyFood, { tex: tex.cut, part: 'TOP', spec: 0.5, shin: 60 }));
        }
        /* --- ピッチャーのレモネード（中身・輪切り・ガラス） --- */
        const js = 0.62, jx = JUG.x, jz = JUG.z;
        api.lathe('lem:liquid', liquidProf, [jx, 0, jz], [0, 0, 0], [js, js, js], mat(M.glossyFood, { tex: tex.lemonade, spec: 0.5, shin: 60 }));
        // ガラスに沿って沈む輪切り（カメラ側）
        const ry = Math.atan2(eye[0] - jx, eye[2] - jz) * 180 / Math.PI;
        for (const [ang, yy, sz] of [[-28, 0.3, 0.2], [18, 0.46, 0.22], [-4, 0.18, 0.18]]) {
          const a = (ry + ang) * Math.PI / 180, rr = 0.418 * js;
          api.cylinder([jx + Math.sin(a) * rr, yy * js, jz + Math.cos(a) * rr], [90, ry + ang, 0], [sz * js, 0.004, sz * js], mat(M.glossyFood, { tex: tex.cut, part: 'TOP', spec: 0.4 }));
        }
        api.mesh('lem:handle', () => G.tube((t) => { const a = -Math.PI / 2 + t * Math.PI; return [0.44 + Math.cos(a) * 0.2, 0.5 - Math.sin(a) * 0.28, 0]; }, () => 0.04, 32, 14, true),
          [jx, 0, jz], [0, 150, 0], [js, js, js], mat(M.glass, { color: [0.86, 0.94, 0.95], spec: 0.9, rim: 0.6 }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, bx, bz, 0.6, 0.56, 0, 0.45);
        K.shadow(api, brd.x, brd.z, 0.85, 0.62, br, 0.4);
        K.shadow(api, jx, jz, 0.62, 0.58, 0, 0.35);

        stand.shadow(api, P);
        api.blend(true);
        // ガラスのピッチャー（中身より手前・アクスタより奥）。影は落とさない
        api.lathe('lem:jug', jugProf, [jx, 0, jz], [0, 0, 0], [js, js, js], mat(M.glass, { color: [0.86, 0.95, 0.97], alpha: 0.2, rim: 0.9, castShadow: false }));
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.022, 105, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 白いタイル（横長のサブウェイタイル、目地は淡いグレー）
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#c9cfcf'; x.fillRect(0, 0, Wd, Ht);
    const tw = 128, th = 64;
    for (let row = 0; row < 4; row++) for (let col = -1; col < 5; col++) {
      const px = col * tw + (row % 2) * tw / 2 + 4, py = row * th + 4;
      const g = x.createLinearGradient(0, py, 0, py + th - 8);
      g.addColorStop(0, '#fbfcfb'); g.addColorStop(1, '#eef1f0');
      x.fillStyle = g; E.roundRect(x, px, py, tw - 8, th - 8, 6); x.fill();
    }
    T.tile = c;
  }
  // 窓（朝の空とレモンの木の葉）
  {
    const Wd = 760, Ht = 520, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(8);
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#bfe0f2'); g.addColorStop(1, '#fbf3d8');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 70; i++) {
      x.fillStyle = ['#7fae5c', '#98c270', '#6a9a4e'][i % 3]; x.globalAlpha = 0.7;
      x.beginPath(); x.ellipse(r() * Wd, Ht * 0.5 + r() * Ht * 0.6, 30 + r() * 40, 16 + r() * 16, r() * 3, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { x.fillStyle = '#f6d23a'; x.beginPath(); x.ellipse(80 + r() * 600, 320 + r() * 150, 22, 16, 0.3, 0, 7); x.fill(); }
    x.fillStyle = '#f7f6f0'; const fw = 18;
    x.fillRect(0, 0, Wd, fw); x.fillRect(0, Ht - fw, Wd, fw); x.fillRect(0, 0, fw, Ht); x.fillRect(Wd - fw, 0, fw, Ht); x.fillRect(Wd / 2 - 7, 0, 14, Ht);
    T.window = c;
  }
  // カウンター（明るいオーク）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(55);
    const n = 6, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.95 + r() * 0.08;
      x.fillStyle = `rgb(${226 * b | 0},${196 * b | 0},${156 * b | 0})`; x.fillRect(0, i * pw, S, pw);
      for (let k = 0; k < 5; k++) {
        x.strokeStyle = 'rgba(170,125,80,0.18)'; x.lineWidth = 3 + r() * 3;
        const y0 = i * pw + 8 + r() * (pw - 16); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k + i) * 5);
        x.stroke();
      }
      x.fillStyle = 'rgba(130,90,55,0.3)'; x.fillRect(0, i * pw, S, 3);
    }
    T.counter = c;
  }
  // 鉢：白地に内側の黄色い線（v=下→上：外→縁→内）
  {
    const c = C(32, 256), x = c.getContext('2d');
    x.fillStyle = '#f8f7f2'; x.fillRect(0, 0, 32, 256);
    x.fillStyle = '#e8c23a'; x.fillRect(0, 256 * 0.3, 32, 8);
    x.fillStyle = '#6f9a4a'; x.fillRect(0, 256 * 0.58, 32, 5);
    T.bowl = c;
  }
  // レモンの皮：黄色（両端はわずかに緑がかる）
  {
    const c = C(64, 256), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, '#c9c23a'); g.addColorStop(0.08, '#f2cf2a'); g.addColorStop(0.5, '#fbdc3c'); g.addColorStop(0.92, '#f2cf2a'); g.addColorStop(1, '#b9b83a');
    x.fillStyle = g; x.fillRect(0, 0, 64, 256);
    T.peel = c;
  }
  // 切り口：皮・白いわた・房（9つ）・中心の芯
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), cx = S / 2;
    x.fillStyle = '#f3cf2c'; x.fillRect(0, 0, S, S);                 // 角も塗る（透明だと縮小時に暗くなる）
    x.fillStyle = '#fbf6dc'; x.beginPath(); x.arc(cx, cx, S * 0.46, 0, 7); x.fill();
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2 + 0.05, a1 = (i + 1) / n * Math.PI * 2 - 0.05;
      const g = x.createRadialGradient(cx, cx, S * 0.06, cx, cx, S * 0.42);
      g.addColorStop(0, '#fff3a8'); g.addColorStop(1, '#f7de5a');
      x.fillStyle = g;
      x.beginPath(); x.moveTo(cx + Math.cos((a0 + a1) / 2) * S * 0.05, cx + Math.sin((a0 + a1) / 2) * S * 0.05);
      x.arc(cx, cx, S * 0.41, a0, a1); x.closePath(); x.fill();
      // 房の中の粒（粗く、淡い）
      x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 5;
      const am = (a0 + a1) / 2;
      x.beginPath(); x.moveTo(cx + Math.cos(am) * S * 0.14, cx + Math.sin(am) * S * 0.14); x.lineTo(cx + Math.cos(am) * S * 0.34, cx + Math.sin(am) * S * 0.34); x.stroke();
    }
    x.fillStyle = '#fbf6dc'; x.beginPath(); x.arc(cx, cx, S * 0.05, 0, 7); x.fill();
    T.cut = c;
  }
  // レモネード：淡い黄色、下ほど濃い（v=下→上）
  {
    const c = C(32, 256), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, '#f6d23c'); g.addColorStop(0.7, '#fbe46a'); g.addColorStop(1, '#fdf0a0');
    x.fillStyle = g; x.fillRect(0, 0, 32, 256);
    T.lemonade = c;
  }
  // 葉
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#4e8a3a'; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = 'rgba(200,230,160,0.7)'; x.lineWidth = 3; x.beginPath(); x.moveTo(64, 0); x.lineTo(64, 128); x.stroke();
    T.leaf = c;
  }
  // まな板（ヒノキの柾目、淡く）
  {
    const c = C(256, 256), x = c.getContext('2d'), r = E.rnd(3);
    x.fillStyle = '#e9d2a8'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(190,150,100,0.18)'; x.fillRect(r() * 256, 0, 3 + r() * 4, 256); }
    T.board = c;
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
