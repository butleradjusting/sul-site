// The wake-up call in the homepage hero: an alarm clock that runs on the visitor's own time.
// The clock is the snooze button. Each tap blows the digits apart, sends a shockwave through the hero, knocks the
// 3D logo into a spin (src/world.js listens for sul:snooze), stamps U LOSE, and puts the digits back nine minutes
// later. Each snooze hits harder. Three and it's spent.
// Any link to the drop wakes it: the clock rewinds to the real time.
// Without this script the clock rests at 6:00 and does nothing.
import { drop, dropLive } from './catalog.js';

const root = document.getElementById('alarm');
if (root) {
  const LIT = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', ' ': '' };
  const SNOOZE_MINUTES = 9;
  const MAX_SNOOZES = 3;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const node = (id) => document.getElementById(id);
  const digits = [...root.querySelectorAll('[data-digit]')].map((digit) => [...digit.querySelectorAll('[data-seg]')]);
  const meridiem = [...root.querySelectorAll('[data-meridiem]')];
  const [time, label, message, live, snooze, wakeLink] = ['alarm-time', 'alarm-label', 'alarm-message', 'alarm-live', 'alarm-snooze', 'alarm-wake'].map(node);
  const zone = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value;

  let snoozes = 0;
  let ahead = 0; // minutes the display runs ahead of the real time while snoozed
  let rolling = 0;
  let ticking = 0;
  let ringAgain = 0;
  let slamOver = 0;
  let rejoin = 0;
  let holding = false; // the digits are in pieces; the ticking clock leaves them alone
  const display = root.querySelector('.alarm-display');
  const stage = root.closest('.act-stage');

  const write = (target, text) => { if (target.textContent !== text) target.textContent = text; };

  function render() {
    const shown = new Date(Date.now() + ahead * 60000);
    const hour = shown.getHours();
    const minutes = String(shown.getMinutes()).padStart(2, '0');
    const face = String(hour % 12 || 12).padStart(2, ' ') + minutes;
    // Eight sets of segments: the four digits, then the same four again as their reflection.
    if (!holding) digits.forEach((segments, i) => segments.forEach((segment) => segment.classList.toggle('on', LIT[face[i % 4]].includes(segment.dataset.seg))));
    meridiem.forEach((mark) => mark.classList.toggle('on', (mark.dataset.meridiem === 'PM') === hour >= 12));
    write(time, `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`);
    time.dateTime = `${String(hour).padStart(2, '0')}:${minutes}`;
    if (root.dataset.state === 'awake') write(label, 'Right on time');
    else if (snoozes >= MAX_SNOOZES) write(label, 'Out of snoozes');
    else if (snoozes) write(label, `${snoozes * SNOOZE_MINUTES} min later`);
    else write(label, `Your time${zone ? ` · ${zone}` : ''}`);
  }

  // Runs the display forward or back one minute at a time, so losing nine minutes is something you watch happen.
  function roll(target) {
    clearInterval(rolling);
    if (reduced || ahead === target) { ahead = target; render(); return; }
    const step = Math.sign(target - ahead);
    rolling = setInterval(() => {
      ahead += step;
      render();
      if (ahead === target) clearInterval(rolling);
    }, Math.max(20, 540 / Math.abs(target - ahead)));
  }

  function slam() {
    clearTimeout(slamOver);
    root.classList.remove('is-slammed');
    void root.offsetWidth; // lets the stamp play again on the next tap
    root.classList.add('is-slammed');
    slamOver = setTimeout(() => root.classList.remove('is-slammed'), reduced ? 1500 : 1150);
  }

  // One flight per segment, shared by a segment and its reflection: the reflection is the same polygon in a
  // mirrored group, so the same move mirrors on the floor by itself.
  const rand = (a, b) => a + Math.random() * (b - a);
  const flights = (power) => digits.slice(0, 4).map((segments) => segments.map(() => ({ x: rand(-1, 1) * 300 * power, y: rand(-1.15, 0.35) * 230 * power, r: rand(-260, 260), s: rand(0.15, 0.6) })));
  const away = (f) => `translate(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px) rotate(${f.r.toFixed(0)}deg) scale(${f.s.toFixed(2)})`;
  const settle = () => digits.forEach((segments) => segments.forEach((segment) => segment.getAnimations().forEach((a) => a.cancel())));
  function shards(out, power) {
    if (!out) settle(); // the pieces of the old time go; the new time flies in
    const plan = flights(power);
    digits.forEach((segments, i) => segments.forEach((segment, j) => {
      if (!segment.classList.contains('on')) return;
      const frames = [{ transform: 'none', opacity: 1 }, { transform: away(plan[i % 4][j]), opacity: 0 }];
      segment.animate(out ? frames : frames.reverse(), out
        ? { duration: 460 + Math.random() * 160, easing: 'cubic-bezier(.12,.8,.3,1)', fill: 'forwards' }
        : { duration: 560, delay: Math.random() * 90, easing: 'cubic-bezier(.34,1.5,.6,1)', fill: 'backwards' });
    }));
  }

  // A ring of light from the clock across the whole hero, under the words.
  function shockwave(power) {
    if (!stage) return;
    const at = display.getBoundingClientRect();
    const frame = stage.getBoundingClientRect();
    const x = at.left + at.width / 2 - frame.left;
    const y = at.top + at.height * 0.34 - frame.top; // the middle of the digits; the rest is reflection
    const reach = Math.hypot(Math.max(x, frame.width - x), Math.max(y, frame.height - y));
    [[0, 1, 1], [110, 0.55, 0.8]].forEach(([delay, strength, size]) => {
      const ring = document.createElement('span');
      ring.className = 'alarm-wave';
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      stage.append(ring);
      ring.animate([
        { transform: 'translate(-50%, -50%) scale(.04)', opacity: strength },
        { transform: `translate(-50%, -50%) scale(${((reach * 2.1 * size) / 100).toFixed(2)})`, opacity: 0 },
      ], { duration: 900 + power * 120, delay, easing: 'cubic-bezier(.08,.7,.25,1)', fill: 'backwards' }).finished.then(() => ring.remove(), () => ring.remove());
    });
  }

  function shake(power) {
    if (!stage) return;
    const k = 6 * power;
    stage.animate([
      { transform: 'none' },
      { transform: `translate(${-k}px, ${k * 0.5}px) rotate(-.35deg)` },
      { transform: `translate(${k * 0.85}px, ${-k * 0.6}px) rotate(.3deg)` },
      { transform: `translate(${-k * 0.55}px, ${k * 0.35}px) rotate(-.15deg)` },
      { transform: `translate(${k * 0.25}px, ${-k * 0.15}px)` },
      { transform: 'none' },
    ], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' });
  }

  function setSnoozable(on) {
    snooze.disabled = !on;
    wakeLink.hidden = on;
  }

  snooze.addEventListener('click', () => {
    if (snoozes >= MAX_SNOOZES) return;
    snoozes += 1;
    const lost = snoozes * SNOOZE_MINUTES;
    root.dataset.state = 'snoozed';
    clearInterval(rolling);
    clearTimeout(rejoin);
    slam();
    if (reduced) { ahead = lost; render(); }
    else {
      const power = 1 + (snoozes - 1) * 0.35; // each snooze hits harder
      holding = false;
      settle();
      render();
      shards(true, power);
      holding = true;
      shockwave(power);
      shake(power);
      dispatchEvent(new CustomEvent('sul:snooze', { detail: { power } }));
      navigator.vibrate?.([25, 35, 90]);
      rejoin = setTimeout(() => { holding = false; ahead = lost; render(); shards(false, 0.7); }, 720);
    }
    write(message, snoozes === 1 ? 'You don’t get them back.'
      : snoozes === 2 ? 'Somebody else is up.'
      : `${drop.totalSets} sets. Some sizes exist once.`);
    live.textContent = `Snoozed. ${lost} minutes gone. ${message.textContent}`;
    if (snoozes === MAX_SNOOZES) {
      setSnoozable(false);
      write(message, '');
      render();
      wakeLink.focus({ preventScroll: true });
    }
    clearTimeout(ringAgain);
    ringAgain = setTimeout(() => { root.dataset.state = 'ringing'; }, 2600); // the alarm does not give up
  });

  // Heading for the drop is waking up. The link still does its job; the clock rewinds behind it.
  function wake() {
    clearTimeout(ringAgain);
    clearTimeout(rejoin);
    holding = false;
    settle();
    clearTimeout(slamOver);
    root.classList.remove('is-slammed');
    root.dataset.state = 'awake';
    snoozes = 0;
    setSnoozable(true);
    roll(0);
    write(message, dropLive ? 'You’re up. The drop is live.' : 'You’re up. The drop lands soon.');
    live.textContent = message.textContent;
  }
  document.addEventListener('click', (event) => { if (event.target.closest?.('a[href="#drop"], a[href="index.html#drop"]')) wake(); });

  // The clock only runs while it is on screen.
  const tick = () => { render(); ticking = setTimeout(tick, 1000 - (Date.now() % 1000) + 4); };
  const run = (on) => {
    clearTimeout(ticking);
    root.classList.toggle('is-live', on);
    if (on) tick();
  };
  write(message, 'Snooze if you dare');
  setSnoozable(true);
  render();
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => run(entry.isIntersecting && !document.hidden), { threshold: 0.35 }).observe(root);
  else run(true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) run(false); else if (root.getBoundingClientRect().top < innerHeight && root.getBoundingClientRect().bottom > 0) run(true); });
}
