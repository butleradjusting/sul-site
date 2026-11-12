// Makes the Instagram feed posts: carousels of 1080x1350 JPEGs in assets/posts/, plus posts.json, the
// list a scheduler reads (caption, the public address of each slide in order, alt text, product link).
// The slides follow the two carousels the owner queued by hand on 2026-11-11: a cover with a chrome
// headline, photo slides with a short line, a facts slide, and a closing slide that points to the site.
// Prices, sizes, and counts come from assets/catalog.js, so rerun this after a catalog change.
// A post whose styles have all sold out is dropped, and its old files are removed.
// Needs Chrome and Playwright. Usage: SUL_PLAYWRIGHT_PATH=... npm run posts [-- post-id ...]
import fs from 'node:fs';
import path from 'node:path';
import { catalog, headliner, money } from '../../assets/catalog.js';
import { ROOT, SITE, GENERATED, CROWN, FONTS, CHROME, LOGO, numberWord, escape, inStock, sizeRange, runCount, studio } from './kit.mjs';

const OUT = 'assets/posts';
const womenTags = (extra) => `#matchingset #womensstreetwear ${extra} #sulcollective #snoozeulose`;
const find = (id) => catalog.find((p) => p.id === id);
const isSet = (p) => Boolean(p.stock) || p.category === 'Sets';
const facts = (p) => [
  [money(p.price), isSet(p) ? 'Complete set' : 'Price'],
  ...(runCount(p) ? [[String(runCount(p).n), `Sets ${runCount(p).word}`]] : []),
  p.sizes.length > 1 ? [sizeRange(p), 'Sizes'] : [p.sizes[0], 'Size']
];
// "Cream pleated skirt with built-in shorts" becomes a line and a note under it.
const pieces = (p) => (p.details.find(([key]) => key === 'Set' || key === 'Includes') || ['', p.name])[1]
  .split(/, | \+ /).map((piece) => { const [main, note] = piece.split(' with '); return { main, note: note ? `with ${note}` : '' }; });
const scarcity = (p) => (runCount(p).word === 'made' ? `Only ${runCount(p).n} made, and when a size is gone, it’s gone.` : `Only ${runCount(p).n} left.`);
const onePerSize = (p) => Object.values(p.stock).every((n) => n <= 1);
const crownAlt = (image) => headliner.photos.find((photo) => photo.image === image).alt;

// A women's set: cover, close looks, what is in the set, and where to get it.
const setPost = (id, { head, look, close, opener, body, tag }) => ({
  id, products: [id],
  build: ([p]) => ({
    slides: [
      { type: 'cover', photo: `${GENERATED}/${id}.jpg`, alt: p.alt, live: true, pill: 'Women’s drop · Available now', head: head(p), cue: 'Swipe for the details' },
      { type: 'photo', photo: `${GENERATED}/${id}.jpg`, alt: p.alt, ...look },
      { type: 'list', kicker: 'What’s in the set', name: p.name, items: pieces(p), facts: facts(p) },
      { type: 'cta', head: close(p), sub: `${p.name}. ${money(p.price)}. ${sizeRange(p)}.` }
    ],
    caption: `${opener(p)}\n\n${body(p)}\n\n${money(p.price)} for the complete set. Sizes ${sizeRange(p)}. ${scarcity(p)} Link in bio.\n\n${womenTags(tag)}`
  })
});
const lastCall = () => ['When it’s gone,', 'it’s gone.'];
// The second slide is the cover photo again, closer and without the headline over the outfit: from
// the chin down to the hem. The three skirt sets share one pose, so one crop works for each.
const skirtLook = { at: '50% 48%', zoom: 1.45, shade: 1010, words: ['Crown on the chest.', 'Crown on the skirt.'] };

