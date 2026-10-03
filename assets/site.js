import { products, imagePath, money } from './catalog.js';

const byId = new Map(products.map((product) => [product.id, product]));
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${{
  minus: '<path d="M5 12h14"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>', diagonal: '<path d="M5 19 19 5M5 5h14v14"/>'
}[name]}</svg>`;
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
      clean.set(key, { id: item.id, size: item.size, quantity: Math.min(99, (existing?.quantity || 0) + item.quantity) });
    }
    return [...clean.values()];
  } catch { return []; }
}
function saveBag() {
  try { localStorage.setItem(storageKey, JSON.stringify(bag)); }
  catch { toast('Your bag is available for this visit. This browser could not save it for later.'); }
  renderBag();
}
function openDialog(id) {
  const dialog = document.getElementById(id);
  document.querySelectorAll('dialog[open]').forEach((open) => { if (open !== dialog) open.close(); });
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
    content.innerHTML = '<div class="bag-empty"><h3>A little empty.<br>A lot of potential.</h3><p>Find your next piece in the collection. Make it yours.</p><a class="button wine" href="collections.html">Explore the collection' + icon('arrow') + '</a></div>';
  } else {
    content.innerHTML = bag.map((item, index) => {
      const p = byId.get(item.id);
      return `<article class="bag-item"><img src="${imagePath(p.image)}" alt="${escape(p.alt)}" width="85" height="128"><div><div class="bag-item-top"><div><h3><a href="${p.id}.html">${escape(p.name)}</a></h3><p>${escape(item.size)} · ${escape(p.color)}</p></div><strong>${money(p.price * item.quantity)}</strong></div><div class="bag-item-controls"><div class="quantity"><button data-quantity="${index}" data-change="-1" aria-label="Decrease quantity of ${escape(p.name)}, ${escape(item.size)}"${item.quantity === 1 ? ' disabled' : ''}>${icon('minus')}</button><span aria-label="Quantity">${item.quantity}</span><button data-quantity="${index}" data-change="1" aria-label="Increase quantity of ${escape(p.name)}, ${escape(item.size)}"${item.quantity === 99 ? ' disabled' : ''}>${icon('plus')}</button></div><button class="remove-item" data-remove="${index}" aria-label="Remove ${escape(p.name)}, ${escape(item.size)} from bag">Remove</button></div></div></article>`;
    }).join('');
  }
  document.getElementById('bag-total').textContent = money(bag.reduce((sum, item) => sum + byId.get(item.id).price * item.quantity, 0));
  document.getElementById('preview-checkout').disabled = !bag.length;
  const preview = document.getElementById('preview-links');
  preview.hidden = true;
  preview.innerHTML = [...new Set(bag.map((item) => item.id))].map((id) => {
    const p = byId.get(id);
    return `<a href="${p.checkout}" target="_blank" rel="noopener noreferrer">${escape(p.name)} — test checkout${icon('diagonal')}</a>`;
  }).join('');
  document.getElementById('bag-note').textContent = 'Payments are in test mode. Your bag is saved on this device.';
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
  if (existing && existing.quantity === 99) { error.textContent = 'Your bag already has 99 of this piece in this size.'; return; }
  if (existing) existing.quantity += 1;
  else bag.push({ id: p.id, size, quantity: 1 });
  saveBag();
  error.textContent = '';
  openDialog('bag-dialog');
}
function quickView(id) {
  const p = byId.get(id);
  if (!p) return;
  document.getElementById('quick-content').innerHTML = `<div class="quick-body"><img class="quick-image" src="${imagePath(p.image)}" width="832" height="1248" alt="${escape(p.alt)}"><section class="quick-summary" data-detail="${p.id}"><h3>${escape(p.name)}</h3><div class="product-price-row"><strong>${money(p.price)}</strong><span class="color-name">${escape(p.color)}</span></div><p class="product-description">${escape(p.description)}</p>${p.id === 'full-kit' ? '<p class="quick-image-note">Hoodie + joggers + tee. Hoodie shown.</p>' : ''}<fieldset class="size-fieldset"><legend>Select your size</legend><div class="size-options" role="group" aria-label="Size for ${escape(p.name)}">${p.sizes.map((s) => `<button data-size="${escape(s)}" aria-pressed="${p.sizes.length === 1}">${escape(s)}</button>`).join('')}</div><p class="inline-error" role="status"></p></fieldset><button class="button wine product-add" data-add="${p.id}"><span>Add to bag — ${money(p.price)}</span>${icon('plus')}</button><a class="text-link" href="${p.id}.html">View the details${icon('arrow')}</a></section></div>`;
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
  if (countNode) countNode.textContent = `${count} ${count === 1 ? 'piece' : 'pieces'}`;
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
  if (button.dataset.size) {
    const region = button.closest('[data-detail]');
    region.querySelectorAll('[data-size]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    region.querySelector('.inline-error').textContent = '';
    return;
  }
  if (button.dataset.add) { addProduct(button); return; }
  if (button.hasAttribute('data-quantity')) {
    const index = Number(button.dataset.quantity);
    const item = bag[index];
    if (!item) return;
    const change = Number(button.dataset.change);
    item.quantity = Math.max(1, Math.min(99, item.quantity + change));
    saveBag();
    document.querySelector(`[data-quantity="${index}"][data-change="${change}"]:not(:disabled)`)?.focus();
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
    document.getElementById('preview-links').hidden = false;
    document.getElementById('bag-note').textContent = 'These existing Stripe links are for testing individual products. Bag sizes and quantities are not passed to Stripe. No live order will be placed.';
    document.querySelector('#preview-links a')?.focus();
    return;
  }
  if (button.dataset.filter) { applyFilter(button.closest('[data-shop]'), button.dataset.filter); return; }
  if (button.dataset.view) {
    const shop = button.closest('[data-shop]');
    shop.querySelectorAll('[data-view]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    shop.querySelectorAll('.product-card').forEach((card) => {
      const p = byId.get(card.dataset.product);
      const scene = button.dataset.view === 'scene';
      swapImage(card.querySelector('.card-main-image'), scene ? p.scene : p.image, scene ? p.sceneAlt : p.alt);
      card.querySelector('.hover-image').hidden = scene;
    });
    return;
  }
  if (button.dataset.gallery) {
    document.querySelectorAll('[data-gallery]').forEach((node) => { node.setAttribute('aria-pressed', String(node === button)); });
    swapImage(document.getElementById('gallery-image'), button.dataset.gallery, button.dataset.galleryAlt);
    const enlarge = document.querySelector('.gallery-enlarge');
    enlarge.dataset.enlarge = button.dataset.gallery;
    enlarge.dataset.alt = button.dataset.galleryAlt;
    return;
  }
  if (button.dataset.enlarge) {
    const image = document.getElementById('enlarged-image');
    image.src = imagePath(button.dataset.enlarge);
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
  const original = new Map(products.map((p, index) => [p.id, index]));
  cards.sort((a, b) => value === 'price-low' ? Number(a.dataset.price) - Number(b.dataset.price) : value === 'price-high' ? Number(b.dataset.price) - Number(a.dataset.price) : original.get(a.dataset.product) - original.get(b.dataset.product));
  const cta = grid.querySelector('.collection-cta');
  cards.forEach((card) => { grid.insertBefore(card, cta); });
});
window.addEventListener('storage', (event) => { if (event.key === storageKey) { bag = loadBag(); renderBag(); } });
bag = loadBag();
renderBag();
