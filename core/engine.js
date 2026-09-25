/* =========================================================================
 *  毎日おはV — 描画エンジン（基幹・固定）
 *  テーマ（assets/themes/*）から使う共通部品をまとめたもの。
 *  ここはテーマを増やしても基本的に触らない。
 *
 *  公開するもの: window.OhaV.E（エンジン） … テーマの render() に env.E として渡る
 *   [1] ユーティリティ / 立ち絵の解析・配置
 *   [2] WebGL2 コア（GLX）
 *   [3] 擬似3Dステージ（Stage3D）: 直方体・平面・パネル・円柱・リング・取っ手・球
 *   [4] 2D描画プリミティブ（文字・角丸・グレイン・ビネット・影・共通キャプション）
 *   [5] 小道具ジェネレータ（アクリルスタンド、日付カレンダー、汎用の小物キット）
 * ====================================================================== */
(function () {
'use strict';

/* =========================================================================
 * [1] ユーティリティ
 * ====================================================================== */
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const rnd = (s) => { // 決定的な擬似乱数（同じ入力で同じ絵になる）
  let x = s | 0 || 1;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; };
};
function newCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

/* 透過PNG前提で、被写体の外接矩形（アルファbbox）を取る */
function analyzeImage(img) {
  const S = 240;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const sc = Math.min(S / iw, S / ih, 1);
  const w = Math.max(1, Math.round(iw * sc)), h = Math.max(1, Math.round(ih * sc));
  const c = newCanvas(w, h);
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = -1, maxY = -1, transparent = 0;
  for (let y = 0; y < h; y++) for (let px = 0; px < w; px++) {
    const a = d[(y * w + px) * 4 + 3];
    if (a < 24) { transparent++; continue; }
    if (a > 160) {
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
  return {
    hasAlpha: transparent / (w * h) > 0.06,
    bbox: { x: minX / w, y: minY / h, w: (maxX - minX + 1) / w, h: (maxY - minY + 1) / h }
  };
}

/* 被写体bboxを箱に収める。adj = { scale, dx, dy }（dx,dy は箱サイズ比）
 * anchorX/anchorY: 0=左/上寄せ, 0.5=中央, 1=右/下寄せ */
function place(env, box, opt) {
  opt = opt || {};
  const img = env.img, bb = env.meta.bbox;
  const a = env.adj || { scale: 1, dx: 0, dy: 0 };
  const ax = opt.anchorX === undefined ? 0.5 : opt.anchorX;
  const ay = opt.anchorY === undefined ? 1 : opt.anchorY;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const sw = bb.w * iw, sh = bb.h * ih;
  const base = opt.fit === 'cover' ? Math.max(box.w / sw, box.h / sh) : Math.min(box.w / sw, box.h / sh);
  const s = base * (opt.scale || 1) * a.scale;
  const x = box.x + (box.w - sw * s) * ax - bb.x * iw * s + a.dx * box.w;
  const y = box.y + (box.h - sh * s) * ay - bb.y * ih * s + a.dy * box.h;
  return { x, y, w: iw * s, h: ih * s, s,
           bx: x + bb.x * iw * s, by: y + bb.y * ih * s, bw: sw * s, bh: sh * s };
}

/* =========================================================================
 * [2] WebGL2 コア
 * ====================================================================== */
const GLX = (() => {
  let cv = null, gl = null, quad = null, failed = false;
  const progs = new Map();

  function ctx() {
    if (gl || failed) return gl;
    cv = newCanvas(8, 8);
    gl = cv.getContext('webgl2', { antialias: false, alpha: true, depth: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) { failed = true; return null; }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    return gl;
  }
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
    return s;
  }
  function program(key, vs, fs) {
    if (progs.has(key)) return progs.get(key);
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'a_pos'); gl.bindAttribLocation(p, 1, 'a_uv'); gl.bindAttribLocation(p, 2, 'a_nrm');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    progs.set(key, p);
    return p;
  }
  let aniso;
  /* opt: { repeat, mip(default true) }。常に premultiplied alpha で取り込む
   * （透過PNGの縁が黒ずまないように） */
  function texture(src, opt) {
    opt = opt || {};
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const wrap = opt.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (opt.mip === false) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); return t; }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    if (aniso === undefined) {
      aniso = gl.getExtension('EXT_texture_filter_anisotropic') || null;
      if (aniso) aniso.max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    }
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, aniso.max));
    return t;
  }
  function fbo(w, h, withDepth) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
                          [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    let rb = null;
    if (withDepth) {
      rb = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    }
    return { fb: f, tex: t, rb, w, h };
  }
  function setUniforms(p, u) {
    let unit = 0;
    for (const k in u) {
      const loc = gl.getUniformLocation(p, k);
      if (loc === null) continue;
      const v = u[k];
      if (v === undefined || v === null) continue;
      if (v && v.tex !== undefined && typeof v.tex !== 'number') {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, v.tex);
        gl.uniform1i(loc, unit); unit++;
      } else if (v instanceof Float32Array || Array.isArray(v)) {
        if (v.length === 16) gl.uniformMatrix4fv(loc, false, v);
        else if (v.length === 9) gl.uniformMatrix3fv(loc, false, v);
        else if (v.length === 4) gl.uniform4fv(loc, v);
        else if (v.length === 3) gl.uniform3fv(loc, v);
        else if (v.length === 2) gl.uniform2fv(loc, v);
        else gl.uniform1fv(loc, v);
      } else gl.uniform1f(loc, +v);
    }
  }
  function pass(prog, uniforms, target) {
    const w = target ? target.w : cv.width, h = target ? target.h : cv.height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.viewport(0, 0, w, h);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    gl.useProgram(prog);
    setUniforms(prog, Object.assign({ u_res: [w, h] }, uniforms));
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function resize(w, h) { cv.width = w; cv.height = h; }
  function dispose(list) {
    for (const o of list) {
      if (!o) continue;
      if (o.fb) { gl.deleteFramebuffer(o.fb); gl.deleteTexture(o.tex); if (o.rb) gl.deleteRenderbuffer(o.rb); }
      else gl.deleteTexture(o);
    }
  }
  return {
    get gl() { return ctx(); }, get canvas() { return cv; },
    available() { return !!ctx(); },
    program, texture, fbo, pass, resize, dispose, setUniforms
  };
})();

const VS_FULL = `#version 300 es
in vec2 a_pos; out vec2 v_uv;
void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;
const FS_HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 v_uv; out vec4 fragColor; uniform vec2 u_res;
`;
const FS_BLUR = FS_HEAD + `
uniform sampler2D u_tex; uniform vec2 u_dir; uniform float u_radius;
void main(){
  vec2 px = 1.0 / u_res;
  float sigma = max(u_radius * 0.5, 0.5);
  vec4 sum = vec4(0.0); float ws = 0.0;
  for (int i = -14; i <= 14; i++){
    float fi = float(i);
    if (abs(fi) > u_radius) continue;
    float w = exp(-(fi*fi) / (2.0*sigma*sigma));
    sum += texture(u_tex, v_uv + u_dir * px * fi * 1.5) * w; ws += w;
  }
  fragColor = sum / ws;
}`;
const FS_DOF = FS_HEAD + `
uniform sampler2D u_sharp, u_blur, u_coc;
void main(){
  float coc = texture(u_coc, v_uv).r;
  fragColor = vec4(mix(texture(u_sharp, v_uv).rgb, texture(u_blur, v_uv).rgb, clamp(coc, 0.0, 1.0)), 1.0);
}`;

/* 線画：法線と奥行きの差から物の輪郭・折れ目を拾い、その場所の色を暗くして線にする。
 * 線の色は黒ではなく「その物の色を暗く・少し青紫に寄せた色」。奥ほど細く淡い */
const FS_LINE = FS_HEAD + `
uniform sampler2D u_col, u_nd; uniform float u_width, u_strength;
vec4 nd(ivec2 p){ return texelFetch(u_nd, clamp(p, ivec2(0), ivec2(u_res) - 1), 0); }
float depthOf(vec4 v){ return (v.b * 255.0 + v.a) / 255.0 * 30.0; }
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 c = texelFetch(u_col, p, 0);
  vec4 a = nd(p);
  if (a.b + a.a <= 0.0){ fragColor = c; return; }          // 線を引かない物（アクスタ）
  float da = depthOf(a);
  vec3 na = vec3(a.xy * 2.0 - 1.0, 0.0); na.z = sqrt(max(0.0, 1.0 - dot(na.xy, na.xy)));
  float w = u_width * clamp(3.2 / da, 0.45, 1.3);
  float e = 0.0;
  for (int i = 0; i < 8; i++){
    float ang = float(i) * 0.785398;
    ivec2 q = p + ivec2(round(vec2(cos(ang), sin(ang)) * w));
    vec4 b = nd(q);
    if (b.b + b.a <= 0.0) continue;
    float db = depthOf(b);
    vec3 nb = vec3(b.xy * 2.0 - 1.0, 0.0); nb.z = sqrt(max(0.0, 1.0 - dot(nb.xy, nb.xy)));
    float dz = (db - da) / da;                                 // 奥にある隣との段差だけ（手前側に線が乗る）
    e = max(e, smoothstep(0.035, 0.08, dz));
    e = max(e, smoothstep(0.28, 0.5, 1.0 - dot(na, nb)) * 0.85);
  }
  e *= u_strength * clamp(2.2 - da * 0.28, 0.35, 1.0);
  vec3 ink = c.rgb * vec3(0.36, 0.32, 0.4);
  fragColor = vec4(mix(c.rgb, ink, e), c.a);
}`;
/* 絵画調（遠景だけ）：クワハラフィルタ。ぼけている所ほど筆でならした平らな塗りになる */
const FS_PAINT = FS_HEAD + `
uniform sampler2D u_col, u_coc; uniform float u_amount;
void main(){
  vec2 px = 1.0 / u_res;
  vec3 c0 = texture(u_col, v_uv).rgb;
  float k = smoothstep(0.08, 0.35, texture(u_coc, v_uv).g) * u_amount;
  if (k <= 0.0){ fragColor = vec4(c0, 1.0); return; }
  vec3 m[4]; vec3 s[4];
  for (int q = 0; q < 4; q++){ m[q] = vec3(0.0); s[q] = vec3(0.0); }
  for (int j = 0; j <= 4; j++) for (int i = 0; i <= 4; i++){
    vec2 o = vec2(float(i), float(j)) * 3.0;
    vec3 a = texture(u_col, v_uv + vec2(-o.x, -o.y) * px).rgb; m[0] += a; s[0] += a * a;
    vec3 b = texture(u_col, v_uv + vec2( o.x, -o.y) * px).rgb; m[1] += b; s[1] += b * b;
    vec3 c = texture(u_col, v_uv + vec2(-o.x,  o.y) * px).rgb; m[2] += c; s[2] += c * c;
    vec3 d = texture(u_col, v_uv + vec2( o.x,  o.y) * px).rgb; m[3] += d; s[3] += d * d;
  }
  float best = 1e9; vec3 outc = c0;
  for (int q = 0; q < 4; q++){
    vec3 mu = m[q] / 25.0; vec3 v = s[q] / 25.0 - mu * mu;
    float vv = v.r + v.g + v.b;
    if (vv < best){ best = vv; outc = mu; }
  }
  fragColor = vec4(mix(c0, outc, k), 1.0);
}`;

/* 描画スタイル（背景・小物の見せ方）。アクスタ（unlit・noLine）には効かない
 *   line: 線画の強さ 0..1 / lineWidth: 線の太さ(出力px) / toon: セル塗り 0..1 / shadeCol: 影色
 *   texBias: テクスチャを粗いミップで読む量（細かいノイズを消す）/ paint: 遠景の絵画調 0..1 / grain: 粒子の倍率 */
