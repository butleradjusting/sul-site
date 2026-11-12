// The wake-up call in the homepage hero: an alarm clock that runs on the visitor's own time.
// The clock is the snooze button, and it never runs out. Each tap hits harder, up to the third:
// - the lit digits blow apart in a spray of sparks, a flash and two rings of light cross the hero, the headline glitches
//   and the hero shakes;
// - U LOSE slams down, and the digits fly back in nine minutes later;
// - the 3D logo answers (src/world.js listens for sul:snooze). Without the 3D, the poster logo spins instead;
// - a short smash plays through Web Audio (an iPhone on silent stays silent), and phones that allow it give a tap.
// After three snoozes the Wake up link appears. Any link to the drop wakes the clock: it rewinds to the real time.
// It is all plain DOM, canvas 2D and Web Audio, so it runs on every browser, 3D or not.
// With reduced motion only the time and the stamp change. Without this script the clock rests at 6:00 and does nothing.
import { drop, dropLive } from './catalog.js';

const root = document.getElementById('alarm');
if (root) {
  const LIT = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', ' ': '' };
  const SNOOZE_MINUTES = 9;
  const WAKE_AFTER = 3; // snoozes before the Wake up link shows
  const MAX_POWER = 1.8; // the third snooze and every one after it
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const node = (id) => document.getElementById(id);
  const digits = [...root.querySelectorAll('[data-digit]')].map((digit) => [...digit.querySelectorAll('[data-seg]')]);
  const meridiem = [...root.querySelectorAll('[data-meridiem]')];
  const [time, label, message, live, snooze, wakeLink, title] = ['alarm-time', 'alarm-label', 'alarm-message', 'alarm-live', 'alarm-snooze', 'alarm-wake', 'hero-title'].map(node);
  const zone = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value;
  const display = root.querySelector('.alarm-display');
  const stage = root.closest('.act-stage');
  const poster = document.querySelector('.hero-poster');

  let snoozes = 0;
  let ahead = 0; // minutes the display runs ahead of the real time while snoozed
  let rolling = 0;
  let ticking = 0;
  let ringAgain = 0;
  let slamOver = 0;
  let rejoin = 0;
  let holding = false; // the digits are in pieces; the ticking clock leaves them alone

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
    else if (snoozes) write(label, `${snoozes * SNOOZE_MINUTES} min later`);
    else write(label, `Your time${zone ? ` · ${zone}` : ''}`);
  }

  // Runs the display forward or back so losing the time is something you watch happen. Big gaps move in bigger
  // steps, so even a long run of snoozes rewinds in about half a second.
  function roll(target) {
    clearInterval(rolling);
    if (reduced || ahead === target) { ahead = target; render(); return; }
    const size = Math.max(1, Math.ceil(Math.abs(target - ahead) / 27));
    const steps = Math.ceil(Math.abs(target - ahead) / size);
    rolling = setInterval(() => {
      ahead += Math.sign(target - ahead) * Math.min(size, Math.abs(target - ahead));
      render();
      if (ahead === target) clearInterval(rolling);
    }, Math.max(20, 540 / steps));
  }

  function slam() {
    clearTimeout(slamOver);
    root.classList.remove('is-slammed');
    void root.offsetWidth; // lets the stamp play again on the next tap
    root.classList.add('is-slammed');
    slamOver = setTimeout(() => root.classList.remove('is-slammed'), reduced ? 1500 : 1150);
  }

  // ------------------------------------------------------------------ shards
  // One flight per segment, shared by a segment and its reflection: the reflection is the same polygon in a
  // mirrored group, so the same move mirrors on the floor by itself.
  const rand = (a, b) => a + Math.random() * (b - a);
  const flights = (power) => digits.slice(0, 4).map((segments) => segments.map(() => ({ x: rand(-1, 1) * 300 * power, y: rand(-1.15, 0.35) * 230 * power, r: rand(-260, 260), s: rand(0.15, 0.6) })));
  const away = (f) => `translate(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px) rotate(${f.r.toFixed(0)}deg) scale(${f.s.toFixed(2)})`;
  const settle = () => digits.forEach((segments) => segments.forEach((segment) => segment.getAnimations().forEach((a) => a.cancel())));
  const litPieces = () => digits.slice(0, 4).flat().filter((segment) => segment.classList.contains('on')).map((segment) => segment.getBoundingClientRect());
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

  // Where the hit lands, in the hero stage's own pixels: the middle of the digits (the rest is reflection).
  function impact() {
    const at = display.getBoundingClientRect();
    const frame = stage.getBoundingClientRect();
    return { x: at.left + at.width / 2 - frame.left, y: at.top + at.height * 0.34 - frame.top, frame };
  }

  // ------------------------------------------------------------------ sparks
  // A 2D canvas laid over the hero for the length of the burst. Sparks leave from every lit segment, streak, fall
  // and cool from white to royal blue; a few glow as embers.
  let sky = null;
  let pen = null;
  let ember = null;
  let sparks = [];
  let sparkFrame = 0;
  let sparkClock = 0;
  let scale = 1;
  function sparkLayer() {
    if (!sky) {
      sky = document.createElement('canvas');
      sky.className = 'alarm-sparks';
      sky.setAttribute('aria-hidden', 'true');
      pen = sky.getContext('2d');
      ember = document.createElement('canvas');
      ember.width = ember.height = 64;
      const e = ember.getContext('2d');
      const glow = e.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.16, '#d6e1ff');
      glow.addColorStop(0.42, '#4d7dff66');
      glow.addColorStop(1, '#4d7dff00');
      e.fillStyle = glow;
      e.fillRect(0, 0, 64, 64);
    }
    if (!sky.isConnected) stage.append(sky);
    const frame = stage.getBoundingClientRect();
    scale = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(frame.width * scale);
    const h = Math.round(frame.height * scale);
    if (sky.width !== w || sky.height !== h) { sky.width = w; sky.height = h; }
    return frame;
  }
  function burst(pieces, power) {
    const frame = sparkLayer();
    if (!pen) return;
    const each = Math.round((coarse ? 9 : 15) * power);
    pieces.forEach((r) => {
      const cx = r.left + r.width / 2 - frame.left;
      const cy = r.top + r.height / 2 - frame.top;
      for (let i = 0; i < each; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = rand(180, 900) * (0.6 + power * 0.4);
        sparks.push({
          x: cx + rand(-0.5, 0.5) * r.width, y: cy + rand(-0.5, 0.5) * r.height,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(80, 320),
          age: 0, life: rand(0.45, 1.2), w: rand(0.8, 2.4), hot: Math.random() < 0.3, ember: Math.random() < 0.06,
        });
      }
    });
    if (sparks.length > 900) sparks.splice(0, sparks.length - 900);
    if (!sparkFrame) { sparkClock = performance.now(); sparkFrame = requestAnimationFrame(drawSparks); }
  }
  function drawSparks(now) {
    const dt = Math.min(0.05, (now - sparkClock) / 1000);
    sparkClock = now;
    pen.setTransform(1, 0, 0, 1, 0, 0);
    pen.clearRect(0, 0, sky.width, sky.height);
    sparks = sparks.filter((s) => (s.age += dt) < s.life);
    if (!sparks.length) { sparkFrame = 0; sky.remove(); return; }
    pen.setTransform(scale, 0, 0, scale, 0, 0);
    pen.globalCompositeOperation = 'lighter';
    pen.lineCap = 'round';
    const drag = Math.exp(-2.4 * dt);
    for (const s of sparks) {
      s.vx *= drag;
      s.vy = s.vy * drag + 1100 * dt; // they fall
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const t = s.age / s.life;
      pen.globalAlpha = (1 - t) * (1 - t);
      if (s.ember) {
        const size = 28 * (1 - t * 0.6);
        pen.drawImage(ember, s.x - size / 2, s.y - size / 2, size, size);
        continue;
      }
      pen.strokeStyle = s.hot ? '#fff' : `rgb(${(255 - 190 * t) | 0},${(255 - 135 * t) | 0},255)`;
      pen.lineWidth = s.w * (1 - t * 0.5);
      pen.beginPath();
      pen.moveTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03);
      pen.lineTo(s.x, s.y);
      pen.stroke();
    }
    pen.globalAlpha = 1;
    sparkFrame = requestAnimationFrame(drawSparks);
  }

  // ------------------------------------------------------------------ light, shake, glitch
  // A flash from the clock, under the words. Never more than one a second, however fast the taps come.
  let flashAt = -1e9;
  function flash(power, at) {
    const now = performance.now();
    if (now - flashAt < 1000) return false;
    flashAt = now;
    const light = document.createElement('span');
    light.className = 'alarm-flash';
    light.style.setProperty('--x', `${at.x.toFixed(0)}px`);
    light.style.setProperty('--y', `${at.y.toFixed(0)}px`);
    stage.append(light);
    light.animate([{ opacity: 0 }, { opacity: Math.min(1, 0.45 + power * 0.3), offset: 0.12 }, { opacity: 0 }], { duration: 460, easing: 'ease-out' })
      .finished.then(() => light.remove(), () => light.remove());
    return true;
  }

  // Two rings of light from the clock across the whole hero, under the words.
  function shockwave(power, at) {
    const reach = Math.hypot(Math.max(at.x, at.frame.width - at.x), Math.max(at.y, at.frame.height - at.y));
    [[0, 1, 1], [110, 0.55, 0.8]].forEach(([delay, strength, size]) => {
      const ring = document.createElement('span');
      ring.className = 'alarm-wave';
      ring.style.left = `${at.x}px`;
      ring.style.top = `${at.y}px`;
      stage.append(ring);
      ring.animate([
        { transform: 'translate(-50%, -50%) scale(.04)', opacity: strength },
        { transform: `translate(-50%, -50%) scale(${((reach * 2.1 * size) / 100).toFixed(2)})`, opacity: 0 },
      ], { duration: 900 + power * 120, delay, easing: 'cubic-bezier(.08,.7,.25,1)', fill: 'backwards' }).finished.then(() => ring.remove(), () => ring.remove());
    });
  }

  function shake(power) {
    const k = 6 * power;
    stage.animate([
      { transform: 'none' },
      { transform: `translate(${-k}px, ${k * 0.5}px) rotate(-.35deg) scale(${(1 + 0.008 * power).toFixed(3)})` },
      { transform: `translate(${k * 0.85}px, ${-k * 0.6}px) rotate(.3deg)` },
      { transform: `translate(${-k * 0.55}px, ${k * 0.35}px) rotate(-.15deg)` },
      { transform: `translate(${k * 0.25}px, ${-k * 0.15}px)` },
      { transform: 'none' },
    ], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' });
  }

  // The headline takes the hit too: it jumps and splits into red and cyan for a moment. The chrome lettering is a
  // clipped gradient over transparent text, so the split is a drop shadow (behind the letters), not a text shadow.
  function glitch(power) {
    if (!title) return;
    const split = (k, a) => `drop-shadow(${(k * power).toFixed(3)}em 0 #ff3b6b${a}) drop-shadow(${(-k * power).toFixed(3)}em 0 #3be0ff${a})`; // the cyan copy of the red lands behind the letters
    title.animate([
      { transform: 'none', filter: split(0, '00') },
      { transform: `translateX(${(-7 * power).toFixed(1)}px) skewX(-7deg)`, filter: split(0.035, 'cc'), offset: 0.1 },
      { transform: `translateX(${(5 * power).toFixed(1)}px) skewX(4deg)`, filter: split(-0.028, 'b3'), offset: 0.24 },
      { transform: `translateX(${(-2 * power).toFixed(1)}px)`, filter: split(0.014, '80'), offset: 0.42 },
      { transform: 'none', filter: split(0, '00') },
    ], { duration: 480, easing: 'linear' });
  }

  // Without the 3D (or before it is ready), the poster of the logo takes the hit the 3D logo would: a full spin,
  // two on the third snooze, with the chrome flaring when the flash fires.
  function posterKick(power, bright) {
    if (!poster || document.documentElement.classList.contains('world-ready')) return;
    const turn = power >= MAX_POWER ? 720 : 360;
    const at = (deg, size) => `translate(-50%, -50%) perspective(1400px) rotateY(${deg}deg) scale(${size})`;
    poster.animate([
      { transform: at(0, 1), filter: 'brightness(1)' },
      { transform: at(turn * 0.3, (1 + 0.1 * power).toFixed(3)), filter: `brightness(${bright ? (1.5 + 0.4 * power).toFixed(2) : 1.15})`, offset: 0.18 },
      { transform: at(turn, 1), filter: 'brightness(1)' },
    ], { duration: turn > 360 ? 1400 : 1150, easing: 'cubic-bezier(.2,.7,.25,1)' });
  }

  // ------------------------------------------------------------------ sound and touch
  // The smash: a low hit, breaking glass and a chrome ring, made on the spot. Web Audio only starts from a tap,
  // and an iPhone on silent keeps it silent.
  let ears = null;
  let mix = null;
  let glass = null;
  function smash(power) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    try {
      if (!ears) {
        ears = new Context();
        const limiter = ears.createDynamicsCompressor();
        limiter.connect(ears.destination);
        mix = ears.createGain();
        mix.gain.value = 0.5;
        mix.connect(limiter);
        const n = Math.round(ears.sampleRate * 0.45);
        glass = ears.createBuffer(1, n, ears.sampleRate);
        const d = glass.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 4 * (Math.random() < 0.12 ? 1 : 0.3);
      }
      if (ears.state !== 'running') ears.resume();
      const t = ears.currentTime + 0.01;
      const k = Math.min(1, power / MAX_POWER);
      const tone = (type, from, to, peak, length) => {
        const osc = ears.createOscillator();
        const gain = ears.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(from, t);
        osc.frequency.exponentialRampToValueAtTime(to, t + length * 0.7);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(peak, t + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
        osc.connect(gain).connect(mix);
        osc.start(t);
        osc.stop(t + length + 0.05);
      };
      tone('sine', 160 - 40 * k, 34, 0.9, 0.5 + 0.25 * k); // the hit, deeper each time
      tone('sine', 1870, 1862, 0.05, 1.1); // the chrome rings
      tone('triangle', 2960, 2948, 0.045, 0.9);
      tone('sine', 4410, 4396, 0.035, 0.7);
      const noise = ears.createBufferSource();
      const crisp = ears.createBiquadFilter();
      const gain = ears.createGain();
      noise.buffer = glass;
      noise.playbackRate.value = rand(0.9, 1.12);
      crisp.type = 'highpass';
      crisp.frequency.value = 1800;
      gain.gain.value = 0.35 + 0.25 * k;
      noise.connect(crisp).connect(gain).connect(mix);
      noise.start(t);
    } catch { /* a tap without sound is still a tap */ }
  }

  // A tap you can feel. Android vibrates. Safari on iPhone has no vibration, but toggling a switch control gives a
  // haptic tick (iOS 18 and later); elsewhere this does nothing.
  function thud() {
    if (navigator.vibrate) { navigator.vibrate([30, 40, 80]); return; }
    if (!coarse) return;
    try {
      const hold = document.createElement('label');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.setAttribute('switch', '');
      hold.setAttribute('aria-hidden', 'true');
      hold.style.display = 'none';
      hold.append(box);
      document.head.append(hold);
      hold.click();
      hold.remove();
    } catch { /* no haptics here */ }
  }

  // ------------------------------------------------------------------ the snooze
  snooze.addEventListener('click', () => {
    snoozes += 1;
    const lost = snoozes * SNOOZE_MINUTES;
    const power = Math.min(MAX_POWER, 1 + (snoozes - 1) * 0.4); // each snooze hits harder, up to the third
    root.dataset.state = 'snoozed';
    clearInterval(rolling);
    clearTimeout(rejoin);
    slam();
    smash(power);
    thud();
    if (reduced || !stage) { ahead = lost; render(); }
    else {
      holding = false;
      settle();
      render();
      const pieces = litPieces();
      const at = impact();
      shards(true, power);
      holding = true;
      burst(pieces, power);
      const bright = flash(power, at);
      shockwave(power, at);
      shake(power);
      glitch(power);
      posterKick(power, bright);
      dispatchEvent(new CustomEvent('sul:snooze', { detail: { power } }));
      rejoin = setTimeout(() => { holding = false; ahead = lost; render(); shards(false, 0.7); }, 720);
    }
    write(message, snoozes === 1 ? 'You don’t get them back.' : snoozes === 2 ? 'Somebody else is up.' : '');
    live.textContent = [`Snoozed. ${lost} minutes gone.`, snoozes === WAKE_AFTER ? `${drop.totalSets} sets. Some sizes exist once.` : message.textContent].filter(Boolean).join(' ');
    if (snoozes >= WAKE_AFTER) wakeLink.hidden = false;
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
    wakeLink.hidden = true;
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
  snooze.disabled = false;
  wakeLink.hidden = true;
  render();
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => run(entry.isIntersecting && !document.hidden), { threshold: 0.35 }).observe(root);
  else run(true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) run(false); else if (root.getBoundingClientRect().top < innerHeight && root.getBoundingClientRect().bottom > 0) run(true); });
}
