/* =========================================================================
 *  テーマのひな形（このフォルダをコピーして使う）
 *   ★ 作る前に THEME_GUIDE.md（リポジトリ直下）を読むこと。ルールと確認手順はすべてそこにある
 *   1. assets/themes/_template フォルダをコピーして、名前をその日の日付（例 2026-10-02）にする
 *   2. このファイルの id / title / dayName と render() を書き換える
 *   3. python3 tools/check/render.py 2026-10-02 --zoom で描画と拡大図を確認する
 *   それだけで、その日の7日前からサイトの日付タブに出てくる（一覧ファイルの編集は不要）
 *  画像を使うときは同じフォルダに置いて assets に書く → env.images.キー で使える
 * ====================================================================== */
(function () {
'use strict';

OhaV.defineTheme({
  id: 'xxx-day',   // 英字の短い名前（保存するファイル名に使う）
  title: '◯◯の日',
  dayName: 'Xxx Day',                         // 下部キャプション（英語の「◯◯の日」）
  // caption: { fill: '#fff', outline: '#2b2118' },  // キャプションの色（上下共通）
  // caption: false,                          // キャプションを出さないテーマだけ
  size: [1350, 1350],                        // 出力サイズ(px)
  // googleFonts: 'family=Noto+Serif+JP:wght@900',  // テーマ内で使うGoogle Fonts
  // fonts: ['900 100px "Noto Serif JP"'],     // 描画前に読み込みを待つフォント（届かなければ出力しない）
  // fontText: 'おはようございます',          // 絵の中に描く日本語（title・dayName・カレンダー以外）
  // assets: { bg: 'bg.jpg' },               // 付属画像（env.images.bg）
  // adjustRange: { scale: [70, 130], x: [-30, 30], y: [-25, 25] },
  // defaultAdjust: { scale: 1, dx: 0, dy: 0 },
  // shareText: '#おはようVtuber',          // Xの投稿文（省略時はページのURL）

  /* env: { W, H, img, meta, adj, E, images }
   *   E = 基幹エンジン（core/engine.js）: Stage3D / acrylicPlate / place / 文字描画 など */
  render(ctx, env) {
    const { E, W, H } = env;
    const S = E.Stage3D, M = E.MAT;
    const K = E.props();                               // 小物キット（cup, saucer, plate, pitcher, book, plant, shadow, texture）

    // 例：テーブルにアクリルスタンドを置いて斜め上から撮る（9/26〜10/1 のテーマと同じ構図）
    const stand = E.acrylicStand(env);                 // 立ち絵からアクスタ一式を作る
    const P = { x: -0.2, z: 0, yaw: 15 };              // 置き場所と向き（yaw で斜めに振る）
    // 【共通ルール】画角内に「MM/DD」を入れる：卓上カレンダー（form:'wall' で壁掛け）
    const cal = E.dateProp(env, { style: { paper: '#fbf7ee', ink: '#333', accent: '#c0392b' } });
    const CAL = { x: 0.62, z: -0.75, yaw: -16 };
    const eye = [0.3, 1.3, 2.75], at = [0.02, 0.47, 0];
    S.render(ctx, {
      // ライティングは「通常の室内照明」の範囲で（THEME_GUIDE.md「ライティング」）。
      // 目安：ambient 0.45〜0.6 / lightCol 各成分 1.0〜1.2 / ビネット 0.2以下。強いスポット・濃い影で演出しない
      W, H, clear: [0.9, 0.9, 0.92], ambient: 0.55, light: [-0.5, 0.85, 0.5], lightCol: [1.05, 1.03, 1.0],
      sky: [1.0, 1.0, 1.02], ground: [0.7, 0.66, 0.62], envTop: [1.0, 0.99, 0.96], envBot: [0.5, 0.45, 0.4],
      camera: { eye, at, fov: 31, focus: Math.hypot(eye[0] - P.x, eye[1] - 0.6, eye[2] - P.z), dofScale: 0.3, blur: 12 },
      draw(api) {
        api.panel([0, 1.6, -4], [0, 0, 0], [14, 6], Object.assign({}, M.matte, { color: [0.92, 0.9, 0.86] }));   // 奥の壁
        api.box([0, -0.04, 0], [0, 0, 0], [7, 0.08, 5.2], Object.assign({}, M.wood, { color: [0.75, 0.6, 0.45] })); // テーブル
        // 小物の例：陶器のカップ＆ソーサー（キット）。形は api.lathe / api.rbox / api.mesh で作る
        const cy = K.saucer(api, { x: -0.78, z: -0.75, d: 0.5 });
        K.cup(api, { x: -0.78, z: -0.75, y: cy, d: 0.3, h: 0.26, handleYaw: -40, liquid: { color: [0.3, 0.17, 0.08], level: 0.85 } });
        K.shadow(api, -0.78, -0.75, 0.6, 0.55, 0, 0.4);                                      // 接地影
        cal.draw(api, CAL); cal.shadow(api, CAL);
        stand.shadow(api, P);
        api.blend(true);          // 半透明は奥から順に。アクスタは最後
        stand.draw(api, P);
        api.blend(false);
      }
    });
    stand.free(); cal.free(); K.free();

    // 「Good Morning」と dayName は基幹側（app.js）が自動で重ねる
  }
});
})();