const STYLE = {
  real:   { line: 0, toon: 0, texBias: 0, paint: 0, grain: 1 },
  line:   { line: 1, lineWidth: 1.8, toon: 0, texBias: 0, paint: 0, grain: 1 },
  toon:   { line: 1, lineWidth: 3.0, toon: 1, shadeCol: [0.9, 0.87, 0.97], texBias: 0, paint: 0, grain: 0.5 },
  illust: { line: 1, lineWidth: 1.8, toon: 1, shadeCol: [0.9, 0.87, 0.97], texBias: 2.2, paint: 1, grain: 0 },
  soft:   { line: 0, toon: 0.8, shadeCol: [0.92, 0.89, 0.98], texBias: 2.2, paint: 1, grain: 0 }
};
let styleOverride = null;     // 確認用（?dev&style=名前）。null ならテーマ指定（なければ標準の toon）

/* =========================================================================
 * [3] 擬似3Dステージ
 *   座標系: Y が上、単位は自由（テーマ内で揃えればよい）。
 *   テクスチャは全て premultiplied。半透明は api.blend(true) の間に描く。
 * ====================================================================== */
const M4 = {
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0; for (let k = 0; k < 4; k++) s += a[r + k * 4] * b[k + c * 4];
      o[r + c * 4] = s;
    }
    return o;
  },
  ortho(l, r, b, t, n, f) {
    const o = new Float32Array(16);
    o[0] = 2 / (r - l); o[5] = 2 / (t - b); o[10] = -2 / (f - n);
    o[12] = -(r + l) / (r - l); o[13] = -(t + b) / (t - b); o[14] = -(f + n) / (f - n); o[15] = 1;
    return o;
  },
  /* 法線行列（モデル行列の左上3x3の逆転置）。つぶした球でも陰影が正しくなる */
  normal3(m) {
    const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C || 1e-9, k = 1 / det;
    return new Float32Array([
      A * k, (-(b * i - c * h)) * k, (b * f - c * e) * k,
      B * k, (a * i - c * g) * k, (-(a * f - c * d)) * k,
      C * k, (-(a * h - b * g)) * k, (a * e - b * d) * k
    ]);
  },
  perspective(fovyDeg, aspect, near, far) {
    const fo = 1 / Math.tan(fovyDeg * Math.PI / 360), nf = 1 / (near - far);
    const o = new Float32Array(16);
    o[0] = fo / aspect; o[5] = fo; o[10] = (far + near) * nf; o[11] = -1; o[14] = 2 * far * near * nf;
    return o;
  },
  lookAt(eye, at, up) {
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const z = norm(sub(eye, at)), x = norm(cross(up, z)), y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
  },
  /* T * Ry * Rx * Rz * S（回転は度） */
  compose(pos, rot, size) {
    const d = Math.PI / 180;
    const cx = Math.cos((rot[0] || 0) * d), sx = Math.sin((rot[0] || 0) * d);
    const cy = Math.cos((rot[1] || 0) * d), sy = Math.sin((rot[1] || 0) * d);
    const cz = Math.cos((rot[2] || 0) * d), sz = Math.sin((rot[2] || 0) * d);
    const R = [
      [cy * cz + sy * sx * sz, -cy * sz + sy * sx * cz, sy * cx],
      [cx * sz, cx * cz, -sx],
      [-sy * cz + cy * sx * sz, sy * sz + cy * sx * cz, cy * cx]
    ];
    const o = new Float32Array(16);
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[r + c * 4] = R[r][c] * size[c];
    o[12] = pos[0]; o[13] = pos[1]; o[14] = pos[2]; o[15] = 1;
    return o;
  }
};

const VS_STAGE = `#version 300 es
in vec3 a_pos; in vec2 a_uv; in vec3 a_nrm;
uniform mat4 u_mvp, u_model, u_view, u_lightVP;
uniform mat3 u_nrmMat;
uniform vec2 u_uvScale, u_uvOffset;
out vec2 v_uv; out vec3 v_nrm; out float v_viewZ; out vec3 v_wpos; out vec4 v_lpos;
void main(){
  vec4 wp = u_model * vec4(a_pos, 1.0);
  v_wpos = wp.xyz;
  v_viewZ = -(u_view * wp).z;
  v_nrm = u_nrmMat * a_nrm;
  v_uv = a_uv * u_uvScale + u_uvOffset;
  v_lpos = u_lightVP * wp;
  gl_Position = u_mvp * vec4(a_pos, 1.0);
}`;
/* 陰影モデル
 *   拡散：半球環境光（空と床の色）＋平行光（影つき）
 *   鏡面：Blinn-Phong（u_spec 強さ / u_shin 鋭さ）
 *   金属：u_metal で環境の映り込み（上＝明るい空、下＝暗い床）を色に掛ける
 *   縁：u_rim でフレネル（見る角度が浅いほど映り込む）
 *   凹凸：u_bump でテクスチャの明暗から法線を揺らす（木目・スポンジ・紙の質感）
 *   影：シャドウマップ（5x5 PCF のソフトシャドウ） */
const FS_STAGE = `#version 300 es
precision highp float;
precision highp sampler2DShadow;
in vec2 v_uv; in vec3 v_nrm; in float v_viewZ; in vec3 v_wpos; in vec4 v_lpos;
out vec4 fragColor;
uniform sampler2D u_tex;
uniform sampler2DShadow u_shadow;
uniform vec3 u_color, u_light, u_lightCol, u_sky, u_ground, u_camPos, u_envTop, u_envBot;
uniform float u_useTex, u_unlit, u_alpha, u_mode, u_focus, u_dofScale, u_ambient;
uniform float u_spec, u_shin, u_metal, u_rim, u_bump, u_useShadow, u_texel, u_tintTex;
uniform mat4 u_view;
uniform float u_toon, u_texBias, u_sharp, u_noLine;   // 描画スタイル（STYLE 参照）
uniform vec3 u_shadeCol;
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
/* 映り込む環境：上は明るい天井・窓、水平付近はやや暗い壁、下は暗い床。
 * 光源の方向には柔らかい明るい窓を置く（金属がそれらしく見える） */
vec3 envAt(vec3 r, vec3 l){
  vec3 c = mix(u_envBot, u_envTop, smoothstep(-0.25, 0.8, r.y));
  c *= 0.8 + 0.2 * smoothstep(0.04, 0.3, abs(r.y - 0.12));
  float win = pow(max(dot(r, l), 0.0), 10.0);
  return c + u_lightCol * win * 1.1;
}
float shadowAt(vec3 n, vec3 l){
  if (u_useShadow < 0.5) return 1.0;
  vec3 p = v_lpos.xyz / v_lpos.w * 0.5 + 0.5;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
  float bias = 0.0008 + 0.0025 * (1.0 - max(dot(n, l), 0.0));
  float s = 0.0;
  for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++)
    s += texture(u_shadow, vec3(p.xy + vec2(float(x), float(y)) * u_texel * 1.3, p.z - bias));
  return s / 25.0;
}
void main(){
  float bias = (u_mode < 0.5 && u_sharp < 0.5) ? u_texBias : 0.0;
  vec4 base = u_useTex > 0.5 ? texture(u_tex, v_uv, bias) : vec4(u_color, 1.0);
  if (u_useTex > 0.5 && u_tintTex > 0.5) base.rgb *= u_color;
  if (u_mode > 2.5){                         // 線画用：画面空間の法線(xy)と奥行き(16bit)
    if (base.a * u_alpha < 0.5) discard;
    if (u_noLine > 0.5){ fragColor = vec4(0.0); return; }
    vec3 n = normalize(v_nrm);
    if (!gl_FrontFacing) n = -n;
    vec3 vn = normalize((u_view * vec4(n, 0.0)).xyz);
    float d = clamp(v_viewZ / 30.0, 0.0, 1.0) * 255.0;
    fragColor = vec4(vn.xy * 0.5 + 0.5, floor(d) / 255.0, fract(d)); return;
  }
  if (u_mode > 1.5){                         // シャドウマップ（深度だけ）
    if (base.a * u_alpha < 0.5) discard;
    fragColor = vec4(1.0); return;
  }
  if (u_mode > 0.5){                         // CoC（被写界深度マスク）
    if (base.a * u_alpha < 0.5) discard;
    float coc = clamp(abs(v_viewZ - u_focus) * u_dofScale, 0.0, 1.0);
    fragColor = vec4(coc, u_sharp > 0.5 ? 0.0 : coc, coc, 1.0); return;   // g: 絵画調をかける量（文字のある物は0）
  }
  if (base.a < 0.004) discard;
  vec3 rgb = base.rgb;
  if (u_unlit < 0.5){
    vec3 n = normalize(v_nrm);
    if (!gl_FrontFacing) n = -n;
    if (u_bump > 0.0 && u_useTex > 0.5 && u_toon < 0.5){
      float h = lum(base.rgb);
      vec3 dpdx = dFdx(v_wpos), dpdy = dFdy(v_wpos);
      float dhdx = dFdx(h), dhdy = dFdy(h);
      vec3 r1 = cross(dpdy, n), r2 = cross(n, dpdx);
      float det = dot(dpdx, r1);
      vec3 g = sign(det) * (dhdx * r1 + dhdy * r2);
      n = normalize(abs(det) * n - u_bump * g);
    }
    vec3 l = normalize(u_light), v = normalize(u_camPos - v_wpos), hv = normalize(l + v);
    float ndl = max(dot(n, l), 0.0);
    float sh = shadowAt(n, l);
    vec3 hemi = mix(u_ground, u_sky, n.y * 0.5 + 0.5);
    vec3 diff = rgb * (hemi * u_ambient + u_lightCol * (1.0 - u_ambient) * ndl * sh);
    vec3 r = reflect(-v, n);
    vec3 env = envAt(r, l);
    float spec = u_spec * pow(max(dot(n, hv), 0.0), u_shin) * sh * step(0.0, dot(n, l));
    float fr = pow(1.0 - max(dot(n, v), 0.0), 5.0);
    vec3 metalCol = rgb * env * (0.45 + 0.55 * sh);
    if (u_toon > 0.0){
      /* セル塗り：光・中間・影の3段。影は黒ではなく色味のある影色。ツヤは輪郭のはっきりした形 */
      float t = ndl * sh;
      float tb = smoothstep(0.03, 0.08, t) * 0.72 + smoothstep(0.34, 0.42, t) * 0.28;
      vec3 hemiF = mix(hemi, 0.5 * (u_sky + u_ground), 0.6);
      vec3 litC = hemiF * u_ambient + u_lightCol * (1.0 - u_ambient) * 0.92;
      vec3 shdC = (hemiF * u_ambient + u_lightCol * (1.0 - u_ambient) * 0.38) * u_shadeCol;
      diff = mix(diff, rgb * mix(shdC, litC, tb), u_toon);
      float sp = pow(max(dot(n, hv), 0.0), u_shin);
      float specT = min(u_spec, 1.0) * 0.8 * smoothstep(0.3, 0.38, sp) * step(0.5, sh) * step(0.0, dot(n, l));
      spec = mix(spec, specT, u_toon);
      vec3 envT = floor(env * 2.5 + 0.5) / 2.5;
      metalCol = mix(metalCol, rgb * envT * mix(0.6, 1.0, step(0.5, sh)), u_toon);
      fr = mix(fr, smoothstep(0.5, 0.56, fr) * 0.6, u_toon);
    }
    rgb = mix(diff, metalCol, u_metal)
        + spec * mix(u_lightCol, rgb * 1.4, u_metal) * base.a
        + env * fr * u_rim * base.a;
  }
  fragColor = vec4(rgb, base.a) * u_alpha;   // premultiplied
}`;

