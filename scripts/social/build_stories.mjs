// Makes the Instagram Stories: one 1080x1920 JPEG per story in assets/stories/, plus stories.json,
// the list a scheduler reads (file, public URL, product link, alt text, and whether the photo is AI).
// Prices, sizes, and counts come from assets/catalog.js, so rerun this after a catalog change.
// A style with no size left gets no story, and its old file is removed.
// Needs Chrome and Playwright. Usage: SUL_PLAYWRIGHT_PATH=... npm run stories [-- story-id ...]
import fs from 'node:fs';
import path from 'node:path';
import { catalog, drop, sets, money } from '../../assets/catalog.js';
import { ROOT, SITE, GENERATED, CROWN, FONTS, CHROME, LOGO, numberWord, escape, inStock, sizeRange, run, setsLeft, firstSentence, studio } from './kit.mjs';

const OUT = 'assets/stories';

// Every photo here is a Higgsfield image (AI-edited campaign crops, AI models wearing the pictured
// garment), so each story is marked `ai` and should be posted with Instagram's AI label on.
// `at` is the CSS object-position of the photo inside the frame. `lift` moves the photo up and `shade`
// is where it starts fading into the dark (both px), for a photo whose own lettering would sit behind
// the words; the fade always finishes at the photo's bottom edge. `sub` is optional.
const SPECS = [
  { id: 'crown-set', product: 'crown-set', photo: `${CROWN}/crown-set-night-front.jpg`, at: '30% 50%', live: true, pill: 'Available now',
    head: ['The Crown Set', 'is on the site.'], sub: 'Washed charcoal hoodie + joggers, with the chrome crest across the back.' },
  { id: 'crown-set-crest', product: 'crown-set', photo: `${CROWN}/crown-set-crest.jpg`, at: '50% 50%', lift: 130, shade: 900, pill: 'The Charcoal Crown Set',
    head: ['Chrome', 'on charcoal.'] },
  { id: 'crown-set-back', product: 'crown-set', photo: `${CROWN}/crown-set-night-back.jpg`, at: '50% 50%', pill: 'The Charcoal Crown Set',
    head: ['Hood up.', 'Crown out.'], sub: 'Hoodie + joggers, sold together as one set.' },
  { id: 'crown-set-flatlay', product: 'crown-set', photo: `${CROWN}/crown-set-flatlay.jpg`, at: '50% 50%', pill: 'The Charcoal Crown Set',
    head: ['Two pieces.', 'One set.'], sub: 'Crown on the chest and the leg. The crest takes the whole back.' },
  { id: 'womens-drop', lineup: true, live: true, pill: 'Women’s drop · Available now',
    head: () => [setsLeft() < drop.totalSets ? `${setsLeft()} sets left.` : `${drop.totalSets} sets.`, `${numberWord(sets.filter(inStock).length)} colorway${sets.filter(inStock).length === 1 ? '' : 's'}.`], sub: 'Limited runs. When a size is gone, it’s gone.' },
  { id: 'olive-set', product: 'olive-set', photo: `${GENERATED}/olive-set.jpg`, live: true, pill: 'Women’s drop · Available now',
    head: ['Olive.', 'Four pieces.'], sub: 'Fitted tank, leggings, knit cardigan, and cream leg warmers.' },
  { id: 'navy-cream-set', product: 'navy-cream-set', photo: `${GENERATED}/navy-cream-set.jpg`, live: true, pill: 'Women’s drop · Available now',
    head: ['Deep navy.', 'Against cream.'], sub: 'Crown sweatshirt, pleated skirt with built-in shorts, leg warmers.' },
  { id: 'black-set', product: 'black-set', photo: `${GENERATED}/black-set.jpg`, live: true, pill: 'Women’s drop · Available now',
    head: ['All black.', 'Head to toe.'], sub: 'Crown sweatshirt, pleated skirt with built-in shorts, leg warmers.' },
  { id: 'pink-set', product: 'pink-set', photo: `${GENERATED}/pink-set.jpg`, live: true, pill: 'Women’s drop · Available now',
    head: (p) => ['Blush pink.', Object.values(p.stock).every((n) => n <= 1) ? 'One per size.' : 'The smallest run.'], sub: 'The softest colorway in the drop. Sweatshirt, pleated skirt, leg warmers.' },
  { id: 'blackout-hoodie', product: 'blackout-hoodie', photo: `${GENERATED}/blackout-hoodie.jpg`, pill: 'Blackout Hoodie',
    head: ['All black.', 'All SUL.'], sub: 'Heavyweight fleece with white SUL lettering down both sleeves.' },
  { id: 'lion-sweater', product: 'lion-sweater', photo: `${GENERATED}/lion-sweater.jpg`, pill: 'Lion Sweater',
    head: ['The lion', 'takes its place.'], sub: 'A heavyweight knit crewneck with the embroidered lion crest.' },
  { id: 'full-kit', product: 'full-kit', photo: `${GENERATED}/full-kit.jpg`, pill: 'The Full Kit',
    head: ['One look.', 'Three pieces.'], sub: 'The Blackout Hoodie, matching joggers, and the SUL tee.' },
  { id: 'new-era-hat', product: 'new-era-hat', photo: `${GENERATED}/new-era-hat.jpg`, at: '50% 30%', pill: 'SUL × New Era',
    head: ['Finish', 'the look.'], sub: 'Black mesh trucker, raised SUL embroidery, adjustable snapback.' }
];

