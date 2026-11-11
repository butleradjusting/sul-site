// The wake-up call on the homepage (#story): an alarm clock that runs on the visitor's own time.
// Snooze fast-forwards nine minutes and stamps U LOSE. Wake up rewinds to now and points back to the drop.
// Without this script the clock rests at 6:00 and "Wake up" is a plain link to the drop.
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
  const seconds = root.querySelector('.alarm-seconds');
  const [time, label, date, message, live, controls, next, snooze, wake, reset] = ['alarm-time', 'alarm-label', 'alarm-date', 'alarm-message', 'alarm-live', 'alarm-controls', 'alarm-next', 'alarm-snooze', 'alarm-wake', 'alarm-reset'].map(node);
  const zone = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value;
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  let snoozes = 0;
  let ahead = 0; // minutes the display runs ahead of the real time while snoozed
  let rolling = 0;
  let ticking = 0;
  let ringAgain = 0;
  let slamOver = 0;

  const greeting = (hour) => (hour < 5 ? 'Still up? Good. This is your hour.'
    : hour < 9 ? 'Up before the alarm. That’s the mindset.'
    : hour < 12 ? 'Morning’s moving. Move with it.'
    : hour < 17 ? 'Midday. Still time to make your move.'
    : hour < 21 ? 'Golden hour. Step out.'
    : 'After hours. Don’t sleep on style.');
  const write = (target, text) => { if (target.textContent !== text) target.textContent = text; };

  function render() {
    const now = new Date();
    const shown = new Date(now.getTime() + ahead * 60000);
    const hour = shown.getHours();
    const minutes = String(shown.getMinutes()).padStart(2, '0');
    const face = String(hour % 12 || 12).padStart(2, ' ') + minutes;
    // Eight sets of segments: the four digits, then the same four again as their reflection.
    digits.forEach((segments, i) => segments.forEach((segment) => segment.classList.toggle('on', LIT[face[i % 4]].includes(segment.dataset.seg))));
    meridiem.forEach((mark) => mark.classList.toggle('on', (mark.dataset.meridiem === 'PM') === hour >= 12));
    seconds.style.setProperty('--s', now.getSeconds());
    write(time, `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`);
    time.dateTime = `${String(hour).padStart(2, '0')}:${minutes}`;
    write(date, day.format(now));
    if (root.dataset.state === 'awake') write(label, 'Right on time');
    else if (snoozes) write(label, `${ahead} min later`);
    else {
      write(label, `Your time${zone ? ` · ${zone}` : ''}`);
      write(message, greeting(now.getHours()));
    }
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

  function ring() {
    root.dataset.state = 'ringing';
  }

  function slam() {
    clearTimeout(slamOver);
    root.classList.remove('is-slammed');
    void root.offsetWidth; // lets the stamp play again on the next press
    root.classList.add('is-slammed');
    slamOver = setTimeout(() => root.classList.remove('is-slammed'), 1500);
  }

  snooze.hidden = false;
  snooze.addEventListener('click', () => {
    if (snoozes >= MAX_SNOOZES) return;
    snoozes += 1;
    const lost = snoozes * SNOOZE_MINUTES;
    root.dataset.state = 'snoozed';
    roll(lost);
    slam();
    if (!reduced) navigator.vibrate?.([70, 50, 70]);
    write(message, snoozes === 1 ? `${lost} minutes gone. You don’t get them back.`
      : snoozes === 2 ? `${lost} minutes gone. Somebody else is already up.`
      : `${lost} minutes gone. ${drop.totalSets} sets made. Some sizes exist once.`);
    live.textContent = `Snoozed. ${message.textContent}`;
    if (snoozes === MAX_SNOOZES) {
      snooze.disabled = true;
      snooze.firstChild.textContent = 'Out of snoozes';
      snooze.querySelector('small').hidden = true;
      wake.focus({ preventScroll: true });
    }
    clearTimeout(ringAgain);
    ringAgain = setTimeout(ring, 2600); // the alarm does not give up
  });

  wake.addEventListener('click', (event) => {
    event.preventDefault();
    clearTimeout(ringAgain);
    clearTimeout(slamOver);
    root.classList.remove('is-slammed');
    root.dataset.state = 'awake';
    roll(0);
    write(message, dropLive ? 'You’re up. The drop is live.' : 'You’re up. The drop lands soon.');
    live.textContent = message.textContent;
    controls.hidden = true;
    next.hidden = false;
    next.querySelector('a').focus({ preventScroll: true });
  });

  reset.addEventListener('click', () => {
    snoozes = 0;
    snooze.disabled = false;
    snooze.firstChild.textContent = 'Snooze';
    snooze.querySelector('small').hidden = false;
    next.hidden = true;
    controls.hidden = false;
    live.textContent = 'Alarm set again.';
    roll(0);
    ring();
    render();
    wake.focus({ preventScroll: true });
  });

  // The clock only runs, and only rings, while it is on screen.
  const tick = () => { render(); ticking = setTimeout(tick, 1000 - (Date.now() % 1000) + 4); };
  const run = (on) => {
    clearTimeout(ticking);
    root.classList.toggle('is-live', on);
    if (on) tick();
  };
  render();
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => run(entry.isIntersecting && !document.hidden), { threshold: 0.35 }).observe(root);
  else run(true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) run(false); else if (root.getBoundingClientRect().top < innerHeight && root.getBoundingClientRect().bottom > 0) run(true); });
}