// The order here is the posting order. Every photo used is a Higgsfield image, so every post is `ai`.
const POSTS = [
  { id: 'crown-night', products: ['crown-set'],
    build: ([p]) => ({
      slides: [
        { type: 'cover', photo: `${CROWN}/crown-set-night-front.jpg`, at: '30% 50%', alt: crownAlt('crown-set-night-front'), live: true, pill: 'Available now · Charcoal Crown Set', head: ['The Crown Set', 'is on the site.'], cue: 'Swipe for the back' },
        { type: 'photo', photo: `${CROWN}/crown-set-night-back.jpg`, alt: crownAlt('crown-set-night-back'), words: ['Hood up.', 'Crown out.'] },
        { type: 'photo', photo: `${CROWN}/crown-set-crest.jpg`, alt: crownAlt('crown-set-crest'), at: '50% 30%', shade: 980, words: ['Chrome on charcoal.'] },
        { type: 'card', photo: `${CROWN}/crown-set-flatlay.jpg`, alt: crownAlt('crown-set-flatlay'), name: 'Charcoal Crown Set', sub: 'Hoodie + joggers, sold together as one set', facts: facts(p) },
        { type: 'cta', head: ['Don’t sleep', 'on style.'], sub: `The Charcoal Crown Set. ${money(p.price)}. ${sizeRange(p)}.` }
      ],
      caption: `Hood up. Crown out. 👑\n\nThe Charcoal Crown Set is on the site. Washed charcoal hoodie + joggers, crown on the chest and the leg, chrome crest across the whole back.\n\n${money(p.price)} for the set. Sizes ${sizeRange(p)}. Link in bio.\n\n#streetwear #hoodieset #sweatsuit #sulcollective #snoozeulose`
    }) },
  setPost('olive-set', {
    head: (p) => ['Olive.', `${numberWord(p.pieces)} pieces.`],
    look: { at: '48% 0%', zoom: 1.22, shade: 1010, words: ['Crown on the tank.', 'Crown on the leggings.'] },
    close: lastCall,
    opener: (p) => `Olive. ${numberWord(p.pieces)} pieces. One order.`,
    body: () => 'Fitted tank, fitted leggings, the cream and olive cardigan, and cream leg warmers. Crown details on the tank and the leggings.',
    tag: '#loungewear'
  }),
  { id: 'originals', products: ['blackout-hoodie', 'lion-sweater', 'full-kit', 'new-era-hat'],
    build: (list) => {
      const sub = { 'blackout-hoodie': 'Heavyweight fleece, SUL down both sleeves', 'lion-sweater': 'Heavyweight knit, embroidered lion crest', 'full-kit': 'Blackout Hoodie, joggers, and tee', 'new-era-hat': 'SUL × New Era, adjustable snapback' };
      // The cover is the Full Kit photo, so the kit's own slide shows it closer.
      const lead = list.find((p) => p.id === 'full-kit') || list[0];
      const view = { 'full-kit': { at: '50% 30%', zoom: 1.3 }, 'new-era-hat': { at: '50% 30%' } };
      return {
        slides: [
          { type: 'cover', photo: `${GENERATED}/${lead.id}.jpg`, alt: lead.alt, shade: 640, pill: 'On the site now', head: ['All black.', 'All SUL.'], cue: 'Swipe through' },
          ...list.map((p) => ({ type: 'card', photo: `${GENERATED}/${p.id}.jpg`, alt: p.alt, ...view[p.id], name: p.name.replace(/^The /, ''), sub: sub[p.id] || '', facts: facts(p) })),
          { type: 'cta', head: ['Finish', 'the look.'], sub: `${numberWord(list.length)} piece${list.length === 1 ? '' : 's'} in black, all on the site.` }
        ],
        caption: `All black. All SUL.\n\n${list.map((p) => `${p.name.replace(/^The /, '')} ${money(p.price)}`).join(' · ')}.\n\nWhich one goes in your rotation? Link in bio.\n\n#streetwear #allblack #hoodie #sulcollective #snoozeulose`
      };
    } },
  setPost('black-set', {
    head: () => ['All black.', 'Head to toe.'],
    look: skirtLook,
    close: (p) => (p.sizes.includes('2XL') ? ['The only one', 'with a 2XL.'] : lastCall()),
    opener: () => 'All black, head to toe.',
    body: (p) => `Black sweatshirt with the S.U.L crown across the chest, black pleated skirt with built-in shorts, black leg warmers.${p.sizes.includes('2XL') ? ' The only colorway with a 2XL.' : ''}`,
    tag: '#pleatedskirt'
  }),
  setPost('navy-cream-set', {
    head: () => ['Deep navy.', 'Against cream.'],
    look: skirtLook,
    close: lastCall,
    opener: () => 'Deep navy against cream.',
    body: () => 'Navy sweatshirt with the S.U.L crown across the chest, cream pleated skirt with built-in shorts, cream leg warmers.',
    tag: '#pleatedskirt'
  }),
  setPost('pink-set', {
    head: (p) => ['Blush pink.', onePerSize(p) ? 'One per size.' : 'The smallest run.'],
    look: skirtLook,
    close: (p) => (onePerSize(p) ? [`${numberWord(runCount(p).n)} ${runCount(p).word}.`, 'One per size.'] : lastCall()),
    opener: (p) => `Blush pink.${onePerSize(p) ? ' One per size.' : ''}`,
    body: () => 'The softest colorway in the drop and the smallest run. Blush pink sweatshirt with the S.U.L crown across the chest, pink pleated skirt with built-in shorts, cream and pink leg warmers.',
    tag: '#pleatedskirt'
  })
];

