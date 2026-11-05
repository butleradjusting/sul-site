// Photographs the live 3D logo for the first-paint and fallback poster, so the handoff to WebGL does not jump.
// With `npm run dev` running: SUL_PLAYWRIGHT_PATH=... node scripts/3d/capture_poster.cjs
const { chromium } = require(process.env.SUL_PLAYWRIGHT_PATH || 'playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto((process.env.SUL_PREVIEW_URL || 'http://127.0.0.1:4173') + '/index.html?world=poster');
  await page.addStyleTag({ content: '.hero-copy,.site-header,.scroll-cue,.hero-poster{display:none!important}' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'assets/images/poster.png', clip: { x: 300, y: 120, width: 860, height: 520 } });
  await browser.close();
  execFileSync('cwebp', ['-quiet', '-q', '84', '-resize', '1400', '0', 'assets/images/poster.png', '-o', 'assets/images/sul-chrome-poster.webp']);
  fs.unlinkSync('assets/images/poster.png');
})().catch((error) => { console.error(error); process.exitCode = 1; });
