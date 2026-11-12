// Shared by the Instagram story and feed post builders: paths, the site's fonts and logo, the catalog
// wording (size ranges, "7 made" / "4 left"), and the browser that turns HTML into JPEGs.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sets } from '../../assets/catalog.js';

const require = createRequire(import.meta.url);
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SITE = 'https://snoozeulose.com';
// Every photo in these two folders is a Higgsfield image (AI-edited campaign crops, AI models wearing
// the pictured garment), so whatever is made from them is posted with Instagram's AI label on.
export const GENERATED = 'site-photos/share-generated';
export const CROWN = 'site-photos/crown-generated';

export const numberWord = (n) => ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][n] || String(n);
export const escape = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const inStock = (p) => p.sizes.length > 0;
// "S–XL" only when every size in between is still there; otherwise the sizes are listed.
const ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
export const sizeRange = (p) => {
  const at = p.sizes.map((size) => ORDER.indexOf(size));
  const unbroken = p.sizes.length > 2 && !at.includes(-1) && at.at(-1) - at[0] === at.length - 1;
  return unbroken ? `${p.sizes[0]}–${p.sizes.at(-1)}` : p.sizes.join(' · ');
};
// Sets are limited runs: how many were made, or how many are left once some have sold.
export const unitsLeft = (p) => Object.values(p.stock).reduce((sum, n) => sum + n, 0);
export const runCount = (p) => {
  if (!p.stock) return null;
  const left = unitsLeft(p);
  return left < p.quantity ? { n: left, word: 'left' } : { n: p.quantity, word: 'made' };
};
export const run = (p) => (runCount(p) ? `${runCount(p).n} ${runCount(p).word}` : '');
export const setsLeft = () => sets.reduce((sum, set) => sum + unitsLeft(set), 0);
export const firstSentence = (text) => (text.match(/^.*?[.!?](?=\s|$)/) || [text])[0];

export const LOGO = fs.readFileSync(path.join(ROOT, 'assets/3d/sul-logo.svg'), 'utf8').match(/ d="([^"]+)"/)[1];
export const FONTS = `
@font-face{font-family:Barlow;src:url('assets/fonts/barlow-condensed-800.woff2') format('woff2');font-weight:800}
@font-face{font-family:Barlow;src:url('assets/fonts/barlow-condensed-600.woff2') format('woff2');font-weight:600}
@font-face{font-family:Manrope;src:url('assets/fonts/manrope-400.woff2') format('woff2');font-weight:400}
@font-face{font-family:Manrope;src:url('assets/fonts/manrope-600.woff2') format('woff2');font-weight:600}
@font-face{font-family:Manrope;src:url('assets/fonts/manrope-700.woff2') format('woff2');font-weight:700}
`;
// The chrome the site uses on its headlines.
export const CHROME = 'linear-gradient(176deg,#fff 4%,#e7ecf8 30%,#b4c2e2 47%,#f8faff 54%,#aab8da 70%,#eef2fb 86%,#fff 100%)';

// Serves the repository to the browser so fonts and photos load the same way they do on the site.
function serve() {
  const types = { '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
  const server = createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'text/plain' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Opens Chrome at the given size and hands `work` a `shoot(html, file, label)` that saves one JPEG.
// `html` is a function of the local address the repository is served from. A headline marked
// `data-fit` shrinks (down to `data-min` px) until its longest line fits its column.
export async function studio({ width, height }, work) {
  const { chromium } = require(process.env.SUL_PLAYWRIGHT_PATH || 'playwright');
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: process.env.SUL_PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`${base}/robots.txt`);
    await work(async (html, file, label) => {
      await page.setContent(html(base), { waitUntil: 'load' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
        for (const el of document.querySelectorAll('[data-fit]')) {
          const room = el.parentElement.clientWidth;
          const min = Number(el.dataset.min || 84);
          let size = parseFloat(getComputedStyle(el).fontSize);
          while (size > min && Math.max(...[...el.children].map((line) => line.offsetWidth)) > room) el.style.fontSize = `${(size -= 2)}px`;
        }
      });
      const broken = await page.evaluate(() => [...document.images].filter((img) => !img.naturalWidth).map((img) => img.getAttribute('src')));
      if (broken.length) throw new Error(`${label}: photo did not load: ${broken.join(', ')}`);
      await page.screenshot({ path: path.join(ROOT, file), type: 'jpeg', quality: 92 });
    });
  } finally {
    await browser.close();
    server.close();
  }
}
