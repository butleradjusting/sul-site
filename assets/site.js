import { catalog, drop, dropLive, imagePath, money, claimLink, sizeGuideFor, measuringNotes, isLiveCheckout, stripeLink, orderEmailLink, maxQuantity } from './catalog.js';

const byId = new Map(catalog.map((product) => [product.id, product]));
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${{
  minus: '<path d="M5 12h14"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>', diagonal: '<path d="M5 19 19 5M5 5h14v14"/>'
}[name]}</svg>`;
const tile = (p, attrs = 'aria-hidden="true"') => `<div class="set-tile${p.tile.band ? ' has-band' : ''}" style="--tile:${p.tile.bg};--tile-ink:${p.tile.ink}${p.tile.band ? `;--tile-band:${p.tile.band}` : ''}" ${attrs}><span class="set-count">${p.pieces}</span><span class="set-word">Piece<br>set</span><span class="set-colorway">${escape(p.colorway)}</span></div>`;
const storageKey = 'sul-bag-v1';
let bag = [];
let toastTimeout;
const toast = (message) => {
  const node = document.getElementById('toast');
  clearTimeout(toastTimeout);
  node.textContent = message;
  node.hidden = false;
  toastTimeout = setTimeout(() => { node.hidden = true; }, 4200);
};
function loadBag() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(data)) return [];
    const clean = new Map();
    for (const item of data) {
      const product = byId.get(item?.id);
      if (!product || !product.sizes.includes(item.size) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) continue;
      const key = `${item.id}:${item.size}`;
      const existing = clean.get(key);
      const quantity = Math.min(maxQuantity(product, item.size), (existing?.quantity || 0) + item.quantity);
      if (quantity > 0) clean.set(key, { id: item.id, size: item.size, quantity });
    }
    return [...clean.values()];
  } catch { return []; }
}
function saveBag() {
  try { localStorage.setItem(storageKey, JSON.stringify(bag)); }
  catch { toast('Your bag is available for this visit. This browser could not save it for later.'); }
  renderBag();
}
function openDialog(id, stack = false) {
  const dialog = document.getElementById(id);
  if (!stack) document.querySelectorAll('dialog[open]').forEach((open) => { if (open !== dialog) open.close(); });
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
function renderBag() {
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.bag-count').forEach((node) => { node.textContent = `(${count})`; });
  document.querySelector('.bag-trigger')?.setAttribute('aria-label', `Open shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  document.getElementById('bag-heading-count').textContent = `(${count})`;
  const content = document.getElementById('bag-items');
  if (!bag.length) {
    content.innerHTML = '<div class="bag-empty"><h3>A little empty.<br>A lot of potential.</h3><p>Find your next piece in the collection. Make it yours.</p><a class="button blue" href="collections.html">Explore the collection' + icon('arrow') + '</a></div>';
  } else {
    content.innerHTML = bag.map((item, index) => {
      const p = byId.get(item.id);
      const thumb = p.image ? `<img src="${imagePath(p.image)}" alt="${escape(p.alt)}" width="85" height="128">` : `<div class="bag-swatch">${tile(p)}</div>`;
      return `<article class="bag-item">${thumb}<div><div class="bag-item-top"><div><h3><a href="${p.id}.html">${escape(p.name)}</a></h3><p>${escape(item.size)} · ${escape(p.color)}</p>${p.stock && item.quantity >= maxQuantity(p, item.size) ? `<p class="bag-limit">Only ${maxQuantity(p, item.size)} made in ${escape(item.size)}</p>` : ''}</div><strong>${money(p.price * item.quantity)}</strong></div><div class="bag-item-controls"><div class="quantity"><button data-quantity="${index}" data-change="-1" aria-label="Decrease quantity of ${escape(p.name)}, ${escape(item.size)}"${item.quantity === 1 ? ' disabled' : ''}>${icon('minus')}</button><span aria-label="Quantity">${item.quantity}</span><button data-quantity="${index}" data-change="1" aria-label="Increase quantity of ${escape(p.name)}, ${escape(item.size)}"${item.quantity >= maxQuantity(p, item.size) ? ' disabled' : ''}>${icon('plus')}</button></div><button class="remove-item" data-remove="${index}" aria-label="Remove ${escape(p.name)}, ${escape(item.size)} from bag">Remove</button></div></div></article>`;
    }).join('');
  }
  document.getElementById('bag-total').textContent = money(bag.reduce((sum, item) => sum + byId.get(item.id).price * item.quantity, 0));
  document.getElementById('preview-checkout').disabled = !bag.length;
  document.getElementById('bag-dialog').classList.toggle('is-empty', !bag.length);
  const preview = document.getElementById('preview-links');
  preview.hidden = true;
  const ids = [...new Set(bag.map((item) => item.id))];
  const paid = ids.filter((id) => isLiveCheckout(byId.get(id).checkout));
  const emailed = bag.filter((item) => !isLiveCheckout(byId.get(item.id).checkout)).map((item) => ({ p: byId.get(item.id), item }));
  preview.innerHTML = paid.map((id) => {
    const p = byId.get(id);
    const items = bag.filter((item) => item.id === id);
    const summary = items.map((item) => `${item.size} × ${item.quantity}`).join(', ');
    return `<a href="${stripeLink(p, items)}" target="_blank" rel="noopener noreferrer">Pay for ${escape(p.name)} (${escape(summary)}) — card via Stripe${icon('diagonal')}</a>`;
  }).join('') + (emailed.length ? `<a href="${orderEmailLink(emailed)}">${paid.length ? 'Order the rest' : 'Send your order'} by email${icon('diagonal')}</a>` : '');
  preview.dataset.paid = String(paid.length);
  preview.dataset.emailed = String(emailed.length);
  document.getElementById('bag-note').textContent = 'Your bag is saved on this device.';
}
function addProduct(button) {
  const p = byId.get(button.dataset.add);
  const region = button.closest('[data-detail]');
  const size = region.querySelector('[data-size][aria-pressed="true"]')?.dataset.size;
  const error = region.querySelector('.inline-error');
  if (!size) {
    error.textContent = 'Choose a size before adding this piece to your bag.';
    region.querySelector('[data-size]').focus();
    return;
  }
  const existing = bag.find((item) => item.id === p.id && item.size === size);
  const max = maxQuantity(p, size);
  if (existing && existing.quantity >= max) {
    error.textContent = p.stock ? `Only ${max} made in ${size}, and your bag already has ${max === 1 ? 'it' : 'them all'}.` : 'Your bag already has 99 of this piece in this size.';
    return;
  }
  if (existing) existing.quantity += 1;
  else bag.push({ id: p.id, size, quantity: 1 });
  saveBag();
  error.textContent = '';
  openDialog('bag-dialog');
}
function claimSet(button) {
  const p = byId.get(button.dataset.claim);
  const region = button.closest('[data-detail]');
  const size = region.querySelector('[data-size][aria-pressed="true"]')?.dataset.size;
  const error = region.querySelector('.inline-error');
  if (!size) {
    error.textContent = 'Choose a size to claim this set.';
    region.querySelector('[data-size]').focus();
    return;
  }
  error.textContent = '';
  toast(`Opening your email app. Send the message to claim the ${p.name} in ${size}.`);
  window.location.href = claimLink(p, size);
}
function openSizeGuide(id) {
  const p = byId.get(id);
  if (!p) return;
  const guide = sizeGuideFor(p);
  const chart = guide.chart
    ? `<table class="size-table"><caption class="sr-only">Body measurements in inches for ${escape(p.name)}</caption><thead><tr>${guide.chart.columns.map((c) => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${guide.chart.rows.map((row) => `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row">${escape(cell)}</th>` : `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="size-guide-foot">${escape(guide.chart.note)} Between sizes? Go by the fit note above.</p><h4 class="small-label">How to measure</h4><dl class="measure-list">${measuringNotes.filter(([k]) => k.split(' / ').some((part) => guide.chart.columns.some((c) => c.toLowerCase() === part.toLowerCase()))).map(([k, v]) => `<div><dt>${escape(k)}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl>`
    : '';
  document.getElementById('size-content').innerHTML = `<p class="small-label size-guide-product">${escape(p.name)}</p><h3>${escape(guide.fit)}.</h3><p class="size-guide-note">${escape(guide.note)}</p>${chart}<p class="size-guide-foot">Still unsure? <a href="mailto:${escape(drop.email)}?subject=${encodeURIComponent(`Sizing: ${p.name}`)}">Email SUL</a> with your measurements and the set you want.</p>`;
  openDialog('size-dialog', true); // stacks over the quick view so closing the guide returns to the size choice
}
function quickView(id) {
  const p = byId.get(id);
  if (!p) return;
  const claiming = p.tile && !dropLive;
  const media = p.image ? `<img class="quick-image${p.tile ? ' quick-image--set' : ''}" src="${imagePath(p.image)}" width="832" height="1248" alt="${escape(p.alt)}">` : `<div class="quick-tile">${tile(p)}</div>`;
  const action = claiming
    ? `<button class="button blue product-add" data-claim="${p.id}"><span>Claim your size</span>${icon('arrow')}</button><p class="quick-claim-note">No payment today. Your claim opens an email to SUL.</p>`
    : `<button class="button blue product-add" data-add="${p.id}"><span>Add to bag — ${money(p.price)}</span>${icon('plus')}</button>`;
  document.getElementById('quick-content').innerHTML = `<div class="quick-body">${media}<section class="quick-summary" data-detail="${p.id}"><h3>${escape(p.name)}</h3><div class="product-price-row"><strong>${money(p.price)}</strong><span class="color-name">${escape(p.color)}${p.quantity ? ` · ${p.quantity} sets made` : ''}</span></div><p class="product-description">${escape(p.description)}</p>${p.id === 'full-kit' ? '<p class="quick-image-note">Hoodie + joggers + tee. Hoodie shown.</p>' : ''}<fieldset class="size-fieldset"><legend class="sr-only">Select your size</legend><div class="size-head"><span>Select your size</span><button type="button" class="size-guide-link" data-size-guide="${p.id}" aria-haspopup="dialog">Size guide</button></div><div class="size-options" role="group" aria-label="Size for ${escape(p.name)}">${p.sizes.map((s) => `<button data-size="${escape(s)}" aria-pressed="${p.sizes.length === 1}">${escape(s)}</button>`).join('')}</div><p class="inline-error" role="status"></p></fieldset>${action}<a class="text-link" href="${p.id}.html">View the details${icon('arrow')}</a></section></div>`;
  openDialog('quick-dialog');
}
async function swapImage(image, name, alt) {
  const src = imagePath(name);
  const request = String(Number(image.dataset.request || 0) + 1);
  image.dataset.request = request;
  image.classList.add('image-loading');
  try {
    const preload = new Image();
    preload.src = src;
    await preload.decode();
    if (image.dataset.request !== request) return;
    image.src = src;
    image.alt = alt;
  } catch { toast('This image could not load. Please try again.'); }
  finally { if (image.dataset.request === request) image.classList.remove('image-loading'); }
}
function applyFilter(shop, category) {
  const cards = [...shop.querySelectorAll('.product-card')];
  cards.forEach((card) => { card.hidden = category !== 'All' && card.dataset.category !== category; });
  shop.querySelectorAll('[data-filter]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.filter === category)); });
  const count = cards.filter((card) => !card.hidden).length;
  const countNode = shop.querySelector('.collection-count');
  if (countNode) countNode.textContent = `${count} ${count === 1 ? 'style' : 'styles'}`;
  shop.querySelector('.shop-empty').hidden = count !== 0;
  const cta = shop.querySelector('.collection-cta');
  if (cta) cta.hidden = category !== 'All';
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  const link = event.target.closest('#menu-dialog a');
  if (link) document.getElementById('menu-dialog').close();
  if (!button) return;
  if (button.dataset.open) { openDialog(button.dataset.open); return; }
  if (button.hasAttribute('data-close')) { button.closest('dialog').close(); return; }
  if (button.dataset.quick) { quickView(button.dataset.quick); return; }
  if (button.dataset.sizeGuide) { openSizeGuide(button.dataset.sizeGuide); return; }
  if (button.dataset.size) {
    const region = button.closest('[data-detail]');
    region.querySelectorAll('[data-size]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    region.querySelector('.inline-error').textContent = '';
    return;
  }
  if (button.dataset.add) { addProduct(button); return; }
  if (button.dataset.claim) { claimSet(button); return; }
  if (button.hasAttribute('data-quantity')) {
    const index = Number(button.dataset.quantity);
    const item = bag[index];
    if (!item) return;
    const change = Number(button.dataset.change);
    item.quantity = Math.max(1, Math.min(maxQuantity(byId.get(item.id), item.size), item.quantity + change));
    saveBag();
    (document.querySelector(`[data-quantity="${index}"][data-change="${change}"]:not(:disabled)`) || document.querySelector(`[data-quantity="${index}"]:not(:disabled)`))?.focus();
    return;
  }
  if (button.hasAttribute('data-remove')) {
    bag.splice(Number(button.dataset.remove), 1);
    saveBag();
    document.querySelector('.remove-item')?.focus();
    if (!bag.length) document.querySelector('#bag-dialog .dialog-close').focus();
    return;
  }
  if (button.id === 'preview-checkout') {
    const preview = document.getElementById('preview-links');
    preview.hidden = false;
    const paid = Number(preview.dataset.paid);
    const emailed = Number(preview.dataset.emailed);
    const notes = [];
    if (paid) notes.push(`Secure card payment by Stripe${paid > 1 ? ', one payment per style' : ''}. Set the same quantity on the Stripe page; your sizes are sent with the payment.`);
    if (emailed) notes.push(`${paid ? 'Pieces without card payment yet are' : 'Your order is'} sent to SUL by email. SUL replies to confirm payment and shipping. No email app? Write to ${drop.email}.`);
    document.getElementById('bag-note').textContent = notes.join(' ');
    const links = preview.querySelectorAll('a');
    links[0]?.focus();
    if (links.length === 1) links[0].click(); // One destination: go straight there. The link stays visible as a fallback.
    return;
  }
  if (button.dataset.filter) { applyFilter(button.closest('[data-shop]'), button.dataset.filter); return; }
  if (button.dataset.view) {
    const shop = button.closest('[data-shop]');
    shop.querySelectorAll('[data-view]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    shop.querySelectorAll('.product-card').forEach((card) => {
      const p = byId.get(card.dataset.product);
      if (!p?.scene || !card.querySelector('.hover-image')) return;
      const scene = button.dataset.view === 'scene';
      swapImage(card.querySelector('.card-main-image'), scene ? p.scene : p.image, scene ? p.sceneAlt : p.alt);
      card.querySelector('.hover-image').hidden = scene;
    });
    return;
  }
  if (button.dataset.gallery) {
    document.querySelectorAll('[data-gallery]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    const galleryImage = document.getElementById('gallery-image');
    galleryImage.classList.toggle('fit-contain', button.dataset.galleryFit === 'contain');
    swapImage(galleryImage, button.dataset.gallery, button.dataset.galleryAlt);
    const enlarge = document.querySelector('.gallery-enlarge');
    enlarge.dataset.enlarge = button.dataset.gallery;
    enlarge.dataset.alt = button.dataset.galleryAlt;
    const concept = button.dataset.galleryConcept === 'true';
    enlarge.dataset.concept = concept;
    const tag = document.getElementById('gallery-tag');
    if (tag) tag.hidden = !concept;
    if (button.dataset.galleryNote) document.getElementById('gallery-note').textContent = button.dataset.galleryNote;
    return;
  }
  if (button.dataset.enlarge) {
    const image = document.getElementById('enlarged-image');
    image.src = imagePath(button.dataset.enlarge);
    document.getElementById('enlarged-note').hidden = button.dataset.concept !== 'true';
    image.alt = button.dataset.alt;
    openDialog('image-dialog');
    return;
  }
  if (button.dataset.study) {
    document.querySelectorAll('[data-study]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    swapImage(document.getElementById('studio-image'), button.dataset.study, button.dataset.studyAlt);
    return;
  }
  if (button.dataset.printImage) {
    const card = button.closest('.print-card');
    card.querySelectorAll('[data-print-image]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    swapImage(card.querySelector('.print-image img'), button.dataset.printImage, button.dataset.printAlt);
    card.querySelector('.print-image').dataset.enlarge = button.dataset.printImage;
    card.querySelector('.print-image').dataset.alt = button.dataset.printAlt;
    return;
  }
  if (button.dataset.campaign) {
    const city = button.dataset.campaign === 'city';
    document.querySelectorAll('[data-campaign]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    swapImage(document.getElementById('campaign-image'), button.dataset.campaign, city ? 'SUL white and maroon sweatsuit worn on a city street' : 'SUL white and maroon sweatsuit worn outdoors among trees');
    document.getElementById('campaign-caption').textContent = city ? 'SUL in the city.' : 'SUL, off the clock.';
  }
});
document.getElementById('sort-products')?.addEventListener('change', (event) => {
  const grid = document.querySelector('.collection-page .product-grid');
  const cards = [...grid.querySelectorAll('.product-card')];
  const value = event.target.value;
  const original = new Map(catalog.map((p, index) => [p.id, index]));
  cards.sort((a, b) => value === 'price-low' ? Number(a.dataset.price) - Number(b.dataset.price) : value === 'price-high' ? Number(b.dataset.price) - Number(a.dataset.price) : original.get(a.dataset.product) - original.get(b.dataset.product));
  const cta = grid.querySelector('.collection-cta');
  cards.forEach((card) => { grid.insertBefore(card, cta); });
});
window.addEventListener('storage', (event) => { if (event.key === storageKey) { bag = loadBag(); renderBag(); } });
// Back and Forward can bring this page back from memory without running this script again. Safari sends no
// storage event for what changed meanwhile, so the bag is read again. Without it, the page showed the old
// bag and the next add saved over whatever was added on the page in between.
window.addEventListener('pageshow', (event) => { if (event.persisted) { bag = loadBag(); renderBag(); } });
bag = loadBag();
renderBag();

// The header stays reachable: during the homepage flight it tucks away on the way down and returns on the way up.
const siteHeader = document.querySelector('.site-header');
const worldAct = document.querySelector('.ring-act');
let lastScroll = window.scrollY;
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    if (Math.abs(y - lastScroll) > 6) {
      // Only the 3D flight hides the header. Everywhere else the bag stays in reach.
      const flying = worldAct && document.documentElement.classList.contains('world') && worldAct.getBoundingClientRect().bottom > innerHeight * 0.5;
      siteHeader.classList.toggle('is-tucked', Boolean(flying) && y > lastScroll && y > 320);
      lastScroll = y;
    }
    scrollQueued = false;
  });
}, { passive: true });

// On phones the buy action stays in reach whenever the page's own button is off screen.
const buyBarNode = document.getElementById('buy-bar');
const mainAdd = document.querySelector('main .product-add');
if (buyBarNode && mainAdd && 'IntersectionObserver' in window) {
  const inView = new Set();
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target); });
    buyBarNode.hidden = inView.size > 0;
  });
  [mainAdd, document.querySelector('.site-footer')].forEach((node) => watcher.observe(node));
  document.getElementById('buy-bar-action').addEventListener('click', () => mainAdd.click());
}
