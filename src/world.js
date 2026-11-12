// The SUL world: one continuous 3D scene behind the homepage.
// Act 1: an inflated chrome SUL logo, circled by a band of type. Scrolling flies the camera through the U.
// Act 2: the four colorways hang on a curved wall as cloth panels, and scrolling turns the wall.
// html.world is set by the inline gate in <head>. Removing it returns the page to the static layout.
import {
  AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry,
  DoubleSide, FogExp2, Group, HalfFloatType, Mesh, MeshBasicMaterial, MeshStandardMaterial, NoToneMapping, PerspectiveCamera,
  PlaneGeometry, PMREMGenerator, Points, Raycaster, RepeatWrapping, SRGBColorSpace, Scene, ShaderMaterial, SphereGeometry,
  TextureLoader, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const root = document.documentElement;
const canvas = document.getElementById('world');
const heroAct = document.querySelector('[data-act="hero"]');
const ringAct = document.querySelector('[data-act="ring"]');
const heroCopy = document.querySelector('.hero-copy');
const cue = document.querySelector('.scroll-cue');
const items = [...document.querySelectorAll('[data-ring-item]')];
const ticks = [...document.querySelectorAll('.ring-ticks span')];
const params = new URLSearchParams(location.search);
const force = params.has('world'); // ?world keeps the 3D on while testing, whatever the frame rate
const bare = params.get('world') === 'poster'; // logo alone, for scripts/3d/capture_poster.cjs

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

const coarse = matchMedia('(pointer:coarse)').matches || innerWidth < 768;
const strong = !coarse && (navigator.hardwareConcurrency || 4) >= 6;
let dprCap = coarse ? 1.5 : strong ? 2 : 1.5;
let bloomOn = strong;
let alive = true;

function fallback() {
  if (!alive) return;
  alive = false;
  root.classList.remove('world', 'world-ready');
  canvas.remove();
  [heroCopy, cue].forEach((n) => n?.removeAttribute('style'));
}

// ---------------------------------------------------------------- renderer
let renderer;
try {
  renderer = new WebGLRenderer({ canvas, antialias: !strong, powerPreference: 'high-performance', stencil: false });
} catch { fallback(); throw new Error('WebGL unavailable'); }
renderer.toneMapping = NoToneMapping; // garment photos must keep their true color
renderer.outputColorSpace = SRGBColorSpace;
const voidColor = new Color('#05070d');
renderer.setClearColor(voidColor, 1);

const scene = new Scene();
scene.background = voidColor.clone();
scene.fog = new FogExp2(voidColor.clone(), 0.028);
const camera = new PerspectiveCamera(30, 1, 0.04, 80);

// ---------------------------------------------------------------- reflections: a studio of light bands, baked once
function buildEnvironment() {
  const env = new Scene();
  const sky = new Mesh(new SphereGeometry(30, 48, 32), new ShaderMaterial({
    side: BackSide,
    vertexShader: 'varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec3 d;
      vec3 ramp(float y){
        vec3 c = vec3(.004,.006,.016);
        c = mix(c, vec3(.03,.11,.62), smoothstep(-.62,-.16,y));
        c = mix(c, vec3(.62,.76,1.3), smoothstep(-.16,-.035,y));
        c = mix(c, vec3(.008,.01,.03), smoothstep(-.03,.012,y));
        c = mix(c, vec3(.05,.08,.2), smoothstep(.02,.2,y));
        c = mix(c, vec3(1.9,1.95,2.2), smoothstep(.28,.47,y));
        c = mix(c, vec3(.1,.2,.85), smoothstep(.5,.66,y));
        c = mix(c, vec3(.006,.01,.03), smoothstep(.7,.96,y));
        return c;
      }
      void main(){
        vec3 n = normalize(d);
        float az = atan(n.x, n.z);
        vec3 c = ramp(n.y + sin(az*2.)*.05);
        float strip = smoothstep(.93,.995, sin(az*3.+.6)) * smoothstep(-.7,-.2,n.y) * smoothstep(.85,.3,n.y);
        c += strip * vec3(.9,1.,1.45);
        gl_FragColor = vec4(c,1.);
      }`
  }));
  env.add(sky);
  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.012, 0.1, 60);
  pmrem.dispose();
  sky.geometry.dispose();
  sky.material.dispose();
  return target.texture;
}
scene.environment = buildEnvironment();

// ---------------------------------------------------------------- act 1: logo
const logo = new Group();
scene.add(logo);
const liquid = { uTime: { value: 0 }, uLiquid: { value: 0.35 }, uRipple: { value: new Vector3(0, 0, 0) } };
const chrome = new MeshStandardMaterial({ color: '#eaeef8', metalness: 1, roughness: 0.075, envMapIntensity: 1.25 });
chrome.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, liquid);
  shader.vertexShader = `varying vec3 vL; uniform float uTime; uniform vec3 uRipple;\n${shader.vertexShader}`
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      vL = position;
      float rd = distance(position.xy, uRipple.xy);
      transformed += normal * (sin(rd*9. - uTime*4.) * exp(-rd*1.9) * .05 * uRipple.z + sin(position.x*2.4+uTime*.8)*sin(position.y*3.-uTime*.6)*.012);`);
  shader.fragmentShader = `varying vec3 vL; uniform float uTime; uniform float uLiquid;\n${shader.fragmentShader}`
    .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      { vec3 q = vL*2.1; float t = uTime*.32;
        vec3 w = vec3(sin(q.y*2.7+t*1.7+sin(q.x*1.6+t)*1.6), sin(q.x*2.2-t*1.3+sin(q.y*2.4-t)*1.5), 0.);
        normal = normalize(normal + (viewMatrix * vec4(w,0.)).xyz * .14 * uLiquid); }`);
};
async function loadLogo() {
  const res = await fetch('assets/3d/sul-logo.bin');
  if (!res.ok) throw new Error('logo missing');
  const buf = await res.arrayBuffer();
  const dv = new DataView(buf);
  const nV = dv.getUint32(4, true);
  const nF = dv.getUint32(8, true);
  const b = [dv.getFloat32(12, true), dv.getFloat32(16, true), dv.getFloat32(20, true)];
  let off = 24;
  const posQ = new Int16Array(buf, off, nV * 3); off += nV * 6;
  const norQ = new Int8Array(buf, off, nV * 3); off += nV * 3;
  if (off % 2) off += 1;
  const idx = new Uint16Array(buf, off, nF * 3);
  // Front half plus a mirrored back half, so the file only ships one side.
  const pos = new Float32Array(nV * 6);
  const nor = new Float32Array(nV * 6);
  for (let i = 0; i < nV; i++) {
    const x = posQ[i * 3] / 32767 * b[0], y = posQ[i * 3 + 1] / 32767 * b[1], z = posQ[i * 3 + 2] / 32767 * b[2];
    const nx = norQ[i * 3] / 127, ny = norQ[i * 3 + 1] / 127, nz = norQ[i * 3 + 2] / 127;
    pos.set([x, y, z], i * 3); pos.set([x, y, -z], (i + nV) * 3);
    nor.set([nx, ny, nz], i * 3); nor.set([nx, ny, -nz], (i + nV) * 3);
  }
  const indices = new Uint32Array(nF * 6);
  for (let i = 0; i < nF; i++) {
    const a = idx[i * 3], c = idx[i * 3 + 1], d = idx[i * 3 + 2];
    indices.set([a, c, d], i * 3);
    indices.set([d + nV, c + nV, a + nV], (i + nF) * 3);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('normal', new BufferAttribute(nor, 3));
  g.setIndex(new BufferAttribute(indices, 1));
  logo.add(new Mesh(g, chrome));
}

// Band of type orbiting the logo.
const bandGroup = new Group();
scene.add(bandGroup);
const bandMat = new MeshBasicMaterial({ transparent: true, side: DoubleSide, depthWrite: false, color: '#b8c8ee', opacity: 0.5 });
async function buildBand() {
  try { await document.fonts.load('800 110px Barlow'); } catch { /* the fallback face still reads */ }
  const c = document.createElement('canvas');
  c.width = coarse ? 2048 : 4096; c.height = coarse ? 88 : 150;
  const x = c.getContext('2d');
  const size = c.height * 0.8;
  x.font = `800 ${size}px Barlow, sans-serif`;
  x.textBaseline = 'middle';
  x.fillStyle = '#fff';
  const phrase = 'SNOOZE U LOSE  /  DON’T SLEEP ON STYLE  /  ';
  const w = x.measureText(phrase).width;
  const n = Math.max(1, Math.round(c.width / w));
  x.setTransform(c.width / (n * w), 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) x.fillText(phrase, i * w, c.height * 0.54);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.repeat.set(3, 1);
  bandMat.map = tex;
  bandMat.needsUpdate = true;
  const band = new Mesh(new CylinderGeometry(3.3, 3.3, 0.2, 128, 1, true), bandMat);
  band.renderOrder = 2;
  bandGroup.add(band);
  bandGroup.rotation.set(0.2, 0, -0.21);
  bandGroup.userData.band = band;
}

// Dust the camera rushes through.
const dustCount = coarse ? 130 : 320;
const dustPos = new Float32Array(dustCount * 3);
const dustSeed = new Float32Array(dustCount);
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 16;
  dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
  dustPos[i * 3 + 2] = 8 - Math.random() * 26;
  dustSeed[i] = Math.random();
}
const dustGeo = new BufferGeometry();
dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3));
dustGeo.setAttribute('seed', new BufferAttribute(dustSeed, 1));
const dustMat = new ShaderMaterial({
  transparent: true, depthWrite: false, blending: AdditiveBlending,
  uniforms: { uTime: liquid.uTime, uTint: { value: new Color('#7f9fff') }, uPx: { value: 1 }, uBurst: { value: 0 } },
  vertexShader: `attribute float seed; uniform float uTime; uniform float uPx; uniform float uBurst; varying float vA;
    void main(){ vec3 p = position; p.y += sin(uTime*.2+seed*40.)*.25; p.x += cos(uTime*.16+seed*30.)*.25;
      p += normalize(p + vec3(.001)) * uBurst * (.4 + seed * 1.3);
      vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
      gl_PointSize = uPx*(1.+seed*3.2)*(9./max(.6,-mv.z)); vA = (.25+seed*.75)*smoothstep(.2,1.4,-mv.z)*(.65+.35*sin(uTime*(.6+seed)+seed*20.)); }`,
  fragmentShader: `uniform vec3 uTint; varying float vA;
    void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,.05,d)*vA; gl_FragColor = vec4(uTint*a,a);
      #include <colorspace_fragment>
    }`
});
const dust = new Points(dustGeo, dustMat);
dust.visible = !bare;
scene.add(dust);

// ---------------------------------------------------------------- act 2: the curved wall of colorways
const R = 6;
const C_Z = -6;
const SPACING = 0.86; // radians between panels
const PANEL_H = 2.6;
const PANEL_W = PANEL_H * 2 / 3;
const wall = new Group();
wall.position.set(0, 0, C_Z);
scene.add(wall);
const wallUniforms = { uTime: liquid.uTime, uVel: { value: 0 } };
const panelGeo = new PlaneGeometry(PANEL_W, PANEL_H, 36, 44);
{ // Curve the cloth around the viewer.
  const p = panelGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setXYZ(i, R * 0.72 * Math.sin(x / (R * 0.72)), p.getY(i), R * 0.72 * (1 - Math.cos(x / (R * 0.72))));
  }
}
const panelVert = `
  uniform float uTime; uniform float uVel; uniform vec3 uHit; uniform float uMirror; varying vec2 vUv; varying float vFold; varying float vWorldY;
  void main(){
    vUv = uv; vec3 p = position; float t = uTime;
    float a = sin(p.y*2.1 + t*1.05 + p.x*1.5), b = sin(p.x*4.6 + t*.72 - p.y*.8);
    float d = distance(uv, uHit.xy);
    float rip = exp(-d*d*16.)*uHit.z*sin(d*30.-t*6.);
    float hang = smoothstep(1.,.2,uv.y);
    p.z += (a*.024 + b*.014)*hang + rip*.07;
    float vb = sin(uv.x*3.14159);
    p.z += vb*uVel*.42; p.y += vb*uVel*.16*(uv.y-.5);
    vFold = (cos(p.y*2.1+t*1.05+p.x*1.5)*.5 + cos(p.x*4.6+t*.72-p.y*.8)*.5)*hang*.07 + rip*.1;
    vec4 w = modelMatrix*vec4(p,1.); vWorldY = w.y;
    gl_Position = projectionMatrix*viewMatrix*w;
  }`;
const panelFrag = `
  uniform sampler2D uMap; uniform float uReady; uniform float uVel; uniform float uFocus; uniform vec3 uGlow; uniform float uMirror; uniform float uAspect;
  varying vec2 vUv; varying float vFold; varying float vWorldY;
  float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
  void main(){
    float s = uVel*.012;
    vec3 tex = vec3(texture2D(uMap, vUv+vec2(s,0.)).r, texture2D(uMap, vUv).g, texture2D(uMap, vUv-vec2(s,0.)).b);
    vec3 c = mix(uGlow*.12, tex, uReady);
    c *= mix(.2, 1., uFocus);
    c *= 1. + vFold*1.6;
    vec2 p = (vUv-.5)*vec2(uAspect,1.);
    float sd = rbox(p, vec2(uAspect*.5,.5), .035);
    float a = smoothstep(.002,-.002,sd);
    float rim = smoothstep(.006,.0,abs(sd+.002));
    c += rim*mix(vec3(.36,.42,.6),uGlow,.5)*(.25+uFocus*.45);
    if(uMirror>.5){ a *= .34*smoothstep(-2.5,-1.34,vWorldY); c *= .85; }
    if(a<.003) discard;
    gl_FragColor = vec4(c,a);
    #include <colorspace_fragment>
  }`;
const panels = items.map((node, i) => {
  const uniforms = {
    ...wallUniforms, uMap: { value: null }, uReady: { value: 0 }, uFocus: { value: 0 }, uHit: { value: new Vector3(.5, .5, 0) },
    uGlow: { value: new Color(node.dataset.glow) }, uMirror: { value: 0 }, uAspect: { value: 2 / 3 }
  };
  const mat = new ShaderMaterial({ transparent: true, side: DoubleSide, vertexShader: panelVert, fragmentShader: panelFrag, uniforms });
  const mesh = new Mesh(panelGeo, mat);
  const arm = new Group();
  arm.rotation.y = -i * SPACING;
  mesh.position.set(0, 0, -R);
  mesh.userData = { i, href: node.dataset.href };
  arm.add(mesh);
  const mirrorMat = new ShaderMaterial({ transparent: true, side: DoubleSide, depthWrite: false, vertexShader: panelVert, fragmentShader: panelFrag, uniforms: { ...uniforms, uMirror: { value: 1 } } });
  const mirror = new Mesh(panelGeo, mirrorMat);
  mirror.scale.y = -1;
  mirror.position.set(0, -PANEL_H - 0.12, -R);
  arm.add(mirror);
  wall.add(arm);
  return { node, mesh, uniforms, src: node.dataset.image };
});
function loadPanels() {
  const loader = new TextureLoader();
  panels.forEach((p) => {
    loader.load(p.src, (tex) => {
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = 8;
      p.uniforms.uMap.value = tex;
      p.uniforms.uReady.value = 1;
    });
  });
}
// Colored light behind the active panel, and a floor line.
const glowMat = new ShaderMaterial({
  transparent: true, depthWrite: false, blending: AdditiveBlending,
  uniforms: { uColor: { value: new Color(items[0]?.dataset.glow || '#3f73ff') }, uAmount: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
    void main(){ vec2 p = (vUv-.5)*2.; float g = exp(-dot(p*vec2(1.2,1.5),p*vec2(1.2,1.5))*3.2);
      float floorLine = exp(-pow((vUv.y-.335)*120.,2.))*.22*exp(-p.x*p.x*2.6);
      vec3 c = uColor*(g*.3+floorLine)*uAmount; gl_FragColor = vec4(c,1.);
      #include <colorspace_fragment>
    }`
});
const glow = new Mesh(new PlaneGeometry(26, 16), glowMat);
glow.position.set(0, 0, C_Z - R - 2.6);
scene.add(glow);

