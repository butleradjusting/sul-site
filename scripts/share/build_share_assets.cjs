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
const GENERATED = 'site-photos/share-generated';
const wanted = process.argv.slice(2);
const want = (name) => !wanted.length || wanted.includes(name);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sul-share-'));
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);

// Crop rectangles are in the source image's pixels. Messages shows tall photos large, and Apple
// advises against text in preview images, so these stay photographic. The sets come from
// site-photos/share-generated/: Higgsfield (nano_banana_2) images made from the campaign crops and
// product photos, with prompts to keep the real garments. Compare the prints before replacing one.
const PHOTOS = {
  'olive-set': { src: `${GENERATED}/olive-set.jpg`, x: 6, y: 0, w: 1843 },
  'navy-cream-set': { src: `${GENERATED}/navy-cream-set.jpg`, x: 6, y: 0, w: 1843 },
  'black-set': { src: `${GENERATED}/black-set.jpg`, x: 6, y: 0, w: 1843 },
  'pink-set': { src: `${GENERATED}/pink-set.jpg`, x: 6, y: 0, w: 1843 },
  'blackout-hoodie': { src: `${GENERATED}/blackout-hoodie.jpg`, x: 6, y: 0, w: 1843 },
  'lion-sweater': { src: `${GENERATED}/lion-sweater.jpg`, x: 6, y: 0, w: 1843 },
  'new-era-hat': { src: `${GENERATED}/new-era-hat.jpg`, x: 6, y: 0, w: 1843 },
  'full-kit': { src: `${GENERATED}/full-kit.jpg`, x: 6, y: 0, w: 1843 },
  'crown-set': { src: 'site-photos/crown-generated/crown-set-night-front.jpg', x: 6, y: 0, w: 1843 },
};

function photos() {
  for (const [id, r] of Object.entries(PHOTOS)) {
    const h = Math.round((r.w * 5) / 4);
    ffmpeg('-i', r.src, '-frames:v', '1', '-vf', `crop=${r.w}:${h}:${r.x}:${r.y},scale=1000:1250:flags=lanczos`, '-q:v', '3', `${OUT}/${id}.jpg`);
  }
  // The storefront uses the same images: 2:3 for cards, the 3D wall, and set pages, wide for the lineup.
  for (const id of ['olive-set', 'navy-cream-set', 'black-set', 'pink-set']) {
    const frame = path.join(tmp, `${id}.png`);
    ffmpeg('-i', `${GENERATED}/${id}.jpg`, '-frames:v', '1', '-vf', 'crop=1536:2304:160:0,scale=1000:1500:flags=lanczos', frame);
    execFileSync('cwebp', ['-quiet', '-q', '84', frame, '-o', `assets/images/${id}-studio.webp`]);
  }
  for (const id of ['blackout-hoodie', 'lion-sweater', 'new-era-hat', 'full-kit']) {
    const frame = path.join(tmp, `${id}.png`);
    ffmpeg('-i', `${GENERATED}/${id}.jpg`, '-frames:v', '1', '-vf', 'crop=1536:2304:160:0,scale=1000:1500:flags=lanczos', frame);
    execFileSync('cwebp', ['-quiet', '-q', '84', frame, '-o', `assets/images/${id}-model.webp`]);
  }
  execFileSync('cwebp', ['-quiet', '-q', '84', '-resize', '1600', '0', `${GENERATED}/womens-drop.jpg`, '-o', 'assets/images/womens-lineup.webp']);
  // The homepage and shop page show all four colorways. Cropped from the top so no head is cut.
  ffmpeg('-i', `${GENERATED}/womens-drop.jpg`, '-frames:v', '1', '-vf', 'crop=iw:iw*630/1200:0:0,scale=1200:630:flags=lanczos', '-q:v', '3', `${OUT}/womens-drop.jpg`);
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