/* --- ジオメトリ（pos3 uv2 nrm3 = 8 float/頂点） --- */
const GEO = (() => {
  const push = (v, p, uv, n) => v.push(p[0], p[1], p[2], uv[0], uv[1], n[0], n[1], n[2]);
  // 単位立方体：TOP/BOTTOM/FRONT/BACK/RIGHT/LEFT の順に6頂点ずつ
  const box = (() => {
    const v = [], U = [[0, 0], [1, 0], [1, 1], [0, 1]], h = 0.5;
    const q = (pts, n) => { for (const i of [0, 1, 2, 0, 2, 3]) push(v, pts[i], U[i], n); };
    q([[-h, h, h], [h, h, h], [h, h, -h], [-h, h, -h]], [0, 1, 0]);
    q([[-h, -h, -h], [h, -h, -h], [h, -h, h], [-h, -h, h]], [0, -1, 0]);
    q([[-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]], [0, 0, 1]);
    q([[h, -h, -h], [-h, -h, -h], [-h, h, -h], [h, h, -h]], [0, 0, -1]);
    q([[h, -h, h], [h, -h, -h], [h, h, -h], [h, h, h]], [1, 0, 0]);
    q([[-h, -h, -h], [-h, -h, h], [-h, h, h], [-h, h, -h]], [-1, 0, 0]);
    return new Float32Array(v);
  })();
  // XZ平面（y=0, 法線+Y）。奥（-Z）が uv の v=1
  const plane = new Float32Array([
    -0.5, 0, 0.5, 0, 0, 0, 1, 0,   0.5, 0, 0.5, 1, 0, 0, 1, 0,   0.5, 0, -0.5, 1, 1, 0, 1, 0,
    -0.5, 0, 0.5, 0, 0, 0, 1, 0,   0.5, 0, -0.5, 1, 1, 0, 1, 0,  -0.5, 0, -0.5, 0, 1, 0, 1, 0
  ]);
  // 円柱（半径0.5, 高さ1, 中心原点）：側面 → 上蓋 → 下蓋
  const SEG = 64;
  const cyl = (() => {
    const v = [];
    for (let i = 0; i < SEG; i++) {
      const a0 = i / SEG * Math.PI * 2, a1 = (i + 1) / SEG * Math.PI * 2;
      const p = (a, y) => [Math.sin(a) * 0.5, y, Math.cos(a) * 0.5];
      const n = (a) => [Math.sin(a), 0, Math.cos(a)];
      const u0 = i / SEG, u1 = (i + 1) / SEG;
      push(v, p(a0, -0.5), [u0, 0], n(a0)); push(v, p(a1, -0.5), [u1, 0], n(a1)); push(v, p(a1, 0.5), [u1, 1], n(a1));
      push(v, p(a0, -0.5), [u0, 0], n(a0)); push(v, p(a1, 0.5), [u1, 1], n(a1)); push(v, p(a0, 0.5), [u0, 1], n(a0));
    }
    const cap = (y, ny) => {
      for (let i = 0; i < SEG; i++) {
        const a0 = i / SEG * Math.PI * 2, a1 = (i + 1) / SEG * Math.PI * 2;
        const pt = (a) => [Math.sin(a) * 0.5, y, Math.cos(a) * 0.5];
        const uv = (q) => [q[0] + 0.5, 0.5 - q[2]];
        const c = [0, y, 0], p0 = pt(a0), p1 = pt(a1);
        push(v, c, uv(c), [0, ny, 0]); push(v, p0, uv(p0), [0, ny, 0]); push(v, p1, uv(p1), [0, ny, 0]);
      }
    };
    cap(0.5, 1); cap(-0.5, -1);
    return new Float32Array(v);
  })();
  const CYL = { SIDE: [0, SEG * 6], TOP: [SEG * 6, SEG * 3], BOTTOM: [SEG * 9, SEG * 3], ALL: [0, SEG * 12] };
  // リング（外径0.5・内径 0.5*RING_IN, y=0, 法線+Y）：器の縁など
  const RING_IN = 0.9;
  const ring = (() => {
    const v = [];
    for (let i = 0; i < SEG; i++) {
      const a0 = i / SEG * Math.PI * 2, a1 = (i + 1) / SEG * Math.PI * 2;
      const P = (a, r) => [Math.sin(a) * r, 0, Math.cos(a) * r];
      const uv = (q) => [q[0] + 0.5, 0.5 - q[2]];
      const o0 = P(a0, 0.5), o1 = P(a1, 0.5), i0 = P(a0, 0.5 * RING_IN), i1 = P(a1, 0.5 * RING_IN);
      for (const q of [i0, o0, o1, i0, o1, i1]) push(v, q, uv(q), [0, 1, 0]);
    }
    return new Float32Array(v);
  })();
  // 半トーラス（カップの取っ手）: XY平面, +X側に張り出す。主半径0.5・管半径0.14
  const handle = (() => {
    const v = [], A = 28, B = 16, R = 0.5, r = 0.14;
    const P = (i, j) => {
      const a = -Math.PI / 2 + i / A * Math.PI, b = j / B * Math.PI * 2;
      const cx = Math.cos(a), cy = Math.sin(a);
      const n = [cx * Math.cos(b), cy * Math.cos(b), Math.sin(b)];
      return { p: [cx * R + n[0] * r, cy * R + n[1] * r, n[2] * r], n, uv: [i / A, j / B] };
    };
    for (let i = 0; i < A; i++) for (let j = 0; j < B; j++) {
      const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
      for (const q of [a, b, c, a, c, d]) push(v, q.p, q.uv, q.n);
    }
    return new Float32Array(v);
  })();
  // 球（半径0.5）。uは経度、vは緯度（下=0, 上=1）
  const sphere = (() => {
    const v = [], A = 48, B = 24;
    const P = (i, j) => {
      const th = i / A * Math.PI * 2, ph = -Math.PI / 2 + j / B * Math.PI;
      const n = [Math.cos(ph) * Math.sin(th), Math.sin(ph), Math.cos(ph) * Math.cos(th)];
      return { p: [n[0] * 0.5, n[1] * 0.5, n[2] * 0.5], n, uv: [i / A, j / B] };
    };
    for (let i = 0; i < A; i++) for (let j = 0; j < B; j++) {
      const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
      for (const q of [a, b, c, a, c, d]) push(v, q.p, q.uv, q.n);
    }
    return new Float32Array(v);
  })();
  return { box, plane, cyl, CYL, ring, handle, sphere };
})();

/* --- 自由形状のジオメトリ生成（テーマ・小物で使う）--------------------
 *   どれも { data: Float32Array, parts: { 名前: [first, count] } } を返す
 * ------------------------------------------------------------------- */
