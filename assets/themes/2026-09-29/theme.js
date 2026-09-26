/* =========================================================================
 *  9/29 招き猫の日（「く(9)る(2)ふく(29)＝来る福」の語呂合わせ。日本招猫倶楽部が制定）
 *  金屏風の前の飾り台。右手を挙げた三毛の招き猫（首輪と鈴、小判を抱える）、
 *  紫の座布団にのせた大判の置物、卓上カレンダーの横にアクスタを置く。
 *  台には緋毛氈（赤いフェルト）を敷く。
 *  単位: アクスタの板の高さ 1.0 ≒ 15cm
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'maneki-neko-day',
  title: '招き猫の日',
  dayName: 'Lucky Cat Day',
  caption: { fill: '#ffffff', outline: '#8a2a22' },
  size: [1350, 1350],
  fontText: '千万両大判福',
  adjustRange: { scale: [75, 115], x: [-30, 30], y: [-10, 8] },

  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, G = E.GEN, M = E.MAT;
    const stand = E.acrylicStand(env);
    const cal = E.dateProp(env, { style: { paper: '#fbf5e6', ink: '#8a2a22', accent: '#c8923a', back: '#e8dcc0', grain: 0.06 } });
    const K = E.props();
    const T = makeTextures(E);
    const tex = {};
    for (const k in T) tex[k] = K.texture(T[k], { repeat: ['table', 'felt', 'wall'].includes(k) });
    const mat = (base, o) => Object.assign({}, base, o);

    /* ---------- 配置 ---------- */
    const P = { x: -0.06, z: 0.04, yaw: 12 };            // アクスタ
    const NEKO = { x: 0.64, z: -0.95, yaw: -18 };         // 招き猫（右）
    const OBAN = { x: -0.6, z: -0.12 };                  // 座布団の大判（左手前）
    const CAL = { x: -0.84, z: -1.1, yaw: 22 };           // 卓上カレンダー（左奥）
    const eye = [0.3, 1.3, 2.75], at = [0.02, 0.5, -0.1];
    const focus = Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z);
    const WHITE = mat(M.ceramic, { color: [1.0, 1.0, 0.98], spec: 0.6, shin: 100 });
    const GOLD = mat(M.gold, { color: [0.96, 0.78, 0.36] });
    const RED = mat(M.ceramic, { color: [0.84, 0.16, 0.14], spec: 0.6, shin: 90 });
    const PINK = mat(M.ceramic, { color: [0.96, 0.62, 0.64], spec: 0.5 });

    /* ---------- 形 ---------- */
    // 胴：座った洋梨形（下が広く、肩でしぼる）
    const bodyProf = [[0, 0], [0.4, 0], [0.44, 0.02], [0.5, 0.12], [0.5, 0.3], [0.46, 0.46], [0.38, 0.6], [0.3, 0.68], [0, 0.7]];
    // 耳：少し前に反った円すい（内側は別に）
    const earProf = [[0, 0], [0.5, 0], [0.34, 0.5], [0.12, 0.9], [0, 1]];
    // 首輪
    const collarProf = [[0.3, 0], [0.33, 0.02], [0.335, 0.06], [0.31, 0.08], [0.28, 0.06], [0.28, 0.02]];
    // 座布団（ふっくらした角丸の箱）と、大判（楕円の板）
    const obanGeo = () => G.surface((u, v) => {
      const th = u * Math.PI * 2, ph = (v - 0.5) * Math.PI, c = Math.pow(Math.max(0, Math.cos(ph)), 0.25);
      return [Math.sin(th) * 0.5 * c, Math.sin(ph) * 0.05, Math.cos(th) * 0.5 * c];
    }, 64, 12, (u, v) => { const r = 0.5 * Math.pow(Math.max(0, Math.cos((v - 0.5) * Math.PI)), 0.25); /* 形の半径と同じ割合で貼る */ return [0.5 + Math.sin(u * Math.PI * 2) * r, 0.5 - Math.cos(u * Math.PI * 2) * r]; });

    const safe = guardApi();                           // 初めて描く形の影の乱れを防ぐ（下の guardApi を参照）
    S.render(ctx, {
      W, H, clear: [0.94, 0.9, 0.82], ambient: 0.58, light: [0.2, 0.88, 0.6], lightCol: [1.08, 1.06, 1.0],
      sky: [1.02, 1.0, 0.96], ground: [0.7, 0.52, 0.42], envTop: [1.06, 1.02, 0.94], envBot: [0.5, 0.34, 0.26],
      camera: { eye, at, fov: 31, focus, dofScale: 0.3, blur: 12 },
      draw(api) {
        api = safe(api);
        /* --- 奥：しっくいの壁と、ジグザグに立てた金屏風 --- */
        api.panel([0, 1.6, -3.4], [0, 0, 0], [12, 5], { tex: tex.wall, uvScale: [4, 2], unlit: true });
        const pw = 0.72, n = 6, x0 = -((n - 1) * pw * Math.cos(0.35)) / 2;
        for (let i = 0; i < n; i++) {
          const ry = (i % 2 ? -20 : 20);
          api.panel([x0 + i * pw * Math.cos(0.35), 0.95, -2.6 + (i % 2 ? 0.08 : -0.08)], [0, ry, 0], [pw, 1.9],
            { tex: tex.byobu, uvOffset: [i / n, 0], uvScale: [1 / n, 1], unlit: true });
        }
        /* --- 飾り台と緋毛氈 --- */
        api.box([0, -0.05, -0.6], [0, 0, 0], [6.4, 0.1, 4.4], mat(M.wood, { tex: tex.table, face: S.FACE.TOP, edge: [0.4, 0.24, 0.14], uvScale: [2, 1] }));
        api.box([0.1, 0.004, -0.5], [0, 0, 0], [3.4, 0.008, 1.9], mat(M.matte, { tex: tex.felt, face: S.FACE.TOP, edge: [0.7, 0.14, 0.12], uvScale: [3, 2] }));

        /* --- 招き猫 --- */
        const nx = NEKO.x, nz = NEKO.z, ny = NEKO.yaw, nr = ny * Math.PI / 180, s = 0.64;
        const at3 = (lx, ly, lz) => [nx + (Math.cos(nr) * lx + Math.sin(nr) * lz) * s, 0.008 + ly * s, nz + (-Math.sin(nr) * lx + Math.cos(nr) * lz) * s];
        api.lathe('neko:body', bodyProf, at3(0, 0, 0), [0, ny, 0], [s, s * 0.95, s * 0.9], mat(WHITE, { tex: tex.calico }));
        // 頭（少し横長の球。顔はテクスチャ）
        const hc = at3(0, 0.86, 0.02);
        api.sphere(hc, [0, ny, 0], [0.66 * s, 0.56 * s, 0.58 * s], mat(WHITE, { tex: tex.face }));
        // 耳（外は白、内はピンク）
        for (const sg of [-1, 1]) {
          const ep = at3(sg * 0.2, 1.06, 0.0);
          api.lathe('neko:ear', earProf, ep, [-8, ny, sg * -18], [0.2 * s, 0.2 * s, 0.14 * s], sg > 0 ? mat(WHITE, { color: [0.95, 0.62, 0.28] }) : WHITE);
          api.lathe('neko:ear', earProf, at3(sg * 0.2, 1.065, 0.03), [-8, ny, sg * -18], [0.13 * s, 0.15 * s, 0.06 * s], PINK);
        }
        // 首輪と鈴
        api.lathe('neko:collar', collarProf, at3(0, 0.6, 0.0), [0, ny, 0], [s * 0.98, s, s * 0.9], RED);
        api.sphere(at3(0, 0.56, 0.3), [0, ny, 0], [0.13 * s, 0.13 * s, 0.13 * s], GOLD);
        api.cylinder(at3(0, 0.52, 0.34), [0, ny, 0], [0.08 * s, 0.01, 0.01], mat(M.metal, { color: [0.4, 0.3, 0.1] }));
        // 挙げた右手（見る側から左）：腕を曲面の管で、先に丸い手
        const arm = (t) => [-0.3 - 0.06 * Math.sin(t * Math.PI), 0.42 + t * 0.5, 0.12 + 0.06 * t];
        api.mesh('neko:arm', () => G.tube(arm, (t) => 0.1 - 0.02 * t, 24, 16, true), at3(0, 0, 0), [0, ny, 0], [s, s, s], WHITE);
        api.sphere(at3(-0.3, 0.98, 0.2), [0, ny, 0], [0.2 * s, 0.22 * s, 0.16 * s], WHITE);
        api.sphere(at3(-0.3, 0.94, 0.28), [0, ny, 0], [0.09 * s, 0.07 * s, 0.03 * s], PINK);     // 肉球
        // 左手で抱えた小判
        api.mesh('neko:koban', obanGeo, at3(0.16, 0.34, 0.4), [80, ny, -10], [0.26 * s, 0.9 * s, 0.4 * s], mat(GOLD, { tex: tex.koban }));
        api.sphere(at3(0.26, 0.3, 0.44), [0, ny, 0], [0.16 * s, 0.14 * s, 0.14 * s], WHITE);
        // 後ろ足（前に出たふくらみ）
        for (const sg of [-1, 1]) api.sphere(at3(sg * 0.2, 0.06, 0.34), [0, ny, 0], [0.22 * s, 0.14 * s, 0.26 * s], WHITE);

        /* --- 紫の座布団と大判 --- */
        const ox = OBAN.x, oz = OBAN.z;
        api.rbox([ox, 0.05, oz], [0, 16, 0], [0.42, 0.08, 0.42], mat(M.matte, { color: [0.46, 0.24, 0.52], round: 0.5, spec: 0.2 }));
        for (const [cx, cz] of [[-0.19, -0.19], [0.19, 0.19], [-0.19, 0.19], [0.19, -0.19]]) {
          const a = 16 * Math.PI / 180;
          api.sphere([ox + Math.cos(a) * cx + Math.sin(a) * cz, 0.06, oz - Math.sin(a) * cx + Math.cos(a) * cz], [0, 0, 0], [0.05, 0.05, 0.05], mat(M.matte, { color: [0.95, 0.78, 0.3] }));
        }
        api.mesh('neko:oban', obanGeo, [ox, 0.1, oz], [0, 10, 0], [0.24, 0.6, 0.36], mat(GOLD, { tex: tex.oban, metal: 0.5, spec: 0.45, shin: 60 }));

        /* --- 卓上カレンダー --- */
        cal.draw(api, Object.assign({ y: 0.008 }, CAL));
        cal.shadow(api, Object.assign({ y: 0.008 }, CAL));

        /* --- 接地の暗がり --- */
        K.shadow(api, nx, nz, 0.66, 0.6, ny, 0.45, 0.008);
        K.shadow(api, ox, oz, 0.52, 0.52, 16, 0.4, 0.008);

        stand.shadow(api, Object.assign({ y: 0.008 }, P));
        api.blend(true);
        stand.draw(api, Object.assign({ y: 0.008 }, P));
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    E.drawVignette(ctx, W, H, 0.12);
    E.drawGrain(ctx, W, H, 0.024, 29, 2);
  }
});

