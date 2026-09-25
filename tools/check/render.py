#!/usr/bin/env python3
"""
毎日おはV：テーマの描画確認（制作用。公開ページからは使わない）

  python3 tools/check/render.py 2026-10-02            # → tools/check/out/2026-10-02.png
  python3 tools/check/render.py 2026-10-02 --zoom      # 4分割の拡大図も出す（破綻チェック用）
  python3 tools/check/render.py 2026-09-26 2026-09-27  # 複数日
  python3 tools/check/render.py 2026-10-01 --style=illust   # 描画スタイルを差し替えて確認（real/line/toon/illust/soft）

- リポジトリ直下を簡易サーバーで配信し、ヘッドレス Chromium（Playwright）で ?dev&date=… を開いて
  サンプル立ち絵を読み込ませ、プレビューの canvas を PNG で保存する
- Google Fonts に届かない環境向けに、fonts.googleapis.com への要求を fontsource（npm）の同じフォントに差し替える。
  unicode-range 付きの分割フォントをそのまま使うので、本番と同じく fontText の書き漏れはエラーになる
- 必要なもの：python3, playwright（Python）, Chromium, npm, Pillow（--zoom のとき）
"""
import sys, os, re, json, asyncio, subprocess, threading, tarfile, urllib.parse, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(os.path.expanduser('~'), '.cache', 'ohav-fonts')
PORTRAIT = os.path.join(HERE, 'sample-portrait.png')
FAKE = 'https://fonts.test/'

def fontsource_dir(family):
    """@fontsource/<slug> を npm pack で取ってきて展開したフォルダ"""
    slug = re.sub(r'[^a-z0-9]+', '-', family.lower()).strip('-')
    d = os.path.join(CACHE, slug)
    if os.path.isdir(os.path.join(d, 'package')): return d
    os.makedirs(d, exist_ok=True)
    out = subprocess.run(['npm', 'pack', f'@fontsource/{slug}', '--silent'], cwd=d, capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1]
    with tarfile.open(os.path.join(d, out)) as t: t.extractall(d)
    return d

def css_for(url):
    """Google Fonts css2 の URL → fontsource の @font-face 群（URL は fonts.test へ）"""
    q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
    css = []
    for fam in q.get('family', []):
        name, _, spec = fam.partition(':')
        weights = ['400']
        if spec.startswith('wght@'): weights = spec[5:].split(';')
        d = fontsource_dir(name)
        slug = os.path.basename(d)
        for w in weights:
            p = os.path.join(d, 'package', f'{w}.css')
            if not os.path.exists(p): raise SystemExit(f'fontsource に {name} {w} がありません')
            css.append(open(p, encoding='utf-8').read().replace('url(./files/', f'url({FAKE}{slug}/files/'))
    return '\n'.join(css)

def serve():
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=ROOT)
    s = ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s

async def shoot(date, port, out, zoom, style=None):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 420, 'height': 900})
        logs = []
        # 404 は「テーマが無い日＝準備中」なので表示しない
        pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if (m.type in ('error', 'warning') and '404' not in m.text) or '[render]' in m.text else None)
        pg.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
        async def gcss(route):
            try: await route.fulfill(status=200, content_type='text/css', body=css_for(route.request.url))
            except SystemExit as e: logs.append(f'error: {e}'); await route.abort()
        async def gfile(route):
            rel = route.request.url[len(FAKE):]
            slug, _, f = rel.partition('/')
            await route.fulfill(status=200, content_type='font/woff2', path=os.path.join(CACHE, slug, 'package', f))
        await pg.route('https://fonts.googleapis.com/**', gcss)
        await pg.route(FAKE + '**', gfile)
        await pg.goto(f'http://127.0.0.1:{port}/?dev&date={date}' + (f'&style={style}' if style else ''))
        await pg.wait_for_function("document.querySelector('#days .day')", timeout=30000)
        await pg.set_input_files('#file', PORTRAIT)
        await pg.wait_for_timeout(800)
        await pg.wait_for_function("document.getElementById('spinner').hidden", timeout=120000)
        ok = await pg.evaluate("!document.getElementById('btnSave').disabled")
        data = await pg.evaluate("document.getElementById('preview').toDataURL('image/png')")
        import base64
        open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
        await b.close()
    print(f'{date}: {"OK" if ok else "NG（保存ボタンが無効＝生成失敗）"} → {os.path.relpath(out, ROOT)}')
    for l in logs: print('   ', l)
    if zoom:
        from PIL import Image
        im = Image.open(out); w, h = im.size
        for i, (x, y) in enumerate([(0, 0), (w // 2, 0), (0, h // 2), (w // 2, h // 2)]):
            im.crop((x, y, x + w // 2, y + h // 2)).save(out.replace('.png', f'_zoom{i + 1}.png'))
    return ok

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    zoom = '--zoom' in sys.argv
    style = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--style=')), None)
    if not args: print(__doc__); return 1
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    s = serve()
    ok = True
    for d in args:
        name = f'{d}-{style}' if style else d
        ok &= asyncio.run(shoot(d, s.server_address[1], os.path.join(HERE, 'out', f'{name}.png'), zoom, style))
    s.shutdown()
    return 0 if ok else 2

if __name__ == '__main__':
    sys.exit(main())