const GEN = (() => {
  const push = (v, p, uv, n) => v.push(p[0], p[1], p[2], uv[0], uv[1], n[0], n[1], n[2]);
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

  /* 回転体。profile = [[r, y, sharp?], ...]（下から上へ。外側を上がって内側を下りれば厚みのある器になる）
   * sharp=1 の点は角（法線を分ける）。u=角度、v=輪郭に沿った長さ */
  function lathe(profile, seg) {
    seg = seg || 96;
    const pts = [];            // 角の点は2つに分ける
    for (let i = 0; i < profile.length; i++) {
      const q = profile[i];
      pts.push({ r: q[0], y: q[1], seg: i });
      if (q[2] && i > 0 && i < profile.length - 1) pts.push({ r: q[0], y: q[1], seg: i, split: true });
    }
    // 各区間の2D法線
    const segN = [];
    for (let i = 0; i < profile.length - 1; i++) {
      const dr = profile[i + 1][0] - profile[i][0], dy = profile[i + 1][1] - profile[i][1];
      const l = Math.hypot(dr, dy) || 1;
      segN.push([dy / l, -dr / l]);
    }
    const ring = [];           // {r,y,nr,ny,v}
    let len = 0, total = 0;
    for (let i = 0; i < profile.length - 1; i++) total += Math.hypot(profile[i + 1][0] - profile[i][0], profile[i + 1][1] - profile[i][1]);
    for (let i = 0; i < profile.length; i++) {
      if (i > 0) len += Math.hypot(profile[i][0] - profile[i - 1][0], profile[i][1] - profile[i - 1][1]);
      const q = profile[i], sharp = q[2];
      const nPrev = segN[i - 1], nNext = segN[i];
      if (sharp && nPrev && nNext) {
        ring.push({ r: q[0], y: q[1], n: nPrev, v: len / total, end: true });
        ring.push({ r: q[0], y: q[1], n: nNext, v: len / total, start: true });
      } else {
        let n = nPrev && nNext ? [nPrev[0] + nNext[0], nPrev[1] + nNext[1]] : (nPrev || nNext);
        const l = Math.hypot(n[0], n[1]) || 1;
        ring.push({ r: q[0], y: q[1], n: [n[0] / l, n[1] / l], v: len / total });
      }
    }
    const v = [];
    for (let k = 0; k < ring.length - 1; k++) {
      const A = ring[k], B = ring[k + 1];
      if (A.end && B.start) continue;       // 角の分割点どうしはつながない
      for (let j = 0; j < seg; j++) {
        const a0 = j / seg * Math.PI * 2, a1 = (j + 1) / seg * Math.PI * 2;
        const P = (R, a) => [Math.sin(a) * R.r, R.y, Math.cos(a) * R.r];
        const N = (R, a) => [Math.sin(a) * R.n[0], R.n[1], Math.cos(a) * R.n[0]];
        const q = [[A, a0, j / seg], [B, a0, j / seg], [B, a1, (j + 1) / seg], [A, a1, (j + 1) / seg]];
        for (const idx of [0, 2, 1, 0, 3, 2]) { const [R, a, u] = q[idx]; push(v, P(R, a), [u, R.v], N(R, a)); }
      }
    }
    return { data: new Float32Array(v), parts: { all: [0, v.length / 8] } };
  }

  /* パラメトリック曲面。f(u,v) -> [x,y,z]（u,v は 0..1）。法線は差分から */
  function surface(f, nu, nv, uvMap) {
    const P = [], v = [];
    for (let i = 0; i <= nu; i++) { P[i] = []; for (let j = 0; j <= nv; j++) P[i][j] = f(i / nu, j / nv); }
    const Nrm = (i, j) => {
      const du = sub(P[Math.min(nu, i + 1)][j], P[Math.max(0, i - 1)][j]);
      const dv = sub(P[i][Math.min(nv, j + 1)], P[i][Math.max(0, j - 1)]);
      return norm(cross(du, dv));
    };
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      for (const k of [0, 1, 2, 0, 2, 3]) {
        const [a, b] = q[k];
        push(v, P[a][b], uvMap ? uvMap(a / nu, b / nv) : [a / nu, b / nv], Nrm(a, b));
      }
    }
    return { data: new Float32Array(v), parts: { all: [0, v.length / 8] } };
  }

  /* 管（パイプ）。path(t)->[x,y,z]、radius(t)。取っ手・注ぎ口・絞りクリームなど */
  function tube(path, radius, nt, nr, closeEnds) {
    nt = nt || 48; nr = nr || 24;
    const frames = [];
    let prevN = null;
    for (let i = 0; i <= nt; i++) {
      const t = i / nt, e = 1e-3;
      const p = path(t), T = norm(sub(path(Math.min(1, t + e)), path(Math.max(0, t - e))));
      let N = prevN ? sub(prevN, T.map(x => x * (prevN[0] * T[0] + prevN[1] * T[1] + prevN[2] * T[2]))) : cross(T, Math.abs(T[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
      N = norm(N);
      const B = cross(T, N);
      frames.push({ p, N, B, r: radius(t) });
      prevN = N;
    }
    const v = [];
    const V = (i, j) => {
      const F = frames[i], a = j / nr * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a);
      const n = [F.N[0] * c + F.B[0] * s2, F.N[1] * c + F.B[1] * s2, F.N[2] * c + F.B[2] * s2];
      return { p: [F.p[0] + n[0] * F.r, F.p[1] + n[1] * F.r, F.p[2] + n[2] * F.r], n, uv: [i / nt, j / nr] };
    };
    for (let i = 0; i < nt; i++) for (let j = 0; j < nr; j++) {
      const q = [V(i, j), V(i + 1, j), V(i + 1, j + 1), V(i, j + 1)];
      for (const k of [0, 2, 1, 0, 3, 2]) push(v, q[k].p, q[k].uv, q[k].n);   // 表面が外向きになる巻き順
    }
    if (closeEnds) for (const [i, sgn] of [[0, -1], [nt, 1]]) {
      const F = frames[i], T = norm(sub(frames[Math.min(nt, i + 1)].p, frames[Math.max(0, i - 1)].p)).map(x => x * sgn);
      for (let j = 0; j < nr; j++) {
        const a = V(i, j), b = V(i, j + 1);
        for (const q of (sgn > 0 ? [F.p, a.p, b.p] : [F.p, b.p, a.p])) push(v, q, [0.5, 0.5], T);
      }
    }
    return { data: new Float32Array(v), parts: { all: [0, v.length / 8] } };
  }

  /* 扇形の柱（ケーキのひと切れなど）。中心角 ang(度)、半径1・高さ1、中心の辺が原点。
   * parts: top（上面） side（外周） cut（2つの切り口。uvは 横=中心→外, 縦=下→上） bottom */
  function wedge(ang, segs) {
    segs = segs || 24;
    const A = ang * Math.PI / 180, v = [], parts = {};
    const mark = (name, from) => { parts[name] = [from / 8, (v.length - from) / 8]; };
    let f = v.length;
    for (let i = 0; i < segs; i++) {
      const a0 = -A / 2 + A * i / segs, a1 = -A / 2 + A * (i + 1) / segs;
      const p = (a) => [Math.sin(a), 1, Math.cos(a)], uv = (q) => [q[0] * 0.5 + 0.5, 0.5 - q[2] * 0.5];
      for (const q of [[0, 1, 0], p(a0), p(a1)]) push(v, q, uv(q), [0, 1, 0]);
    }
    mark('top', f); f = v.length;
    for (let i = 0; i < segs; i++) {
      const a0 = -A / 2 + A * i / segs, a1 = -A / 2 + A * (i + 1) / segs;
      const Q = (a, y, u) => ({ p: [Math.sin(a), y, Math.cos(a)], n: [Math.sin(a), 0, Math.cos(a)], uv: [u, y] });
      const q = [Q(a0, 0, i / segs), Q(a1, 0, (i + 1) / segs), Q(a1, 1, (i + 1) / segs), Q(a0, 1, i / segs)];
      for (const k of [0, 1, 2, 0, 2, 3]) push(v, q[k].p, q[k].uv, q[k].n);
    }
    mark('side', f); f = v.length;
    for (const sgn of [-1, 1]) {
      const a = sgn * A / 2, dir = [Math.sin(a), 0, Math.cos(a)];
      const n = [sgn * Math.cos(a), 0, -sgn * Math.sin(a)];      // 切り口は外向き
      const Q = (r, y) => ({ p: [dir[0] * r, y, dir[2] * r], uv: [r, y] });
      const q = [Q(0, 0), Q(1, 0), Q(1, 1), Q(0, 1)];
      for (const k of (sgn > 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3])) push(v, q[k].p, q[k].uv, n);
    }
    mark('cut', f); f = v.length;
    for (let i = 0; i < segs; i++) {
      const a0 = -A / 2 + A * i / segs, a1 = -A / 2 + A * (i + 1) / segs;
      for (const q of [[0, 0, 0], [Math.sin(a1), 0, Math.cos(a1)], [Math.sin(a0), 0, Math.cos(a0)]]) push(v, q, [0.5, 0.5], [0, -1, 0]);
    }
    mark('bottom', f);
    return { data: new Float32Array(v), parts };
  }
  /* 角の丸い箱（超楕円体）。幅・高さ・奥行き=1。round: 0.05（ほぼ箱）〜1（球）
   * uv は6面それぞれに 0..1（面ごとに同じ絵が貼られる） */
  function roundBox(round, n) {
    n = n || 20;
    const e = Math.max(0.04, round);
    const sp = (w, m) => Math.sign(w) * Math.pow(Math.abs(w), m);
    const f = (u, v) => {
      const th = (u - 0.5) * Math.PI * 2, ph = (v - 0.5) * Math.PI;
      return [0.5 * sp(Math.cos(ph), e) * sp(Math.sin(th), e), 0.5 * sp(Math.sin(ph), e), 0.5 * sp(Math.cos(ph), e) * sp(Math.cos(th), e)];
    };
    return surface(f, n * 4, n * 2, (u, v) => {
      const p = f(u, v), a = [Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2])];
      if (a[1] >= a[0] && a[1] >= a[2]) return [p[0] + 0.5, 0.5 - p[2] * Math.sign(p[1])];
      if (a[2] >= a[0]) return [p[0] * Math.sign(p[2]) + 0.5, p[1] + 0.5];
      return [-p[2] * Math.sign(p[0]) + 0.5, p[1] + 0.5];
    });
  }
  return { lathe, surface, tube, wedge, roundBox };
})();
const GEOCACHE = new Map();   // key -> {data, parts}（ページ内で1回だけ作る）

