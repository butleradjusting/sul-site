// Shared motion for every page: smooth scroll, depth on cards, magnetic buttons, and the homepage world loader.
import Lenis from 'lenis';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Smooth scroll on mouse and trackpad only. Phones keep their native scroll.
if (!reduced && fine) {
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { duration: 2.2 }, prevent: (node) => !!node.closest?.('dialog, .print-grid') });
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.querySelectorAll('dialog').forEach((dialog) => {
    new MutationObserver(() => { if (document.querySelector('dialog[open]')) lenis.stop(); else lenis.start(); }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
}

if (fine && !reduced) {
  // Cards tilt toward the pointer, with light that follows it.
  document.addEventListener('pointermove', (event) => {
    const tilt = event.target.closest?.('.product-image-link, .gallery-main, .print-image');
    if (!tilt) return;
    const box = tilt.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    tilt.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
    tilt.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`);
    tilt.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    tilt.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    tilt.classList.add('is-tilting');
  }, { passive: true });
  document.addEventListener('pointerout', (event) => {
    const tilt = event.target.closest?.('.is-tilting');
    if (tilt && !tilt.contains(event.relatedTarget)) tilt.classList.remove('is-tilting');
  }, { passive: true });

  // Primary buttons lean toward the pointer.
  document.addEventListener('pointermove', (event) => {
    const button = event.target.closest?.('.button');
    if (!button || button.disabled) return;
    const box = button.getBoundingClientRect();
    button.style.setProperty('--tx', `${(((event.clientX - box.left) / box.width - 0.5) * 8).toFixed(1)}px`);
    button.style.setProperty('--ty', `${(((event.clientY - box.top) / box.height - 0.5) * 6).toFixed(1)}px`);
  }, { passive: true });
  document.addEventListener('pointerout', (event) => {
    const button = event.target.closest?.('.button');
    if (button && !button.contains(event.relatedTarget)) { button.style.removeProperty('--tx'); button.style.removeProperty('--ty'); }
  }, { passive: true });
}

// The chrome logo in the footer catches light as the page moves.
const sheen = document.querySelector('.footer-logo');
if (sheen && !reduced && 'IntersectionObserver' in window) {
  let on = false;
  new IntersectionObserver(([entry]) => { on = entry.isIntersecting; }).observe(sheen);
  addEventListener('scroll', () => { if (on) sheen.style.setProperty('--sheen', `${((scrollY * 0.12) % 200).toFixed(1)}%`); }, { passive: true });
}

// The homepage world loads after first paint, so shopping never waits on it.
if (document.documentElement.classList.contains('world')) {
  const path = './world.js';
  import(path).catch((error) => {
    console.warn('SUL world did not load:', error);
    document.documentElement.classList.remove('world', 'world-ready');
    document.getElementById('world')?.remove();
  });
}
