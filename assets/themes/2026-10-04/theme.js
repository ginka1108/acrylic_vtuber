/* =========================================================================
 *  10/04 陶器の日（「とう(10)き(4)」の語呂合わせ）
 *  陶芸工房の作業台。手回しろくろの上で挽いたばかりの器、
 *  瑠璃釉の花入れ、志野の茶碗、卓上カレンダーの横にアクスタを置く。
 *  奥の棚には素焼きの器が並ぶ。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'pottery-day',
  title: '陶器の日',
  dayName: 'Pottery Day',
  caption: { fill: '#fffaf3', outline: '#5a3524' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#efe6d6', ink: '#5a3524', accent: '#2f5d8a', back: '#ddd0bb', grain: 0.1 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['bench', 'wall', 'shelf'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.08, z: 0.04, yaw: 16 };            // アクスタ
    const WHEEL = { x: 0.7, z: -0.16 };                    // 手回しろくろ（右）
    const VASE = { x: 0.22, z: -1.6 };                     // 花入れ（奥）
    const BOWL = { x: 0.36, z: -0.98 };                  // 茶碗（左手前）
    const CAL = { x: -0.68, z: -0.66, yaw: 22 };           // 卓上カレンダー（左奥）
    const eye = [0.36, 1.3, 2.75], at = [0.04, 0.48, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);

    /* ---------- 形 ---------- */
    // 手回しろくろ：鋳物の台（裾広がり）と回転盤
    const wheelBase = [[0, 0.004], [0.3, 0.004], [0.32, 0, 1], [0.34, 0.03], [0.28, 0.08], [0.16, 0.12], [0.1, 0.16], [0.09, 0.3], [0, 0.3]];
    const wheelHead = [[0, 0.3], [0.45, 0.3], [0.47, 0.31], [0.47, 0.345], [0.455, 0.355, 1], [0, 0.355]];
    // 挽いたばかりの器：厚い口縁・内側のなだらかな底（外→縁→内）
    const wetProf = [[0, 0.004], [0.26, 0.004], [0.28, 0, 1], [0.3, 0.03], [0.34, 0.18], [0.38, 0.34], [0.4, 0.44], [0.41, 0.47], [0.4, 0.49],
      [0.385, 0.48], [0.37, 0.43], [0.34, 0.3], [0.3, 0.16], [0.22, 0.08], [0, 0.07]];
    // 花入れ：肩の張った壺形・細い首・返った口
    const vaseProf = [[0, 0.004], [0.2, 0.004], [0.22, 0, 1], [0.25, 0.03], [0.32, 0.2], [0.36, 0.4], [0.33, 0.58], [0.2, 0.76], [0.13, 0.86],
      [0.12, 0.94], [0.15, 1.0], [0.145, 1.02], [0.12, 1.0], [0.1, 0.94], [0, 0.93]];
    // 志野茶碗：削り出しの高台・腰の張り・厚い口縁
    const bowlProf = [[0, 0.02], [0.15, 0.02], [0.16, 0, 1], [0.21, 0, 1], [0.22, 0.05, 1], [0.3, 0.08], [0.42, 0.2], [0.48, 0.38], [0.5, 0.52],
      [0.49, 0.56], [0.465, 0.55], [0.455, 0.5], [0.43, 0.32], [0.34, 0.18], [0.2, 0.11], [0, 0.1]];
    // 素焼きの器（奥の棚）
    const bisque = [
      [[0, 0], [0.3, 0], [0.4, 0.3], [0.46, 0.5], [0.42, 0.52], [0, 0.2]],
      [[0, 0], [0.22, 0], [0.3, 0.2], [0.3, 0.6], [0.2, 0.8], [0.18, 0.9], [0, 0.9]],
      [[0, 0], [0.3, 0], [0.34, 0.3], [0.36, 0.34], [0.32, 0.34], [0, 0.1]]
    ];

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.92, 0.9, 0.86], ambient: 0.55, light: [-0.4, 0.86, 0.55], lightCol: [1.08, 1.05, 1.0],
      sky: [1.0, 1.0, 0.98], ground: [0.66, 0.58, 0.48], envTop: [1.04, 1.02, 0.98], envBot: [0.45, 0.4, 0.34],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：しっくいの壁と棚 --- */
        api.panel([0, 1.6, -3.4], [0, 0, 0], [12, 5], { tex: tex.wall, uvScale: [4, 2], unlit: true });
        const SHELF = mat(M.wood, { castShadow: false, tex: tex.shelf, face: S.FACE.FRONT, edge: [0.6, 0.45, 0.3], uvScale: [3, 1] });
        const BIS = mat(M.matte, { castShadow: false, color: [0.92, 0.82, 0.7], spec: 0.05 });
        for (const [sy, off] of [[0.3, 0], [0.95, 1]]) {
          api.box([0, sy, -3.2], [0, 0, 0], [6, 0.06, 0.45], SHELF);
          for (let i = 0; i < 7; i++) {
            const k = (i + off) % 3, bx = -2.4 + i * 0.8 + off * 0.3, s = 0.36 + ((i * 7 + off * 3) % 4) * 0.04;
            api.lathe('pot:bisque' + k, bisque[k], [bx, sy + 0.03, -3.2], [0, 0, 0], [s, s, s], BIS);
          }
        }

        /* --- 作業台 --- */
        api.box([0, -0.06, -0.6], [0, 0, 0], [6.4, 0.12, 4.4], mat(M.wood, { tex: tex.bench, face: S.FACE.TOP, edge: [0.6, 0.46, 0.32], uvScale: [2, 1] }));
        // 作業用の帆布（ろくろの下）
        api.quad([WHEEL.x, 0.002, WHEEL.z], [0, -10, 0], [1.1, 0.9], mat(M.matte, { tex: tex.canvasCloth }));

        /* --- 手回しろくろと挽きたての器 --- */
        const ws = 0.66, wx = WHEEL.x, wz = WHEEL.z;
        const IRON = mat(M.metal, { color: [0.36, 0.38, 0.42], spec: 0.6, metal: 0.5 });
        api.lathe('pot:wbase', wheelBase, [wx, 0, wz], [0, 0, 0], [ws, ws, ws], IRON);
        api.lathe('pot:whead', wheelHead, [wx, 0, wz], [0, 0, 0], [ws, ws, ws], mat(M.metal, { color: [0.78, 0.8, 0.82] }));
        const top = 0.355 * ws, ps = 0.46;
        api.lathe('pot:wet', wetProf, [wx, top, wz], [0, 0, 0], [ps, ps, ps], mat(M.glossyFood, { tex: tex.wetClay, spec: 0.45, shin: 50, rim: 0.12 }));

        /* --- 瑠璃釉の花入れ（白い流し掛け） --- */
        const vs = 0.64;
        api.lathe('pot:vase', vaseProf, [VASE.x, 0, VASE.z], [0, 30, 0], [vs, vs, vs], mat(M.ceramic, { tex: tex.ruri, spec: 0.7, shin: 110 }));

        /* --- 志野の茶碗 --- */
        const bs = 0.44;
        api.lathe('pot:bowl', bowlProf, [BOWL.x, 0, BOWL.z], [0, 70, 0], [bs, bs, bs], mat(M.ceramic, { tex: tex.shino, spec: 0.3, shin: 40 }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, wx, wz, 0.66, 0.62, 0, 0.45, 0.002);
        K.shadow(api, VASE.x, VASE.z, 0.48, 0.44, 0, 0.45);
        K.shadow(api, BOWL.x, BOWL.z, 0.5, 0.46, 0, 0.45);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.14);
    E.drawGrain(ctx, W, H, 0.025, 104, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 作業台：明るいブナの集成材（幅の狭い板を貼り合わせ、木目は淡く）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(41);
    const n = 8, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.94 + r() * 0.1;
      x.fillStyle = `rgb(${214 * b | 0},${178 * b | 0},${134 * b | 0})`; x.fillRect(0, i * pw, S, pw);
      for (let k = 0; k < 5; k++) {
        x.strokeStyle = 'rgba(160,112,70,0.18)'; x.lineWidth = 3 + r() * 3;
        const y0 = i * pw + 8 + r() * (pw - 16); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k + i) * 4);
        x.stroke();
      }
      x.fillStyle = 'rgba(120,80,48,0.35)'; x.fillRect(0, i * pw, S, 3);
    }
    T.bench = c;
  }
  // しっくいの壁（白・ゆるいムラ）
  {
    const S = 512, c = C(S, S), x = c.getContext('2d'), r = E.rnd(7);
    x.fillStyle = '#ece3d3'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 60; i++) {
      x.globalAlpha = 0.04 + r() * 0.04; x.fillStyle = r() > 0.5 ? '#ffffff' : '#d8ccb8';
      x.beginPath(); x.ellipse(r() * S, r() * S, 60 + r() * 100, 30 + r() * 50, r() * 3, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    T.wall = c;
  }
  // 棚板の小口
  {
    const c = C(256, 32), x = c.getContext('2d');
    x.fillStyle = '#a57c55'; x.fillRect(0, 0, 256, 32);
    x.fillStyle = 'rgba(80,50,30,0.25)'; x.fillRect(0, 0, 256, 3);
    T.shelf = c;
  }
  // 帆布（生成り・粗い織り目を淡く）
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#e4dccb'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 6) { x.fillStyle = 'rgba(160,145,120,0.12)'; x.fillRect(i, 0, 2, 256); x.fillRect(0, i, 256, 2); }
    x.strokeStyle = '#b9a98c'; x.lineWidth = 6; x.strokeRect(8, 8, 240, 240);
    T.canvasCloth = c;
  }
  // 濡れた粘土：赤土の色に、ろくろ目（水平の太い輪）を粗く
  {
    const c = C(64, 512), x = c.getContext('2d');
    x.fillStyle = '#b07a5c'; x.fillRect(0, 0, 64, 512);
    for (let i = 0; i < 512; i += 36) { x.fillStyle = 'rgba(120,70,48,0.35)'; x.fillRect(0, i, 64, 8); x.fillStyle = 'rgba(214,160,130,0.3)'; x.fillRect(0, i + 10, 64, 6); }
    T.wetClay = c;
  }
  // 瑠璃釉：深い青、肩から白い釉が大きく流れる。裾は土見せ（v=下→上）
  {
    const Wd = 512, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(12);
    const g = x.createLinearGradient(0, Ht, 0, 0);
    g.addColorStop(0, '#c9a27c'); g.addColorStop(0.04, '#c9a27c'); g.addColorStop(0.05, '#1d3a78'); g.addColorStop(0.5, '#2a4f9a'); g.addColorStop(1, '#1d3a78');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#e9eef2';
    x.fillRect(0, 0, Wd, Ht * 0.3);                      // 肩〜口の白
    for (let i = 0; i < 9; i++) {                        // 太いしずく
      const px = (i + 0.3 + r() * 0.4) * Wd / 9, len = Ht * (0.12 + r() * 0.22), w = 22 + r() * 18;
      E.roundRect(x, px - w / 2, Ht * 0.25, w, len, w / 2); x.fill();
    }
    T.ruri = c;
  }
  // 志野：白い長石釉に、ほんのり緋色の火色。高台は土見せ（v=下→上）
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(88);
    x.fillStyle = '#f4ede0'; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 7; i++) {
      x.fillStyle = `rgba(226,146,98,${0.35 + r() * 0.2})`;
      x.beginPath(); x.ellipse(r() * Wd, Ht * (0.3 + r() * 0.5), 40 + r() * 50, 18 + r() * 20, 0, 0, 7); x.fill();
    }
    x.fillStyle = '#c58f64'; x.fillRect(0, Ht * 0.86, Wd, Ht * 0.14);  // 高台
    T.shino = c;
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