// ---------------------------------------------------------------- post
let composer = null;
let bloom = null;
function buildComposer(w, h) {
  const target = new WebGLRenderTarget(w, h, { type: HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new Vector2(w / 2, h / 2), 0.14, 0.42, 0.96);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
}

// ---------------------------------------------------------------- layout
let W = 0, H = 0, portrait = false, fitLogo = 8, heroShiftY = 0, wallDist = 6, wallShiftX = 0, wallShiftY = 0, heroTop = 0, heroLen = 1, ringTop = 0, ringLen = 1, ringEnd = 1;
const FOV_HERO = () => (portrait ? 40 : 30);
const FOV_WALL = 38;
function measure() {
  const y = scrollY;
  const hr = heroAct.getBoundingClientRect();
  const rr = ringAct.getBoundingClientRect();
  heroTop = hr.top + y; heroLen = Math.max(1, hr.height - innerHeight);
  ringTop = rr.top + y; ringLen = Math.max(1, rr.height - innerHeight);
  ringEnd = rr.bottom + y;
}
function resize() {
  const nw = innerWidth;
  const nh = canvas.clientHeight || innerHeight;
  if (nw === W && Math.abs(nh - H) < 2) { measure(); return; }
  W = nw; H = nh;
  portrait = W / H < 0.9;
  const dpr = Math.min(devicePixelRatio || 1, dprCap);
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H, false);
  if (bloomOn) { if (!composer) buildComposer(W * dpr, H * dpr); composer.setPixelRatio(dpr); composer.setSize(W, H); }
  dustMat.uniforms.uPx.value = dpr * (portrait ? 0.8 : 1);
  camera.aspect = W / H;
  const tanH = Math.tan((FOV_HERO() * Math.PI) / 360) * camera.aspect;
  fitLogo = 2 / ((portrait ? 0.9 : Math.min(0.55, 0.92 / camera.aspect)) * tanH);
  heroShiftY = -2 * fitLogo * Math.tan((FOV_HERO() * Math.PI) / 360) * (portrait ? 0.095 : 0.075);
  const t = Math.tan((FOV_WALL * Math.PI) / 360);
  const byH = PANEL_H / ((portrait ? 0.5 : 0.7) * 2 * t);
  const byW = PANEL_W / ((portrait ? 0.68 : 0.42) * 2 * t * camera.aspect);
  wallDist = Math.max(byH, byW);
  const visW = 2 * wallDist * t * camera.aspect;
  const visH = 2 * wallDist * t;
  wallShiftX = portrait ? 0 : visW * 0.2;   // desktop: panel sits left, details sit right
  wallShiftY = portrait ? -visH * 0.17 : 0; // phone: panel sits high, details sit low
  measure();
}

