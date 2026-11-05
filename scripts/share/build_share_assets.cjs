// Makes what a shared link shows: preview photos, the moving homepage preview, and the app icons.
// Needs `npm run dev` running, Chrome, and ffmpeg. Output lands in assets/share/ and assets/images/.
// Usage: SUL_PLAYWRIGHT_PATH=... node scripts/share/build_share_assets.cjs [photos] [icons] [film]
// With no arguments it makes all three. Rerun `photos` when a product photo changes.
const { chromium } = require(process.env.SUL_PLAYWRIGHT_PATH || 'playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const BASE = process.env.SUL_PREVIEW_URL || 'http://127.0.0.1:4173';
const OUT = 'assets/share';
const CAMPAIGN = 'site-photos/campaign-womens-collection.webp';
const wanted = process.argv.slice(2);
const want = (name) => !wanted.length || wanted.includes(name);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sul-share-'));
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);

// Crop rectangles are in the source image's pixels. Messages shows tall photos large, and Apple
// advises against text in preview images, so these stay photographic. Campaign crops start below
// the words printed at the top of the campaign image.
const PHOTOS = {
  'olive-set': { src: CAMPAIGN, x: 15, y: 205, w: 325 },
  'navy-cream-set': { src: CAMPAIGN, x: 310, y: 205, w: 338 },
  'black-set': { src: CAMPAIGN, x: 636, y: 205, w: 340 },
  'pink-set': { src: CAMPAIGN, x: 950, y: 205, w: 304 },
  'blackout-hoodie': { src: 'assets/images/hoodie.webp', x: 76, y: 200, w: 680 },
  'lion-sweater': { src: 'assets/images/sweater.webp', x: 66, y: 180, w: 700 },
  'new-era-hat': { src: 'assets/images/hat.webp', x: 150, y: 335, w: 520 },
  'full-kit': { src: 'assets/images/hoodie-scene.webp', x: 0, y: 120, w: 784 },
};

function photos() {
  for (const [id, r] of Object.entries(PHOTOS)) {
    const h = Math.round((r.w * 5) / 4);
    // Soft edges hide the neighboring model's sleeve in the campaign crops.
    const edge = r.src === CAMPAIGN ? ",format=rgb24,geq=r='r(X,Y)*E(X)':g='g(X,Y)*E(X)':b='b(X,Y)*E(X)'".replaceAll('E(X)', "min(1,0.55+0.45*min(X,W-X)/(W*0.09))") : '';
    ffmpeg('-i', r.src, '-frames:v', '1', '-vf', `crop=${r.w}:${h}:${r.x}:${r.y},scale=1000:1250:flags=lanczos,unsharp=5:5:0.55${edge}`, '-q:v', '3', `${OUT}/${id}.jpg`);
  }
  // The homepage and shop page show all four colorways. No printed words, no site name.
  ffmpeg('-i', CAMPAIGN, '-frames:v', '1', '-vf', 'crop=1254:658:0:205,scale=1200:630:flags=lanczos,unsharp=5:5:0.35', '-q:v', '3', `${OUT}/womens-drop.jpg`);
}

async function icons(browser) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.goto(`${BASE}/404.html`);
  await page.setContent(`<!doctype html><base href="${BASE}/"><style>
    html,body{margin:0;width:1024px;height:1024px;overflow:hidden}
    body{background:radial-gradient(circle at 50% 42%,#3a6df0 0,#204cad 42%,#122c6e 78%,#0b1a45 100%);display:grid;place-items:center}
    .shadow{filter:drop-shadow(0 26px 34px rgba(3,8,30,.55))}
    .logo{width:800px;aspect-ratio:596.5/327.6;background:linear-gradient(168deg,#fff 0,#f2f5fc 34%,#aebbd8 52%,#fff 66%,#d5ddf0 100%);-webkit-mask:url('assets/3d/sul-logo.svg') center/contain no-repeat;mask:url('assets/3d/sul-logo.svg') center/contain no-repeat}
  </style><div class="shadow"><div class="logo"></div></div>`);
  await page.waitForTimeout(800);
  const master = path.join(tmp, 'icon.png');
  await page.screenshot({ path: master });
  await page.close();
  for (const [size, file] of [[512, 'assets/images/icon-512.png'], [192, 'assets/images/icon-192.png'], [180, 'assets/images/apple-touch-icon.png'], [180, 'apple-touch-icon.png'], [64, 'assets/images/favicon-64.png'], [48, 'favicon.ico']]) {
    ffmpeg('-i', master, '-vf', `scale=${size}:${size}:flags=lanczos`, file);
  }
}

async function film(browser) {
  // Records the real homepage scene, the chrome logo and the flight through the U, and lands on all four sets.
  // It starts on the logo and ends on the sets, with no fades, so a player resting on either frame still looks right.
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/index.html?world`);
  await page.addStyleTag({ content: 'body>*:not(#world),main>*{visibility:hidden!important}#world{visibility:visible!important}' });
  await page.waitForFunction(() => document.documentElement.classList.contains('world-ready'), null, { timeout: 30000 });
  await page.waitForTimeout(4000); // the wall's photos load after first paint
  const data = await page.evaluate(async () => {
    const canvas = document.getElementById('world');
    const hero = document.querySelector('[data-act="hero"]');
    const heroEnd = hero.getBoundingClientRect().bottom + scrollY - innerHeight;
    const ease = (t) => t * t * (3 - 2 * t);
    const keys = [[0, 0], [1200, 0], [3800, heroEnd]];
    const at = (ms) => { for (let i = 1; i < keys.length; i += 1) { const [a, ya] = keys[i - 1]; const [b, yb] = keys[i]; if (ms <= b) return ya + (yb - ya) * ease((ms - a) / (b - a)); } return keys.at(-1)[1]; };
    const chunks = [];
    const rec = new MediaRecorder(canvas.captureStream(60), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 60e6 });
    rec.ondataavailable = (e) => chunks.push(e.data);
    const stopped = new Promise((done) => { rec.onstop = done; });
    rec.start();
    const t0 = performance.now();
    await new Promise((done) => { const tick = () => { const ms = performance.now() - t0; window.scrollTo(0, at(ms)); if (ms < keys.at(-1)[0]) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
    rec.stop();
    await stopped;
    const buffer = await new Blob(chunks).arrayBuffer();
    let out = ''; const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 32768) out += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    return btoa(out);
  });
  await page.close();
  const raw = path.join(tmp, 'film.webm');
  fs.writeFileSync(raw, Buffer.from(data, 'base64'));
  const lands = "zoompan=z='1+0.00028*on':x='iw/2-(iw/zoom/2)':y=0:d=1:s=1200x630:fps=30";
  ffmpeg('-i', raw, '-loop', '1', '-t', '5', '-i', `${OUT}/womens-drop.jpg`, '-an',
    '-filter_complex', `[0:v]fps=30,scale=1200:630:flags=lanczos,format=yuv420p,settb=AVTB[a];[1:v]scale=2400:1260:flags=lanczos,${lands},format=yuv420p,settb=AVTB[b];[a][b]xfade=transition=fade:duration=0.35:offset=2.6,format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '23', '-preset', 'veryslow', '-movflags', '+faststart', `${OUT}/sul-film.mp4`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (want('photos')) photos();
  if (want('icons') || want('film')) {
    const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
    if (want('icons')) await icons(browser);
    if (want('film')) await film(browser);
    await browser.close();
  }
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((error) => { console.error(error); process.exitCode = 1; });