/* =========================================================================
 *  テクスチャ
 * ====================================================================== */
function makeTextures(E) {
  const T = {}, C = E.newCanvas;

  // しっくいの壁
  {
    const c = C(256, 256), x = c.getContext('2d');
    x.fillStyle = '#efe6d4'; x.fillRect(0, 0, 256, 256);
    T.wall = c;
  }
  // 金屏風：金箔の四角い継ぎ目（淡く）と、白い雲がすみ・松の枝（粗く）
  {
    const Wd = 1536, Ht = 640, c = C(Wd, Ht), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, Ht);
    g.addColorStop(0, '#e8c46a'); g.addColorStop(1, '#d2a24c');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
    x.strokeStyle = 'rgba(160,110,40,0.25)'; x.lineWidth = 3;
    for (let i = 0; i < Wd; i += 96) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, Ht); x.stroke(); }
    for (let j = 0; j < Ht; j += 96) { x.beginPath(); x.moveTo(0, j); x.lineTo(Wd, j); x.stroke(); }
    x.fillStyle = 'rgba(255,250,235,0.75)';
    const cloud = (cx, cy, w) => { E.roundRect(x, cx - w / 2, cy - 22, w, 44, 22); x.fill(); E.roundRect(x, cx - w * 0.2, cy - 50, w * 0.6, 40, 20); x.fill(); };
    cloud(300, 150, 360); cloud(1250, 520, 380);
    x.strokeStyle = '#5a3a24'; x.lineWidth = 22; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 560); x.bezierCurveTo(200, 500, 300, 420, 520, 380); x.stroke();
    x.fillStyle = '#3f6b44';
    for (const [px, py] of [[180, 470], [330, 420], [480, 370]]) { x.beginPath(); x.ellipse(px, py - 30, 90, 36, -0.2, 0, 7); x.fill(); }
    T.byobu = c;
  }
  // 飾り台：こげ茶の木目
  {
    const S = 1024, c = C(S, S), x = c.getContext('2d'), r = E.rnd(12);
    x.fillStyle = '#6a4028'; x.fillRect(0, 0, S, S);
    for (let k = 0; k < 30; k++) {
      x.strokeStyle = r() > 0.5 ? 'rgba(40,22,12,0.3)' : 'rgba(150,100,64,0.22)'; x.lineWidth = 3 + r() * 5;
      const y0 = r() * S; x.beginPath();
      for (let px = 0; px <= S; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.004 + k) * 8);
      x.stroke();
    }
    T.table = c;
  }
  // 緋毛氈（赤いフェルト。ごく淡いムラ）
  {
    const c = C(128, 128), x = c.getContext('2d');
    x.fillStyle = '#c42a22'; x.fillRect(0, 0, 128, 128);
    E.drawGrain(x, 128, 128, 0.06, 5, 3);
    T.felt = c;
  }
  // 三毛の胴：白地に茶と黒のぶち（u=周方向、u=0 が正面なので正面は白く残す）
  {
    const Wd = 512, Ht = 256, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#e8923a'; x.beginPath(); x.ellipse(Wd * 0.3, Ht * 0.45, 70, 60, 0.4, 0, 7); x.fill();
    x.fillStyle = '#2e2a2a'; x.beginPath(); x.ellipse(Wd * 0.62, Ht * 0.6, 60, 50, -0.3, 0, 7); x.fill();
    x.fillStyle = '#e8923a'; x.beginPath(); x.ellipse(Wd * 0.72, Ht * 0.3, 50, 40, 0.2, 0, 7); x.fill();
    T.calico = c;
  }
  // 顔（球の u=0 が正面。継ぎ目をまたぐので左右の端に半分ずつ描く）
  {
    const Wd = 1024, Ht = 512, c = C(Wd, Ht), x = c.getContext('2d');
    x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, Wd, Ht);
    x.fillStyle = '#e8923a'; x.beginPath(); x.ellipse(Wd * 0.62, Ht * 0.3, 110, 90, 0, 0, 7); x.fill();   // 頭の後ろのぶち
    const face = (cx) => {
      const cy = Ht * 0.5;
      x.strokeStyle = '#2e2a2a'; x.lineWidth = 12; x.lineCap = 'round';
      for (const sg of [-1, 1]) { x.beginPath(); x.arc(cx + sg * 70, cy + 4, 30, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }     // にっこり閉じた目
      x.fillStyle = '#e86a74'; x.beginPath(); x.moveTo(cx - 14, cy + 30); x.lineTo(cx + 14, cy + 30); x.lineTo(cx, cy + 46); x.fill(); // 鼻
      x.lineWidth = 7;
      x.beginPath(); x.arc(cx - 14, cy + 50, 14, 0.1, Math.PI - 0.3); x.stroke();
      x.beginPath(); x.arc(cx + 14, cy + 50, 14, 0.3, Math.PI - 0.1); x.stroke();                                 // ω の口
      x.lineWidth = 6;
      for (const sg of [-1, 1]) for (const k of [-1, 0, 1]) { x.beginPath(); x.moveTo(cx + sg * 60, cy + 44 + k * 14); x.lineTo(cx + sg * 130, cy + 38 + k * 22); x.stroke(); }  // ひげ
      x.fillStyle = 'rgba(240,120,130,0.4)';
      for (const sg of [-1, 1]) { x.beginPath(); x.ellipse(cx + sg * 100, cy + 30, 24, 14, 0, 0, 7); x.fill(); }   // ほお
    };
    x.save(); x.beginPath(); x.rect(0, 0, Wd / 2, Ht); x.clip(); face(0); x.restore();
    x.save(); x.beginPath(); x.rect(Wd / 2, 0, Wd / 2, Ht); x.clip(); face(Wd); x.restore();
    T.face = c;
  }
  // 小判・大判：金地に縦の槌目（粗く淡く）と墨書き
  const coin = (text, big) => {
    const S = 512, c = C(S, S), x = c.getContext('2d');
    x.fillStyle = '#f0c85a'; x.fillRect(0, 0, S, S);
    x.fillStyle = 'rgba(180,130,40,0.25)'; for (let i = 0; i < S; i += 28) x.fillRect(0, i, S, 8);
    x.fillStyle = '#3a2a1a'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = E.font(900, big ? 170 : 120, E.FONT.sans);
    x.save(); x.translate(S / 2, S / 2); x.scale(big ? 1.2 : 1.1, 1);          // 楕円に貼ると横が縮むので先に広げておく
    Array.from(text).forEach((ch, i, a) => x.fillText(ch, 0, (i - (a.length - 1) / 2) * (big ? 190 : 130)));
    x.restore();
    return c;
  };
  T.koban = coin('千万両', false);
  T.oban = coin('大判', true);
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
