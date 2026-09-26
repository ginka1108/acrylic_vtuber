/* =========================================================================
 *  10/10 ドラムの日（「ドン(10)ドン(10)」と太鼓をたたく音の語呂合わせ）
 *  音楽スタジオの机。赤いスネアドラム、真鍮のハイハット（スタンドは机置きの小型）、
 *  振り子のメトロノーム、ヘッドホン、卓上カレンダーの横にアクスタを置く。
 *  奥は吸音パネルの壁。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'drum-day',
  title: 'ドラムの日',
  dayName: 'Drum Day',
  caption: { fill: '#ffffff', outline: '#2a2440' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f4f1ea', ink: '#2a2440', accent: '#c0392b', back: '#dcd8cc', grain: 0.06 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['desk', 'foam'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.02, z: 0.04, yaw: 12 };            // アクスタ
    const SNARE = { x: 0.78, z: -1.15 };                   // スネア（右奥）
    const HAT = { x: -0.95, z: -2.0 };                    // ハイハット（左奥）
    const METRO = { x: 0.6, z: -0.12, yaw: -20 };         // メトロノーム（右手前）
    const PHONES = { x: -0.56, z: 0.14, yaw: 14 };       // ヘッドホン（左手前）
    const CAL = { x: -0.78, z: -0.82, yaw: 22 };           // 卓上カレンダー（左）
    const eye = [0.28, 1.3, 2.75], at = [0.02, 0.48, -0.12];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const CHROME = mat(M.metal, { color: [0.86, 0.88, 0.9] });
    const CYMBAL = mat(M.gold, { tex: tex.cymbal, color: [1, 1, 1] });
    const BLACK = mat(M.plastic, { color: [0.14, 0.14, 0.16], spec: 0.5, shin: 60 });

    /* ---------- 形 ---------- */
    // スネアの胴（外側のみ・上下の縁）とヘッド
    const shellProf = [[0.49, 0], [0.5, 0.02], [0.5, 0.38], [0.49, 0.4]];
    const hoopProf = [[0.5, 0], [0.52, 0.005], [0.525, 0.03], [0.515, 0.045], [0.49, 0.045], [0.49, 0]];
    // シンバル：中央のカップと、ゆるく反った円盤（厚み付き）
    const cymbalProf = [[0, 0.1], [0.08, 0.1], [0.12, 0.07], [0.16, 0.05], [0.5, 0.0], [0.5, -0.01], [0.16, 0.04], [0.12, 0.06], [0.08, 0.09], [0, 0.09]];
    // メトロノーム：前から見た台形の胴（四角錐台）
    const pyramid = () => G.surface((u, v) => {
      // u: 周方向（4面）、v: 下→上
      const w = 0.5 - 0.3 * v, d = 0.32 - 0.16 * v, a = u * 4;
      const side = Math.floor(Math.min(3.999, a)), t = a - side;
      const corners = [[-w, -d], [w, -d], [w, d], [-w, d]];
      const p0 = corners[side], p1 = corners[(side + 1) % 4];
      return [p0[0] + (p1[0] - p0[0]) * t, v, p0[1] + (p1[1] - p0[1]) * t];
    }, 64, 2);

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.86, 0.85, 0.88], ambient: 0.55, light: [-0.4, 0.86, 0.55], lightCol: [1.08, 1.06, 1.02],
      sky: [1.0, 1.0, 1.02], ground: [0.6, 0.56, 0.54], envTop: [1.06, 1.05, 1.04], envBot: [0.4, 0.36, 0.34],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：吸音パネルの壁 --- */
        api.panel([0, 1.6, -3.2], [0, 0, 0], [12, 5], { tex: tex.foam, uvScale: [6, 2.5], unlit: true });
        /* --- 机 --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.desk, face: S.FACE.TOP, edge: [0.3, 0.26, 0.24], uvScale: [2, 1] }));

        /* --- スネアドラム --- */
        const sx = SNARE.x, sz = SNARE.z, ss = 0.78;
        api.lathe('drm:shell', shellProf, [sx, 0.0, sz], [0, 0, 0], [ss, ss, ss], mat(M.glossyFood, { tex: tex.shell, spec: 0.8, shin: 110, rim: 0.25 }));
        for (const hy of [0, 0.4 - 0.045]) api.lathe('drm:hoop', hoopProf, [sx, hy * ss, sz], [0, 0, 0], [ss, ss, ss], CHROME);
        api.cylinder([sx, 0.4 * ss - 0.012, sz], [0, 0, 0], [0.49 * 2 * ss, 0.002, 0.49 * 2 * ss], mat(M.matte, { tex: tex.head, part: 'TOP', spec: 0.15 }));
        // ラグ（胴のまわりの金具）とテンションボルト
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2 + 0.2, r = 0.5 * ss + 0.012;
          api.rbox([sx + Math.sin(a) * r, 0.2 * ss, sz + Math.cos(a) * r], [0, a * 180 / Math.PI, 0], [0.04, 0.1, 0.03], mat(CHROME, { round: 0.4 }));
          for (const by of [0.04, 0.36]) api.cylinder([sx + Math.sin(a) * r, by * ss, sz + Math.cos(a) * r], [0, 0, 0], [0.012, 0.09, 0.012], CHROME);
        }

        /* --- 卓上の小型ハイハット --- */
        const hx = HAT.x, hz = HAT.z;
        api.lathe('drm:tripod', [[0, 0.004], [0.4, 0.004], [0.44, 0, 1], [0.44, 0.03], [0.1, 0.06], [0, 0.06]], [hx, 0, hz], [0, 0, 0], [0.5, 0.5, 0.5], BLACK);
        api.cylinder([hx, 0.3, hz], [0, 0, 0], [0.03, 0.58, 0.03], CHROME);
        const cs = 0.56;
        api.lathe('drm:cymbal', cymbalProf, [hx, 0.46, hz], [0, 0, 0], [cs, cs * 0.8, cs], CYMBAL);
        api.lathe('drm:cymbal', cymbalProf, [hx, 0.48, hz], [180, 0, 0], [cs, cs * 0.8, cs], CYMBAL);
        api.lathe('drm:clutch', [[0, 0], [0.5, 0], [0.5, 1], [0, 1]], [hx, 0.52, hz], [0, 0, 0], [0.06, 0.05, 0.06], BLACK);

        /* --- 振り子のメトロノーム --- */
        const mx = METRO.x, mz = METRO.z, my = METRO.yaw, mr = my * Math.PI / 180;
        const mH = 0.36;
        api.mesh('drm:metro', pyramid, [mx, 0, mz], [0, my, 0], [0.3, mH, 0.3], mat(M.wood, { color: [0.42, 0.22, 0.14], spec: 0.5, shin: 70 }));
        api.rbox([mx, 0.02, mz], [0, my, 0], [0.34, 0.04, 0.22], mat(M.wood, { color: [0.3, 0.16, 0.1], round: 0.2 }));
        // 前面の目盛り板と振り子（前面の傾きに合わせて立てる）
        const fz = 0.32 * 0.3, tilt = Math.atan2(0.16 * 0.3, mH) * 180 / Math.PI;
        const front = (h) => [mx + Math.sin(mr) * (fz - 0.16 * 0.3 * h + 0.004), h * mH, mz + Math.cos(mr) * (fz - 0.16 * 0.3 * h + 0.004)];
        api.panel(front(0.5), [tilt, my, 0], [0.06, 0.36], mat(M.matte, { tex: tex.scale, sharp: true }));
        const pv = front(0.12);
        api.panel([pv[0] + Math.sin(mr) * 0.004, 0.5 * mH, pv[2] + Math.cos(mr) * 0.004], [tilt, my, -14], [0.012, 0.38], CHROME);
        api.rbox(front(0.7).map((v, i) => i === 0 ? v - 0.02 + Math.sin(mr) * 0.012 : (i === 2 ? v + Math.cos(mr) * 0.012 : v)), [tilt, my, -14], [0.04, 0.04, 0.02], mat(M.gold, { color: [0.9, 0.72, 0.4], round: 0.3 }));

        /* --- ヘッドホン（机に置く。バンドとイヤーカップ） --- */
        const px = PHONES.x, pz = PHONES.z, py = PHONES.yaw, pr = py * Math.PI / 180;
        const pat = (lx, ly, lz) => [px + Math.cos(pr) * lx + Math.sin(pr) * lz, ly, pz - Math.sin(pr) * lx + Math.cos(pr) * lz];
        for (const sg of [-1, 1]) {
          api.lathe('drm:cup', [[0, 0], [0.45, 0], [0.5, 0.2], [0.5, 0.7], [0.4, 1], [0, 1]], pat(sg * 0.15, 0.1, 0), [0, py, sg * 90], [0.2, 0.08, 0.2], BLACK);
          api.lathe('drm:pad', [[0, 0], [0.5, 0], [0.5, 0.6], [0.35, 1], [0, 1]], pat(sg * 0.105, 0.1, 0), [0, py, sg * 90], [0.19, 0.04, 0.19], mat(M.matte, { color: [0.2, 0.2, 0.22] }));
        }
        api.mesh('drm:band', () => G.tube((t) => { const a = Math.PI * t; return [-Math.cos(a) * 0.17, 0.1 + Math.sin(a) * 0.05, -Math.sin(a) * 0.16]; }, () => 0.018, 40, 10, true),
          [px, 0, pz], [0, py, 0], [1, 1, 1], mat(M.plastic, { color: [0.78, 0.2, 0.18], spec: 0.5 }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, CAL);
        cal.shadow(api, CAL);

        /* --- 接地の暗がり --- */
        K.shadow(api, sx, sz, 0.95, 0.9, 0, 0.45);
        K.shadow(api, hx, hz, 0.3, 0.28, 0, 0.45);
        K.shadow(api, mx, mz, 0.44, 0.36, my, 0.45);
        K.shadow(api, px, pz, 0.5, 0.36, py, 0.4);

        stand.shadow(api, P);
        api.blend(true);
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.14);
    E.drawGrain(ctx, W, H, 0.024, 110, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // 吸音パネル：紺と灰の四角いパネルを市松に（凹凸は色の濃淡で）
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#2a2a38'; x.fillRect(0, 0, S, S);
    const cols = ['#4a4f78', '#5f5f6e'];
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      x.fillStyle = cols[(i + j) % 2]; x.fillRect(i * 128 + 6, j * 128 + 6, 116, 116);
      x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(i * 128 + 6, j * 128 + 6, 116, 20);
    }
    T.foam = c;
  }
  // 机：黒っぽい天板（天然木のうっすらした木目）
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(40);
    x.fillStyle = '#4a4040'; x.fillRect(0, 0, S, S);
    for (let k = 0; k < 30; k++) {
      x.strokeStyle = r() > 0.5 ? 'rgba(30,24,24,0.3)' : 'rgba(110,96,92,0.2)'; x.lineWidth = 3 + r() * 5;
      const y0 = r() * S; x.beginPath();
      for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k) * 8);
      x.stroke();
    }
    T.desk = c;
  }
  // スネアの胴：赤いスパークル仕上げ（粗く）とバッジ
  {
    const Wd = 512, Ht = 128, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(3);
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#b3201e'); g.addColorStop(0.5, '#d8342a'); g.addColorStop(1, '#a01a1a');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(255,200,180,0.35)'; x.beginPath(); x.arc(r() * Wd, r() * Ht, 2 + r() * 2, 0, 7); x.fill(); }
    x.fillStyle = '#e8d8b0'; E.roundRect(x, 230, 44, 52, 40, 8); x.fill();
    x.fillStyle = '#2a2440'; x.beginPath(); x.arc(256, 64, 10, 0, 7); x.fill();
    T.shell = c;
  }
  // ヘッド：白いコーテッド、中央に黒い丸
  {
    const S = 256, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#f2efe6'; x.fillRect(0, 0, S, S);
    x.fillStyle = 'rgba(40,36,40,0.8)'; x.beginPath(); x.arc(S / 2, S / 2, 30, 0, 7); x.fill();
    T.head = c;
  }
  // シンバル：金色に同心の旋盤目（粗く淡く）
  {
    const c = C(32, 256), x = c.getContext('2d');
    x.fillStyle = '#d8b25a'; x.fillRect(0, 0, 32, 256);
    for (let i = 0; i < 256; i += 18) { x.fillStyle = 'rgba(140,100,40,0.25)'; x.fillRect(0, i, 32, 5); }
    T.cymbal = c;
  }
  // メトロノームの目盛り
  {
    const Wd = 64, Ht = 384, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#efe4c8'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#5a3a24';
    for (let i = 0; i < 12; i++) x.fillRect(10, 20 + i * 30, i % 2 ? 22 : 44, 5);
    T.scale = c;
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
