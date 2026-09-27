/* =========================================================================
 *  10/16 ボスの日（上司に日ごろの感謝を伝える日。1958年アメリカ発祥）
 *  夕方前のオフィス。窓の外にビル街、濃い木の机に緑の革のデスクマット。
 *  主役は右奥の、リボンをかけた贈り物の箱。右手前に「BOSS」のマグ、左手前に真鍮の名札の台。
 *  左奥に卓上カレンダー。単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'boss-day',
  title: 'ボスの日',
  dayName: "Boss's Day",
  caption: { fill: '#fffdf6', outline: '#1f3a33' },
  size: [1350, 1350],
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#f7f6f0', ink: '#1f2a28', accent: '#2f6a58', back: '#dcdcd2', grain: 0.08 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    const P = { x: -0.14, z: 0.12, yaw: -10 };
    const GIFT = { x: 0.74, z: -1.08, yaw: -24 };
    const MUG = { x: 0.36, z: -0.5 };
    const PLATE = { x: 0.5, z: 0.04, yaw: -16 };
    const CAL = { x: -0.8, z: -0.74, yaw: 20 };
    const eye = [0.12, 1.3, 2.75], at = [-0.06, 0.48, -0.14];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const GOLD = mat(M.gold, { color: [0.9, 0.74, 0.42] });

    // リボンの蝶結び：ループ（平たい管）2つと垂れ2本
    const loopGeo = () => G.tube((t) => { const a = t * Math.PI * 2; return [0.5 * (1 - Math.cos(a)) * 0.9, 0.35 * Math.sin(a) + 0.18 * (1 - Math.cos(a)) * 0.6, 0]; }, () => 0.06, 48, 12, false);
    const tailGeo = () => G.surface((u, v) => [u * 0.8, -0.1 * u * u, (v - 0.5) * 0.24 * (1 - 0.3 * u)], 16, 4);
    // マグ（外・縁・内を一続きの回転体）
    const mugProf = [[0, 0.01], [0.4, 0.01], [0.42, 0, 1], [0.45, 0.03], [0.46, 0.5], [0.46, 0.96], [0.45, 1.0], [0.42, 1.0], [0.41, 0.96], [0.41, 0.12], [0.3, 0.09], [0, 0.09]];

    const safe = guardApi();
    S.render(ctx, {
      W, H, clear: [0.82, 0.86, 0.86], ambient: 0.56, light: [-0.42, 0.86, 0.55], lightCol: [1.06, 1.04, 1.0],
      sky: [1.0, 1.01, 1.02], ground: [0.56, 0.48, 0.4], envTop: [1.02, 1.02, 1.02], envBot: [0.36, 0.32, 0.28],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* 壁と窓（ビル街） */
        api.panel([0, 1.7, -3.05], [0, 0, 0], [12, 4.4], { tex: tex.wall, uvScale: [5, 2], unlit: true });
        api.panel([0.5, 1.45, -3.0], [0, 0, 0], [3.4, 1.9], { tex: tex.window, unlit: true, sharp: true });
        /* 机とデスクマット */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.28, 0.16, 0.1], uvScale: [2, 1] }));
        api.rbox([0.1, 0.006, -0.3], [0, 0, 0], [2.6, 0.012, 1.3], mat(M.matte, { color: [0.2, 0.36, 0.3], spec: 0.2, shin: 30, round: 0.05 }));

        /* --- 贈り物の箱（ふた付き・十字のリボン・蝶結び） --- */
        const L = local(GIFT.x, GIFT.z, GIFT.yaw, 1), yw = GIFT.yaw;
        const bw = 0.62, bd = 0.46, bh = 0.34;
        const BOX = mat(M.matte, { color: [0.14, 0.24, 0.42], spec: 0.2, shin: 30 });
        const RIB = mat(M.plastic, { color: [0.86, 0.68, 0.3], spec: 0.7, shin: 70, rim: 0.2 });
        api.rbox(L(0, bh * 0.45, 0), [0, yw, 0], [bw, bh * 0.9, bd], mat(BOX, { round: 0.04 }));
        api.rbox(L(0, bh * 0.92, 0), [0, yw, 0], [bw + 0.03, bh * 0.2, bd + 0.03], mat(BOX, { round: 0.06 }));
        api.box(L(0, bh * 0.5, 0), [0, yw, 0], [0.07, bh + 0.01, bd + 0.036], RIB);
        api.box(L(0, bh * 0.5, 0), [0, yw, 0], [bw + 0.036, bh + 0.01, 0.07], RIB);
        const top = L(0, bh + 0.02, 0);
        api.mesh('bs:loop', loopGeo, top, [0, yw + 20, 0], [0.18, 0.18, 0.5], RIB);
        api.mesh('bs:loop', loopGeo, top, [0, yw + 200, 0], [0.18, 0.18, 0.5], RIB);
        api.lathe('bs:knot', [[0, 0], [0.5, 0.1], [0.55, 0.5], [0.5, 0.9], [0, 1]], [top[0], top[1] - 0.02, top[2]], [0, 0, 0], [0.06, 0.05, 0.06], RIB);
        api.mesh('bs:tail', tailGeo, top, [0, yw - 60, -30], [0.2, 0.2, 0.2], RIB);
        api.mesh('bs:tail', tailGeo, top, [0, yw + 120, -30], [0.2, 0.2, 0.2], RIB);
        K.shadow(api, GIFT.x, GIFT.z, 0.8, 0.62, yw, 0.45);

        /* --- マグ（白地に「BOSS」） --- */
        const ms = 0.3, mx = MUG.x, mz = MUG.z;
        const MUGM = mat(M.ceramic, { tex: tex.mug, color: [1, 1, 1] });
        api.lathe('bs:mug', mugProf, [mx, 0.012, mz], [0, 160, 0], [ms, ms, ms], MUGM);
        api.cylinder([mx, 0.012 + 0.84 * ms, mz], [0, 0, 0], [0.82 * ms, 0.0006, 0.82 * ms], mat(M.glossyFood, { part: 'TOP', color: [0.3, 0.17, 0.08], spec: 0.35 }));
        const hp = (t) => { const a = -Math.PI / 2 + t * Math.PI; return [0.46 + Math.cos(a) * 0.24, 0.52 + Math.sin(a) * 0.3, 0]; };
        api.mesh('bs:handle', () => G.tube(hp, () => 0.05, 32, 12, true), [mx, 0.012, mz], [0, -30, 0], [ms, ms, ms], mat(M.ceramic, { color: [0.97, 0.96, 0.93] }));
        K.shadow(api, mx, mz, 0.34, 0.34, 0, 0.45);

        /* --- 名札の台（くさび形の木＋真鍮の板） --- */
        const N = local(PLATE.x, PLATE.z, PLATE.yaw, 1), ny = PLATE.yaw;
        api.mesh('bs:wedge', () => G.surface((u, v) => {
          // 断面は台形（手前が低い傾斜面）を u で周回、v で幅方向
          const pts = [[-0.07, 0], [0.07, 0], [0.07, 0.03], [-0.05, 0.14], [-0.07, 0.14], [-0.07, 0]];
          const f = u * 5, i = Math.min(4, Math.floor(f)), t = f - i;
          const a = pts[i], b = pts[i + 1];
          return [(v - 0.5) * 0.52, a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t];
        }, 40, 2), N(0, 0.012, 0), [0, ny, 0], [1, 1, 1], mat(M.wood, { color: [0.36, 0.2, 0.12], spec: 0.3 }));
                api.panel(N(0, 0.1, 0.016), [47.5, ny, 0], [0.44, 0.1], mat(GOLD, { tex: tex.plate, sharp: true }));
        K.shadow(api, PLATE.x, PLATE.z, 0.56, 0.2, ny, 0.4);

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
    E.drawGrain(ctx, W, H, 0.022, 116, 2);
  }
});

