// Makes a live Stripe Payment Link for every style on sale that has none, and keeps the links in step
// with the catalog (owner's request, 2026-11-11). `npm run build` runs it first; `npm run stripe` runs it alone.
//
// - New style with a price: makes a Stripe product (name, description, share photo), a price, and a link.
// - Price changed: makes a new price and link, and turns the old link off.
// - Name, description, or photo changed: updates the Stripe product.
// - Stock changed: the link's quantity limit follows the total left; at 0 the link is turned off.
// - Style removed or shelved: its link is turned off. Relisting at the same price turns it back on.
//
// The key is a restricted live key (Products, Prices, Payment Links: Write), read from STRIPE_SECRET_KEY
// or the macOS Keychain item "snoozeulose-stripe". It is never written to the repository.
// With no key it changes nothing and lists what still needs a link. `--dry-run` shows the plan only.
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { sets, products, isLiveCheckout } from '../assets/catalog.js';
import { stripeLinks } from '../assets/stripe-links.js';

const FILE = new URL('../assets/stripe-links.js', import.meta.url);
const SITE = 'https://snoozeulose.com';
const KEYCHAIN_ITEM = 'snoozeulose-stripe';
const MAX_UNLIMITED = 10; // per-order cap for styles without a stock count
const dryRun = process.argv.includes('--dry-run');
const inBuild = process.argv.includes('--build'); // never stop the site build over Stripe
const saved = structuredClone(stripeLinks);

const wanted = [...sets, ...products]
  .filter((p) => p.price > 0 && !isLiveCheckout(p.manualCheckout))
  .map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    amount: Math.round(p.price * 100),
    max: Math.min(p.stock ? Object.values(p.stock).reduce((sum, n) => sum + n, 0) : MAX_UNLIMITED, 999),
    image: existsSync(new URL(`../assets/share/${p.id}.jpg`, import.meta.url)) ? `${SITE}/assets/share/${p.id}.jpg` : ''
  }));

// Work out what has to change before touching Stripe.
const plan = [];
for (const w of wanted) {
  const s = saved[w.id];
  if (!s) { if (w.max > 0) plan.push({ w, s, step: 'create' }); continue; }
  if (s.amount !== w.amount) { if (w.max > 0) plan.push({ w, s, step: 'reprice' }); else if (s.active) plan.push({ w, s, step: 'off' }); continue; }
  if (s.name !== w.name || s.description !== w.description || s.image !== w.image) plan.push({ w, s, step: 'product' });
  if (w.max === 0) { if (s.active) plan.push({ w, s, step: 'off' }); }
  else if (s.max !== w.max || !s.active) plan.push({ w, s, step: 'quantity' });
}
for (const [id, s] of Object.entries(saved)) if (s.active && !wanted.some((w) => w.id === id)) plan.push({ w: { id }, s, step: 'off' });

const dollars = (cents) => `$${(cents / 100).toFixed(2)}`;
const describe = ({ w, s, step }) => {
  if (step === 'create') return `make a link for ${w.name} at ${dollars(w.amount)} (up to ${w.max} per order)`;
  if (step === 'reprice') return `${w.name}: price ${dollars(s.amount)} → ${dollars(w.amount)}, new link, old link off`;
  if (step === 'product') return `${w.name}: update the name, description, or photo in Stripe`;
  if (step === 'quantity') return `${w.name}: up to ${w.max} per order${s.active ? '' : ', link back on'}`;
  return `${w.name || w.id}: turn the link off (${w.max === 0 ? 'sold out' : 'no longer listed'})`;
};

if (!plan.length) { console.log(`Stripe: ${Object.values(saved).filter((s) => s.active).length} live links, all up to date.`); process.exit(0); }
if (dryRun) { console.log(`Stripe (dry run): ${plan.length} change(s)\n${plan.map((p) => `  - ${describe(p)}`).join('\n')}`); process.exit(0); }

const key = process.env.STRIPE_SECRET_KEY || readKeychain();
if (!key) {
  console.log(`Stripe: no key saved, so nothing changed. Waiting:\n${plan.map((p) => `  - ${describe(p)}`).join('\n')}\n  Save a restricted live key in the Keychain item "${KEYCHAIN_ITEM}" (see CLAUDE.md), then rebuild.`);
  process.exit(0);
}
if (!/^(sk|rk)_live_/.test(key)) {
  console.log('Stripe: the saved key is not a live key, so nothing changed. The site only shows live links.');
  process.exit(inBuild ? 0 : 1);
}