const Stage3D = (() => {
  const FACE = { TOP: 0, BOTTOM: 6, FRONT: 12, BACK: 18, RIGHT: 24, LEFT: 30 };
  const ALL = [FACE.TOP, FACE.BOTTOM, FACE.FRONT, FACE.BACK, FACE.RIGHT, FACE.LEFT];
  const SS = 2;               // 2倍で描いて縮小（ジャギー対策）。これより下げない
  const SHADOW = 2048;        // シャドウマップの解像度
  let dummy = null;           // テクスチャを使わない描画でも sampler に正しい型を割り当てるためのもの

  /* opt: {
   *   W, H, clear, camera:{eye,at,fov,focus,dofScale,blur}, draw(api),
   *   light:[x,y,z]（光の来る方向）, lightCol, ambient, sky, ground（半球環境光）,
   *   envTop, envBot（金属・縁の映り込み色）, shadow:{ size, center, strength }
   * }
   * draw(api) は「影（mode 2）」「カラー（mode 0）」「被写界深度（mode 1）」の3回呼ばれる。 */
  function render(ctx, opt) {
    const gl = GLX.gl;
    if (!gl) throw new Error('WebGL2 が使えません');
    const W = opt.W, H = opt.H;
    const lim = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    if (Math.max(W, H) * SS > lim) throw new Error(`この端末のGPUでは ${W * SS}px の描画ができません（上限 ${lim}px）`);
    const RW = W * SS, RH = H * SS;
    GLX.resize(RW, RH);
    const prog = GLX.program('stage3', VS_STAGE, FS_STAGE);
    if (!dummy) {
      dummy = {};
      dummy.color = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, dummy.color);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
      dummy.depth = makeDepthTex(gl, 1);
    }
    const bufs = {}, meshBufs = new Map();
    for (const k of ['box', 'plane', 'cyl', 'ring', 'handle', 'sphere']) {
      bufs[k] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bufs[k]);
      gl.bufferData(gl.ARRAY_BUFFER, GEO[k], gl.STATIC_DRAW);
    }
    const cam = opt.camera;
    const view = M4.lookAt(cam.eye, cam.at, [0, 1, 0]);
    const camVP = M4.mul(M4.perspective(cam.fov || 30, W / H, 0.05, 300), view);
    // 光源からの正射影（影用）
    const L = (() => { const l = opt.light || [0.4, 0.86, 0.45], n = Math.hypot(l[0], l[1], l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })();
    const sc = (opt.shadow && opt.shadow.center) || cam.at, half = (opt.shadow && opt.shadow.size) || 3.2;
    const lView = M4.lookAt([sc[0] + L[0] * 20, sc[1] + L[1] * 20, sc[2] + L[2] * 20], sc, Math.abs(L[1]) > 0.99 ? [0, 0, 1] : [0, 1, 0]);
    const lightVP = M4.mul(M4.ortho(-half, half, -half, half, 0.1, 50), lView);
    const useShadow = !(opt.shadow === false);
    // 標準は toon（線＋セル塗り。2026-09-26 採用）。テーマの opt.style で上書き可、?dev&style= は確認用
    const st = Object.assign({}, STYLE.real, styleOverride ? STYLE[styleOverride] : (typeof opt.style === 'string' ? STYLE[opt.style] : opt.style) || STYLE.toon);
    const common = {
      u_toon: st.toon || 0, u_texBias: st.texBias || 0, u_shadeCol: st.shadeCol || [0.8, 0.78, 0.9],
      u_view: view, u_light: L, u_lightVP: lightVP, u_camPos: cam.eye,
      u_lightCol: opt.lightCol || [1.0, 0.97, 0.92],
      u_ambient: opt.ambient === undefined ? 0.45 : opt.ambient,
      u_sky: opt.sky || [1.0, 0.99, 0.97], u_ground: opt.ground || [0.62, 0.57, 0.52],
      u_envTop: opt.envTop || [1.0, 0.98, 0.94], u_envBot: opt.envBot || [0.3, 0.26, 0.23],
      u_focus: cam.focus, u_dofScale: cam.dofScale === undefined ? 0.4 : cam.dofScale,
      u_texel: 1 / SHADOW
    };
    let mode = 0, bound = null, vp = camVP, shadowTex = null;
    const bindBuf = (buf) => {
      if (bound === buf) return; bound = buf;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 12);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 20);
    };
    const bind = (k) => bindBuf(bufs[k]);
    const draw = (m, o, first, count) => {
      o = o || {};
      if (mode === 2 && o.castShadow === false) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, o.tex || dummy.color);
      gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, (mode === 0 && shadowTex) ? shadowTex : dummy.depth);
      gl.uniform1i(gl.getUniformLocation(prog, 'u_shadow'), 1);
      GLX.setUniforms(prog, Object.assign({}, common, {
        u_mvp: M4.mul(vp, m), u_model: m, u_nrmMat: M4.normal3(m), u_mode: mode,
        u_useTex: o.tex ? 1 : 0, u_tintTex: o.tint ? 1 : 0,
        u_color: o.color || [0.8, 0.8, 0.8], u_alpha: o.alpha === undefined ? 1 : o.alpha,
        u_unlit: o.unlit ? 1 : 0, u_uvScale: o.uvScale || [1, 1], u_uvOffset: o.uvOffset || [0, 0],
        u_spec: o.spec || 0, u_shin: o.shin || 40, u_metal: o.metal || 0, u_rim: o.rim || 0, u_bump: o.bump || 0,
        u_useShadow: (mode === 0 && shadowTex && o.receiveShadow !== false) ? 1 : 0,
        u_sharp: o.sharp ? 1 : 0, u_noLine: o.noLine ? 1 : 0
      }));
      gl.drawArrays(gl.TRIANGLES, first, count);
    };
    const meshOf = (key, build) => {
      let g = GEOCACHE.get(key);
      if (!g) { g = build(); if (g instanceof Float32Array) g = { data: g, parts: { all: [0, g.length / 8] } }; GEOCACHE.set(key, g); }
      let b = meshBufs.get(key);
      if (!b) { b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, g.data, gl.STATIC_DRAW); meshBufs.set(key, b); bound = b; }
      return { g, b };
    };

    const api = {
      get mode() { return mode; },
      /* 半透明（影・光・アクリル）を描く区間。奥から手前の順に呼ぶこと */
      blend(on) {
        if (mode === 2 || mode === 3) return;    // 影・線画用の描画では半透明を扱わない
        if (on) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
        else { gl.disable(gl.BLEND); gl.depthMask(true); }
      },
      /* 直方体。o.tex を渡すと o.face 面だけテクスチャ、他の面は o.edge 色 */
      box(pos, rot, size, o) {
        o = o || {}; bind('box');
        const m = M4.compose(pos, rot, size);
        if (o.tex) {
          const fi = o.face === undefined ? FACE.TOP : o.face;
          draw(m, o, fi, 6);
          for (const fa of ALL) if (fa !== fi) draw(m, Object.assign({}, o, { tex: o.edgeTex || null, color: o.edge || [0.9, 0.9, 0.9] }), fa, 6);
        } else draw(m, o, 0, 36);
        return m;
      },
      /* 床・天板など水平面。size=[幅, 奥行] */
      quad(pos, rot, size, o) {
        bind('plane');
        const m = M4.compose(pos, rot, [size[0], 1, size[1]]);
        draw(m, o, 0, 6); return m;
      },
      /* 立てた板（壁・ポスター・アクスタ）。正面が +Z、絵が正立する。
       * size=[幅, 高さ]。rot=[後ろへの傾き, Y回転, Z回転] */
      panel(pos, rot, size, o) {
        bind('plane');
        const m = M4.compose(pos, [90 - (rot[0] || 0), rot[1] || 0, rot[2] || 0], [size[0], 1, size[1]]);
        draw(m, o, 0, 6); return m;
      },
      /* 円柱。size=[直径X, 高さ, 直径Z]。o.part: 'SIDE'|'TOP'|'BOTTOM'|'ALL' */
      cylinder(pos, rot, size, o) {
        o = o || {}; bind('cyl');
        const r = GEO.CYL[o.part || 'ALL'];
        const m = M4.compose(pos, rot, size);
        draw(m, o, r[0], r[1]); return m;
      },
      /* 水平リング（外径 size[0]、内径は外径の90%） */
      ring(pos, rot, size, o) {
        bind('ring');
        const m = M4.compose(pos, rot, [size[0], 1, size[1] === undefined ? size[0] : size[1]]);
        draw(m, o, 0, GEO.ring.length / 8); return m;
      },
      /* 球・楕円体。size=[直径X, 直径Y, 直径Z] */
      sphere(pos, rot, size, o) {
        bind('sphere');
        const m = M4.compose(pos, rot, size);
        draw(m, o, 0, GEO.sphere.length / 8); return m;
      },
      /* カップの取っ手（半トーラス, +X側）。size=[高さ方向の径, 同, 厚み] */
      handle(pos, rot, size, o) {
        bind('handle');
        const m = M4.compose(pos, rot, size);
        draw(m, o, 0, GEO.handle.length / 8); return m;
      },
      /* 自由形状。key ごとに1回だけ build() を呼んで形を作る（E.GEN の関数を使う）。
       * o.part で parts の範囲を選ぶ（既定 all）。size は各軸の拡大率 */
      mesh(key, build, pos, rot, size, o) {
        o = o || {};
        const { g, b } = meshOf(key, build);
        bindBuf(b);
        const m = M4.compose(pos, rot || [0, 0, 0], size || [1, 1, 1]);
        const names = o.part ? [o.part] : Object.keys(g.parts);
        for (const nm of names) { const r = g.parts[nm]; if (r) draw(m, o, r[0], r[1]); }
        return m;
      },
      /* 角の丸い箱。size=[幅, 高さ, 奥行き]、o.round（0.05〜1, 既定0.15）。
       * 注意：丸みは大きさに比例するので、細長い物は round を小さめにする */
      rbox(pos, rot, size, o) {
        o = o || {};
        const rr = +(o.round === undefined ? 0.15 : o.round).toFixed(2);
        return api.mesh('rbox' + rr, () => GEN.roundBox(rr), pos, rot, size, o);
      },
      /* 回転体（器・瓶・果物など）。profile は GEN.lathe の説明を参照 */
      lathe(key, profile, pos, rot, size, o) {
        return api.mesh('lathe:' + key, () => GEN.lathe(profile, o && o.seg), pos, rot, size, o);
      }
    };

    const runPass = (target, m, clear) => {
      mode = m; bound = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      gl.viewport(0, 0, target.w, target.h);
      gl.useProgram(prog);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
      gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
      gl.clearColor(clear[0], clear[1], clear[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      opt.draw(api);
      gl.disable(gl.BLEND); gl.depthMask(true);
    };
    const trash = [];
    // 1) 影
    if (useShadow) {
      shadowTex = makeDepthTex(gl, SHADOW);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTex, 0);
      gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
      vp = lightVP;
      runPass({ fb, w: SHADOW, h: SHADOW }, 2, [1, 1, 1]);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fb);
      vp = camVP;
    }
    // 2) カラー / 3) 被写界深度
    const fC = GLX.fbo(RW, RH, true), fZ = GLX.fbo(W, H, true), fA = GLX.fbo(W, H), fB = GLX.fbo(W, H);
    trash.push(fC, fZ, fA, fB);
    runPass(fC, 0, opt.clear || [0.1, 0.1, 0.1]);
    runPass(fZ, 1, [1, 1, 1]);
    let sharp = fC;
    if (st.line > 0) {                           // 線画（ぼかしの前に入れて、奥の線は一緒にぼける）
      const fN = GLX.fbo(RW, RH, true), fL = GLX.fbo(RW, RH);
      trash.push(fN, fL);
      runPass(fN, 3, [0, 0, 0]);
      GLX.pass(GLX.program('line', VS_FULL, FS_LINE), { u_col: { tex: fC.tex }, u_nd: { tex: fN.tex }, u_width: (st.lineWidth || 1.4) * SS, u_strength: st.line }, fL);
      sharp = fL;
    }
    const pBlur = GLX.program('blur', VS_FULL, FS_BLUR), pDof = GLX.program('dof', VS_FULL, FS_DOF);
    const br = cam.blur === undefined ? 8 : cam.blur;
    GLX.pass(pBlur, { u_tex: { tex: sharp.tex }, u_dir: [1, 0], u_radius: br }, fA);
    GLX.pass(pBlur, { u_tex: { tex: fA.tex }, u_dir: [0, 1], u_radius: br }, fB);
    if (st.paint > 0) {
      const fD = GLX.fbo(RW, RH); trash.push(fD);
      GLX.pass(pDof, { u_sharp: { tex: sharp.tex }, u_blur: { tex: fB.tex }, u_coc: { tex: fZ.tex } }, fD);
      GLX.pass(GLX.program('paint', VS_FULL, FS_PAINT), { u_col: { tex: fD.tex }, u_coc: { tex: fZ.tex }, u_amount: st.paint }, null);
    } else GLX.pass(pDof, { u_sharp: { tex: sharp.tex }, u_blur: { tex: fB.tex }, u_coc: { tex: fZ.tex } }, null);
    currentStyle = st;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(GLX.canvas, 0, 0, W, H);
    for (const k in bufs) gl.deleteBuffer(bufs[k]);
    for (const b of meshBufs.values()) gl.deleteBuffer(b);
    if (shadowTex) gl.deleteTexture(shadowTex);
    GLX.dispose(trash);
    return true;
  }
  function makeDepthTex(gl, size) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    return t;
  }
  /* テーマ用のテクスチャ生成。使い終わったら Stage3D.free([...]) */
  const texture = (src, opt) => GLX.texture(src, opt);
  const free = (list) => GLX.dispose(list);
  return { render, texture, free, FACE, STYLE, setStyle(name) { if (name && !STYLE[name]) throw new Error('未知のスタイル: ' + name); styleOverride = name || null; } };
})();
let currentStyle = STYLE.real;   // 直前の render のスタイル（粒子の量などに使う）

/* 材質のひな形。{...E.MAT.ceramic, color:[...]} のように使う */
const MAT = {
  ceramic: { spec: 0.5, shin: 90, rim: 0.16 },           // 釉薬のかかった陶磁器
  matte: { spec: 0.06, shin: 12, rim: 0.04 },            // 素焼き・紙・布
  wood: { spec: 0.12, shin: 20, rim: 0.05, bump: 0.1 },  // 木（テクスチャの明暗でわずかに凹凸）
  metal: { spec: 1.0, shin: 140, metal: 0.92, rim: 0.2 },   // 銀・ステンレス
  gold: { spec: 1.0, shin: 110, metal: 0.9, rim: 0.2 },
  plastic: { spec: 0.45, shin: 60, rim: 0.12 },
  glossyFood: { spec: 0.7, shin: 80, rim: 0.18 },         // 果物・ナパージュ
  cream: { spec: 0.14, shin: 16, rim: 0.06 },             // 生クリーム・スポンジ
  glass: { spec: 1.0, shin: 180, rim: 0.7 }               // 半透明と組み合わせる
};

/* =========================================================================
 * [4] 2D描画プリミティブ
 * ====================================================================== */
const FONT = {
  sans: '"Noto Sans JP",sans-serif',
  serif: '"Noto Serif JP",serif',
  round: '"M PLUS Rounded 1c","Noto Sans JP",sans-serif',
  cond: '"Oswald","Noto Sans JP",sans-serif',
  script: '"Caveat","Noto Sans JP",cursive',
  caption: '"Righteous","Noto Sans JP",sans-serif'   // 共通キャプション
};
const font = (weight, size, family) => `${weight} ${size}px ${family}`;

