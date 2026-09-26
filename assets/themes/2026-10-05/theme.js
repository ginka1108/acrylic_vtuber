/* =========================================================================
 *  10/05 時刻表記念日（1894年のこの日、日本初の本格的な時刻表『汽車汽舩旅行案内』が発行された）
 *  駅の待合室の机。展示台にのった蒸気機関車と客車の模型、厚い時刻表、
 *  駅の置き時計、卓上カレンダーの横にアクスタを置く。奥の壁には発車標。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'timetable-day',
  title: '時刻表記念日',
  dayName: 'Timetable Day',
  caption: { fill: '#ffffff', outline: '#1f4a3a' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f6f2e6', ink: '#1f4a3a', accent: '#c0392b', back: '#e2dccb', grain: 0.06 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['desk', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.02, z: 0.04, yaw: -12 };           // アクスタ（右へ振る）
    const TRAIN = { x: 0.52, z: -1.3, yaw: -18 };        // 機関車の模型（右奥）
    const CLOCK = { x: -0.74, z: -1.3 };                  // 置き時計（左奥）
    const BOOK = { x: -0.6, z: 0.02, yaw: 16 };         // 時刻表（左手前）
    const CAL = { x: 0.66, z: -0.2, yaw: -20 };           // 卓上カレンダー（左）
    const eye = [-0.12, 1.3, 2.75], at = [0.04, 0.48, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const GREEN = mat(M.plastic, { color: [0.16, 0.4, 0.3], spec: 0.55, shin: 70 });
    const BLACK = mat(M.plastic, { color: [0.12, 0.12, 0.14], spec: 0.5, shin: 60 });
    const RED = mat(M.plastic, { color: [0.78, 0.16, 0.14], spec: 0.5, shin: 60 });
    const BRASS = mat(M.gold, { color: [0.88, 0.7, 0.4] });

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.9, 0.9, 0.86], ambient: 0.55, light: [0.4, 0.86, 0.55], lightCol: [1.08, 1.06, 1.0],
      sky: [1.0, 1.0, 0.98], ground: [0.64, 0.58, 0.48], envTop: [1.04, 1.04, 1.0], envBot: [0.44, 0.4, 0.34],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：タイルの壁と発車標 --- */
        api.panel([0, 1.6, -3.2], [0, 0, 0], [12, 5], { tex: tex.wall, uvScale: [8, 3], unlit: true });
        api.panel([0.1, 0.95, -3.16], [0, 0, 0], [2.8, 1.04], { tex: tex.board, unlit: true });
        /* --- 机 --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.desk, face: S.FACE.TOP, edge: [0.5, 0.34, 0.22], uvScale: [2, 1] }));

        /* --- 蒸気機関車と客車の模型（展示台の線路にのせる） --- */
        const tx = TRAIN.x, tz = TRAIN.z, ty = TRAIN.yaw, tr = ty * Math.PI / 180;
        const at3 = (lx, ly, lz) => [tx + Math.cos(tr) * lx + Math.sin(tr) * lz, ly, tz - Math.sin(tr) * lx + Math.cos(tr) * lz];
        api.rbox(at3(0, 0.03, 0), [0, ty, 0], [1.3, 0.06, 0.26], mat(M.wood, { color: [0.36, 0.22, 0.14], round: 0.1, spec: 0.4, shin: 50 }));
        for (let i = 0; i < 11; i++) api.box(at3(-0.6 + i * 0.12, 0.066, 0), [0, ty, 0], [0.05, 0.012, 0.2], mat(M.wood, { color: [0.5, 0.36, 0.24] }));
        for (const sz of [-0.055, 0.055]) api.box(at3(0, 0.08, sz), [0, ty, 0], [1.28, 0.016, 0.014], mat(M.metal, { color: [0.7, 0.72, 0.74] }));
        const rail = 0.088;
        // 機関車（先頭が -X 側）：台枠・ボイラー・煙突・蒸気だめ・運転室・車輪
        const lx0 = -0.3;
        api.rbox(at3(lx0, rail + 0.05, 0), [0, ty, 0], [0.5, 0.04, 0.16], mat(BLACK, { round: 0.1 }));
        api.cylinder(at3(lx0 - 0.06, rail + 0.13, 0), [0, ty, 90], [0.13, 0.36, 0.13], GREEN);
        api.cylinder(at3(lx0 - 0.245, rail + 0.13, 0), [0, ty, 90], [0.12, 0.02, 0.12], BLACK);
        api.lathe('tt:chimney', [[0, 0], [0.4, 0], [0.4, 0.7], [0.55, 0.85], [0.55, 1], [0, 1]], at3(lx0 - 0.18, rail + 0.18, 0), [0, 0, 0], [0.07, 0.1, 0.07], BLACK);
        api.lathe('tt:dome', [[0, 0], [0.5, 0], [0.48, 0.4], [0.3, 0.8], [0, 0.9]], at3(lx0 - 0.03, rail + 0.18, 0), [0, 0, 0], [0.07, 0.07, 0.07], BRASS);
        api.rbox(at3(lx0 + 0.15, rail + 0.16, 0), [0, ty, 0], [0.16, 0.18, 0.17], mat(GREEN, { round: 0.12 }));
        api.rbox(at3(lx0 + 0.15, rail + 0.26, 0), [0, ty, 0], [0.2, 0.025, 0.2], mat(BLACK, { round: 0.2 }));
        api.box(at3(lx0 + 0.15, rail + 0.18, 0.086), [0, ty, 0], [0.08, 0.06, 0.004], { color: [0.95, 0.88, 0.62], unlit: true });
        for (const wx of [-0.2, -0.06, 0.08]) for (const sz of [-0.072, 0.072])
          api.cylinder(at3(lx0 + wx, rail + 0.04, sz), [90, ty, 0], [0.08, 0.02, 0.08], RED);
        // 客車（屋根の丸い箱と窓の帯）
        const cx0 = 0.22;
        api.rbox(at3(cx0, rail + 0.13, 0), [0, ty, 0], [0.5, 0.16, 0.16], mat(M.plastic, { tex: tex.coach, round: 0.08, spec: 0.4, shin: 50 }));
        api.rbox(at3(cx0, rail + 0.22, 0), [0, ty, 0], [0.52, 0.04, 0.18], mat(BLACK, { round: 0.4 }));
        for (const wx of [-0.16, 0.16]) for (const sz of [-0.072, 0.072])
          api.cylinder(at3(cx0 + wx, rail + 0.035, sz), [90, ty, 0], [0.065, 0.02, 0.065], BLACK);

        /* --- 駅の置き時計 --- */
        const kx = CLOCK.x, kz = CLOCK.z, ks = 0.5;
        api.lathe('tt:clockBase', [[0, 0.004], [0.36, 0.004], [0.4, 0, 1], [0.4, 0.06], [0.2, 0.1], [0.1, 0.2], [0, 0.2]], [kx, 0, kz], [0, 0, 0], [ks, ks, ks], BRASS);
        const cy = 0.2 * ks + 0.24;
        const ry = Math.atan2(eye[0] - kx, eye[2] - kz) * 180 / Math.PI;
        api.cylinder([kx, cy, kz], [90, ry, 0], [0.48, 0.08, 0.48], GREEN);
        api.mesh('tt:bezel', () => G.tube((t) => [Math.cos(t * Math.PI * 2) * 0.5, Math.sin(t * Math.PI * 2) * 0.5, 0], () => 0.03, 96, 12, false), [kx + Math.sin(ry * Math.PI / 180) * 0.04, cy, kz + Math.cos(ry * Math.PI / 180) * 0.04], [0, ry, 0], [0.48, 0.48, 0.48], BRASS);
        api.cylinder([kx + Math.sin(ry * Math.PI / 180) * 0.04, cy, kz + Math.cos(ry * Math.PI / 180) * 0.04], [90, ry, 0], [0.44, 0.002, 0.44], { tex: tex.clock, part: 'TOP', spec: 0.3, sharp: true });

        /* --- 時刻表（厚い1冊を寝かせる） --- */
        K.book(api, { x: BOOK.x, z: BOOK.z, w: 0.42, d: 0.56, h: 0.13, yaw: BOOK.yaw, col: [0.86, 0.3, 0.2], coverTex: tex.cover });

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, tx, tz, 1.45, 0.4, ty, 0.4);
        K.shadow(api, kx, kz, 0.3, 0.28, 0, 0.45);
        K.shadow(api, BOOK.x, BOOK.z, 0.56, 0.68, BOOK.yaw, 0.4);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.024, 105, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 白いタイルの壁（腰は緑）
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#c8ccc6'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#f2f1ea'; x.fillRect(3, 3, 122, 58); x.fillRect(3, 67, 122, 58);
    T.wall = c;
  }
  // 発車標：黒地に黄と白の文字（時刻・行き先・番線）
  {
    const Wd = 1024, Ht = 380, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#22262a'; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = '#8a9096'; x.lineWidth = 14; x.strokeRect(7, 7, Wd - 14, Ht - 14);
    x.fillStyle = '#f2c14e'; x.font = '700 40px "Oswald",sans-serif'; x.textAlign = 'left';
    x.fillText('DEPARTURES', 40, 66);
    const rows = [['06:12', 'LOCAL', 'MORNING', '1'], ['06:30', 'RAPID', 'SEASIDE', '2'], ['06:48', 'LTD EXP', 'MOUNTAIN', '3'], ['07:05', 'LOCAL', 'CENTRAL', '1']];
    rows.forEach((r, i) => {
      const y = 132 + i * 62;
      x.fillStyle = '#343a40'; x.fillRect(30, y - 44, Wd - 60, 54);
      x.fillStyle = '#f7f4ea'; x.font = '700 40px "Oswald",sans-serif';
      x.fillText(r[0], 50, y); x.fillStyle = i === 2 ? '#e8563a' : '#7fd08a'; x.fillText(r[1], 220, y);
      x.fillStyle = '#f7f4ea'; x.fillText(r[2], 470, y); x.fillText(r[3], Wd - 90, y);
    });
    T.board = c;
  }
  // 机：オーク
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(33);
    const n = 6, pw = S / n;
    for (let i = 0; i < n; i++) {
      const b = 0.94 + r() * 0.1;
      x.fillStyle = `rgb(${182 * b | 0},${132 * b | 0},${90 * b | 0})`; x.fillRect(0, i * pw, S, pw);
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
  // 客車：えんじの車体に窓の帯（クリーム）
  {
    const c = C(256, 128), x = c.getContext('2d');
    x.fillStyle = '#8a2a26'; x.fillRect(0, 0, 256, 128);
    x.fillStyle = '#f1e2b8'; x.fillRect(0, 34, 256, 34);
    x.fillStyle = '#5a1a18'; for (let i = 0; i < 6; i++) x.fillRect(14 + i * 40, 38, 28, 26);
    x.fillStyle = '#d6b36a'; x.fillRect(0, 84, 256, 5);
    T.coach = c;
  }
  // 置き時計の文字盤（6:45 ごろ）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d'), cx = S / 2;
    x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#1f2a2a';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.save(); x.translate(cx + Math.sin(a) * 100, cx - Math.cos(a) * 100); x.rotate(a); x.fillRect(-4, -12, 8, i % 3 ? 16 : 26); x.restore(); }
    const hand = (a, len, w) => { x.save(); x.translate(cx, cx); x.rotate(a); x.fillRect(-w / 2, -len, w, len + 12); x.restore(); };
    hand((6.75 / 12) * Math.PI * 2, 58, 10); hand((45 / 60) * Math.PI * 2, 88, 7);
    x.fillStyle = '#c0392b'; hand((20 / 60) * Math.PI * 2, 94, 3);
    x.beginPath(); x.arc(cx, cx, 8, 0, 7); x.fill();
    T.clock = c;
  }
  // 時刻表の表紙（題字・列車の図・路線の線）
  {
    const Wd = 420, Ht = 560, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#e04a32'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#fbf6ea'; x.fillRect(0, 60, Wd, 110);
    x.fillStyle = '#1f4a3a'; x.font = '700 64px "Oswald",sans-serif'; x.textAlign = 'center';
    x.fillText('TIMETABLE', Wd / 2, 140);
    x.strokeStyle = '#fbf6ea'; x.lineWidth = 10;
    x.beginPath(); x.moveTo(40, 420); x.bezierCurveTo(140, 300, 260, 480, 380, 330); x.stroke();
    x.fillStyle = '#fbf6ea';
    for (const [px, py] of [[40, 420], [168, 390], [290, 400], [380, 330]]) { x.beginPath(); x.arc(px, py, 16, 0, 7); x.fill(); }
    x.font = '700 36px "Oswald",sans-serif'; x.fillText('OCTOBER', Wd / 2, 520);
    T.cover = c;
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