function makeTextures(E) {
  const T = {}, C = E.newCanvas;
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#3e5a54'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(0, 0, 64, 128);
    T.wall = c;
  }
  // 窓：白い枠と十字の桟、外は昼の空とビル
  {
    const Wd = 640, Ht = 360, c = C(Wd, Ht), x = c.getContext('2d'), r = E.rnd(8);
    const g = x.createLinearGradient(0, 0, 0, Ht); g.addColorStop(0, '#9cc4e4'); g.addColorStop(1, '#d9e8f2');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    for (let i = 0; i < 12; i++) {
      const bw = 40 + r() * 50, bh = 90 + r() * 200, bx = i * 56 - 20;
      x.fillStyle = ['#8ea4b8', '#a9b8c6', '#7d92a8'][i % 3]; x.fillRect(bx, Ht - bh, bw, bh);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let yy = Ht - bh + 12; yy < Ht - 10; yy += 22) for (let xx = bx + 8; xx < bx + bw - 10; xx += 16) x.fillRect(xx, yy, 8, 10);
    }
    x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, Wd, 16); x.fillRect(0, Ht - 16, Wd, 16); x.fillRect(0, 0, 16, Ht); x.fillRect(Wd - 16, 0, 16, Ht);
    x.fillRect(Wd / 2 - 6, 0, 12, Ht); x.fillRect(0, Ht * 0.45, Wd, 10);
    T.window = c;
  }
  T.table = woodTex(E, 31, [92, 54, 32], 4);
  // マグ：白地に緑の帯と「BOSS」（正面は u=0.5 付近）
  {
    const Wd = 1024, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#f8f7f2'; x.fillRect(0, 0, Wd, Ht);
    // 回転体の v は輪郭の長さ（外側の胴は v≒0.16〜0.48）。キャンバスは上が v=1
    x.fillStyle = '#2f6a58'; x.fillRect(0, Ht * 0.54, Wd, 8); x.fillRect(0, Ht * 0.8, Wd, 8);
    x.fillStyle = '#2f6a58'; x.font = '700 50px "Oswald",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('No.1 BOSS', Wd * 0.5, Ht * 0.675);
        T.mug = c;
  }
  // 名札の真鍮板：「THE BOSS」
  {
    const c = C(512, 96), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, '#f0d488'); g.addColorStop(1, '#c49a44');
    x.fillStyle = g; x.fillRect(0, 0, 512, 96);
    x.strokeStyle = '#8a6424'; x.lineWidth = 6; x.strokeRect(6, 6, 500, 84);
    x.fillStyle = '#3a2a14'; x.font = '700 54px "Oswald",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('THE BOSS', 256, 50);
    T.plate = c;
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