function posts() {
  return POSTS.flatMap((spec) => {
    const list = spec.products.map(find).filter((p) => p && inStock(p));
    if (!list.length) return [];
    const built = spec.build(list);
    return [{ id: spec.id, list, ai: true, ...built }];
  });
}

const mark = (cls = 'mark') => `<svg class="${cls}" viewBox="0 0 596.5 327.6" aria-hidden="true"><path fill="#f2f4f9" d="${LOGO}"/></svg>`;
// `at` is the point of the photo kept in view (CSS object-position); `zoom` enlarges the photo around it.
const photo = (s) => `<div class="frame"><img src="${s.photo}" alt="" style="object-position:${s.at || '50% 50%'};transform:scale(${s.zoom || 1});transform-origin:${s.at || '50% 50%'}"></div>`;
const lines = (list) => list.map((line) => `<span>${escape(line)}</span>`).join('');
const factsRow = (list) => `<div class="facts">${list.map(([value, label]) => `<p><b>${escape(value)}</b>${escape(label)}</p>`).join('')}</div>`;
const SLIDES = {
  cover: (s) => `${photo(s)}<div class="shade" style="--from:${s.shade || 480}px"></div>${mark()}<div class="copy"><p class="pill"><i class="dot${s.live ? ' live' : ''}"></i>${escape(s.pill)}</p><h1 class="chrome" data-fit data-min="96">${lines(s.head)}</h1><p class="cue">${escape(s.cue)} <span>→</span></p></div>`,
  photo: (s) => `${photo(s)}<div class="shade" style="--from:${s.shade || 760}px"></div>${mark()}<div class="copy"><h2 data-fit data-min="56">${lines(s.words)}</h2></div>`,
  card: (s) => `${photo(s)}<div class="shade" style="--from:${s.shade || 560}px"></div>${mark()}<div class="copy"><h2 class="name" data-fit data-min="64">${lines([s.name])}</h2><p class="sub">${escape(s.sub)}</p>${factsRow(s.facts)}</div>`,
  list: (s) => `<div class="night"></div>${mark()}<div class="copy list"><p class="kicker">${escape(s.kicker)}</p><h2 class="name chrome" data-fit data-min="64">${lines([s.name])}</h2><ol>${s.items.map((item, i) => `<li><i>${String(i + 1).padStart(2, '0')}</i><b>${escape(item.main)}${item.note ? `<small>${escape(item.note)}</small>` : ''}</b></li>`).join('')}</ol>${factsRow(s.facts)}</div>`,
  cta: (s) => `<div class="night"></div><div class="center">${mark('big')}<h1 class="chrome" data-fit data-min="84">${lines(s.head)}</h1><p class="sub">${escape(s.sub)}</p><p class="button">Shop at snoozeulose.com</p></div>`
};
// What a screen reader gets for a slide: the words printed on it, then what the photo shows.
const words = (s) => [
  s.pill, (s.head || s.words || []).join(' '), s.kicker, s.name, s.sub,
  (s.items || []).map((item) => `${item.main}${item.note ? ` ${item.note}` : ''}`).join(', '),
  ...(s.facts || []).map(([value, label]) => `${label}: ${value}`),
  s.type === 'cta' ? 'Shop at snoozeulose.com' : ''
].filter(Boolean).map((part) => part.replace(/[.,]$/, '')).join('. ');
const alt = (s) => `${words(s)}.${s.alt ? ` ${s.alt}.` : ''}`;