// ---------------------------------------------------------------- pointer + picking
const pointer = new Vector2(0, 0);
const pointerSmooth = new Vector2(0, 0);
let pointerSeen = 0;
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  pointerSeen = performance.now();
}, { passive: true });
const ray = new Raycaster();
document.querySelector('.ring-stage')?.addEventListener('click', (e) => {
  if (e.target.closest('a,button') || activeAmount < 0.5) return;
  ray.setFromCamera(new Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hit = ray.intersectObjects(panels.map((p) => p.mesh))[0];
  if (hit?.object.userData.href) location.href = hit.object.userData.href;
});

// ---------------------------------------------------------------- snooze
// The hero clock (assets/alarm.js) sends sul:snooze. The logo takes the hit: a full spin (two on the third snooze),
// a punch in the metal, the chrome flaring white, the void flashing blue, the dust blown outward, the camera
// punching in and shaking. Harder each time (detail.power).
const FINALE = 1.75;
let kickAt = -1e9, kickPower = 1, flareAt = -1e9;
addEventListener('sul:snooze', (e) => {
  kickAt = performance.now();
  kickPower = e.detail?.power || 1;
  if (kickAt - flareAt > 1000) flareAt = kickAt; // the flash never comes more than once a second, however fast the taps
  start();
});
const easeOut = (t) => 1 - (1 - t) ** 4;

// ---------------------------------------------------------------- frame
let last = performance.now();
let heroP = 0, ringP = 0, prevRing = 0, vel = 0, activeAmount = 0, activeIndex = -1, ripple = 0, logoVisible = true;
let frames = 0, frameSum = 0, ready = false, running = false, rafId = 0, lost = false, lostTimer = 0;
const glowTarget = new Color();
const lookAt = new Vector3();
const U = new Vector3(0.2, 0.22, 0); // the gap in the U

function setActive(i) {
  if (i === activeIndex) return;
  activeIndex = i;
  items.forEach((node, n) => {
    const on = n === i;
    node.classList.toggle('is-active', on);
    node.inert = !on;
    node.setAttribute('aria-hidden', String(!on));
  });
  ticks.forEach((t, n) => t.classList.toggle('on', n === i));
}

function frame(now) {
  if (!alive) return;
  rafId = requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  const raw = now - last;
  last = now;
  const y = scrollY;
  if (y > ringEnd || document.hidden) { canvas.style.visibility = 'hidden'; running = false; cancelAnimationFrame(rafId); return; }
  canvas.style.visibility = '';
  liquid.uTime.value += dt;

  const h = clamp((y - heroTop) / heroLen);
  const r = clamp((y - ringTop) / ringLen);
  heroP = damp(heroP, h, coarse ? 16 : 9, dt);
  ringP = damp(ringP, r, coarse ? 16 : 7, dt);
  vel = damp(vel, clamp((ringP - prevRing) / Math.max(dt, 1e-3) * 0.55, -1, 1), 7, dt);
  prevRing = ringP;
  pointerSmooth.lerp(pointer, 1 - Math.exp(-5 * dt));

  // The snooze hit, fading as the camera leaves the logo.
  const align = smooth(0.02, 0.45, heroP);
  const kt = (now - kickAt) / 1000;
  const hit = kt < 1.3 ? (1 - kt / 1.3) ** 2 * (1 - align) : 0;
  const ft = (now - flareAt) / 1000;
  const flare = ft < 0.7 ? (1 - ft / 0.7) ** 3 * (1 - align) : 0;
  const punch = kt < 0.55 ? Math.sin((kt / 0.55) * Math.PI) * (1 - kt / 0.55) * 4.5 * kickPower * (1 - align) : 0;

  // Camera path: hold on the logo, then rush through the U, then settle facing the wall.
  const fly = smooth(0.06, 0.92, heroP);
  const rush = fly * fly * (3 - 2 * fly);
  const settle = smooth(0.7, 1, heroP);
  const zHero = lerp(fitLogo, -0.6, rush);
  const zWall = C_Z - R + wallDist;
  camera.position.set(
    lerp(lerp(0, U.x, smooth(0, 0.55, fly)), wallShiftX, settle),
    lerp(lerp(heroShiftY, U.y, smooth(0, 0.55, fly)), wallShiftY, settle),
    lerp(zHero, zWall, settle)
  );
  camera.position.x += pointerSmooth.x * lerp(0.1, 0.08, settle);
  camera.position.y += pointerSmooth.y * lerp(0.06, 0.05, settle);
  lookAt.set(lerp(U.x * rush, wallShiftX, settle), lerp(lerp(heroShiftY, U.y, rush), wallShiftY, settle), camera.position.z - 6);
  camera.lookAt(lookAt);
  camera.fov = lerp(lerp(FOV_HERO(), 62, smooth(0.45, 0.85, heroP)), FOV_WALL, settle) - punch;
  camera.updateProjectionMatrix();

  // Logo: alive under the pointer, flattens as we line up with the gap.
  const sway = Math.sin(liquid.uTime.value * 0.42);
  logo.rotation.y = lerp(-0.2 + sway * 0.13 + pointerSmooth.x * 0.3, 0, align);
  logo.rotation.x = lerp(-0.1 + Math.cos(liquid.uTime.value * 0.33) * 0.05 - pointerSmooth.y * 0.2, 0, align);
  logo.rotation.z = lerp(Math.sin(liquid.uTime.value * 0.27) * 0.015, 0, align);
  const turns = kickPower >= FINALE ? 2 : 1;
  const spin = turns === 2 ? 1.5 : 1.15;
  if (kt < spin) {
    logo.rotation.y += easeOut(kt / spin) * Math.PI * 2 * turns * (1 - align); // lands back where it started
    logo.rotation.z += Math.sin((kt / spin) * Math.PI) * 0.1 * kickPower * (1 - align); // leans into the spin
  }
  logo.scale.setScalar(1 + (kt < 0.7 ? Math.sin(Math.min(kt / 0.7, 1) * Math.PI * 2) * Math.exp(-kt * 4) * 0.16 * kickPower * (1 - align) : 0));
  chrome.envMapIntensity = 1.25 + flare * 2.2 * kickPower;
  dustMat.uniforms.uBurst.value = kt < 2.2 ? Math.sin(Math.min(kt / 0.22, 1) * Math.PI * 0.5) * Math.exp(-kt * 2) * 1.5 * kickPower * (1 - align) : 0;
  if (hit) {
    camera.position.x += (Math.random() - 0.5) * 0.14 * hit * kickPower;
    camera.position.y += (Math.random() - 0.5) * 0.1 * hit * kickPower;
  }
  logoVisible = heroP < 0.995;
  logo.visible = logoVisible;
  // Touch or pointer sends a slow ripple through the metal.
  const active = performance.now() - pointerSeen < 900 ? 1 : 0;
  ripple = damp(ripple, active, 2.4, dt);
  liquid.uRipple.value.set(pointerSmooth.x * 2.2, pointerSmooth.y * 1.2, Math.max(ripple, hit * 3 * kickPower));
  liquid.uLiquid.value = damp(liquid.uLiquid.value, 0.42 + rush * 0.9 + ripple * 0.45 + hit * 1.6 * kickPower, hit ? 14 : 4, dt);

  const band = bandGroup.userData.band;
  if (band) {
    band.rotation.y = -liquid.uTime.value * 0.13 - heroP * 3 + (kt < 1.6 ? easeOut(kt / 1.6) * Math.PI * 2 : 0); // one full turn the other way
    bandMat.opacity = 0.5 * (1 - smooth(0.2, 0.55, heroP));
    bandGroup.visible = !bare && heroP < 0.58;
    const s = 1 + rush * 1.5;
    bandGroup.scale.set(s, 1, s);
    bandGroup.rotation.y = pointerSmooth.x * 0.1;
  }
  scene.environmentRotation.y = liquid.uTime.value * 0.05 + pointerSmooth.x * 0.5 + heroP * 2.4;
  scene.environmentRotation.x = pointerSmooth.y * 0.22;

  // The rush floods the world with royal blue, then clears to the wall.
  const flood = Math.max(smooth(0.6, 0.76, heroP) * (1 - smooth(0.78, 0.93, heroP)) * 0.92, Math.min(0.5, flare * 0.28 * kickPower));
  scene.background.copy(voidColor).lerp(floodColor, flood);
  scene.fog.color.copy(scene.background);
  renderer.setClearColor(scene.background, 1);

  // Wall.
  const n = panels.length;
  const seg = ringP * (n - 1);
  const base = Math.floor(seg);
  const t = seg - base;
  const eased = base + smooth(0.28, 0.72, t);
  wall.rotation.y = eased * SPACING;
  const idx = clamp(Math.round(eased), 0, n - 1);
  const shown = smooth(0.68, 0.84, heroP);
  wall.visible = shown > 0.001;
  glow.visible = wall.visible;
  wallUniforms.uVel.value = vel;
  panels.forEach((p, i) => {
    const focus = 1 - clamp(Math.abs(eased - i));
    p.uniforms.uFocus.value = damp(p.uniforms.uFocus.value, focus, 10, dt);
    if (i === idx && !coarse && shown > 0.9) {
      // Hover ripple: project the pointer onto the panel.
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObject(p.mesh)[0];
      const uHit = p.uniforms.uHit.value;
      if (hit?.uv) { uHit.x = hit.uv.x; uHit.y = hit.uv.y; uHit.z = damp(uHit.z, 1, 6, dt); } else uHit.z = damp(uHit.z, 0, 3, dt);
    }
  });
  glowTarget.set(panels[idx]?.node.dataset.glow || '#3f73ff');
  glowMat.uniforms.uColor.value.lerp(glowTarget, 1 - Math.exp(-3.5 * dt));
  dustMat.uniforms.uTint.value.copy(glowMat.uniforms.uColor.value).lerp(tintBlue, 1 - shown * 0.6);
  glowMat.uniforms.uAmount.value = shown;
  glow.position.x = wallShiftX * 0.8;
  activeAmount = shown;

  // DOM follows the world.
  const copyFade = 1 - smooth(0.02, 0.2, heroP);
  heroCopy.style.opacity = copyFade.toFixed(3);
  heroCopy.style.transform = `translate3d(0,${(-heroP * 90).toFixed(1)}px,0)`;
  heroCopy.style.visibility = copyFade < 0.01 ? 'hidden' : '';
  if (cue) cue.style.opacity = (1 - smooth(0, 0.05, heroP)).toFixed(3);
  setActive(shown > 0.6 && r <= 1 ? idx : -1);
  const ringBottom = ringEnd - y;
  canvas.style.opacity = smooth(innerHeight * 0.25, innerHeight * 0.95, ringBottom).toFixed(3);

  if (composer && bloomOn) {
    bloom.strength = 0.14 + rush * 0.1 + flood * 0.12 + flare * 0.5 * kickPower;
    composer.render(dt);
  } else renderer.render(scene, camera);

  if (!ready) {
    ready = true;
    root.classList.add('world-ready');
    last = performance.now();
    return;
  }
  // Keep it smooth: step quality down as far as it goes, and give up on the 3D only if the page itself would lag.
  // Slow means under about 24 fps; a phone in Low Power Mode holds 30 and keeps full quality.
  if (!force && document.visibilityState === 'visible' && raw < 400) {
    frames += 1; frameSum += raw;
    if (frames >= 80) {
      const avg = frameSum / frames;
      frames = 0; frameSum = 0;
      if (avg > 42) {
        if (bloomOn) bloomOn = false;
        else if (dprCap > 1) { dprCap = 1; W = 0; resize(); }
        else if (dprCap > 0.75) { dprCap = 0.75; W = 0; resize(); }
        else if (dust.visible) dust.visible = false;
        else if (avg > 85) fallback(); // under 12 fps even at the lowest quality
      }
    }
  }
}
const floodColor = new Color('#1b46c4');
const tintBlue = new Color('#7f9fff');

function start() {
  if (running || !alive || lost) return;
  running = true;
  last = performance.now();
  rafId = requestAnimationFrame(frame);
}

// A phone can take the GPU back (memory pressure, a long spell in the background). Show the poster, wait for the
// context to come back, and carry on. The page goes static only if it stays lost while the page is on screen.
function giveUp() {
  clearTimeout(lostTimer);
  lostTimer = setTimeout(() => { if (!lost) return; if (document.hidden) giveUp(); else fallback(); }, 6000);
}
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  lost = true;
  running = false;
  cancelAnimationFrame(rafId);
  ready = false;
  root.classList.remove('world-ready');
  giveUp();
});
canvas.addEventListener('webglcontextrestored', () => {
  clearTimeout(lostTimer);
  lost = false;
  if (!alive) return;
  const old = scene.environment;
  scene.environment = buildEnvironment(); // the baked reflections lived on the GPU
  old?.dispose();
  W = 0;
  resize();
  start();
});
addEventListener('scroll', () => { if (!running && scrollY <= ringEnd) start(); }, { passive: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
addEventListener('resize', resize, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.body);

try {
  await Promise.all([loadLogo(), buildBand()]);
  resize();
  renderer.compile(scene, camera);
  start();
  (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(loadPanels);
} catch (error) {
  console.warn('SUL world fell back to the static hero:', error);
  fallback();
}