let failed = 0;
for (const item of plan) {
  try {
    await run(item);
    save();
    console.log(`Stripe: ${describe(item)}. Done.`);
  } catch (error) {
    failed += 1;
    console.error(`Stripe: could not ${describe(item)}: ${error.message}`);
  }
}
if (failed) console.error(`Stripe: ${failed} change(s) failed. Styles without a live link are ordered by email until a rebuild succeeds.`);
process.exit(failed && !inBuild ? 1 : 0);

async function run({ w, s, step }) {
  if (step === 'off') {
    await stripe('POST', `payment_links/${s.link}`, { active: false });
    saved[w.id] = { ...s, active: false };
    return;
  }
  if (step === 'product') {
    await stripe('POST', `products/${s.product}`, productFields(w));
    saved[w.id] = { ...saved[w.id], name: w.name, description: w.description, image: w.image };
    return;
  }
  if (step === 'quantity') {
    const items = await stripe('GET', `payment_links/${s.link}/line_items`);
    await stripe('POST', `payment_links/${s.link}`, { active: true, line_items: [{ id: items.data[0].id, adjustable_quantity: quantity(w) }] });
    saved[w.id] = { ...saved[w.id], max: w.max, active: true };
    return;
  }
  // create or reprice
  let product = s?.product;
  if (!product) {
    const found = await stripe('GET', 'products/search', { query: `metadata['sul_id']:'${w.id}'` });
    product = found.data[0]?.id;
    if (product) await stripe('POST', `products/${product}`, productFields(w));
    else product = (await stripe('POST', 'products', { ...productFields(w), metadata: { sul_id: w.id } }, `sul-product-${w.id}`)).id;
  }
  const price = await stripe('POST', 'prices', { product, unit_amount: w.amount, currency: 'usd', metadata: { sul_id: w.id } }, `sul-price-${product}-${w.amount}`);
  const link = await stripe('POST', 'payment_links', {
    line_items: [{ price: price.id, quantity: 1, adjustable_quantity: quantity(w) }],
    shipping_address_collection: { allowed_countries: ['US'] },
    phone_number_collection: { enabled: true },
    metadata: { sul_id: w.id }
  }, `sul-link-${price.id}-${s?.link || 'first'}`);
  if (s?.link && s.active) await stripe('POST', `payment_links/${s.link}`, { active: false });
  saved[w.id] = { url: link.url, link: link.id, product, price: price.id, amount: w.amount, max: w.max, name: w.name, description: w.description, image: w.image, active: true };
}

function productFields(w) {
  return { name: w.name, description: w.description, images: w.image ? [w.image] : undefined };
}
function quantity(w) {
  return { enabled: true, minimum: 1, maximum: w.max };
}

function readKeychain() {
  if (process.platform !== 'darwin') return '';
  try {
    return execFileSync('security', ['find-generic-password', '-s', KEYCHAIN_ITEM, '-w'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

async function stripe(method, path, params, idempotencyKey) {
  const query = params ? new URLSearchParams(flatten(params)).toString() : '';
  const response = await fetch(`https://api.stripe.com/v1/${path}${method === 'GET' && query ? `?${query}` : ''}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
    },
    body: method === 'GET' ? undefined : query
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error?.message || `HTTP ${response.status}`);
  return json;
}

// Stripe's form encoding: { a: { b: [1] } } becomes a[b][0]=1. An empty string clears a field.
function flatten(value, prefix = '', out = []) {
  for (const [name, item] of Object.entries(value)) {
    const field = prefix ? `${prefix}[${name}]` : name;
    if (item === undefined || item === null) continue;
    if (typeof item === 'object') flatten(item, field, out);
    else out.push([field, String(item)]);
  }
  return out;
}

function save() {
  const rows = Object.keys(saved).sort().map((id) => `  ${JSON.stringify(id)}: ${JSON.stringify(saved[id])}`);
  writeFileSync(FILE, `// Live Stripe Payment Links, one per style, made by scripts/stripe-links.mjs (\`npm run build\` runs it).
// Do not edit by hand: change the catalog and rebuild. Payment Link URLs are public; no keys are kept here.
export const stripeLinks = ${rows.length ? `{\n${rows.join(',\n')}\n}` : '{}'};
`);
}