// A style added to the catalog later still gets a story: its share photo, its name, its own words.
function specFor(p) {
  const known = SPECS.filter((s) => s.product === p.id);
  if (known.length) return known;
  const photo = [`${GENERATED}/${p.id}.jpg`, `assets/share/${p.id}.jpg`, `assets/images/${p.image}.webp`].find((file) => fs.existsSync(path.join(ROOT, file)));
  return [{ id: p.id, product: p.id, photo, pill: 'New on the site', head: [p.name, 'is on the site.'], sub: firstSentence(p.description) }];
}

function stories() {
  const list = [];
  const seen = new Set();
  const add = (spec) => {
    if (seen.has(spec.id)) return;
    seen.add(spec.id);
    const p = spec.product && catalog.find((item) => item.id === spec.product);
    if (spec.product && (!p || !inStock(p))) return;
    if (spec.lineup && !sets.some(inStock)) return;
    const head = typeof spec.head === 'function' ? spec.head(p) : spec.head;
    list.push({ ...spec, p, head, ai: spec.ai ?? true });
  };
  SPECS.forEach(add);
  catalog.filter((p) => !SPECS.some((s) => s.product === p.id)).flatMap(specFor).forEach(add);
  return list;
}

const logo = `<svg class="logo" viewBox="0 0 596.5 327.6" aria-hidden="true"><defs><linearGradient id="chrome" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="#8fa3cf"/><stop offset=".22" stop-color="#fff"/><stop offset=".38" stop-color="#6c82b8"/><stop offset=".55" stop-color="#f4f7ff"/><stop offset=".72" stop-color="#3e5fc2"/><stop offset=".88" stop-color="#e6ecfb"/><stop offset="1" stop-color="#93a6d0"/></linearGradient></defs><path fill="url(#chrome)" d="${LOGO}"/></svg>`;

const CSS = `${FONTS}
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1920px;overflow:hidden;background:#05070d;color:#f2f4f9;font:400 36px/1.42 Manrope,sans-serif;-webkit-font-smoothing:antialiased}
.photo{position:absolute;top:0;left:0;width:1080px;height:1380px;object-fit:cover}
/* Instagram draws its own header over the top 270px and the reply bar over the bottom 380px; words stay between them. */
.shade{--from:800px;--to:1370px;position:absolute;inset:0;background:linear-gradient(180deg,#05070d99 0,#05070d00 290px),linear-gradient(180deg,#05070d00 var(--from),#05070dd9 calc(var(--from)*.44 + var(--to)*.56),#05070d var(--to))}
.glow{position:absolute;inset:0;background:radial-gradient(1200px 820px at 4% 80%,#1c3fa66b,transparent 70%),radial-gradient(900px 620px at 104% 100%,#14308a52,transparent 70%)}
.copy{position:absolute;left:76px;right:76px;bottom:384px;display:flex;flex-direction:column;align-items:flex-start}
.pill{display:inline-flex;align-items:center;gap:16px;padding:14px 28px 14px 24px;border-radius:999px;border:1.5px solid #ffffff33;background:#0a0e18d9;box-shadow:inset 0 1.5px 0 #ffffff24;font:600 28px/1.2 Manrope,sans-serif;color:#f2f4f9}
.dot{width:14px;height:14px;border-radius:50%;background:#4d7dff;box-shadow:0 0 18px #4d7dff}
.dot.live{background:#c9f24f;box-shadow:0 0 18px #c9f24f}
h1{margin-top:30px;font:800 140px/.9 Barlow,sans-serif;text-transform:uppercase;letter-spacing:-.018em;white-space:nowrap}
h1 span{display:block;width:max-content}
h1 .a{background:${CHROME};-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.04em}
h1 .b{color:#a9bff2}
.sub{margin-top:26px;max-width:880px;color:#c8cfdd;text-wrap:pretty}
.meta{margin-top:38px;padding-top:32px;border-top:1.5px solid #ffffff30;width:100%;display:flex;align-items:center;gap:26px}
.price{font:800 76px/.9 Barlow,sans-serif;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.facts{font:600 28px/1.3 Manrope,sans-serif;color:#cfd9f2}
.facts span{display:block;color:#9aa3b6;font-weight:400}
.site{margin-left:auto;display:flex;align-items:center;gap:18px;font:600 28px/1 Manrope,sans-serif;color:#f2f4f9}
.logo{width:86px;height:auto;filter:drop-shadow(0 0 22px #2c5cff66)}
.lineup{position:absolute;top:0;left:0;width:1080px;height:960px;display:flex;gap:6px;background:#05070d}
.strip{position:relative;flex:1;overflow:hidden;background:#07090f}
.strip img{position:absolute;top:104px;left:50%;height:856px;width:auto;transform:translateX(-50%)}
.strip::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#07090f 104px,#07090f00 250px),linear-gradient(180deg,#05070d00 700px,#05070de6 900px,#05070d 960px)}
.strip p{position:absolute;left:0;right:0;bottom:26px;z-index:1;text-align:center;font:600 27px/1.25 Manrope,sans-serif}
.strip p span{display:block;color:#cfd9f2;font-weight:400;font-variant-numeric:tabular-nums}
.lineup-story .shade{background:none}
`;