function fitSize(ctx, text, weight, family, maxW, maxSize, minSize, tracking) {
  tracking = tracking || 0;
  let lo = minSize || 8, hi = maxSize, best = lo;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    ctx.font = font(weight, mid, family);
    const w = ctx.measureText(text).width + tracking * mid * Math.max(0, Array.from(text).length - 1);
    if (w <= maxW) { best = mid; lo = mid; } else hi = mid;
  }
  return best;
}
/* 字送り付きテキスト。align: left|center|right、mode: fill|stroke|both */
function drawTracked(ctx, text, x, y, tracking, align, mode) {
  const chars = Array.from(text);
  let total = 0;
  const ws = chars.map(c => { const w = ctx.measureText(c).width; total += w; return w; });
  total += tracking * Math.max(0, chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : (align === 'right' ? x - total : x);
  const prev = ctx.textAlign; ctx.textAlign = 'left';
  for (let i = 0; i < chars.length; i++) {
    if (mode === 'stroke' || mode === 'both') ctx.strokeText(chars[i], cx, y);
    if (mode !== 'stroke') ctx.fillText(chars[i], cx, y);
    cx += ws[i] + tracking;
  }
  ctx.textAlign = prev;
  return total;
}
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
function drawGrain(ctx, w, h, amount, seed, size) {
  amount *= currentStyle.grain === undefined ? 1 : currentStyle.grain;
  if (amount <= 0) return;
  const s = size || 3, gw = Math.ceil(w / s), gh = Math.ceil(h / s);
  const c = newCanvas(gw, gh), g = c.getContext('2d'), id = g.createImageData(gw, gh), r = rnd(seed || 7);
  for (let i = 0; i < gw * gh; i++) {
    const v = 128 + (r() - 0.5) * 255;
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  ctx.save(); ctx.globalAlpha = amount; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(c, 0, 0, w, h); ctx.restore();
}
function drawVignette(ctx, w, h, strength) {
  const g = ctx.createRadialGradient(w / 2, h * 0.46, w * 0.25, w / 2, h * 0.5, w * 0.8);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}
/* ---- 共通キャプション（全テーマ共通・app.js が最後に重ねる） ----------
 *   上部に大きく「Good Morning」、下部に英語の「◯◯の日」。フォントは Righteous。
 *   どちらも横幅いっぱいまで広げる。下は長い文言なら2行に組んで帯を埋める。
 *   Righteous は1ウェイトしかないため、同色の細いストロークで太らせる。
 *   立ち絵に少し被るくらいの大きさ。読みやすさは縁取り＋影で確保する。
 *   opt: { top, bottom, fill, outline, shadow, topSize, bottomSize }
 * ------------------------------------------------------------------- */
function drawDayCaption(ctx, W, H, opt) {
  opt = opt || {};
  const fill = opt.fill || '#ffffff';
  const outline = opt.outline || '#2b2118';
  const shadow = opt.shadow || 'rgba(0,0,0,0.35)';
  const fam = FONT.caption, TRACK = 0.02;
  const maxW = W * 0.92;                         // 左右の余白は各4%
  const fit = (t, mx) => fitSize(ctx, t, 400, fam, maxW, mx, 16, TRACK);
  const drawLine = (text, size, y, baseline) => {
    ctx.save();
    ctx.font = font(400, size, fam);
    ctx.textBaseline = baseline;
    ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    // 1) 影付きの外側の縁
    ctx.shadowColor = shadow; ctx.shadowBlur = size * 0.16; ctx.shadowOffsetY = size * 0.05;
    ctx.strokeStyle = outline; ctx.lineWidth = size * 0.16;
    drawTracked(ctx, text, W / 2, y, size * TRACK, 'center', 'stroke');
    // 2) 同色ストロークで太らせた本体
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.strokeStyle = fill; ctx.fillStyle = fill; ctx.lineWidth = size * 0.035;
    drawTracked(ctx, text, W / 2, y, size * TRACK, 'center', 'both');
    ctx.restore();
  };

  // 上：Good Morning（横幅いっぱい・高さ上限 17%）
  const top = opt.top === undefined ? 'Good Morning' : opt.top;
  const topMax = opt.topSize || H * 0.17;
  if (top) drawLine(top, fit(top, topMax), H * 0.035, 'top');

  // 下：英語の「◯◯の日」。下の帯を目一杯使う
  //  - 1行で横幅いっぱいに広げる（上限は上の文字と同じ大きさ）
  //  - 長くて1行だと小さくなりすぎる場合は、単語の切れ目で2行に分けて大きく組む
  const bottom = opt.bottom;
  if (!bottom) return;
  const bottomMax = opt.bottomSize || topMax;
  const yBase = H * 0.975, LINE = 0.98;
  const one = fit(bottom, bottomMax);
  let best = { lines: [bottom], size: one };
  const words = bottom.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const two2 = bottomMax * 0.78;                 // 2行時の1行あたり上限（帯の高さに収める）
    for (let k = 1; k < words.length; k++) {
      const a = words.slice(0, k).join(' '), b = words.slice(k).join(' ');
      const sz = Math.min(fit(a, two2), fit(b, two2));
      if (sz > best.size * 1.18 && (best.lines.length === 1 || sz > best.size)) best = { lines: [a, b], size: sz };
    }
  }
  const n = best.lines.length;
  best.lines.forEach((t, i) => drawLine(t, best.size, yBase - (n - 1 - i) * best.size * LINE, 'bottom'));
}

/* 接地影用の柔らかい円 */
function shadowCanvas(alpha) {
  const S = 256, c = newCanvas(S, S), x = c.getContext('2d');
  const a = alpha === undefined ? 0.7 : alpha;
  const g = x.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(20,14,8,${a})`); g.addColorStop(0.5, `rgba(20,14,8,${a * 0.5})`); g.addColorStop(1, 'rgba(20,14,8,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return c;
}

/* =========================================================================
 * [5] 小道具ジェネレータ
 * ====================================================================== */

/* アクリルスタンドの版を作る。
 *   立ち絵を輪郭に沿ってカット（余白 margin px）し、台座に差す脚（タブ）を付ける。
 *   返り値 { front, back, w, h }
 *     back : 裏面（立ち絵を印刷した面）… 立ち絵の色はそのまま
 *     front: 表面（透明アクリルの縁とツヤだけ）
 *   opt: { w, h, box, margin, tabW, tabH, tabX, rim, gloss(反射の強さ 既定1) }（px。w:h が板の縦横比になる） */
function acrylicPlate(env, opt) {
  opt = opt || {};
  const W = opt.w || 720, H = opt.h || 1000;
  const margin = opt.margin === undefined ? 16 : opt.margin;
  const tabH = opt.tabH === undefined ? 34 : opt.tabH;
  const pad = 40;
  // box: 立ち絵を収める枠（既定の大きさ）。板はそれより広く取っておくと拡大しても切れない
  const box = opt.box || { x: pad, y: pad, w: W - pad * 2, h: H - pad - tabH - margin };
  const p = place(env, box, { anchorY: 1 });

  // 1) 立ち絵
  const art = newCanvas(W, H);
  art.getContext('2d').drawImage(env.img, p.x, p.y, p.w, p.h);

  // 2) カットライン（アルファを膨張させたシルエット）+ 脚
  const mask = newCanvas(W, H), mx = mask.getContext('2d');
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    mx.drawImage(art, Math.cos(a) * margin, Math.sin(a) * margin);
  }
  mx.drawImage(art, 0, 0);
  // 脚は台座の位置（既定は板の中央）に固定。立ち絵を動かしても台座に刺さったまま
  const tabW = opt.tabW || W * 0.3;
  const cxTab = opt.tabX === undefined ? W / 2 : opt.tabX;
  mx.fillStyle = '#000';
  mx.fillRect(cxTab - tabW / 2, Math.min(p.by + p.bh - 20, H - tabH), tabW, H);
  // アルファを二値化気味に（カット面をくっきり）
  const md = mx.getImageData(0, 0, W, H);
  for (let i = 3; i < md.data.length; i += 4) {
    const a = md.data[i];
    md.data[i] = a < 40 ? 0 : (a > 110 ? 255 : (a - 40) / 70 * 255);
    md.data[i - 3] = md.data[i - 2] = md.data[i - 1] = 255;
  }
  mx.putImageData(md, 0, 0);

  // 3) 縁（カットラインの内側 数px）
  const inner = newCanvas(W, H), ix = inner.getContext('2d');
  ix.drawImage(mask, 0, 0);
  ix.globalCompositeOperation = 'destination-in';
  const e = opt.rim || 5;
  for (const [dx, dy] of [[e, 0], [-e, 0], [0, e], [0, -e], [e * .7, e * .7], [-e * .7, e * .7], [e * .7, -e * .7], [-e * .7, -e * .7]]) ix.drawImage(mask, dx, dy);
  const rim = newCanvas(W, H), rx = rim.getContext('2d');
  rx.drawImage(mask, 0, 0);
  rx.globalCompositeOperation = 'destination-out';
  rx.drawImage(inner, 0, 0);

  // 裏面：うっすら白いアクリル地 + 立ち絵
  const back = newCanvas(W, H), bx = back.getContext('2d');
  bx.globalAlpha = 0.10; bx.drawImage(mask, 0, 0);
  bx.globalAlpha = 0.35; bx.drawImage(rim, 0, 0);
  bx.globalAlpha = 1; bx.drawImage(art, 0, 0);

  // 表面：アクリルらしい反射。立ち絵の色を変えないよう、白を「重ねる」だけで上限を抑える
  //   ① 縁：カット面が光る。光源（左上）側は明るく、反対側はわずかに青みの影
  //   ② ツヤ：斜めの広い映り込み＋細く鋭いハイライト2本
  //   ③ 映り込み：上端ほどうっすら明るい（天井・窓の反射）
  //   opt.gloss で全体の強さを調整（既定 1.0）。どの画素も白の重なりは最大でも約45%
  const front = newCanvas(W, H), fx = front.getContext('2d');
  const G = opt.gloss === undefined ? 1 : opt.gloss;
  const shifted = (dx, dy) => {           // mask − (dx,dy)ずらした mask ＝ 片側の縁
    const c = newCanvas(W, H), x = c.getContext('2d');
    x.drawImage(mask, 0, 0);
    x.globalCompositeOperation = 'destination-out';
    x.drawImage(mask, dx, dy);
    return c;
  };
  const tint = (src, color, a) => {       // 形を保ったまま色を載せる
    const c = newCanvas(W, H), x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color; x.fillRect(0, 0, W, H);
    fx.globalAlpha = a; fx.drawImage(c, 0, 0); fx.globalAlpha = 1;
  };
  tint(rim, '#f4fbff', 0.62 * Math.min(1, G));              // 縁全体（ごく薄い水色がかった白）
  tint(shifted(4, 5), '#ffffff', 0.9 * Math.min(1, G));     // 左上側の縁が光る
  tint(shifted(-4, -5), '#3a5a78', 0.28);                  // 右下側の縁の影（厚みの表現）
  if (G > 0) {
    const gl2 = newCanvas(W, H), gx = gl2.getContext('2d');
    // ② 斜めのツヤ
    const g = gx.createLinearGradient(W * 0.05, H * 0.3, W * 0.95, H * 0.98);   // 立ち絵の範囲を斜めに横切る
    const st = (t, a) => g.addColorStop(t, `rgba(255,255,255,${Math.min(0.45, a * G)})`);
    st(0.00, 0); st(0.16, 0); st(0.24, 0.07); st(0.31, 0.15);      // 広い映り込み（なだらか）
    st(0.345, 0.34); st(0.36, 0.40); st(0.375, 0.30);               // 鋭いハイライト
    st(0.40, 0.12); st(0.46, 0.05); st(0.52, 0);
    st(0.555, 0.20); st(0.565, 0.24); st(0.58, 0);                  // 2本目の細い筋
    st(0.70, 0); st(0.82, 0.05); st(1.0, 0);
    gx.fillStyle = g; gx.fillRect(0, 0, W, H);
    // ③ 上端の映り込み
    const g2 = gx.createLinearGradient(0, 0, 0, H * 0.45);
    g2.addColorStop(0, `rgba(255,255,255,${0.10 * G})`); g2.addColorStop(1, 'rgba(255,255,255,0)');
    gx.fillStyle = g2; gx.fillRect(0, 0, W, H);
    gx.globalCompositeOperation = 'destination-in';
    gx.drawImage(mask, 0, 0);
    fx.drawImage(gl2, 0, 0);
  }
  return { front, back, mask, w: W, h: H, place: p };
}

/* アクリルスタンド一式（版の生成・テクスチャ化・台座と板の描画）。
 *   どのテーマでも同じ見た目・同じ操作感になるよう寸法は固定：
 *   板 1.1 x 1.5（立ち絵の既定枠は 幅0.74 x 高さ1.0）、台座 0.56 x 0.04 x 0.3
 *   使い方:
 *     const stand = E.acrylicStand(env);
 *     draw(api) { ...不透明物...; stand.shadow(api, P); api.blend(true); stand.draw(api, P); api.blend(false) }
 *     描画後に stand.free()
 *   P = { x, z, yaw, y(台座の置き面の高さ, 既定0) }
 */
function acrylicStand(env, opt) {
  opt = opt || {};
  const PPU = 800, PW = 1.1, PH = 1.5;
  const plate = acrylicPlate(env, {
    w: PW * PPU, h: PH * PPU,
    box: { x: (PW - 0.74) / 2 * PPU, y: (PH - 1.0) * PPU + 20, w: 0.74 * PPU, h: 1.0 * PPU - 20 - 30 - 14 },
    margin: 14, tabH: 30, tabW: 0.26 * PPU, rim: 5, gloss: opt.gloss === undefined ? 1 : opt.gloss
  });
  // 台座の天面：縁が光る透明アクリル
  const top = newCanvas(256, 140), tx = top.getContext('2d');
  tx.fillStyle = 'rgba(255,255,255,0.10)'; roundRect(tx, 4, 4, 248, 132, 18); tx.fill();
  tx.strokeStyle = 'rgba(255,255,255,0.85)'; tx.lineWidth = 5; roundRect(tx, 5, 5, 246, 130, 18); tx.stroke();
  const tg = tx.createLinearGradient(0, 0, 256, 140);
  tg.addColorStop(0.25, 'rgba(255,255,255,0)'); tg.addColorStop(0.4, 'rgba(255,255,255,0.35)'); tg.addColorStop(0.55, 'rgba(255,255,255,0)');
  tx.fillStyle = tg; roundRect(tx, 4, 4, 248, 132, 18); tx.fill();
  tx.fillStyle = 'rgba(40,60,80,0.35)'; tx.fillRect(128 - 60, 62, 120, 14);   // 差し込み口
  const tex = {
    back: Stage3D.texture(plate.back), front: Stage3D.texture(plate.front),
    shadow: Stage3D.texture(shadowCanvas(0.62)), top: Stage3D.texture(top)
  };
  const baseColor = opt.baseColor || [0.97, 0.98, 1.0];
  return {
    PW, PH, plate,
    /* 接地影（api.mode===0 のときだけ描く） */
    shadow(api, P) {
      if (api.mode !== 0) return;
      api.blend(true);
      api.quad([P.x + 0.03, (P.y || 0) + 0.002, P.z - 0.02], [0, P.yaw || 0, 0], [0.95, 0.5], { tex: tex.shadow, unlit: true, alpha: P.shadow === undefined ? 0.8 : P.shadow });
      api.blend(false);
    },
    /* 台座と板。api.blend(true) の中で、他の半透明より先（奥）に呼ぶ */
    draw(api, P) {
      const y0 = P.y || 0, yaw = P.yaw || 0, sy = yaw * Math.PI / 180, t = 0.012;
      api.box([P.x, y0 + 0.02, P.z], [0, yaw, 0], [0.56, 0.04, 0.3], { color: baseColor, alpha: 0.36, spec: 0.9, noLine: true });
      api.quad([P.x, y0 + 0.0405, P.z], [0, yaw, 0], [0.56, 0.3], { tex: tex.top, unlit: true, noLine: true });
      const py = y0 + 0.012 + PH / 2;
      api.panel([P.x - Math.sin(sy) * t, py, P.z - Math.cos(sy) * t], [0, yaw, 0], [PW, PH], { tex: tex.back, unlit: true, noLine: true, sharp: true });
      api.panel([P.x + Math.sin(sy) * t, py, P.z + Math.cos(sy) * t], [0, yaw, 0], [PW, PH], { tex: tex.front, unlit: true, noLine: true, sharp: true });
    },
    free() { Stage3D.free(Object.values(tex)); }
  };
}

/* ---- 日付の小道具（全テーマ共通ルール：画角内に必ず「MM/DD」を入れる） ----
 *   卓上カレンダー（三角POP型）か壁掛けカレンダーとして、シーンの中に自然に置く。
 *   日付・曜日・月名はテーマの日付（env.date）から自動で入る。
 *   使い方:
 *     const cal = E.dateProp(env, { style: { paper, ink, accent }, label: '風呂の日' });
 *     draw(api) { cal.draw(api, { x, z, yaw }); ... }   // 不透明物として描く
 *     cal.shadow(api, P)  … 半透明の影（任意）
 *     描画後に cal.free()
 *   P: { x, y(置き面の高さ,既定0), z, yaw, w(幅,既定0.62), form:'desk'|'wall', lean }
 *   form:'wall' のときは (x, y, z) が紙の中心。壁に貼る（吊るす）形になる。
 * ------------------------------------------------------------------- */
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
let dateUsed = 0;
function dateInfo(dateStr) {
  const [y, m, d] = String(dateStr || '').split('-').map(Number);
  const ok = y && m && d;
  const dt = ok ? new Date(y, m - 1, d) : new Date();
  const mm = dt.getMonth() + 1, dd = dt.getDate();
  return { y: dt.getFullYear(), m: mm, d: dd, mmdd: String(mm).padStart(2, '0') + '/' + String(dd).padStart(2, '0'),
           month: MONTHS[mm - 1], week: WEEK[dt.getDay()] };
}
function dateCardCanvas(info, opt) {
  const st = Object.assign({ paper: '#d9c29b', ink: '#4a2e1a', accent: '#8a4b22', grain: 0.16 }, opt.style || {});
  const Wd = 620, Ht = 460, c = newCanvas(Wd, Ht), x = c.getContext('2d');
  x.fillStyle = st.paper; x.fillRect(0, 0, Wd, Ht);
  if (st.grain) drawGrain(x, Wd, Ht, st.grain, 12, 2);
  x.strokeStyle = st.ink; x.lineWidth = 4; roundRect(x, 22, 22, Wd - 44, Ht - 44, 14); x.stroke();
  x.lineWidth = 1.5; roundRect(x, 32, 32, Wd - 64, Ht - 64, 10); x.stroke();
  x.textBaseline = 'alphabetic';
  x.fillStyle = st.accent; x.font = font(500, 40, FONT.cond);
  drawTracked(x, info.month + '  ·  ' + info.week, Wd / 2, 100, 8, 'center');
  x.fillStyle = st.ink;
  const big = fitSize(x, info.mmdd, 700, FONT.cond, Wd - 120, 168, 40, 0.02);
  x.font = font(700, big, FONT.cond);
  drawTracked(x, info.mmdd, Wd / 2, 272, big * 0.02, 'center');
  const label = opt.label || '';
  if (label) {
    const ls = fitSize(x, label, 900, FONT.sans, Wd - 120, 70, 16, 0.06);
    x.font = font(900, ls, FONT.sans);
    drawTracked(x, label, Wd / 2, 378, ls * 0.06, 'center');
  }
  return c;
}
function dateProp(env, opt) {
  opt = opt || {};
  dateUsed++;
  const info = dateInfo(env.date);
  const label = opt.label === undefined ? ((env.theme && env.theme.title) || '') : opt.label;
  const card = dateCardCanvas(info, { style: opt.style, label });
  const back = newCanvas(32, 32), bx = back.getContext('2d');
  bx.fillStyle = (opt.style && opt.style.back) || (opt.style && opt.style.paper) || '#cdb58f'; bx.fillRect(0, 0, 32, 32);
  const tex = { card: Stage3D.texture(card), back: Stage3D.texture(back), shadow: Stage3D.texture(shadowCanvas(0.5)) };
  const RING = (opt.style && opt.style.ring) || [0.25, 0.25, 0.27];
  return {
    info, canvas: card,
    draw(api, P) {
      const w = P.w || 0.62, h = w * 460 / 620, yaw = P.yaw || 0, y0 = P.y || 0;
      const yr = yaw * Math.PI / 180;
      if (P.form === 'wall') {
        api.panel([P.x, y0, P.z], [0, yaw, P.tilt || -3], [w, h], { tex: tex.card, spec: 0.04, sharp: true });
        api.cylinder([P.x - Math.sin(yr) * 0.01, y0 + h / 2 + 0.03, P.z + Math.cos(yr) * 0.02], [90, yaw, 0], [0.025, 0.04, 0.025], { color: RING });
        return;
      }
      const lean = P.lean === undefined ? 16 : P.lean, lr = lean * Math.PI / 180;
      const off = Math.sin(lr) * h / 2, cy = y0 + Math.cos(lr) * h / 2;
      api.panel([P.x + Math.sin(yr) * off, cy, P.z + Math.cos(yr) * off], [lean, yaw, 0], [w, h], { tex: tex.card, spec: 0.05, sharp: true });
      api.panel([P.x - Math.sin(yr) * off, cy, P.z - Math.cos(yr) * off], [-lean, yaw, 0], [w, h], { tex: tex.back });
      // 上端のリング（卓上カレンダーらしさ）
      const topY = y0 + Math.cos(lr) * h + 0.004;
      for (let i = 0; i < 6; i++) {
        const t = (i - 2.5) / 2.5 * w * 0.4;
        api.cylinder([P.x + Math.cos(yr) * t, topY, P.z - Math.sin(yr) * t], [90, yaw, 0], [0.028, 0.05, 0.028], { color: RING, spec: 0.5 });
      }
    },
    shadow(api, P) {
      if (api.mode !== 0 || P.form === 'wall') return;
      const w = P.w || 0.62;
      api.blend(true);
      api.quad([P.x + 0.02, (P.y || 0) + 0.002, P.z], [0, P.yaw || 0, 0], [w * 1.3, w * 0.72], { tex: tex.shadow, unlit: true, alpha: 0.7 });
      api.blend(false);
    },
    free() { Stage3D.free(Object.values(tex)); }
  };
}

/* ---- 小物キット（テーマ間で使い回す汎用の小物） ---------------------
 *   const K = E.props();  …  K.cup(api, {...}) など。描画後に K.free()
 *   器は回転体（GEN.lathe）で断面から作るので、縁の丸み・高台・内側の傾斜まで形になる。
 *   色は [r,g,b]（0〜1）。y は置き面の高さ（既定0）。寸法の単位はシーン共通（アクスタの板の高さ1.0 ≒ 15cm）
 * ------------------------------------------------------------------- */
function props() {
  let shadowTex = null;
  const own = [], texCache = new Map();
  const T = (c, o) => { const t = Stage3D.texture(c, o); own.push(t); return t; };
  const sh = () => shadowTex || (shadowTex = T(shadowCanvas(0.6)));
  const rad = (d) => d * Math.PI / 180;
  const bez = (p0, p1, p2, p3) => (t) => {
    const u = 1 - t;
    return [0, 1, 2].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
  };
  const lerpProfile = (pts, y) => {   // 内壁の点列（上→下）から高さ y の半径
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if ((y <= a[1] && y >= b[1]) || (y >= a[1] && y <= b[1])) { const t = (y - a[1]) / ((b[1] - a[1]) || 1e-6); return a[0] + (b[0] - a[0]) * t; }
    }
    return pts[pts.length - 1][0];
  };

  /* 器の断面（直径1に正規化）。k = 高さ/直径 */
  const cupProfile = (k) => {
    const H = k;
    const outer = [[0, 0.006], [0.29, 0.006], [0.305, 0, 1], [0.325, 0.004], [0.335, 0.022], [0.338, 0.04, 1],
      [0.36, 0.06 * H + 0.02], [0.41, 0.16 * H + 0.02], [0.45, 0.32 * H], [0.475, 0.5 * H], [0.492, 0.7 * H], [0.5, 0.88 * H],
      [0.502, 0.96 * H], [0.498, 0.99 * H], [0.488, H], [0.478, 0.996 * H]];
    const inner = [[0.472, 0.975 * H], [0.47, 0.9 * H], [0.462, 0.72 * H], [0.445, 0.52 * H], [0.415, 0.34 * H],
      [0.36, 0.19 * H], [0.27, 0.11 * H], [0.14, 0.085 * H], [0, 0.08 * H]];
    return { profile: outer.concat(inner), inner };
  };
  const saucerProfile = [[0, 0.014], [0.17, 0.014], [0.18, 0.001, 1], [0.205, 0.001], [0.212, 0.012, 1], [0.3, 0.02],
    [0.4, 0.034], [0.47, 0.052], [0.495, 0.064], [0.5, 0.071], [0.496, 0.078], [0.485, 0.08], [0.46, 0.073],
    [0.4, 0.056], [0.3, 0.036], [0.215, 0.027], [0.205, 0.024, 1], [0.195, 0.026, 1], [0, 0.026]];
  const saucerTopY = (r) => {            // 上面の高さ（半径 r での）
    const pts = [[0.215, 0.027], [0.3, 0.036], [0.4, 0.056], [0.46, 0.073]];
    r = Math.max(0.215, Math.min(0.46, r));
    for (let i = 0; i < pts.length - 1; i++) if (r <= pts[i + 1][0]) { const t = (r - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t; }
    return pts[pts.length - 1][1];
  };

  const K = {
    texture: T,
    /* 接地影（柔らかい接地の暗がり。平行光の影とは別に、物の足元を締める） */
    shadow(api, x, z, w, d, yaw, a, y) {
      if (api.mode !== 0) return;
      api.blend(true);
      api.quad([x, (y || 0) + 0.003, z], [0, yaw || 0, 0], [w, d], { tex: sh(), unlit: true, alpha: a === undefined ? 0.45 : a });
      api.blend(false);
    },

    /* カップ（高台・丸い縁・内側の傾斜・耳型の取っ手・中身）
     *   d:直径 h:高さ color:釉薬の色 handleYaw:取っ手の向き(度)
     *   liquid:{ tex|color, level(0..1 満たす高さ), rot }  band:[r,g,b]（縁の下の線） */
    cup(api, o) {
      const y = o.y || 0, d = o.d || 0.4, h = o.h || 0.36, k = +(h / d).toFixed(3);
      const c = o.color || [0.95, 0.93, 0.89], hy = o.handleYaw === undefined ? -25 : o.handleYaw;
      const mat = Object.assign({}, MAT.ceramic, { color: c }, o.mat || {});
      const cp = cupProfile(k);
      api.lathe('cup' + k, cp.profile, [o.x, y, o.z], [0, hy, 0], [d, d, d], mat);
      if (o.band) {
        const by = 0.86 * k;
        api.lathe('cupband' + k, [[0.4985, by - 0.03 * k], [0.502, by], [0.4985, by + 0.001]].map(q => [q[0] + 0.0015, q[1]]), [o.x, y, o.z], [0, 0, 0], [d, d, d],
          Object.assign({}, MAT.ceramic, { color: o.band }));
      }
      // 取っ手：縁の少し下から出て、下で胴に戻る耳型
      const hp = bez([0.47, 0.8 * k, 0], [0.8, 0.9 * k, 0], [0.8, 0.28 * k, 0], [0.43, 0.3 * k, 0]);
      api.mesh('cuphandle' + k, () => GEN.tube(hp, (t) => 0.042 - 0.012 * Math.sin(t * Math.PI), 40, 18, true),
        [o.x, y, o.z], [0, hy, 0], [d, d, d], mat);
      if (o.liquid) {
        const lv = (o.liquid.level === undefined ? 0.82 : o.liquid.level) * k;
        const r = lerpProfile(cp.inner, lv);
        api.cylinder([o.x, y + lv * d, o.z], [0, o.liquid.rot || 0, 0], [r * 2 * d, 0.0005, r * 2 * d],
          Object.assign({ part: 'TOP', tex: o.liquid.tex, color: o.liquid.color || [0.35, 0.2, 0.1] }, MAT.glossyFood, { spec: 0.35, shin: 60, rim: 0.1 }));
      }
    },

    /* ソーサー（高台・カップの受け・反り上がる縁）。d:直径 band:[r,g,b] */
    saucer(api, o) {
      const y = o.y || 0, d = o.d || 0.8, c = o.color || [0.96, 0.94, 0.9];
      api.lathe('saucer', saucerProfile, [o.x, y, o.z], [0, 0, 0], [d, d, d], Object.assign({}, MAT.ceramic, { color: c }, o.mat || {}));
      if (o.band) {
        const r0 = 0.405, r1 = 0.43, e = 0.0012;
        api.lathe('saucerband', [[r1, saucerTopY(r1) + e], [r0, saucerTopY(r0) + e]], [o.x, y, o.z], [0, 0, 0], [d, d, d],
          Object.assign({}, MAT.ceramic, { color: o.band }));
      }
      return y + saucerTopY(0.2) * d;       // カップを置く高さ
    },

    /* 平皿（ケーキ皿など）。d:直径 */
    plate(api, o) {
      const y = o.y || 0, d = o.d || 0.7, c = o.color || [0.97, 0.96, 0.93];
      const prof = [[0, 0.01], [0.3, 0.01], [0.31, 0, 1], [0.34, 0, 1], [0.35, 0.012], [0.44, 0.03], [0.49, 0.045], [0.5, 0.052],
        [0.495, 0.058], [0.48, 0.058], [0.43, 0.045], [0.37, 0.026], [0.33, 0.022], [0, 0.022]];
      api.lathe('plate', prof, [o.x, y, o.z], [0, 0, 0], [d, d, d], Object.assign({}, MAT.ceramic, { color: c }, o.mat || {}));
      return y + 0.022 * d;
    },

    /* スプーン・フォーク等の小さい什器は共通ルールで置かないため、キットに含めない（THEME_GUIDE.md） */

    /* ミルクジャグ（陶器・注ぎ口つき）。h:高さ yaw:注ぎ口の向き(度, 既定は-X側) */
    pitcher(api, o) {
      const y = o.y || 0, h = o.h || 0.3, yaw = o.yaw || 0;
      const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      const radius = (v) => 0.3 + 0.04 * Math.sin(Math.PI * Math.min(1, v * 1.25)) - 0.05 * sm(0.55, 0.85, v) + 0.03 * sm(0.85, 1, v);
      const spout = (ang, v) => Math.exp(-(ang * ang) / 0.1) * sm(0.62, 1, v);
      // 外面・内面・縁を一続きの曲面として作る（v: 0..1 外面を上へ, 1..2 縁, 2..3 内面を下へ）
      const geo = () => GEN.surface((u, w) => {
        const ang = (u - 0.5) * Math.PI * 2, t = w * 3;
        let r, yy;
        if (t <= 1) { r = radius(t); yy = t; }
        else if (t <= 2) { const k = t - 1; r = radius(1) - 0.03 * k; yy = 1 + 0.012 * Math.sin(k * Math.PI); }
        else { const k = 3 - t; r = (radius(k) - 0.03) * (k > 0.08 ? 1 : k / 0.08); yy = Math.max(0.03, k); }
        const sp = spout(ang, Math.min(1, t <= 1 ? t : (t <= 2 ? 1 : 3 - t)));
        r += sp * 0.14; yy += sp * 0.06;
        return [-Math.cos(ang) * r, yy, Math.sin(ang) * r];
      }, 96, 72);
      const mat = Object.assign({}, MAT.ceramic, { color: o.color || [0.96, 0.95, 0.92] });
      api.mesh('jug', geo, [o.x, y, o.z], [0, yaw, 0], [h, h, h], mat);
      api.lathe('jugfoot', [[0, 0.002], [0.28, 0.002], [0.3, 0, 1], [0.31, 0.02], [0, 0.02]], [o.x, y, o.z], [0, 0, 0], [h, h, h], mat);
      const hp = bez([0.3, 0.8, 0], [0.6, 0.86, 0], [0.62, 0.3, 0], [0.33, 0.2, 0]);
      api.mesh('jughandle', () => GEN.tube(hp, (t) => 0.04 - 0.01 * Math.sin(t * Math.PI), 36, 14, true), [o.x, y, o.z], [0, yaw, 0], [h, h, h], mat);
    },

    /* 本（閉じた状態）。w:幅 d:奥行き h:厚み col:表紙色。小口は紙の重なりのテクスチャ */
    book(api, o) {
      const y = o.y || 0, yaw = o.yaw || 0, col = o.col || [0.5, 0.2, 0.2];
      let pagesTex = texCache.get('pages');
      if (!pagesTex) {
        const c = newCanvas(256, 64), x = c.getContext('2d');
        x.fillStyle = '#f2ead8'; x.fillRect(0, 0, 256, 64);
        for (let i = 0; i < 64; i += 2) { x.fillStyle = `rgba(150,130,100,${0.12 + (i % 6 === 0 ? 0.1 : 0)})`; x.fillRect(0, i, 256, 1); }
        pagesTex = T(c); texCache.set('pages', pagesTex);
      }
      const r = rad(yaw), t = Math.min(0.014, o.h * 0.12);
      const pageMat = Object.assign({}, MAT.matte, { color: [0.95, 0.92, 0.84], tex: pagesTex, edgeTex: pagesTex, edge: [1, 1, 1], face: Stage3D.FACE.FRONT });
      api.box([o.x + Math.cos(r) * 0.01, y + o.h / 2, o.z - Math.sin(r) * 0.01], [0, yaw, 0], [o.w - 0.03, o.h - t * 2, o.d - 0.02], pageMat);
      const cov = Object.assign({}, MAT.plastic, { color: col, spec: 0.18, shin: 30 });
      api.box([o.x, y + t / 2, o.z], [0, yaw, 0], [o.w, t, o.d], cov);
      api.box([o.x, y + o.h - t / 2, o.z], [0, yaw, 0], [o.w, t, o.d], o.coverTex ? Object.assign({}, cov, { tex: o.coverTex, face: Stage3D.FACE.TOP, edge: col }) : cov);
      api.box([o.x - Math.cos(r) * o.w / 2, y + o.h / 2, o.z + Math.sin(r) * o.w / 2], [0, yaw, 0], [t * 1.4, o.h, o.d], cov);
    },

    /* 観葉植物：鉢（回転体）＋土＋細長い葉（反った曲面）を放射状に */
    plant(api, o) {
      const y = o.y || 0, s = o.s || 1, pot = o.pot || [0.82, 0.62, 0.48], leaf = o.leaf || [0.3, 0.52, 0.28];
      const potProf = [[0, 0], [0.11, 0], [0.12, 0.01], [0.14, 0.2], [0.155, 0.22, 1], [0.16, 0.26], [0.15, 0.262], [0.14, 0.24], [0, 0.24]];
      api.lathe('pot', potProf, [o.x, y, o.z], [0, 0, 0], [s, s, s], Object.assign({}, MAT.matte, { color: pot, spec: 0.1 }));
      api.cylinder([o.x, y + 0.238 * s, o.z], [0, 0, 0], [0.27 * s, 0.002, 0.27 * s], Object.assign({}, MAT.matte, { color: [0.28, 0.2, 0.14], part: 'TOP' }));
      const leafGeo = () => GEN.surface((u, v) => {
        const w = 0.05 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 0.8) + 0.002, sgn = v * 2 - 1;
        const len = 0.42;
        const z = u * len, yy = 0.28 * u - 0.32 * u * u - 0.012 * Math.abs(sgn) * (1 - u) + 0.008 * (1 - sgn * sgn);
        return [sgn * w, yy, z];
      }, 24, 6);
      const rr = rnd(o.seed || 3), n = o.leaves || 11;
      for (let i = 0; i < n; i++) {
        const ang = i / n * 360 + rr() * 20, tilt = -10 - rr() * 25, sz = (0.75 + rr() * 0.45) * s;
        const shade = 0.82 + rr() * 0.3;
        api.mesh('leaf', leafGeo, [o.x, y + 0.24 * s, o.z], [tilt, ang, 0], [sz, sz, sz],
          Object.assign({}, MAT.plastic, { color: leaf.map(v => v * shade), spec: 0.25, shin: 30, rim: 0.1 }));
      }
    },
    free() { Stage3D.free(own); own.length = 0; shadowTex = null; texCache.clear(); }
  };
  return K;
}

/* ---- 公開 ---- */
window.OhaV = window.OhaV || {};
window.OhaV.E = {
  clamp, rnd, newCanvas, analyzeImage, place,
  GLX, M4, Stage3D, GEN, MAT,
  FONT, font, fitSize, drawTracked, roundRect, drawGrain, drawVignette, shadowCanvas, drawDayCaption,
  acrylicPlate, acrylicStand, dateProp, dateInfo, props,
  get dateUsed() { return dateUsed; }, resetDateUsed() { dateUsed = 0; }
};
})();