const CSS = `${FONTS}
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1350px;overflow:hidden;background:#05070d;color:#f2f4f9;font:400 34px/1.4 Manrope,sans-serif;-webkit-font-smoothing:antialiased}
.frame{position:absolute;inset:0;overflow:hidden}
.frame img{width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,#05070d8c 0,#05070d00 250px),linear-gradient(180deg,#05070d00 var(--from),#05070dcc calc(var(--from)*.45 + 742px),#05070df2 1350px)}
.night{position:absolute;inset:0;background:radial-gradient(1000px 760px at 100% 0,#16348f70,transparent 70%),radial-gradient(1100px 820px at 0 100%,#1c3fa652,transparent 70%),#05070d}
.mark{position:absolute;left:64px;top:58px;width:116px;height:auto;filter:drop-shadow(0 2px 14px #05070d99)}
.copy{position:absolute;left:66px;right:66px;bottom:66px;display:flex;flex-direction:column;align-items:flex-start}
.pill{display:inline-flex;align-items:center;gap:15px;padding:13px 26px 13px 22px;border-radius:999px;border:1.5px solid #ffffff33;background:#0a0e18d9;box-shadow:inset 0 1.5px 0 #ffffff24;font:600 27px/1.2 Manrope,sans-serif}
.dot{width:14px;height:14px;border-radius:50%;background:#4d7dff;box-shadow:0 0 18px #4d7dff}
.dot.live{background:#c9f24f;box-shadow:0 0 18px #c9f24f}
h1,h2{font-family:Barlow,sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-.015em;white-space:nowrap}
h1 span,h2 span{display:block;width:max-content}
h1{margin-top:28px;font-size:156px;line-height:.9}
h2{font-size:84px;line-height:.95}
h2.name{font-size:108px}
.chrome span{background:${CHROME};-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.04em}
.cue{margin-top:34px;font:600 26px/1 Manrope,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#a9bff2}
.cue span{font-family:system-ui,sans-serif}
.sub{margin-top:10px;color:#c8cfdd}
.facts{margin-top:30px;padding-top:30px;border-top:1.5px solid #ffffff30;width:100%;display:flex;gap:64px}
.facts p{font:400 25px/1.3 Manrope,sans-serif;color:#9aa3b6}
.facts b{display:block;margin-bottom:8px;font:800 64px/1 Barlow,sans-serif;color:#f2f4f9;text-transform:uppercase;font-variant-numeric:tabular-nums}
.list{top:150px;justify-content:center}
.kicker{font:600 26px/1 Manrope,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#a9bff2}
.list h2{margin-top:24px}
ol{list-style:none;padding:0;margin-top:40px;width:100%}
li{display:flex;align-items:baseline;gap:30px;padding:26px 0;border-top:1.5px solid #ffffff24}
li i{flex:none;width:44px;font:600 30px/1 Barlow,sans-serif;color:#a9bff2}
li b{font:800 62px/1 Barlow,sans-serif;text-transform:uppercase}
li small{display:block;margin-top:10px;font:400 27px/1.2 Manrope,sans-serif;color:#c8cfdd;text-transform:none}
.list .facts{margin-top:44px}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 66px 30px;text-align:center}
.big{width:270px;height:auto}
.center h1{margin-top:58px;font-size:132px}
.center h1 span{margin:0 auto}
.center .sub{margin-top:24px;max-width:860px;text-wrap:balance}
.button{margin-top:50px;padding:30px 56px;border-radius:999px;background:linear-gradient(180deg,#3a6ce0,#2955c8);box-shadow:0 0 70px #2c5cff80,inset 0 1.5px 0 #ffffff40;font:600 37px/1 Manrope,sans-serif;color:#fff}
`;
const html = (slide) => (base) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${base}/"><style>${CSS}</style></head><body>${SLIDES[slide.type](slide)}</body></html>`;
const file = (post, i) => `${OUT}/${post.id}-${i + 1}.jpg`;

const wanted = process.argv.slice(2);
const all = posts();
const list = wanted.length ? all.filter((post) => wanted.includes(post.id)) : all;
fs.mkdirSync(path.join(ROOT, OUT), { recursive: true });
await studio({ width: 1080, height: 1350 }, async (shoot) => {
  for (const post of list) {
    for (const [i, slide] of post.slides.entries()) await shoot(html(slide), file(post, i), `${post.id} slide ${i + 1}`);
    console.log(`${OUT}/${post.id}-1…${post.slides.length}.jpg  ${post.slides[0].head.join(' ')}`);
  }
});

// Drop slides that no longer belong to a post (sold out, shortened), then write the list.
const keep = new Set(all.flatMap((post) => post.slides.map((_, i) => path.basename(file(post, i)))));
for (const name of fs.readdirSync(path.join(ROOT, OUT))) if (name.endsWith('.jpg') && !keep.has(name)) fs.rmSync(path.join(ROOT, OUT, name));
const manifest = all.map((post) => ({
  id: post.id,
  title: post.slides[0].head.join(' '),
  caption: post.caption,
  images: post.slides.map((_, i) => `${SITE}/${file(post, i)}`),
  alt: post.slides.map(alt),
  link: post.list.length === 1 ? `${SITE}/${post.list[0].id}.html` : `${SITE}/collections.html`,
  ai: post.ai
}));
fs.writeFileSync(path.join(ROOT, OUT, 'posts.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${all.length} posts listed in ${OUT}/posts.json`);
