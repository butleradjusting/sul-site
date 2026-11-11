// The wake-up call in the homepage hero: an alarm clock that runs on the visitor's own time.
// The clock is the snooze button: each tap runs it nine minutes ahead and stamps U LOSE. Three and it's spent.
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

  const write = (target, text) => { if (target.textContent !== text) target.textContent = text; };

  function render() {
    const shown = new Date(Date.now() + ahead * 60000);
    const hour = shown.getHours();
    const minutes = String(shown.getMinutes()).padStart(2, '0');
    const face = String(hour % 12 || 12).padStart(2, ' ') + minutes;
    // Eight sets of segments: the four digits, then the same four again as their reflection.
    digits.forEach((segments, i) => segments.forEach((segment) => segment.classList.toggle('on', LIT[face[i % 4]].includes(segment.dataset.seg))));
    meridiem.forEach((mark) => mark.classList.toggle('on', (mark.dataset.meridiem === 'PM') === hour >= 12));
    write(time, `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`);
    time.dateTime = `${String(hour).padStart(2, '0')}:${minutes}`;
    if (root.dataset.state === 'awake') write(label, 'Right on time');
    else if (snoozes) write(label, `${ahead} min later`);
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
    slamOver = setTimeout(() => root.classList.remove('is-slammed'), 1500);
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
    roll(lost);
    slam();
    if (!reduced) navigator.vibrate?.([70, 50, 70]);
    write(message, snoozes === 1 ? 'You don’t get them back.'
      : snoozes === 2 ? 'Somebody else is already up.'
      : `${drop.totalSets} sets. Some sizes exist once.`);
    live.textContent = `Snoozed. ${lost} minutes gone. ${message.textContent}`;
    if (snoozes === MAX_SNOOZES) {
      setSnoozable(false);
      write(message, 'Out of snoozes.');
      wakeLink.focus({ preventScroll: true });
    }
    clearTimeout(ringAgain);
    ringAgain = setTimeout(() => { root.dataset.state = 'ringing'; }, 2600); // the alarm does not give up
  });

  // Heading for the drop is waking up. The link still does its job; the clock rewinds behind it.
  function wake() {
    clearTimeout(ringAgain);
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
  write(message, 'Hit snooze');
  setSnoozable(true);
  render();
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => run(entry.isIntersecting && !document.hidden), { threshold: 0.35 }).observe(root);
  else run(true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) run(false); else if (root.getBoundingClientRect().top < innerHeight && root.getBoundingClientRect().bottom > 0) run(true); });
}
