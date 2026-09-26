/* =========================================================================
 *  10/09 世界郵便デー（1874年のこの日、万国郵便連合（UPU）が発足）
 *  郵便局の窓口の机。赤い丸ポスト（置物）、麻ひもで結んだ小包、
 *  エアメールの封筒、卓上カレンダーの横にアクスタを置く。奥の壁は仕分け棚。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'world-post-day',
  title: '世界郵便デー',
  dayName: 'World Post Day',
  caption: { fill: '#ffffff', outline: '#a8262b' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf6ea', ink: '#2a3550', accent: '#c0392b', back: '#e6ddc8', grain: 0.06 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['desk', 'sorter', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: 0.0, z: 0.04, yaw: -10 };             // アクスタ（右へ振る）
    const POST = { x: -0.72, z: -1.3 };                   // 丸ポスト（左奥）
    const CAL = { x: 0.66, z: -1.15, yaw: -20 };           // 卓上カレンダー（右奥）
    const PARCEL = { x: 0.6, z: -0.2, yaw: -22 };        // 小包（右手前）
    const MAIL = { x: -0.6, z: 0.12, yaw: 12 };          // エアメール（左手前）
    const eye = [-0.26, 1.3, 2.75], at = [0.0, 0.48, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const RED = mat(M.plastic, { color: [0.82, 0.14, 0.14], spec: 0.55, shin: 70, rim: 0.16 });

    /* ---------- 形 ---------- */
    // 丸ポスト：台座・胴・帯・笠（ドーム）
    const plinth = [[0, 0.004], [0.44, 0.004], [0.46, 0, 1], [0.46, 0.07], [0.42, 0.09], [0.4, 0.1], [0, 0.1]];
    const body = [[0, 0.1], [0.36, 0.1], [0.37, 0.12], [0.37, 0.56], [0.385, 0.57], [0.385, 0.6], [0.37, 0.61], [0.37, 0.78], [0, 0.78]];
    const cap = [[0, 0.78], [0.4, 0.78], [0.42, 0.8], [0.42, 0.82], [0.38, 0.86], [0.3, 0.93], [0.18, 0.98], [0.06, 1.0], [0, 1.0]];

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.92, 0.9, 0.85], ambient: 0.55, light: [0.45, 0.86, 0.5], lightCol: [1.08, 1.05, 1.0],
      sky: [1.0, 1.0, 0.98], ground: [0.66, 0.58, 0.48], envTop: [1.04, 1.02, 0.98], envBot: [0.44, 0.38, 0.32],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：クリーム色の壁と、仕分け棚 --- */
        api.panel([0, 1.6, -3.2], [0, 0, 0], [12, 5], { tex: tex.wall, uvScale: [4, 2], unlit: true });
        api.panel([0.2, 1.05, -3.18], [0, 0, 0], [3.6, 1.8], { tex: tex.sorter, unlit: true });
        /* --- 机 --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.desk, face: S.FACE.TOP, edge: [0.5, 0.34, 0.22], uvScale: [2, 1] }));

        /* --- 赤い丸ポスト --- */
        const ps = 0.82, px = POST.x, pz = POST.z;
        api.lathe('post:plinth', plinth, [px, 0, pz], [0, 0, 0], [ps, ps, ps], mat(M.plastic, { color: [0.2, 0.2, 0.22], spec: 0.4 }));
        api.lathe('post:body', body, [px, 0, pz], [0, 0, 0], [ps, ps, ps], RED);
        api.lathe('post:cap', cap, [px, 0, pz], [0, 0, 0], [ps, ps, ps], RED);
        // 差し入れ口（ひさし付き）と表示板・取り出し口
        const ry = Math.atan2(eye[0] - px, eye[2] - pz) * 180 / Math.PI + 12, a = ry * Math.PI / 180;
        const front = (r, y) => [px + Math.sin(a) * r * ps, y * ps, pz + Math.cos(a) * r * ps];
        api.rbox(front(0.36, 0.68), [0, ry, 0], [0.34 * ps, 0.07 * ps, 0.05 * ps], mat(M.plastic, { color: [0.12, 0.1, 0.1], round: 0.2 }));
        api.rbox(front(0.385, 0.725), [-20, ry, 0], [0.4 * ps, 0.03 * ps, 0.08 * ps], mat(RED, { round: 0.2 }));
        api.panel(front(0.372, 0.43), [0, ry, 0], [0.3 * ps, 0.2 * ps], mat(M.ceramic, { tex: tex.plate, sharp: true }));
        api.rbox(front(0.368, 0.24), [0, ry, 0], [0.28 * ps, 0.14 * ps, 0.02], mat(RED, { round: 0.2 }));
        api.lathe('post:lock', [[0, 0], [0.5, 0], [0.5, 1], [0, 1]], front(0.37, 0.24), [90, ry, 0], [0.04, 0.02, 0.04], mat(M.gold, { color: [0.8, 0.66, 0.4] }));

        /* --- 麻ひもで結んだ小包 --- */
        const cx = PARCEL.x, cz = PARCEL.z, cy = PARCEL.yaw, cr = cy * Math.PI / 180;
        const bw = 0.5, bh = 0.26, bd = 0.36;
        api.rbox([cx, bh / 2, cz], [0, cy, 0], [bw, bh, bd], mat(M.matte, { tex: tex.kraft, round: 0.06 }));
        const TWINE = mat(M.matte, { color: [0.84, 0.72, 0.52] });
        api.box([cx, bh / 2, cz], [0, cy, 0], [bw + 0.008, bh + 0.008, 0.022], TWINE);
        api.box([cx, bh / 2, cz], [0, cy, 0], [0.022, bh + 0.008, bd + 0.008], TWINE);
        // 蝶結び（輪2つとたれ）
        for (const sg of [-1, 1])
          api.sphere([cx + Math.cos(cr) * sg * 0.045, bh + 0.012, cz - Math.sin(cr) * sg * 0.045], [0, cy + sg * 20, 0], [0.08, 0.024, 0.045], TWINE);
        api.sphere([cx, bh + 0.014, cz], [0, cy, 0], [0.03, 0.026, 0.03], TWINE);
        // 宛名ラベル（上面・左手前の区画）
        const lx = -0.13, lz = 0.09;
        api.quad([cx + Math.cos(cr) * lx + Math.sin(cr) * lz, bh + 0.004, cz - Math.sin(cr) * lx + Math.cos(cr) * lz], [0, cy, 0], [0.18, 0.12], mat(M.matte, { tex: tex.label }));

        /* --- エアメールの封筒（机に寝かせる） --- */
        api.box([MAIL.x, 0.005, MAIL.z], [0, MAIL.yaw, 0], [0.5, 0.01, 0.32], mat(M.matte, { tex: tex.airmail, face: S.FACE.TOP, edge: [0.95, 0.94, 0.9] }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, px, pz, 0.6, 0.56, 0, 0.45);
        K.shadow(api, cx, cz, 0.66, 0.5, cy, 0.4);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.024, 109, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // クリーム色の壁（腰から下は板張り）
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#f1e8d4'; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#8a5a3a'; x.fillRect(0, 200, 256, 56);
    x.fillStyle = 'rgba(60,36,20,0.4)'; x.fillRect(0, 198, 256, 4);
    T.wall = c;
  }
  // 仕分け棚：木の格子に、ところどころ封筒の端がのぞく
  {
    const Wd = 1024, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(99);
    x.fillStyle = '#a0704a'; x.fillRect(0, 0, Wd, Ht);
    const cols = 8, rows = 4, cw = Wd / cols, ch = Ht / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const px = i * cw + 12, py = j * ch + 12, w = cw - 24, h = ch - 24;
      x.fillStyle = '#4a3020'; x.fillRect(px, py, w, h);
      if (r() > 0.35) {
        const n = 1 + (r() * 2 | 0);
        for (let k = 0; k < n; k++) {
          x.fillStyle = ['#f6f1e4', '#e9f0f6', '#f3e2c9', '#f7e8e8'][(r() * 4) | 0];
          const ew = w * (0.7 + r() * 0.2), eh = h * (0.35 + r() * 0.25);
          x.fillRect(px + (w - ew) / 2 + k * 6, py + h - eh, ew, eh);
        }
      }
    }
    x.fillStyle = 'rgba(255,230,190,0.25)';
    for (let j = 0; j <= rows; j++) x.fillRect(0, j * ch, Wd, 6);
    T.sorter = c;
  }
  // 机：オーク
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(31);
    const n = 6, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.94 + r() * 0.1;
      x.fillStyle = `rgb(${190 * b | 0},${140 * b | 0},${96 * b | 0})`; x.fillRect(0, i * pw, S, pw);
      for (let k = 0; k < 6; k++) {
        x.strokeStyle = r() > 0.5 ? 'rgba(120,78,46,0.22)' : 'rgba(225,185,140,0.2)'; x.lineWidth = 3 + r() * 4;
        const y0 = i * pw + 8 + r() * (pw - 16); x.beginPath();
        for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k + i) * 6);
        x.stroke();
      }
      x.fillStyle = 'rgba(80,50,28,0.4)'; x.fillRect(0, i * pw, S, 3);
    }
    T.desk = c;
  }
  // ポストの表示板：白地に〒マーク（線で描く）と POST、集配時刻の枠
  {
    const Wd = 300, Ht = 200, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbfaf5'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = '#c0392b'; x.lineWidth = 6; x.strokeRect(8, 8, Wd - 16, Ht - 16);
    x.fillStyle = '#c0392b';
    x.fillRect(40, 38, 70, 10); x.fillRect(40, 60, 70, 10); x.fillRect(70, 60, 10, 58);   // 〒
    x.font = '700 58px "Oswald","Noto Sans JP",sans-serif'; x.textAlign = 'left'; x.fillText('POST', 130, 104);
    x.strokeStyle = '#2a3550'; x.lineWidth = 3;
    for (let i = 0; i < 3; i++) x.strokeRect(40 + i * 76, 132, 64, 38);
    T.plate = c;
  }
  // クラフト紙
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#c49a68'; x.fillRect(0, 0, 128, 128);
    E.drawGrain(x, 128, 128, 0.12, 3, 3);
    T.kraft = c;
  }
  // 宛名ラベル
  {
    const Wd = 240, Ht = 160, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#2a3550';
    for (let i = 0; i < 3; i++) x.fillRect(24, 50 + i * 30, 140 - i * 30, 8);
    x.strokeStyle = '#c0392b'; x.lineWidth = 3; x.strokeRect(170, 16, 50, 60);
    x.fillStyle = '#e8b04a'; x.fillRect(176, 22, 38, 48);
    T.label = c;
  }
  // エアメール封筒：赤と青の斜めストライプの縁、切手、消印、宛名
  {
    const Wd = 500, Ht = 320, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f7f4ec'; x.fillRect(0, 0, Wd, Ht);
    x.save(); x.beginPath(); x.rect(0, 0, Wd, Ht); x.rect(22, 22, Wd - 44, Ht - 44); x.clip('evenodd');
    for (let i = -Ht; i < Wd + Ht; i += 44) {
      x.fillStyle = (i / 44 | 0) % 2 ? '#c0392b' : '#2f5fa8';
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 22, 0); x.lineTo(i + 22 - Ht, Ht); x.lineTo(i - Ht, Ht); x.fill();
    }
    x.restore();
    // 切手（ギザギザの縁）
    x.fillStyle = '#ffffff'; x.fillRect(380, 44, 76, 92);
    x.fillStyle = '#7fb3d9'; x.fillRect(388, 52, 60, 76);
    x.fillStyle = '#f2c14e'; x.beginPath(); x.arc(418, 84, 16, 0, 7); x.fill();
    x.fillStyle = '#5a8a4a'; x.fillRect(388, 104, 60, 24);
    x.fillStyle = '#f7f4ec'; for (let k = 0; k < 8; k++) { x.beginPath(); x.arc(380 + k * 10.8 + 5, 44, 3.5, 0, 7); x.arc(380 + k * 10.8 + 5, 136, 3.5, 0, 7); x.fill(); }
    // 消印
    x.strokeStyle = 'rgba(40,50,80,0.55)'; x.lineWidth = 3;
    x.beginPath(); x.arc(360, 110, 30, 0, 7); x.stroke();
    for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(250, 96 + k * 12); x.quadraticCurveTo(290, 88 + k * 12, 330, 96 + k * 12); x.stroke(); }
    // 宛名
    x.fillStyle = '#2a3550'; x.font = '700 30px "Oswald",sans-serif'; x.textAlign = 'left';
    x.fillText('PAR AVION', 56, 90);
    for (let i = 0; i < 3; i++) x.fillRect(140, 180 + i * 30, 200 - i * 30, 7);
    T.airmail = c;
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