const html = (story) => (base) => {
  const { p } = story;
  const media = story.lineup
    ? `<div class="lineup">${sets.filter(inStock).map((set) => `<div class="strip"><img src="${GENERATED}/${set.id}.jpg" alt=""><p>${escape(set.colorway)}<span>${money(set.price)}</span></p></div>`).join('')}</div>`
    : `<img class="photo" src="${story.photo}" alt="" style="object-position:${story.at || '50% 50%'};top:${-(story.lift || 0)}px">`;
  const meta = p
    ? `<p class="price">${money(p.price)}</p><p class="facts">${escape(sizeRange(p))}<span>${escape(run(p) || (p.sizes.length > 1 ? 'Sizes' : ''))}</span></p>`
    : `<p class="price">From ${money(Math.min(...sets.filter(inStock).map((set) => set.price)))}</p>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${base}/"><style>${CSS}</style></head>
<body class="${story.lineup ? 'lineup-story' : ''}">${media}<div class="shade" style="--from:${story.shade || 800}px;--to:${1370 - (story.lift || 0)}px"></div><div class="glow"></div>
<div class="copy"><p class="pill"><i class="dot${story.live ? ' live' : ''}"></i>${escape(story.pill)}</p>
<h1 data-fit data-min="84"><span class="a">${escape(story.head[0])}</span><span class="b">${escape(story.head[1])}</span></h1>
${story.sub ? `<p class="sub">${escape(story.sub)}</p>` : ''}
<div class="meta">${meta}<p class="site">${logo}snoozeulose.com</p></div></div></body></html>`;
};

const wanted = process.argv.slice(2);
const all = stories();
const list = wanted.length ? all.filter((story) => wanted.includes(story.id)) : all;
fs.mkdirSync(path.join(ROOT, OUT), { recursive: true });
await studio({ width: 1080, height: 1920 }, async (shoot) => {
  for (const story of list) {
    await shoot(html(story), `${OUT}/${story.id}.jpg`, story.id);
    console.log(`${OUT}/${story.id}.jpg  ${story.head.join(' ')}`);
  }
});

// Drop files for stories that no longer exist (sold out, shelved, removed), then write the list.
const keep = new Set(all.map((story) => `${story.id}.jpg`));
for (const file of fs.readdirSync(path.join(ROOT, OUT))) if (file.endsWith('.jpg') && !keep.has(file)) fs.rmSync(path.join(ROOT, OUT, file));
const manifest = all.map((story) => ({
  id: story.id,
  title: story.head.join(' '),
  image: `${SITE}/${OUT}/${story.id}.jpg`,
  link: story.p ? `${SITE}/${story.p.id}.html` : `${SITE}/collections.html`,
  ai: story.ai,
  alt: `${story.head.join(' ')}${story.sub ? ` ${story.sub}` : ''}${story.p ? ` ${story.p.name}, ${money(story.p.price)}.` : ''}`
}));
fs.writeFileSync(path.join(ROOT, OUT, 'stories.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${all.length} stories listed in ${OUT}/stories.json`);
