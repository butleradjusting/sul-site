// Draws one image of a week's Instagram plan for the owner to approve: a row per item with its date,
// the story image or every slide of the carousel. Reads the images made by `npm run stories` and
// `npm run posts`, so run those first.
// Usage: SUL_PLAYWRIGHT_PATH=... node scripts/social/plan_sheet.mjs <plan.json> <out.jpg>
// plan.json is a list of { "at": "2026-11-20T12:00", "kind": "story" | "post", "id": "<story or post id>" }.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './kit.mjs';

const [planFile, out] = process.argv.slice(2);
if (!planFile || !out) throw new Error('Usage: node scripts/social/plan_sheet.mjs <plan.json> <out.jpg>');
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8')).sort((a, b) => a.at.localeCompare(b.at));
const stories = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/stories/stories.json'), 'utf8'));
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/posts/posts.json'), 'utf8'));
const local = (url) => path.join(ROOT, new URL(url).pathname);
const data = (file) => `data:image/jpeg;base64,${fs.readFileSync(file).toString('base64')}`;
const escape = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const when = (at) => new Date(`${at}:00`).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const entry = (item) => {
  const found = (item.kind === 'story' ? stories : posts).find((s) => s.id === item.id);
  if (!found) throw new Error(`No ${item.kind} called ${item.id}: run npm run stories and npm run posts first`);
  return found;
};
// Stories sit in a grid, one card each; feed posts get a row each with every slide.
const storyCards = plan.filter((item) => item.kind === 'story').map((item) => {
  const story = entry(item);
  return `<figure><img src="${data(local(story.image))}" width="186" height="330"><figcaption><b>${escape(when(item.at))}</b>${escape(story.title)}</figcaption></figure>`;
});
const postRows = plan.filter((item) => item.kind === 'post').map((item) => {
  const post = entry(item);
  return `<section><header><p class="kind">Feed post · ${post.images.length} slides</p><h2>${escape(post.title)}</h2><p>${escape(when(item.at))}</p></header>${post.images.map((url) => `<img src="${data(local(url))}" width="264" height="330">`).join('')}</section>`;
});
const first = when(plan[0].at).split(',').slice(0, 2).join(',');
const last = when(plan.at(-1).at).split(',').slice(0, 2).join(',');

const require = createRequire(import.meta.url);
const heading = (text) => `<h3>${text}</h3>`;
const { chromium } = require(process.env.SUL_PLAYWRIGHT_PATH || 'playwright');
const browser = await chromium.launch({ channel: process.env.SUL_PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>
body{margin:0;padding:36px;background:#05070d;color:#f2f4f9;font:400 20px/1.35 -apple-system,Helvetica,sans-serif;width:1890px}
h1{margin:0 0 6px;font-size:34px}h1+p{margin:0 0 26px;color:#9aa3b6}
section{display:flex;gap:10px;margin-bottom:16px}
header{width:260px;padding:4px 18px 0 0}
.kind{margin:0;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#a9bff2}
h3{margin:30px 0 16px;font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:#a9bff2}
.grid{display:flex;flex-wrap:wrap;gap:16px 12px}
figure{margin:0;width:186px}
figcaption{margin-top:8px;font-size:15px;line-height:1.3;color:#c8cfdd}
figcaption b{display:block;color:#f2f4f9;font-weight:600}
section .kind{color:#c9f24f}
h2{margin:10px 0 8px;font-size:24px;line-height:1.15}
header p{margin:0;color:#c8cfdd}
img{display:block;border-radius:6px}
</style><h1>SUL Instagram · ${escape(first)} to ${escape(last)}</h1><p>${plan.filter((i) => i.kind === 'story').length} stories, ${plan.filter((i) => i.kind === 'post').length} feed posts · Eastern time · nothing is queued until you say yes</p>${storyCards.length ? `${heading('Stories')}<div class="grid">${storyCards.join('')}</div>` : ''}${postRows.length ? `${heading('Feed posts')}${postRows.join('')}` : ''}`);
  await page.locator('body').screenshot({ path: out, type: 'jpeg', quality: 86 });
} finally {
  await browser.close();
}
console.log(`${plan.length} items drawn to ${out}`);
