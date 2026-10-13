// B"H — Reality Engine photorealism scene.
// Branch: reality-photorealism. Real photographic textures (Awtsmoos Drive),
// ez-tree-derived procedural tree generator, no blocky placeholders.
import * as THREE from '../../../scripts/build/three.module.js';
import { generateTreeProceduralData } from '../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js';
import { buildCharacter } from './reality-character.mjs';
import { makeFireflies, makePollen, makeFallingLeaves, makeDustMotes, makeEmbers } from './reality-particles.mjs';

const TEX = './textures/';

/* ---------------- deterministic RNG + value noise ---------------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeNoise2D(rand) {
  const perm = new Uint8Array(512);
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = (rand() * (i + 1)) | 0;[p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h, x, y) => ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
  const fade = t => t * t * (3 - 2 * t);
  return function noise(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    return (grad(aa, x, y) * (1 - u) + grad(ba, x - 1, y) * u) * (1 - v)
         + (grad(ab, x, y - 1) * (1 - u) + grad(bb, x - 1, y - 1) * u) * v; // ~[-1,1]
  };
}

/* ---------------- world shape ---------------- */
const WORLD = 240;
const riverX = z => 26 * Math.sin(z * 0.02) + 10 * Math.sin(z * 0.043 + 1.7);
const WATER_Y = -0.55;

function groundHeight(x, z, noise) {
  let h = noise(x * 0.02, z * 0.02) * 3.2
        + noise(x * 0.06 + 9, z * 0.06) * 1.1
        + noise(x * 0.18, z * 0.18 + 4) * 0.35;
  const d = Math.abs(x - riverX(z));
  if (d < 13) {
    const t = Math.min(1, d / 13);
    const bed = -2.1 + noise(x * 0.1, z * 0.1) * 0.25;      // riverbed depth
    const bank = 0.7;                                        // bank height
    const target = d < 5.5 ? bed : bed + (bank - bed) * ((d - 5.5) / 7.5);
    h = h * t * t + target * (1 - t * t);
  }
  return h;
}

function loadTexture(url, repeatX = 1, repeatY = 1) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      tex.anisotropy = 8;
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    }, undefined, reject);
  });
}

function bufferGeometryFromStream(stream, leafShrink = 0) {
  let positions = stream.positions;
  if (leafShrink > 0 && positions.length % 12 === 0) {
    // shrink each leaf quad toward its centroid so foliage photos read as fine detail
    const p = Float32Array.from(positions);
    for (let q = 0; q < p.length; q += 12) {
      const cx = (p[q] + p[q + 3] + p[q + 6] + p[q + 9]) / 4;
      const cy = (p[q + 1] + p[q + 4] + p[q + 7] + p[q + 10]) / 4;
      const cz = (p[q + 2] + p[q + 5] + p[q + 8] + p[q + 11]) / 4;
      for (let v = 0; v < 4; v++) {
        const o = q + v * 3;
        p[o] = cx + (p[o] - cx) * leafShrink;
        p[o + 1] = cy + (p[o + 1] - cy) * leafShrink;
        p[o + 2] = cz + (p[o + 2] - cz) * leafShrink;
      }
    }
    positions = p;
  }
  const g = new THREE.BufferGeometry();
  const pos = positions instanceof Float32Array ? positions : new Float32Array(positions);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  if (stream.normals?.length) {
    const n = stream.normals instanceof Float32Array ? stream.normals : new Float32Array(stream.normals);
    g.setAttribute('normal', new THREE.BufferAttribute(n, 3));
  }
  if (stream.uvs?.length) {
    const uv = stream.uvs instanceof Float32Array ? stream.uvs : new Float32Array(stream.uvs);
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  if (stream.colors?.length) {
    const c = stream.colors instanceof Float32Array ? stream.colors : new Float32Array(stream.colors);
    // tree colors may be rgb or rgba
    const item = c.length / (pos.length / 3);
    g.setAttribute('color', new THREE.BufferAttribute(c, item >= 4 ? 4 : 3));
  }
  const idx = stream.indices;
  if (idx?.length) g.setIndex(new THREE.BufferAttribute(
    (idx instanceof Uint32Array || Math.max(...idx.slice(0, 1000)) > 65535) ? new Uint32Array(idx) : new Uint16Array(idx), 1));
  return g;
}

const VIEWS = {
  forest:    { pos: [riverX(30) + 10, 3.4, 30],  look: [riverX(-30) - 2, 5.0, -30] },
  river:     { pos: [riverX(34) + 7, 3.4, 34], look: [riverX(-30) - 2, 0.5, -30] },
  grassland: { pos: [-34, 10, 46],  look: [10, 2, -10] },
  particles: { pos: [7, 2.4, 13],   look: [-8, 3.5, -12] },
  // hero-character views — cameras are framed relative to the character's ground
  // (terrain height varies), so the hero is always in frame
  'character-forest': { pos: [0, 0, 0], look: [0, 0, 0],
    frame: { dpos: [1.55, 2.05, 2.35], dlook: [0, 1.42, 0] },
    character: { pose: 'stand', outfit: 'jacket', head: 'neutral', brim: 1, at: [4, 12], rotY: 0.35 } },
  'character-river': { pos: [0, 0, 0], look: [0, 0, 0],
    frame: { dpos: [4.2, 3.9, 5.0], lookAbs: [riverX(-14), WATER_Y + 0.3, -14] },
    character: { pose: 'walk', outfit: 'openjacket', head: 'smile', brim: 1, at: [riverX(2) + 7.5, 2], rotY: Math.PI } },
  'character-sitting': { pos: [0, 0, 0], look: [0, 0, 0],
    frame: { dpos: [3.4, 2.6, 3.8], dlook: [0, 1.3, 0] },
    character: { pose: 'sit', outfit: 'shirt', head: 'neutral', brim: 0, at: [-6, 20], rotY: 0.73 } },
  'character-portrait': { pos: [0, 0, 0], look: [0, 0, 0],
    frame: { dpos: [0.35, 1.68, 1.02], dlook: [0, 1.56, 0] },
    character: { pose: 'portrait', outfit: 'jacket', head: 'smile', brim: 2, at: [4, 12], rotY: 0.15 } },
  night: { pos: [0, 0, 0], look: [0, 0, 0], night: true,
    frame: { dpos: [3.5, 3.3, 5.5], dlook: [0, 2.6, 0] },
    character: { pose: 'stand', outfit: 'jacket', head: 'neutral', brim: 1, at: [2, 10], rotY: 0.57 } },
  'character-older': { pos: [0, 0, 0], look: [0, 0, 0],
    frame: { dpos: [0.45, 1.75, 1.15], dlook: [0, 1.56, 0] },
    character: { pose: 'stand', outfit: 'tshirt', head: 'older', brim: 0, at: [-12, 4], rotY: 0.25 } },
};

/* ---------------- time-of-day presets (Phase 1 realism) ----------------
   Each preset drives sun direction/color, sky-shader golden warmth, fog and
   exposure. 'midday' reproduces the exact pre-Phase-1 lighting so the
   renderer contract from Task 1 is unchanged unless a preset is chosen. */
const TOD = {
  midday: {
    sunDir: [0.55, 0.62, 0.35], sunColor: 0xfff2dd, sunI: 2.6,
    hemiSky: 0xbdd8ee, hemiGround: 0x5d6b46, hemiI: 0.85,
    fog: 0xcfdfe8, fogNear: 70, fogFar: 300, exposure: 1.12,
    golden: 0.0, warm: 0.0,
  },
  golden: {
    // B"H — 2026-10-13 Phase 1 lighting rebuild: warm white sun (~5500K, not
    // yellow), cool green-blue ambient (reference shadows are cool), exposure
    // 1.0. The reference is softly lit — restraint, not blowout.
    sunDir: [0.72, 0.30, 0.28], sunColor: 0xfff6e8, sunI: 2.4,
    hemiSky: 0xa8c8d8, hemiGround: 0x4a5a3a, hemiI: 0.7,
    fog: 0x9aaa7a, fogNear: 60, fogFar: 270, exposure: 1.0,
    golden: 1.0, warm: 0.25,
  },
  dusk: {
    sunDir: [0.78, 0.13, 0.18], sunColor: 0xff9e5e, sunI: 2.3,
    hemiSky: 0x9a7a90, hemiGround: 0x333a28, hemiI: 0.55,
    fog: 0xc9a48e, fogNear: 55, fogFar: 250, exposure: 1.15,
    golden: 1.6, warm: 1.0,
  },
};

export async function buildRealityScene(container, { view = 'forest', seed = 20261011, fast = false, tod = 'golden' } = {}) {
  // B"H — render-bar instrumentation: per-phase timings for the speed mission.
  const _t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  try { window.__buildStartEpoch = Date.now(); window.__navStartEpoch = Math.round(performance.timeOrigin); } catch {}
  const _marks = [];
  const mark = (name) => {
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    _marks.push([name, +((now - _t0) / 1000).toFixed(2)]);
  };
  const publishMarks = () => { try { window.__realityTimings = _marks; } catch {} };
  mark('start');
  const rand = mulberry32(seed);
  const noise = makeNoise2D(mulberry32(seed ^ 0x9e37));
  const night = Boolean((VIEWS[view] || {}).night);
  const vc = (VIEWS[view] || {}).character || null;
  const T = night ? null : (TOD[tod] || TOD.midday);
  // ground-relative camera framing for hero views (terrain height varies)
  if (vc && VIEWS[view].frame) {
    const gy = groundHeight(vc.at[0], vc.at[1], noise);
    const f = VIEWS[view].frame;
    VIEWS[view].pos = [vc.at[0] + f.dpos[0], gy + f.dpos[1], vc.at[1] + f.dpos[2]];
    VIEWS[view].look = f.lookAbs ? f.lookAbs.slice()
      : [vc.at[0] + f.dlook[0], gy + f.dlook[1], vc.at[1] + f.dlook[2]];
  }

  const renderer = new THREE.WebGLRenderer({ antialias: !fast });
  const SHADOW = fast ? 512 : 1024;
  const PQ = fast ? 0.5 : 1; // particle quantity scaler
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  // B"H speed: fast mode uses hard-PCF shadows (4 taps vs PCFSoft's wide
  // kernel) — shadow sampling on fullscreen receivers (terrain) is the
  // dominant SwiftShader fragment cost.
  renderer.shadowMap.type = fast ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = night ? 1.12 : T.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(night ? 0xcfdfe8 : T.fog, night ? 70 : T.fogNear, night ? 300 : T.fogFar);

  /* sky dome */
  const sunDir = new THREE.Vector3(...(night ? [0.55, 0.62, 0.35] : T.sunDir)).normalize();
  const moonDir = new THREE.Vector3(-0.42, 0.30, -0.60).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        sunDir: { value: sunDir },
        uMoonDir: { value: moonDir },
        uNight: { value: night ? 1 : 0 },
        uGolden: { value: night ? 0.0 : T.golden },
        uCloudT: { value: 0 },
        uFast: { value: fast ? 1 : 0 },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vDir; uniform vec3 sunDir; uniform vec3 uMoonDir;
        uniform float uNight; uniform float uGolden; uniform float uCloudT; uniform float uFast;
        float hash13(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
        float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
                     mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y); }
        float fbm(vec2 p){ float v = 0.0, a = 0.5;
          for (int i = 0; i < 5; i++) { if (uFast > 0.5 && i >= 3) break;
            v += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
          return v; }
        void main(){
          float h = clamp(vDir.y, -0.1, 1.0);
          vec3 zen = vec3(0.19, 0.42, 0.72);
          vec3 hor = vec3(0.82, 0.90, 0.95);
          vec3 col = mix(hor, zen, pow(max(h, 0.0), 0.55));
          float s = max(dot(normalize(vDir), sunDir), 0.0);
          col += vec3(1.0, 0.93, 0.78) * (pow(s, 900.0) * 1.4 + pow(s, 18.0) * 0.22);
          // golden-hour warmth: warm tint blooms along the horizon near the sun
          if (uGolden > 0.0) {
            vec3 d2 = normalize(vDir);
            float near = pow(max(dot(normalize(vec3(d2.x, 0.0, d2.z)),
                                        normalize(vec3(sunDir.x, 0.0, sunDir.z))), 0.0), 3.0);
            float horizBand = exp(-abs(h - 0.06) * 7.0);
            col = mix(col, vec3(1.0, 0.62, 0.34), near * horizBand * 0.55 * uGolden);
            col += vec3(1.0, 0.55, 0.25) * pow(s, 24.0) * 0.35 * uGolden;
            // stretch the sun disc lower for dusk
            col += vec3(1.0, 0.50, 0.22) * pow(s, 60.0) * 0.9 * uGolden;
          }
          // night sky: deep gradient + stars + moon
          vec3 nzen = vec3(0.006, 0.012, 0.032);
          vec3 nhor = vec3(0.028, 0.052, 0.098);
          vec3 d = normalize(vDir);
          vec3 ncol = mix(nhor, nzen, pow(max(h, 0.0), 0.5));
          float st = step(0.9986, hash13(floor(d * 220.0)));
          ncol += vec3(0.90, 0.93, 1.0) * st * smoothstep(0.02, 0.25, h);
          float m = max(dot(d, uMoonDir), 0.0);
          ncol += vec3(0.92, 0.95, 1.0) * (smoothstep(0.99850, 0.99950, m) * 1.6 + pow(m, 200.0) * 0.60);
          // day clouds: fbm-projected, sun-warmed, kept off the horizon band
          vec3 d2n = normalize(vDir);
          vec2 cuv = d2n.xz / (abs(d2n.y) + 0.18);
          float cl = fbm(cuv * 1.35 + vec2(uCloudT * 0.008, uCloudT * 0.0022));
          float cover = smoothstep(0.46, 0.70, cl) * smoothstep(0.015, 0.22, h);
          float shade = fbm(cuv * 2.6 + vec2(uCloudT * 0.011, 0.0) + 4.7);
          vec3 cloudCol = mix(vec3(0.72, 0.76, 0.82), vec3(1.04, 1.0, 0.96), shade);
          cloudCol = mix(cloudCol, vec3(1.05, 0.82, 0.62), uGolden * 0.45 * pow(s, 2.0));
          col = mix(col, cloudCol, cover * 0.92);
          col = mix(col, ncol, uNight);
          gl_FragColor = vec4(col, 1.0);
        }`
    })
  );
  scene.add(sky);

  /* sun glow billboard — cheap god-ray feel (1 extra draw call, no post chain) */
  if (!night) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const cx = cv.getContext('2d');
    const g = cx.createRadialGradient(64, 64, 4, 64, 64, 62);
    const warm = T.warm;
    g.addColorStop(0, `rgba(255,${232 - Math.round(warm * 40)},${205 - Math.round(warm * 90)},0.95)`);
    g.addColorStop(0.35, `rgba(255,${215 - Math.round(warm * 55)},${170 - Math.round(warm * 80)},0.38)`);
    g.addColorStop(1, 'rgba(255,190,120,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, 128, 128);
    const gtex = new THREE.CanvasTexture(cv); gtex.colorSpace = THREE.SRGBColorSpace;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: gtex, transparent: true, depthWrite: false,
      // B"H — Phase 1 (2026-10-13): 0.85→0.35. The sun glow was a major
      // blowout source. Soft presence, not a flare.
      blending: THREE.AdditiveBlending, fog: false, opacity: 0.35,
    }));
    glow.position.copy(sunDir).multiplyScalar(420);
    glow.scale.setScalar(90 + warm * 30);
    scene.add(glow);
  }

  /* B"H — volumetric god-ray shafts: crossed additive planes tilted along the
     sun direction, standing in the river corridor where the reference shows
     sunbeams piercing the canopy. Own RNG (srand) keeps the main deterministic
     layout sequence untouched. */
  const srand = mulberry32(seed ^ 0x5aa5);
  if (!night) {
    const sc = document.createElement('canvas'); sc.width = 128; sc.height = 256;
    const sx = sc.getContext('2d');
    const grad = sx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(255,236,200,0.28)');
    grad.addColorStop(0.55, 'rgba(255,228,180,0.10)');
    grad.addColorStop(1, 'rgba(255,220,160,0)');
    sx.fillStyle = grad; sx.fillRect(0, 0, 128, 256);
    sx.globalCompositeOperation = 'destination-in';
    const hg = sx.createLinearGradient(0, 0, 128, 0);
    hg.addColorStop(0, 'rgba(0,0,0,0)');
    hg.addColorStop(0.5, 'rgba(0,0,0,1)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    sx.fillStyle = hg; sx.fillRect(0, 0, 128, 256);
    const shaftTex = new THREE.CanvasTexture(sc); shaftTex.colorSpace = THREE.SRGBColorSpace;
    const shaftMat = new THREE.MeshBasicMaterial({
      map: shaftTex, transparent: true, blending: THREE.AdditiveBlending,
      // B"H — dramatic sunbeams (Yaakov 2026-10-13 "Fix it"): bright enough
      // to read against the canopy. Positioned to overlap tree edges where
      // additive glow is visible (not in open sky).
      // B"H — Phase 1 lighting rebuild (2026-10-13): 0.38→0.05. The reference
      // has whisper-soft rays, not beams. Restraint.
      depthWrite: false, side: THREE.DoubleSide, fog: false, opacity: 0.05,
    });
    const shaftGeo = new THREE.PlaneGeometry(4.5, 40);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), sunDir.clone().normalize());
    // B"H 2026-10-13 Phase 1: 14→10 shafts, whisper-soft per plan.
    for (let si = 0; si < 10; si++) {
      const z = -70 + si * 7 + (srand() - 0.5) * 5;
      const x = riverX(z) + (srand() - 0.5) * 24;
      const y = groundHeight(x, z, noise) + 15;
      const w = 5 + srand() * 4, l = 40 + srand() * 14;
      for (let k = 0; k < 2; k++) {
        const m = new THREE.Mesh(shaftGeo, shaftMat);
        m.position.set(x, y, z);
        m.quaternion.copy(q);
        m.rotateY(srand() * Math.PI + k * Math.PI / 2);
        m.scale.set(w / 4.5, l / 40, 1);
        scene.add(m);
      }
    }
    mark('shafts');
  }

  /* lights */
  if (night) {
    const moon = new THREE.DirectionalLight(0x9db8e8, 0.62);
    moon.position.copy(moonDir).multiplyScalar(120);
    moon.castShadow = true;
    moon.shadow.mapSize.set(SHADOW, SHADOW);
    moon.shadow.camera.left = -60; moon.shadow.camera.right = 60;
    moon.shadow.camera.top = 60; moon.shadow.camera.bottom = -60;
    moon.shadow.camera.far = 320; moon.shadow.bias = -0.0006;
    scene.add(moon);
    scene.add(new THREE.HemisphereLight(0x2a3a55, 0x141a14, 0.32));
    scene.fog.color.set(0x0a1322); scene.fog.near = 55; scene.fog.far = 240;
  } else {
    const sun = new THREE.DirectionalLight(T.sunColor, T.sunI);
    sun.position.copy(sunDir).multiplyScalar(120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(SHADOW, SHADOW);
    sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
    sun.shadow.camera.far = 320; sun.shadow.bias = -0.0006;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(T.hemiSky, T.hemiGround, T.hemiI));
    // B"H — 2026-10-13 photoreal: camera-facing fill light. The sun is behind
    // the foreground trunks from the camera's view, so they go black. This
    // soft fill lifts them to readable bark without washing the mood.
    // Only for the forest view where near trunks dominate the foreground.
    if (view === 'forest') {
      const vpos = VIEWS.forest.pos;
      // B"H — Sprint fix (2026-10-13): 0.35 was too dim, trunks went black and
      // the v2 bark texture couldn't read. 0.55 warm — reference trunks have
      // warm rim light on the camera side.
      const fill = new THREE.DirectionalLight(0xffe8c8, 0.55);
      fill.position.set(vpos[0], vpos[1] + 4, vpos[2]);
      fill.target.position.set(vpos[0] - 8, 2, vpos[2] - 20);
      scene.add(fill); scene.add(fill.target);
    }
  }

  /* B"H — canopy cutout: leaves1.png is RGB (no alpha channel), so the
     canopy material's alphaTest was a silent no-op and foliage rendered as
     solid slabs. This composites the photo through a painted leaf-cluster
     mask, giving real transparent gaps — airy foliage instead of green blobs.
     Yaakov 2026-10-13: DENSE canopies — 900 large overlapping blobs for full
     leaf mass, no winter-bare trees. Costs one 512px canvas composite at build
     time; zero per-frame cost. */
  async function makeCanopyCutout(url) {
    const photo = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = url;
    });
    const S = 512;
    const mask = document.createElement('canvas'); mask.width = mask.height = S;
    const mx = mask.getContext('2d');
    const r = mulberry32(4242);
    mx.clearRect(0, 0, S, S);
    // leaf-cluster blobs: DENSE coverage — large overlapping blobs, minimal gaps
    for (let i = 0; i < 900; i++) {
      const bx = r() * S, by = r() * S;
      const bw = 12 + r() * 26, bh = 8 + r() * 18;
      mx.save(); mx.translate(bx, by); mx.rotate(r() * Math.PI);
      const g = mx.createRadialGradient(0, 0, 0, 0, 0, bw);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.80, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      mx.fillStyle = g;
      mx.beginPath(); mx.ellipse(0, 0, bw, bh, 0, 0, 6.2832); mx.fill();
      mx.restore();
    }
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const cx = cv.getContext('2d');
    cx.drawImage(photo, 0, 0, S, S);
    cx.globalCompositeOperation = 'destination-in';
    cx.drawImage(mask, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
  }

  /* B"H — dense-canopy alpha: tex-canopy-dense.webp is photoreal leaves on BLACK.
     Key out near-black → real alpha. The dense leaf detail survives at render
     scale for true photoreal canopy (Yaakov 2026-10-13 98% push). */
  async function makeDenseCanopyAlpha(url) {
    const photo = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = url;
    });
    const S = 1024;
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const cx = cv.getContext('2d');
    cx.drawImage(photo, 0, 0, S, S);
    const id = cx.getImageData(0, 0, S, S);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      // black key with soft edge: lum<=25 → transparent, >=60 → opaque
      const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
      const a = Math.max(0, Math.min(1, (lum - 25) / 35));
      d[i + 3] = Math.round(a * 255);
    }
    cx.putImageData(id, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  /* B"H — leaf-cluster alpha: tex-leaf-cluster.webp is sunlit leaves on WHITE.
     Key out near-white → real alpha, so canopy quads show INDIVIDUAL LEAVES
     with true shapes instead of flat green blobs (Yaakov 2026-10-13: "leaves
     have no texture at all"). One 512px canvas composite at build; zero
     per-frame cost. */
  async function makeLeafClusterAlpha(url) {
    const photo = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = url;
    });
    const S = 512;
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const cx = cv.getContext('2d');
    cx.drawImage(photo, 0, 0, S, S);
    const id = cx.getImageData(0, 0, S, S);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      // white key with soft edge: lum>=230 → transparent, <=190 → opaque
      // B"H 2026-10-13 iter8: was 245/205 — near-white edge pixels survived as
      // white flakes (the flashing Yaakov saw). Aggressive key kills them.
      const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
      const a = Math.max(0, Math.min(1, (230 - lum) / 40));
      d[i + 3] = Math.round(a * 255);
    }
    cx.putImageData(id, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    // B"H 2026-10-13 texture-detail: no mipmaps on foliage — mip chains blur
    // the individual-leaf detail to mush at render distance. Crisp always.
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  /* textures (real photographs, Awtsmoos Drive) */
  const [grassTex, dirtTex, barkTex, canopyTex, leafTex,
         grassGroundTex, barkDetailTex, mossGroundTex, mossyBarkTex, fernTex,
         leafClusterTex, denseCanopyTex, backlitCanopyTex, impostorTex1, impostorTex2, impostorTex3, impostorTex4] = await Promise.all([
    loadTexture(TEX + 'grass1.jpg', 30, 30),
    loadTexture(TEX + 'dirt1.jpg', 40, 3),
    loadTexture(TEX + 'bark1.webp', 1, 2),
    makeCanopyCutout(TEX + 'new/tex-canopy-soft.webp'),
    loadTexture(TEX + 'leaf1.jpg', 1, 1),
    // B"H — reference-match texture set (Yaakov 2026-10-13)
    loadTexture(TEX + 'new/tex-grass-ground.webp', 36, 36),
    loadTexture(TEX + 'new/tex-bark-detail.webp', 1, 3),
    // B"H — Phase 5 (2026-10-13 sprint): v2 lumpy photoreal moss floor.
    loadTexture(TEX + 'new/tex-moss-floor-v2.webp', 2, 2),
    // B"H — Phase 3 (2026-10-13 sprint): v2 mossy bark — photoreal 1024px,
    // must READ on trunks (old texture was invisible).
    loadTexture(TEX + 'new/tex-mossy-bark-v2.webp', 1, 2),
    // B"H — Phase 5 (2026-10-13 sprint): v2 detailed fern frond, white-keyed
    // to alpha (generated WebP has baked white background, no alpha channel).
    makeLeafClusterAlpha(TEX + 'new/tex-fern-v2.webp'),
    // B"H — individual-leaf canopy texture (white keyed to alpha)
    // B"H 2026-10-13 iter6: tex-leaf-big = center-cropped for BIGGER leaves
    // at render scale. The full-cluster texture minified to mush.
    makeLeafClusterAlpha(TEX + 'new/tex-leaf-big.webp'),
    // B"H — 98% push: dense photoreal canopy (black keyed to alpha)
    makeDenseCanopyAlpha(TEX + 'tex-canopy-dense.webp'),
    // B"H — Phase 2 (2026-10-13 sprint): backlit leaves for translucency glow.
    makeLeafClusterAlpha(TEX + 'new/tex-canopy-backlit.webp'),
    // B"H — photoreal tree impostors: full trees on black, for dense forest walls.
    // Yaakov 2026-10-13: "do not stop until it's real" — these are the breakthrough.
    makeDenseCanopyAlpha(TEX + 'imp-tree-full-1.webp'),
    makeDenseCanopyAlpha(TEX + 'imp-tree-full-2.webp'),
    makeDenseCanopyAlpha(TEX + 'imp-tree-full-3.webp'),
    makeDenseCanopyAlpha(TEX + 'imp-tree-full-4.webp'),
  ]);
  mark('textures');

  /* tree placement — BEFORE terrain so canopy shade bakes into vertex colors.
     B"H reference match 2026-10-13: enclosed river corridor, denser forest. */
  const treeSpots = [];
  const CLEAR = {
    // B"H 2026-10-13 "Fix it": forest camera was buried in crown filler —
    // filler reaches ~10 units past the trunk, so 12 was not enough.
    // B"H 2026-10-13 photoreal: procedural trees stay FURTHER from camera
    // (impostors carry the midground now). 18→22 for forest.
    forest: 22, river: 15, grassland: 26, particles: 15,
    'character-forest': 14, 'character-river': 14, 'character-sitting': 14,
    'character-portrait': 12, night: 14, 'character-older': 12,
  }[view] || 15;
  const clearPts = [[VIEWS[view].pos[0], VIEWS[view].pos[2]]];
  if (vc) clearPts.push(vc.at);
  let guard = 0;
  while (treeSpots.length < (fast ? 24 : 40) && guard++ < 6000) {
    const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 200;
    if (Math.abs(x - riverX(z)) < 11) continue;                       // keep river clear
    if (clearPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < CLEAR)) continue;
    if (treeSpots.some(s => Math.hypot(s.x - x, s.z - z) < 8)) continue;
    treeSpots.push({ x, z });
  }
  /* B"H — river-corridor overhang trees (Yaakov 2026-10-13 "Fix it"): trees
     planted at the bank edge whose crowns lean over the water, closing the
     corridor like the reference. The lean is baked into placement (crownX) so
     terrain shade + filler match. */
  const overhangCount = fast ? 10 : 14;
  let og = 0, ogGuard = 0;
  while (og < overhangCount && ogGuard++ < 400) {
    // B"H 2026-10-13 enclosure: crowns reach 85% over the river for the
    // reference's tunnel feel. A few near-camera (z up to 20) arch HIGH over
    // the lens instead of blocking it.
    const z = -70 + rand() * 90;                     // z in [-70, 20]
    const side = rand() < 0.5 ? -1 : 1;
    const x = riverX(z) + side * (10.5 + rand() * 3.5);
    if (clearPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < CLEAR + 8)) continue;
    if (treeSpots.some(s => Math.hypot(s.x - x, s.z - z) < 10)) continue;
    treeSpots.push({ x, z, overhang: -side });
    og++;
  }
  mark('tree-spots');

  /* B"H — photoreal impostor forest walls (Yaakov 2026-10-13: "do not stop until it's real").
     Dense walls of full photoreal trees flank the river corridor, creating the
     lush enclosed forest mass of the reference. These are camera-facing billboards
     using the AI-generated tree images — indistinguishable from photographs at
     mid/far distance. The procedural trees provide 3D structure up close;
     impostors provide the dense forest mass behind them.
     Camera is fixed per view, so cylindrical billboards (Y-rotation only) are exact. */
  {
    const camPos = VIEWS[view] ? VIEWS[view].pos : [0, 3.4, 30];
    const impostorTexes = [impostorTex1, impostorTex2, impostorTex3, impostorTex4];
    // aspect of the impostor images (1120x2240 portrait)
    const IMP_ASPECT = 1120 / 2240;
    const walls = [];
    // two dense walls flanking the river, z from -80 to +25
    // B"H — 2026-10-13 photoreal: walls are CLOSE (12-28u) and DENSE to hide
    // procedural thinness behind photoreal mass. The reference is solid green walls.
    const wallCount = fast ? 48 : 80;
    for (let i = 0; i < wallCount; i++) {
      const z = -80 + (105 * i) / wallCount + (rand() - 0.5) * 4;
      for (const side of [-1, 1]) {
        // stagger: alternate sides slightly to avoid perfect symmetry
        if ((i + (side > 0 ? 1 : 0)) % 2 === 1 && rand() < 0.2) continue;
        const dist = 15 + rand() * 18; // 15-33 units — dense but with depth
        const x = riverX(z) + side * dist;
        // don't block the camera
        if (Math.hypot(x - camPos[0], z - camPos[2]) < 12) continue;
        // don't collide with procedural trees (they're in front)
        if (treeSpots.some(s => Math.hypot(s.x - x, s.z - z) < 5)) continue;
        walls.push({ x, z, side });
      }
    }
    // also a back wall far downstream for depth
    for (let i = 0; i < (fast ? 8 : 14); i++) {
      const x = riverX(-85) + (rand() - 0.5) * 70;
      const z = -85 - rand() * 25;
      walls.push({ x, z, side: 0 });
    }
    // B"H 2026-10-13: bank-edge impostors REMOVED — they created dark canopy
    // blobs filling the top of the frame when the camera got inside them.
    // The regular walls + procedural overhang trees provide enough enclosure.
    mark('impostor-spots:' + walls.length);
    const dummy = new THREE.Object3D();
    // group impostors by texture for 4 draw calls
    for (let ti = 0; ti < 4; ti++) {
      const spots = walls.filter((_, idx) => idx % 4 === ti);
      if (!spots.length) continue;
      // tree is ~2:1 portrait; height 18-30 units for forest giants
      const h = 22;
      const w = h * IMP_ASPECT;
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({
        map: impostorTexes[ti],
        alphaTest: 0.35,
        side: THREE.DoubleSide,
      });
      // B"H — Phase 2 (2026-10-13): grade impostors toward the reference's
      // deep-green palette. Unlit (baked photo lighting), color-matched.
      mat.color.setRGB(0.92, 1.0, 0.88);
      const inst = new THREE.InstancedMesh(geo, mat, spots.length);
      let placed = 0;
      for (const s of spots) {
        const gy = groundHeight(s.x, s.z, noise);
        const scale = 0.8 + rand() * 0.7;
        // base of tree (roots) below ground — deeper sink for varied root structures
        // B"H 2026-10-13: -1.5→-2.5, some impostors floated visibly
        const sink = s.bankEdge ? 3.0 : 2.5;
        dummy.position.set(s.x, gy + (h * scale) / 2 - sink, s.z);
        // cylindrical billboard: rotate Y to face camera
        const ang = Math.atan2(camPos[0] - s.x, camPos[2] - s.z);
        dummy.rotation.set(0, ang, 0);
        dummy.scale.set(scale, scale, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(placed++, dummy.matrix);
      }
      inst.count = placed;
      inst.castShadow = false; // impostors don't need to cast (perf)
      inst.receiveShadow = false;
      scene.add(inst);
    }
  }
  mark('impostor-walls');

  /* terrain */
  const terrGeo = new THREE.PlaneGeometry(WORLD, WORLD, 120, 120);
  terrGeo.rotateX(-Math.PI / 2);
  {
    const p = terrGeo.attributes.position;
    const colors = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const h = groundHeight(x, z, noise);
      p.setY(i, h);
      const d = Math.abs(x - riverX(z));
      // B"H reference match: vivid grass photo carries the green; vertex colors
      // add macro variation, damp darkening, canopy shade and dappled light.
      const patch = noise(x * 0.03 + 40, z * 0.03) * 0.5 + 0.5;
      let r = 1.00 + patch * 0.08, g = 1.04 + patch * 0.10, b = 0.94 + patch * 0.08;
      // B"H reference match 2026-10-13 "Fix it": MOSSY banks — bright
      // yellow-green moss near the water like the reference, not damp-dark.
      if (d < 9) { const t = 1 - d / 9; r *= (1 - t * 0.12); g *= (1 + t * 0.22); b *= (1 - t * 0.18); }
      // canopy shade + dappled sun flecks from REAL tree positions
      let minD2 = 1e9;
      for (let ti = 0; ti < treeSpots.length; ti++) {
        const s = treeSpots[ti];
        const dx = x - s.x, dz = z - s.z, dd = dx * dx + dz * dz;
        if (dd < minD2) minD2 = dd;
      }
      const gap = THREE.MathUtils.smoothstep(Math.sqrt(minD2), 5, 16);
      const dappleN = noise(x * 0.45 + 7, z * 0.45 + 3) * 0.5 + 0.5;
      const light = (0.88 + 0.34 * gap) * (0.90 + 0.20 * dappleN);
      // darken hollows
      const shade = THREE.MathUtils.clamp(1 + h * 0.05, 0.82, 1.06);
      const m = light * shade;
      colors[i * 3] = r * m; colors[i * 3 + 1] = g * m; colors[i * 3 + 2] = b * m;
    }
    terrGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrGeo.computeVertexNormals();
  }
  const terrain = new THREE.Mesh(terrGeo, new THREE.MeshStandardMaterial({
    map: grassGroundTex, vertexColors: true, roughness: 1.0, metalness: 0.0,
  }));
  terrain.receiveShadow = true;
  scene.add(terrain);
  mark('terrain');

  /* riverbed ribbon (dirt under water) */
  function ribbon(width, yFn, vRepeat) {
    const segs = 140, verts = [], uvs = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const z = -WORLD / 2 + (WORLD * i) / segs;
      const cx = riverX(z);
      for (let s = -1; s <= 1; s += 2) {
        const x = cx + s * width / 2;
        verts.push(x, yFn(x, z), z);
        uvs.push(s * 0.5 + 0.5, i / segs * vRepeat);
      }
      if (i < segs) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const riverbed = new THREE.Mesh(
    ribbon(21, (x, z) => groundHeight(x, z, noise) - 0.12, 24),
    new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 1 })
  );
  riverbed.receiveShadow = true;
  scene.add(riverbed);

    /* water — animated shader.
     B"H river rebuild 2026-10-13 (Yaakov: "River looks terrible"):
     - water ribbon widened 11 -> 19.5 so it actually reaches the banks
       (waterline sits at d~9.5 from center; the old 11-wide ribbon left a
       stripe of bare dirt between water edge and bank)
     - world-space isotropic ripples (the old vUv-stretched fields made
       visible horizontal bands); two layers scroll downstream
     - dedicated low glitter sun toward -z so the camera looking down-river
       sees a sparkling glitter path like the reference (the scene sun sits
       side-on and its specular never reaches this camera)
     - twinkling high-power glints, fresnel sky reflection, pebble bed in
       the shallows, noise-broken foam lapping at the waterline, alpha fade
       to zero at the banks, manual fog so the river melts into the mist */
  const waterUniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uSunDir: { value: sunDir },
      uGlitterDir: { value: new THREE.Vector3(-0.18, 0.16, -0.97).normalize() },
      uDeep: { value: new THREE.Color(0x1a4a48) },
      uShallow: { value: new THREE.Color(0x5aa898) },
      uSky: { value: new THREE.Color(0xcfe4ea) },
      uFogColor: { value: new THREE.Color(T.fog) },
      uFogNear: { value: T.fogNear },
      uFogFar: { value: T.fogFar },
    },
  ]);
  // UniformsUtils.merge clones — restore live references
  waterUniforms.uSunDir.value = sunDir;
  const water = new THREE.Mesh(
    ribbon(19.5, () => WATER_Y, 24),
    new THREE.ShaderMaterial({
      transparent: true, uniforms: waterUniforms, fog: false,
      side: THREE.DoubleSide, depthWrite: false,
      vertexShader: `varying vec2 vUv; varying vec3 vPos;
        void main(){ vUv = uv; vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; varying vec3 vPos;
        uniform float uTime, uFogNear, uFogFar;
        uniform vec3 uSunDir, uGlitterDir, uDeep, uShallow, uSky, uFogColor;
        // world-ish coords: u spans 19.5 units across, v spans 24 tiles of ~8.33
        float hgt(vec2 p, float t){
          // B"H — Phase 4 (2026-10-13): directional flow — stretched along
          // downstream (y), choppier across (x). Current streaks, not uniform.
          return sin(p.x*2.6 + t*1.2)*0.30 + sin(p.y*0.9 - t*1.5)*0.28
               + sin(p.x*1.8 + p.y*0.7 + t*2.1)*0.20
               + sin(p.x*6.2 - t*2.6)*sin(p.y*1.8 + t*2.2)*0.14;
        }
        vec2 slopeAt(vec2 p, float t){
          float e = 0.22;
          float hC = hgt(p, t);
          return vec2(hgt(p+vec2(e,0.0),t)-hC, hgt(p+vec2(0.0,e),t)-hC)/e;
        }
        float hash22(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec2 pw = vec2(vUv.x*19.5, vUv.y*8.33);
          // two ripple layers drifting downstream (-v), different speeds
          vec2 p1 = pw + vec2(uTime*0.22, -uTime*1.05);
          vec2 p2 = pw*2.3 + vec2(-uTime*0.45, -uTime*2.1) + 7.3;
          vec2 grad = slopeAt(p1, uTime)*0.55 + slopeAt(p2, uTime*1.35)*0.30;
          vec3 n = normalize(vec3(-grad.x, 1.0, -grad.y));
          vec3 viewDir = normalize(cameraPosition - vPos);
          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
          vec3 r = reflect(-viewDir, n);
          float gdot = max(dot(r, uGlitterDir), 0.0);
          float sheen = pow(gdot, 48.0);
          float glint = pow(gdot, 700.0);
          // twinkle: each sparkle cell shimmers on its own phase
          float tw = 0.45 + 0.55*(0.5 + 0.5*sin(uTime*7.0 + hash22(floor(pw*7.0))*43.0));
          float centerDepth = 1.0 - abs(vUv.x*2.0 - 1.0);
          // pebble bed in the shallows, refracted by the ripple
          vec2 gp = pw*3.4 + grad*1.5;
          vec2 gid = floor(gp); vec2 gf = fract(gp);
          vec2 pc = vec2(0.5) + (vec2(hash22(gid+7.3), hash22(gid+3.1))-0.5)*0.55;
          float pd = length((gf-pc)*vec2(1.0,1.3));
          float peb = smoothstep(0.44, 0.37, pd);
          float prnd = hash22(gid+1.7);
          vec3 pebCol = mix(vec3(0.22,0.21,0.19), vec3(0.42,0.40,0.36), prnd);
          pebCol *= 0.85 + 0.3*hash22(gid+9.2);
          vec3 bed = mix(vec3(0.15,0.14,0.12), pebCol, peb);
          float shallow = 1.0 - smoothstep(0.10, 0.55, centerDepth);
          vec3 col = mix(uShallow, uDeep, 0.25 + 0.55*centerDepth);
          // B"H — Phase 4 (2026-10-13): pebble bed more visible (0.8→0.95),
          // water more transparent so the bed reads like the reference.
          col = mix(col, bed*vec3(0.72,0.95,0.88), shallow*0.95);
          col = mix(col, uSky, fres*0.28);
          // glitter path on the water + faint real-sun sparkle
          // B"H 2026-10-13 photoreal: boosted for the reference's bright glitter path
          float sdot = max(dot(r, uSunDir), 0.0);
          col += vec3(1.0,0.96,0.88)*(sheen*0.45 + glint*4.0*tw)
               + vec3(1.0,0.93,0.80)*pow(sdot, 120.0)*0.7;
          // soft alpha fade at the banks — no hard waterline
          float edge = smoothstep(0.0, 0.10, vUv.x)*smoothstep(1.0, 0.90, vUv.x);
          // foam lapping at the waterline, broken up by noise
          float band = 1.0 - smoothstep(0.0, 0.085, vUv.x)*smoothstep(1.0, 0.915, vUv.x);
          float fn = hash22(floor(pw*vec2(3.0, 9.0)));
          float lap = 0.5 + 0.5*sin(uTime*1.6 + pw.y*1.8 + fn*6.28);
          float foam = band * smoothstep(0.45, 0.85, fn*0.6 + lap*0.45) * 0.65;
          col = mix(col, vec3(0.90,0.95,0.93), clamp(foam, 0.0, 1.0));
          float alpha = mix(0.0, 0.75, edge) + foam*0.12;
          // manual fog: the river winds away into the mist like the reference
          float fd = distance(cameraPosition, vPos);
          float f2 = smoothstep(uFogNear, uFogFar, fd);
          col = mix(col, uFogColor, f2);
          alpha = mix(alpha, 1.0, f2*0.85);
          gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.96)); }`
    })
  );
  scene.add(water);
  mark('water');

  /* wet-bank shore: dark damp ribbon hugging the terrain at the waterline,
     softens the water-to-land transition (no hard edge) */
  const shore = new THREE.Mesh(
    ribbon(25, (x, z) => groundHeight(x, z, noise) + 0.07, 24),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { uFogColor: { value: new THREE.Color(T.fog) },
                  uFogNear: { value: T.fogNear }, uFogFar: { value: T.fogFar } },
      vertexShader: `varying vec2 vUv; varying vec3 vPos;
        void main(){ vUv = uv; vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; varying vec3 vPos;
        uniform vec3 uFogColor; uniform float uFogNear, uFogFar;
        void main(){
          // damp band hugging the waterline (edges of the ribbon), fading out
          float dEdge = min(vUv.x, 1.0 - vUv.x);
          float wet = smoothstep(0.30, 0.06, dEdge) * smoothstep(0.0, 0.045, dEdge);
          vec3 col = vec3(0.16, 0.19, 0.12);
          float fd = distance(cameraPosition, vPos);
          col = mix(col, uFogColor, smoothstep(uFogNear, uFogFar, fd));
          gl_FragColor = vec4(col, wet*0.55); }`
    })
  );
  shore.renderOrder = 1;
  scene.add(shore);
  mark('shore');

/* trees — ez-tree-derived procedural generator, real bark + canopy photos */
  const barkMat = new THREE.MeshStandardMaterial({
    map: mossyBarkTex, roughness: 0.95,
    color: new THREE.Color(0.85, 0.85, 0.80),
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    // B"H 2026-10-13 texture-detail: was pale sage tint (0.58,0.66,0.55) washing
    // the rich leaf photo to flat paper. Deep forest tint lets real leaf detail
    // show. depthWrite kills alpha-test flicker.
    map: leafClusterTex, alphaTest: 0.35, side: THREE.DoubleSide,
    roughness: 0.9, color: new THREE.Color(0.42, 0.50, 0.38),
    emissive: new THREE.Color(0.012, 0.022, 0.010),
    depthWrite: true,
  });
  const ARCHETYPES = [
    ['Oak Large', 'oak-large'], ['Pine Large', 'pine-large'],
    ['Birch Elegant', 'birch-elegant'], ['Willow Weeping', 'willow-weeping'],
  ];
  // B"H — baked tree geometries (assets/trees/*.json, see tools/bake-trees.mjs).
  // Fully deterministic archetypes: baking removes ~1.5-9s of tree-gen JS from
  // every render. Falls back to procedural generation if assets are missing.
  // B"H speed: fast mode drops willow-weeping (80k tris, 8.9MB JSON) from the
  // pool — skips its fetch+parse and cuts average tree geometry ~40%.
  const POOL = fast ? ARCHETYPES.filter(([, slug]) => slug !== 'willow-weeping') : ARCHETYPES;
  async function loadTreeGeos() {
    const out = [];
    for (const [name, slug] of POOL) {
      let baked = null;
      try {
        const r = await fetch(`./assets/trees/${slug}.json`);
        if (r.ok) baked = await r.json();
      } catch {}
      const t = baked || generateTreeProceduralData(name, { detail: 'balanced' });
      out.push({
        bark: bufferGeometryFromStream(t.bark || t.branches),
        leaves: bufferGeometryFromStream(t.leaves, 0.85),
      });
    }
    return out;
  }
  const treeGeos = await loadTreeGeos();
  mark('tree-gen');
  const treeGroup = new THREE.Group();
  // B"H — treeSpots computed BEFORE terrain (moved 2026-10-13) so terrain
  // vertex colors bake real canopy shade + dappled light. Same rand order.
  for (const s of treeSpots) {
    const a = treeGeos[(rand() * treeGeos.length) | 0];
    const sc = s.overhang ? (1.15 + rand() * 0.6) : (0.85 + rand() * 0.75);
    const y = groundHeight(s.x, s.z, noise);
    for (const [geo, mat] of [[a.bark, barkMat], [a.leaves, canopyMat]]) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(s.x, y - 0.15, s.z);
      m.rotation.y = rand() * Math.PI * 2;
      m.scale.setScalar(sc);
      m.castShadow = true; m.receiveShadow = true;
      treeGroup.add(m);
    }
    // B"H — canopy filler: instanced foliage blobs packed into the crown volume.
    // Yaakov 2026-10-13: trees must have FULL dense canopies, no winter-bare look.
    // The baked leaf quads alone read sparse; these blobs fill the crown with
    // leaf mass. One instanced draw for all trees.
    // Overhang trees lean their crowns over the river corridor (crownX).
    s.crownY = y + 8 * sc; s.crownR = 5.5 * sc;
    s.crownX = s.x + (s.overhang ? s.overhang * s.crownR * 0.85 : 0);
  }
  scene.add(treeGroup);
  mark('trees-placed');

  /* B"H — branch-skeleton v2 (Yaakov 2026-10-13, "refine algorithms" sprint).
     DROP-IN REPLACEMENT for lines 929-1061 (the old straight 2-level
     "scaffolding" block). Same scope in/out: reads treeSpots, rand, noise,
     scene, mark, mossyBarkTex, denseCanopyTex, fast; defines segs, tips;
     adds 3 instanced meshes to scene; calls mark('branch-skeleton'),
     mark('crown-filler'), mark('crown-limbs').
     Algorithm — 4-level recursive curved branching with phototropism:
       L0 trunk leader: from just below the crown base, up through the crown.
       L1 primary limbs: 3-4 per tree, bowed outward+upward toward the light.
       L2 secondary branches: 2-3 per parent, sprouting from 45-95% along it.
       L3 tertiary twigs: 2-3 per parent.
       L4 quaternary spray: 2 per parent — short fine shoots, nearly pointed.
     Every branch is a quadratic bezier: the control point is bowed UP
     (phototropism — wood reaches for the light) and OUTWARD from the trunk
     axis (so limbs arc before rising, like real trees). The curve is
     tessellated into 3 short tapered cylinder sub-segments — a quadratic
     bezier is smooth enough that 3 pieces read continuous.
     Radius: ×0.6 per level (L0 0.30 → L4 ~0.04, scaled by tree size), plus
     aggressive 0.55× taper across each branch so tips come nearly to a point.
     Moss on wood: (a) per-instance color on the wood InstancedMesh — sub-
     segments facing up lerp toward moss green; (b) one extra instanced draw
     of small flattened moss blobs hugging the tops of L0-L2 segments.
     Foliage: anchors at every L3+ tip AND along L2+ branches with spacing
     that tightens toward the tip (t = 0.5/0.75/1.0) — denser at the tips,
     like real trees. Every leaf quad sits within ~1.3u of real wood.
     GPU: exactly 3 draw calls — one InstancedMesh for all wood, one for moss
     blobs, one for leaf quads (per-instance colors, castShadow on). */
  {
    const up = new THREE.Vector3(0, 1, 0);
    const dummy = new THREE.Object3D();

    // quadratic bezier point B(t) for control polygon (p0, c, p1)
    function bezPt(p0x, p0y, p0z, cx, cy, cz, p1x, p1y, p1z, t, out) {
      const u = 1 - t;
      out.set(
        u * u * p0x + 2 * u * t * cx + t * t * p1x,
        u * u * p0y + 2 * u * t * cy + t * t * p1y,
        u * u * p0z + 2 * u * t * cz + t * t * p1z
      );
      return out;
    }

    const segs = [];      // {ax,ay,az, bx,by,bz, r0, r1, level, tree}
    const tips = [];      // {x,y,z, tree, level} — every L3+ tip
    const anchors = [];   // {x,y,z} — leaf-quad stations (tips + tip-weighted along L2+)
    const mossBlobs = []; // {x,y,z, s} — moss colonies on upward-facing L0-L2 wood

    const MAX_LEVEL = 4;
    const BASE_RADIUS = [0.30, 0.18, 0.108, 0.065, 0.039]; // ×0.6 per level

    const _e = new THREE.Vector3();   // branch end
    const _ca = new THREE.Vector3();  // scratch curve point
    const _cb = new THREE.Vector3();  // scratch curve point
    const _d = new THREE.Vector3();   // scratch child heading
    const _bark = new THREE.Color(0.50, 0.42, 0.34);
    const _mossGreen = new THREE.Color(0.32, 0.45, 0.22);

    // recursive phototropic grow: origin Vector3, dir Vector3 (normalized)
    function grow(s, ccx, origin, dir, len, level, r0) {
      _e.copy(origin).addScaledVector(dir, len);
      // control point bowed UP (phototropism) and OUTWARD from the trunk axis
      const curl = (0.10 + rand() * 0.14) * len * (level === 0 ? 0.35 : 1.0);
      const outx = origin.x - ccx, outz = origin.z - s.z;
      const outLen = Math.hypot(outx, outz) || 1;
      const cpx = (origin.x + _e.x) / 2 + (outx / outLen) * curl * 0.9;
      const cpy = (origin.y + _e.y) / 2 + curl;
      const cpz = (origin.z + _e.z) / 2 + (outz / outLen) * curl * 0.9;
      // tessellate the bezier into 3 short tapered sub-segments
      const SUB = 3;
      let px = origin.x, py = origin.y, pz = origin.z;
      const rTip = r0 * 0.55; // aggressive taper across the branch
      for (let si = 1; si <= SUB; si++) {
        const t0 = (si - 1) / SUB, t1 = si / SUB;
        const ra = r0 + (rTip - r0) * t0, rb = r0 + (rTip - r0) * t1;
        bezPt(origin.x, origin.y, origin.z, cpx, cpy, cpz, _e.x, _e.y, _e.z, t1, _cb);
        segs.push({ ax: px, ay: py, az: pz, bx: _cb.x, by: _cb.y, bz: _cb.z,
                    r0: ra, r1: rb, level, tree: s });
        // moss colony anchor: tops of upward-facing L0-L2 wood
        if (level <= 2) {
          const dy = _cb.y - py, dx = _cb.x - px, dz = _cb.z - pz;
          const dl = Math.hypot(dx, dy, dz) || 1;
          if (dy / dl > 0.25) {
            mossBlobs.push({
              x: (px + _cb.x) / 2,
              y: (py + _cb.y) / 2 + ra * 0.55,
              z: (pz + _cb.z) / 2,
              // B"H — sprint fix: was ra*(1.6-3.0) = up to 0.9u blobs (tumors).
              // Moss colonies are small: 0.08-0.18u.
              s: 0.08 + rand() * 0.10,
            });
          }
        }
        px = _cb.x; py = _cb.y; pz = _cb.z;
      }
      const tipX = px, tipY = py, tipZ = pz;
      // foliage anchors: every L3+ tip, plus tip-weighted stations along L2+
      if (level === 2) {
        for (const ta of [0.5, 0.75]) {
          bezPt(origin.x, origin.y, origin.z, cpx, cpy, cpz, _e.x, _e.y, _e.z, ta, _ca);
          anchors.push({ x: _ca.x, y: _ca.y, z: _ca.z });
        }
        anchors.push({ x: tipX, y: tipY, z: tipZ });
      } else if (level === 3) {
        bezPt(origin.x, origin.y, origin.z, cpx, cpy, cpz, _e.x, _e.y, _e.z, 0.7, _ca);
        anchors.push({ x: _ca.x, y: _ca.y, z: _ca.z });
        anchors.push({ x: tipX, y: tipY, z: tipZ });
        tips.push({ x: tipX, y: tipY, z: tipZ, tree: s, level });
      } else if (level === 4) {
        anchors.push({ x: tipX, y: tipY, z: tipZ });
        tips.push({ x: tipX, y: tipY, z: tipZ, tree: s, level });
      }
      if (level >= MAX_LEVEL) return;
      // spawn 2-4 children from the distal 45-95% of the branch
      const nCh = level === 0 ? 3 + ((rand() * 2) | 0)   // 3-4 primary limbs
                : level === 3 ? 2                        // L4 spray: 2 fine shoots
                : 2 + ((rand() * 2) | 0);                 // 2-3
      for (let c = 0; c < nCh; c++) {
        const t = 0.45 + rand() * 0.50;
        bezPt(origin.x, origin.y, origin.z, cpx, cpy, cpz, _e.x, _e.y, _e.z, t, _ca);
        const spawn = new THREE.Vector3(_ca.x, _ca.y, _ca.z); // clone: _ca is reused below
        _d.copy(dir);
        _d.applyAxisAngle(up, (rand() - 0.5) * 1.2); // yaw scatter
        const ax = rand() * Math.PI * 2;            // pitch away from parent
        _d.applyAxisAngle(new THREE.Vector3(Math.cos(ax), 0, Math.sin(ax)),
                          (0.35 + rand() * 0.55) * (rand() < 0.72 ? 1 : -1));
        _d.y += 0.25 + rand() * 0.25;                // phototropism: reach for light
        _d.normalize();
        const childLen = len * (0.55 + rand() * 0.15); // length ×0.55-0.7
        grow(s, ccx, spawn, _d, childLen, level + 1, BASE_RADIUS[level + 1] * (s.crownR / 5.5));
      }
    }

    for (const s of treeSpots) {
      const ccx = (s.crownX !== undefined ? s.crownX : s.x);
      const baseY = s.crownY - s.crownR * 0.45;
      const tsc = s.crownR / 5.5; // tree size scale (crownR = 5.5 * sc)
      // L0 trunk leader: from just below the crown base, up through the crown
      const o0 = new THREE.Vector3(ccx, baseY - s.crownR * 0.15, s.z);
      const d0 = new THREE.Vector3((rand() - 0.5) * 0.15, 1, (rand() - 0.5) * 0.15).normalize();
      grow(s, ccx, o0, d0, s.crownR * 0.85, 0, BASE_RADIUS[0] * tsc);
    }

    // ---- draw every sub-segment as an instanced tapered cylinder ----
    // geometry has baked-in taper (top = 0.62 of bottom); per-instance scale
    // sets the mid radius, so the stacked sub-segments read as one smooth
    // tapered, curving branch.
    const segGeo = new THREE.CylinderGeometry(1, 0.62, 1, 5, 1, true);
    segGeo.translate(0, 0.5, 0); // base at origin, grows +Y, unit height
    const segMat = new THREE.MeshStandardMaterial({
      map: mossyBarkTex, roughness: 1.0,
      color: new THREE.Color(0xffffff), // per-instance colors carry bark/moss tint
    });
    const segInst = new THREE.InstancedMesh(segGeo, segMat, segs.length);
    const sv = new THREE.Vector3(), sq = new THREE.Quaternion(), ss = new THREE.Vector3();
    const _tint = new THREE.Color();
    let sp = 0;
    for (const g of segs) {
      sv.set(g.bx - g.ax, g.by - g.ay, g.bz - g.az);
      const len = sv.length() || 1e-6;
      sq.setFromUnitVectors(up, sv.clone().normalize());
      dummy.position.set(g.ax, g.ay, g.az);
      dummy.quaternion.copy(sq);
      dummy.scale.set((g.r0 + g.r1) / 2, len, (g.r0 + g.r1) / 2);
      dummy.updateMatrix();
      segInst.setMatrixAt(sp, dummy.matrix);
      // moss on wood: upward-facing sub-segments lerp toward moss green
      const upness = Math.max(0, Math.min(1, (g.by - g.ay) / len));
      _tint.copy(_bark).lerp(_mossGreen, upness * 0.60);
      segInst.setColorAt(sp, _tint);
      sp++;
    }
    segInst.count = sp;
    if (segInst.instanceColor) segInst.instanceColor.needsUpdate = true;
    segInst.castShadow = true; segInst.receiveShadow = true;
    scene.add(segInst);
    mark('branch-skeleton');

    // ---- instanced moss blobs hugging the tops of L0-L2 branches ----
    if (mossBlobs.length > 0) {
      const mossGeo = new THREE.IcosahedronGeometry(1, 0);
      const mossMat = new THREE.MeshStandardMaterial({
        // B"H — sprint: richer moss green (was grayish).
        color: new THREE.Color(0.25, 0.48, 0.16), roughness: 1.0,
      });
      const mossInst = new THREE.InstancedMesh(mossGeo, mossMat, mossBlobs.length);
      let mp = 0;
      for (const mb of mossBlobs) {
        dummy.position.set(mb.x, mb.y, mb.z);
        dummy.quaternion.identity();
        dummy.rotateY(rand() * Math.PI * 2);
        dummy.scale.set(mb.s, mb.s * 0.35, mb.s); // flattened — sits ON the wood
        dummy.updateMatrix();
        mossInst.setMatrixAt(mp++, dummy.matrix);
      }
      mossInst.count = mp;
      mossInst.receiveShadow = true;
      scene.add(mossInst);
    }
    mark('crown-limbs');

    // ---- leaf quads — clustered at foliage anchors (L3+ tips + tip-weighted
    // along L2+ branches). Foliage hugs the wood: quads sit within ~1.3u of
    // their anchor with small jitter, so no leaf floats in empty space. ----
    const quadGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const quadMat = new THREE.MeshStandardMaterial({
      map: denseCanopyTex, alphaTest: 0.30, side: THREE.DoubleSide,
      // B"H — Phase 2 (re-applied after branch v2 patch): deep green, not yellow.
      // B"H — Phase 2 backlight (sprint): emissiveMap with backlit leaf photo
      // for translucency glow where sun shines through.
      roughness: 0.9, color: new THREE.Color(0.30, 0.42, 0.22),
      emissive: new THREE.Color(0.35, 0.42, 0.20),
      emissiveMap: backlitCanopyTex,
      depthWrite: true,
    });
    const PER_ANCHOR = fast ? 3 : 4;
    const inst = new THREE.InstancedMesh(quadGeo, quadMat, anchors.length * PER_ANCHOR);
    const out = new THREE.Vector3();
    const tint = new THREE.Color();
    let placed = 0;
    for (const an of anchors) {
      for (let i = 0; i < PER_ANCHOR; i++) {
        // jitter within a small ball around the anchor — foliage hugs the branch
        const jth = rand() * Math.PI * 2;
        const jph = Math.acos(2 * rand() - 1);
        const jr = 1.3 * Math.cbrt(rand());
        const bx = an.x + jr * Math.sin(jph) * Math.cos(jth);
        const by = an.y + jr * Math.cos(jph) * 0.7;
        const bz = an.z + jr * Math.sin(jph) * Math.sin(jth);
        const bs = 1.0 + rand() * 1.2;
        dummy.position.set(bx, by, bz);
        // face away from the anchor so quads fan outward, never edge-on clumps
        out.set(bx - an.x, (by - an.y) * 1.2 + 0.15, bz - an.z);
        if (out.lengthSq() < 1e-6) out.set(0, 1, 0);
        out.normalize();
        dummy.lookAt(bx + out.x, by + out.y, bz + out.z);
        dummy.rotateZ(rand() * Math.PI * 2);
        dummy.scale.set(bs, bs, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(placed, dummy.matrix);
        const v = 0.82 + rand() * 0.30;
        tint.setRGB(v * (0.94 + rand() * 0.08), v, v * (0.90 + rand() * 0.08));
        inst.setColorAt(placed, tint);
        placed++;
      }
    }
    inst.count = placed;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.castShadow = true; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('crown-filler');


  /* distant tree-line — procedural billboard trees at the world rim, hazed by fog.
     Two staggered rings with gaps. The silhouette texture is painted on a canvas
     (blobs + trunk, real alpha) so quads break into tree shapes — never slabs. */
  function makeRimTreeTexture() {
    const S = 256;
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const cx = cv.getContext('2d');
    const r = mulberry32(777);
    cx.clearRect(0, 0, S, S);
    // trunk
    const tw = 10 + r() * 8;
    const tg = cx.createLinearGradient(S / 2 - tw / 2, 0, S / 2 + tw / 2, 0);
    tg.addColorStop(0, 'rgba(58,42,30,0)'); tg.addColorStop(0.25, 'rgba(58,42,30,1)');
    tg.addColorStop(0.75, 'rgba(74,56,40,1)'); tg.addColorStop(1, 'rgba(58,42,30,0)');
    cx.fillStyle = tg;
    cx.fillRect(S / 2 - tw / 2, S * 0.42, tw, S * 0.58);
    // canopy: layered soft blobs, denser toward the middle-top.
    // B"H — deep forest greens with strong cores: distant trees must read as
    // TREES through the fog wash, not gray smudges.
    for (let i = 0; i < 85; i++) {
      const bx = S / 2 + (r() - 0.5) * S * 0.62;
      const by = S * 0.30 + (r() - 0.5) * S * 0.42 - Math.abs(bx - S / 2) * 0.25;
      const br = S * (0.05 + r() * 0.10);
      const g2 = cx.createRadialGradient(bx, by, br * 0.1, bx, by, br);
      const tone = 20 + r() * 22;
      g2.addColorStop(0, `rgba(${tone},${tone + 42},${tone + 8},1)`);
      g2.addColorStop(0.62, `rgba(${tone},${tone + 36},${tone + 6},0.92)`);
      g2.addColorStop(1, `rgba(${tone},${tone + 30},${tone},0)`);
      cx.fillStyle = g2;
      cx.beginPath(); cx.arc(bx, by, br, 0, 6.283); cx.fill();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  {
    const rimTex = makeRimTreeTexture();
    const quads = [];
    const pushQuad = (cx, y0, cz, w, h, rotY) => {
      const hw = w / 2, c = Math.cos(rotY), s = Math.sin(rotY);
      const corners = [[-hw, y0], [hw, y0], [hw, y0 + h], [-hw, y0 + h]];
      const pts = corners.map(([lx, ly]) => [cx + lx * c, ly, cz - lx * s]);
      const uvs = [[0, 0], [1, 0], [1, 1], [0, 1]];
      const base = quads.length / 5;
      for (let i = 0; i < 4; i++) quads.push(pts[i][0], pts[i][1], pts[i][2], uvs[i][0], uvs[i][1]);
      return base;
    };
    const idx = [];
    for (const [ringR, n, wMin, wMax, hMin, hMax] of [[132, 52, 10, 18, 22, 44], [162, 44, 14, 24, 30, 55]]) {
      for (let i = 0; i < n; i++) {
        if (rand() < 0.30) continue; // gaps — forest, not wall
        const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.24;
        const r = ringR + (rand() - 0.5) * 20;
        const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
        if (Math.abs(cx - riverX(cz)) < 14) continue; // don't dam the river corridor
        const w = wMin + rand() * (wMax - wMin), h = hMin + rand() * (hMax - hMin);
        const b1 = pushQuad(cx, -2, cz, w, h, a + Math.PI / 2 + (rand() - 0.5) * 0.5);
        idx.push(b1, b1 + 1, b1 + 2, b1, b1 + 2, b1 + 3);
        const b2 = pushQuad(cx, -2, cz, w * 0.85, h * 0.92, a + (rand() - 0.5) * 0.5);
        idx.push(b2, b2 + 1, b2 + 2, b2, b2 + 2, b2 + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(quads);
    g.setAttribute('position', new THREE.BufferAttribute(arr.filter((_, i) => i % 5 < 3), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(arr.filter((_, i) => i % 5 >= 3), 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const rim = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
      map: rimTex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 1,
      // B"H — Yaakov 2026-10-13: distant treeline must be DARK GREEN, not gray
      // ghosts. fog:false (haze is baked into the texture); darker multiplier
      // keeps the forest reading as forest through the atmospheric perspective.
      fog: false,
      color: new THREE.Color(0.42, 0.58, 0.42),
    }));
    rim.castShadow = false; rim.receiveShadow = false;
    scene.add(rim);
  }
  mark('treeline');

  /* underbrush — instanced foliage blobs clustered near tree bases.
     Midground richness for almost no raster cost (one instanced draw). */
  {
    const blobGeo = new THREE.IcosahedronGeometry(1, 1);
    const bp = blobGeo.attributes.position;
    for (let i = 0; i < bp.count; i++) {
      const s = 1 + 0.25 * Math.sin(bp.getX(i) * 5.1 + 1.3) * Math.sin(bp.getZ(i) * 4.3 + 0.7);
      bp.setXYZ(i, bp.getX(i) * s, bp.getY(i) * s * 0.62, bp.getZ(i) * s);
    }
    blobGeo.computeVertexNormals();
    const blobMat = new THREE.MeshStandardMaterial({
      map: leafTex, alphaTest: 0.35, roughness: 1.0,
      color: new THREE.Color(0.38, 0.50, 0.33),
      emissive: new THREE.Color(0.04, 0.07, 0.03),
    });
    const COUNT = fast ? 100 : 240;
    const inst = new THREE.InstancedMesh(blobGeo, blobMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, guard2 = 0;
    while (placed < COUNT && guard2++ < COUNT * 20) {
      const t = treeSpots[(rand() * treeSpots.length) | 0];
      if (!t) break;
      const a = rand() * Math.PI * 2, r = 2.5 + rand() * 9;
      const x = t.x + Math.cos(a) * r, z = t.z + Math.sin(a) * r;
      if (Math.abs(x - riverX(z)) < 10.2) continue; // B"H 2026-10-13: clear of widened water
      if (clearPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < 4)) continue;
      const s = 0.35 + rand() * 0.75;
      dummy.position.set(x, groundHeight(x, z, noise) + 0.12 * s, z);
      dummy.rotation.y = rand() * Math.PI * 2;
      dummy.scale.set(s * (0.8 + rand() * 0.5), s, s * (0.8 + rand() * 0.5));
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    inst.count = placed;
    inst.castShadow = true; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('underbrush');

  /* B"H — ferns: instanced crossed-plane fronds along the riverbanks and
     tree bases, like the reference. One instanced draw, alphaTest cutout. */
  {
    // build a 3-plane star geometry (planes at 0/60/120 degrees)
    const planeGeos = [];
    for (let k = 0; k < 3; k++) {
      const pg = new THREE.PlaneGeometry(1.6, 1.6);
      pg.translate(0, 0.7, 0); // frond base at ground
      pg.rotateY(k * Math.PI / 3);
      planeGeos.push(pg);
    }
    // merge manually (positions, uvs, normals, index)
    let vOff = 0, iOff = 0;
    const pos = [], uv = [], nor = [], idx = [];
    for (const pg of planeGeos) {
      const p = pg.attributes.position, u = pg.attributes.uv, n = pg.attributes.normal, ix = pg.index;
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); uv.push(u.getX(i), u.getY(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); }
      for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + vOff);
      vOff += p.count;
    }
    const fernGeo = new THREE.BufferGeometry();
    fernGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    fernGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    fernGeo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    fernGeo.setIndex(idx);
    const fernMat = new THREE.MeshStandardMaterial({
      map: fernTex, alphaTest: 0.40, side: THREE.DoubleSide,
      roughness: 0.9, color: new THREE.Color(0.85, 1.05, 0.70),
    });
    const COUNT = fast ? 120 : 320;
    const inst = new THREE.InstancedMesh(fernGeo, fernMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, guard = 0;
    while (placed < COUNT && guard++ < COUNT * 25) {
      // cluster near riverbanks (60%) or tree bases (40%)
      let x, z;
      if (rand() < 0.6) {
        z = (rand() - 0.5) * 190;
        const side = rand() < 0.5 ? -1 : 1;
        x = riverX(z) + side * (10.5 + rand() * 7); // B"H 2026-10-13: at the banks
      } else {
        const t = treeSpots[(rand() * treeSpots.length) | 0];
        if (!t) continue;
        const a = rand() * Math.PI * 2, r = 2 + rand() * 6;
        x = t.x + Math.cos(a) * r; z = t.z + Math.sin(a) * r;
      }
      if (Math.abs(x - riverX(z)) < 10.2) continue; // B"H 2026-10-13: not in the widened water
      if (clearPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < 3)) continue;
      const s = 0.9 + rand() * 1.3;
      dummy.position.set(x, groundHeight(x, z, noise), z);
      dummy.rotation.y = rand() * Math.PI * 2;
      // slight outward tilt for natural arch
      dummy.rotation.x = (rand() - 0.5) * 0.25;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    inst.count = placed;
    inst.castShadow = true; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('ferns');

  /* B"H — mossy riverbank rocks: instanced displaced icosahedrons, moss-green
     tops keyed by normal.y, scattered along the banks like the reference. */
  {
    const rockGeo = new THREE.IcosahedronGeometry(1, 1);
    const rp = rockGeo.attributes.position;
    const ror = mulberry32(seed ^ 0x60cc);
    for (let i = 0; i < rp.count; i++) {
      const s = 1 + 0.35 * Math.sin(rp.getX(i) * 3.7 + 1.1)
                      * Math.sin(rp.getY(i) * 4.3 + 0.5)
                      * Math.sin(rp.getZ(i) * 3.1 + 2.2);
      rp.setXYZ(i, rp.getX(i) * s, rp.getY(i) * s * 0.72, rp.getZ(i) * s);
    }
    rockGeo.computeVertexNormals();
    const np = rockGeo.attributes.normal;
    const cols = new Float32Array(rp.count * 3);
    for (let i = 0; i < rp.count; i++) {
      const moss = THREE.MathUtils.smoothstep(np.getY(i), 0.15, 0.75);
      const g = 0.75 + ror() * 0.25;
      cols[i * 3]     = 0.42 + (0.38 * g - 0.42) * moss;
      cols[i * 3 + 1] = 0.40 + (0.62 * g - 0.40) * moss;
      cols[i * 3 + 2] = 0.36 + (0.28 * g - 0.36) * moss;
    }
    rockGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const rockMat = new THREE.MeshStandardMaterial({
      map: mossGroundTex, vertexColors: true, roughness: 1,
    });
    const COUNT = fast ? 90 : 160;
    const inst = new THREE.InstancedMesh(rockGeo, rockMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, g2 = 0;
    while (placed < COUNT && g2++ < COUNT * 30) {
      const z = (srand() - 0.5) * 200;
      const side = srand() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * (10.5 + srand() * 6); // B"H 2026-10-13: banks, not in the widened water
      const s = 0.35 + srand() * 1.1;
      dummy.position.set(x, groundHeight(x, z, noise) + 0.05, z);
      dummy.rotation.set(0, srand() * Math.PI * 2, 0);
      dummy.scale.set(s * (0.8 + srand() * 0.6), s * 0.75, s * (0.8 + srand() * 0.6));
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    inst.count = placed;
    inst.castShadow = true; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('rocks');

  /* B"H — moss mounds (Yaakov 2026-10-13 "Fix it"): bright mossy humps
     carpeting the riverbanks like the reference. Instanced flattened blobs
     with the moss photo, vivid yellow-green. One instanced draw. */
  {
    const moundGeo = new THREE.IcosahedronGeometry(1, 1);
    const mp = moundGeo.attributes.position;
    const mor = mulberry32(seed ^ 0xf055);
    for (let i = 0; i < mp.count; i++) {
      const s = 1 + 0.30 * Math.sin(mp.getX(i) * 4.3 + 2.0)
                      * Math.sin(mp.getY(i) * 3.7 + 1.1)
                      * Math.sin(mp.getZ(i) * 4.9 + 0.6);
      mp.setXYZ(i, mp.getX(i) * s, mp.getY(i) * s * 0.45, mp.getZ(i) * s);
    }
    moundGeo.computeVertexNormals();
    const moundMat = new THREE.MeshStandardMaterial({
      map: mossGroundTex, roughness: 1,
      // B"H — vivid moss: push past 1.0 so banks glow yellow-green like the ref
      color: new THREE.Color(1.05, 1.35, 0.62),
      emissive: new THREE.Color(0.10, 0.16, 0.04),
    });
    const COUNT = fast ? 110 : 200;
    const inst = new THREE.InstancedMesh(moundGeo, moundMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, g4 = 0;
    while (placed < COUNT && g4++ < COUNT * 30) {
      const z = (mor() - 0.5) * 200;
      const side = mor() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * (10.5 + mor() * 9); // B"H 2026-10-13: banks, not in the widened water
      // B"H — keep mounds well clear of the camera: a bright mound at 4 units
      // fills the lens. 10-unit exclusion around camera/character points.
      if (clearPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < 10)) continue;
      const s = 0.5 + mor() * 1.1;
      dummy.position.set(x, groundHeight(x, z, noise) + 0.02, z);
      dummy.rotation.set(0, mor() * Math.PI * 2, 0);
      dummy.scale.set(s * (0.9 + mor() * 0.8), s * 0.55, s * (0.9 + mor() * 0.8));
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    inst.count = placed;
    inst.castShadow = false; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('moss-mounds');

  /* B"H — rocks IN the shallows: small boulders poking through the water. */
  {
    const wrockGeo = new THREE.IcosahedronGeometry(1, 1);
    const wp = wrockGeo.attributes.position;
    const wor = mulberry32(seed ^ 0x70cc);
    for (let i = 0; i < wp.count; i++) {
      const s = 1 + 0.30 * Math.sin(wp.getX(i) * 4.1 + 0.7)
                      * Math.sin(wp.getY(i) * 3.3 + 1.9)
                      * Math.sin(wp.getZ(i) * 4.7 + 0.3);
      wp.setXYZ(i, wp.getX(i) * s, wp.getY(i) * s * 0.62, wp.getZ(i) * s);
    }
    wrockGeo.computeVertexNormals();
    const wn = wrockGeo.attributes.normal;
    const wcols = new Float32Array(wp.count * 3);
    for (let i = 0; i < wp.count; i++) {
      const moss = THREE.MathUtils.smoothstep(wn.getY(i), 0.3, 0.85);
      wcols[i * 3]     = 0.30 + 0.10 * moss;
      wcols[i * 3 + 1] = 0.32 + 0.16 * moss;
      wcols[i * 3 + 2] = 0.30 + 0.06 * moss;
    }
    wrockGeo.setAttribute('color', new THREE.BufferAttribute(wcols, 3));
    const COUNT = fast ? 30 : 55;
    const inst = new THREE.InstancedMesh(wrockGeo,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, g3 = 0;
    while (placed < COUNT && g3++ < COUNT * 40) {
      const z = (srand() - 0.5) * 200;
      const side = srand() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * (1.8 + srand() * 3.2);
      const s = 0.28 + srand() * 0.55;
      dummy.position.set(x, WATER_Y - 0.15, z);
      dummy.rotation.set(0, wor() * Math.PI * 2, 0);
      dummy.scale.set(s * (0.8 + wor() * 0.5), s * 0.7, s * (0.8 + wor() * 0.5));
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    inst.count = placed;
    inst.castShadow = true; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('water-rocks');

  /* grass tufts — instanced tapered blades, vertex-color gradient.
     Yaakov 2026-10-13: LUSH grass — dense, tall, vibrant. Speed is secondary. */
  {
    const blade = new THREE.PlaneGeometry(0.20, 0.65, 1, 3);
    blade.translate(0, 0.325, 0);
    const bp = blade.attributes.position, bc = [];
    for (let i = 0; i < bp.count; i++) {
      const t = bp.getY(i) / 0.65;
      bp.setX(i, bp.getX(i) * (1 - t * 0.92));              // taper to tip
      bp.setZ(i, t * t * 0.18);                            // gentle arc
      // natural meadow green: dark base → bright tips (kept off yellow)
      const shade = 0.50 + t * 0.95;
      bc.push(0.30 * shade, 0.60 * shade, 0.20 * shade);
    }
    blade.setAttribute('color', new THREE.BufferAttribute(new Float32Array(bc), 3));
    // cross THREE blades for full tufts (was two)
    const tuftGeo = (() => {
      const parts = [blade, blade.clone().rotateY(Math.PI / 3), blade.clone().rotateY(-Math.PI / 3)];
      let vCount = 0;
      const positions = [], colors = [], indices = [];
      for (const p of parts) {
        const pa = p.attributes.position.array, ca = p.attributes.color.array, ia = p.index.array;
        positions.push(...pa); colors.push(...ca);
        for (const idx of ia) indices.push(idx + vCount);
        vCount += pa.length / 3;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
      g.setIndex(indices);
      g.computeVertexNormals();
      return g;
    })();
    const tuftMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 });
    const COUNT = fast ? 3000 : 6000;
    const inst = new THREE.InstancedMesh(tuftGeo, tuftMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0; guard = 0;
    while (placed < COUNT && guard++ < COUNT * 14) {
      // B"H reference match: lush banks — 62% of tufts hug the river corridor
      let x, z;
      if (rand() < 0.62) {
        z = (rand() - 0.5) * 190;
        x = riverX(z) + (rand() < 0.5 ? -1 : 1) * (10.5 + rand() * 17); // B"H 2026-10-13: banks
      } else {
        x = (rand() - 0.5) * 190; z = (rand() - 0.5) * 190;
      }
      if (Math.abs(x - riverX(z)) < 10.2) continue; // B"H 2026-10-13: clear of widened water
      dummy.position.set(x, groundHeight(x, z, noise), z);
      dummy.rotation.y = rand() * Math.PI * 2;
      // natural lean: slight random tilt
      dummy.rotation.x = (rand() - 0.5) * 0.25;
      dummy.rotation.z = (rand() - 0.5) * 0.25;
      const s = 0.85 + rand() * 1.1;
      dummy.scale.set(s, s * (0.85 + rand() * 0.6), s);
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    inst.count = placed;
    inst.castShadow = false; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('grass');

  /* hero character — Yaakov's avatar, posed in-scene */
  if (vc) {
    const C = buildCharacter({
      head: vc.head || 'neutral', outfit: vc.outfit || 'jacket',
      brim: vc.brim ?? 1, pose: vc.pose || 'stand', seed: seed + 7,
    });
    const [cx, cz] = vc.at;
    let cy = groundHeight(cx, cz, noise);
    if (vc.pose === 'sit') {
      // smooth sitting rock (displaced icosahedron — no blocky shapes)
      const rockGeo = new THREE.IcosahedronGeometry(0.95, 3);
      const rp = rockGeo.attributes.position;
      for (let i = 0; i < rp.count; i++) {
        const x = rp.getX(i), y = rp.getY(i), z = rp.getZ(i);
        const s = 1 + 0.13 * Math.sin(x * 3.1 + 1.7) * Math.sin(y * 2.6 + 0.4) * Math.sin(z * 3.4 + 2.9)
                    + 0.06 * Math.sin(x * 6.3) * Math.sin(z * 5.1 + 1.2);
        rp.setXYZ(i, x * s, y * s * 0.58, z * s);
      }
      rockGeo.computeVertexNormals();
      const rock = new THREE.Mesh(rockGeo, new THREE.MeshStandardMaterial({ color: 0x8d8880, roughness: 1.0 }));
      rock.position.set(cx, cy + 0.18, cz);
      rock.castShadow = rock.receiveShadow = true;
      scene.add(rock);
      cy = cy + 0.74 - 0.925;   // rock top → hip height
    }
    C.root.position.set(cx, cy - 0.02, cz);
    C.root.rotation.y = vc.rotY || 0;
    scene.add(C.root);
    // soft front fill so the hero's face reads (no shadows from this one)
    const vpos = VIEWS[view].pos;
    const fill = new THREE.DirectionalLight(night ? 0xbfd4ff : 0xfff4e0, night ? 0.50 : 0.55);
    fill.position.set(cx + (vpos[0] - cx) * 0.6, cy + 3.4, cz + (vpos[2] - cz) * 0.6);
    fill.target.position.set(cx, cy + 1.5, cz);
    scene.add(fill); scene.add(fill.target);
  }
  mark('character');

  /* particles — per-view systems */
  const updaters = [];
  const addParticles = sys => { scene.add(sys.obj); updaters.push(sys.update); };
  const PSETS = {
    forest: ['pollen', 'dust'], river: ['pollen', 'dust'], grassland: ['pollen'],
    particles: ['pollen', 'leaves'],
    'character-forest': ['pollen', 'dust'], 'character-river': ['pollen'],
    'character-sitting': ['leaves', 'pollen'], 'character-portrait': ['dust'],
    night: ['fireflies', 'embers'],
  }[view] || ['pollen'];
  const shaftDir = night ? moonDir : sunDir;
  // wind gust strength keyed to time of day: golden hour and dusk carry the breeze
  const gust = night ? 0.2 : (tod === 'midday' ? 0.25 : tod === 'golden' ? 0.9 : 1.3);
  for (const pset of PSETS) {
    if (pset === 'fireflies') addParticles(makeFireflies({ count: Math.round(240 * PQ), area: 70, seed: seed + 11 }));
    else if (pset === 'pollen') addParticles(makePollen({ count: Math.round(300 * PQ), area: 80, seed: seed + 22, gust }));
    else if (pset === 'leaves') addParticles(makeFallingLeaves(leafTex, (x, z) => groundHeight(x, z, noise), { count: Math.round(120 * PQ), area: 70, seed: seed + 33, gust }));
    else if (pset === 'dust') addParticles(makeDustMotes(shaftDir, { count: Math.round(220 * PQ), seed: seed + 44 }));
    else if (pset === 'embers') addParticles(makeEmbers({ count: Math.round(100 * PQ), area: 44, seed: seed + 55 }));
  }

  /* camera */
  const v = VIEWS[view] || VIEWS.forest;
  if (view === 'river') {
    // camera rides inside the river corridor (trees are excluded there), looking downstream
    v.pos[0] = riverX(24); v.pos[1] = WATER_Y + 3.4; v.pos[2] = 24;
    v.look[0] = riverX(-50); v.look[1] = WATER_Y + 0.3; v.look[2] = -50;
  }
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1200);
  camera.position.set(...v.pos);
  camera.lookAt(...v.look);
  mark('particles+camera');

  /* render loop — settle the simulation SYNCHRONOUSLY (no rAF waits).
     B"H speed mission: in headless SwiftShader, requestAnimationFrame scheduling
     between frames cost ~10s of wall time (compositor stalls), dwarfing actual
     render cost. Settle frames just advance water/particle/cloud simulation time.
     B"H realism era: rasterization is lazy until readback on SwiftShader, so the
     intermediate canvas renders are dropped entirely — only the final
     render-target capture rasterizes (shadow map bakes on that same pass). */
  const FRAMES = fast ? 4 : 10;
  const STEP_DT = 0.5; // simulated seconds per settle frame
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true; // one shadow pass, baked on the capture render
  for (let f = 0; f < FRAMES; f++) {
    const t = (f + 1) * STEP_DT;
    waterUniforms.uTime.value = t;
    sky.material.uniforms.uCloudT.value = t;
    for (const u of updaters) u(t, STEP_DT);
    mark('frame' + (f + 1));
  }
  mark('done');
  publishMarks();
  // B"H speed mission: deliver pixels directly — canvas.toBlob + POST to the
  // capture harness. Bypasses Page.captureScreenshot, whose first capture in
  // headless SwiftShader stalls 20s+ in the compositor. Same-task readback
  // works with preserveDrawingBuffer:false.
  //
  // B"H realism-era upgrade: render-target readback. canvas.toBlob() on
  // SwiftShader stalls 60-110s inside the page compositor's readback path.
  // Rendering once more into an sRGB WebGLRenderTarget + readPixels + 2D-canvas
  // PNG encode skips the compositor entirely. Color-identical: ACES lives in
  // the material shaders and the target carries SRGBColorSpace, exactly like
  // the canvas path. Falls back to canvas.toBlob on any failure.
  try {
    const qs = new URLSearchParams(location.search);
    const signalPort = qs.get('signalPort');
    const sp = qs.get('sp');
    if (signalPort) {
      mark('toblob-start');
      let blob = null;
      try {
        const dbSize = new THREE.Vector2();
        renderer.getDrawingBufferSize(dbSize);
        const W = dbSize.x | 0, H = dbSize.y | 0;
        const rt = new THREE.WebGLRenderTarget(W, H, { samples: fast ? 0 : 4, depthBuffer: true });
        rt.texture.colorSpace = THREE.SRGBColorSpace;
        renderer.setRenderTarget(rt);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        mark('rt-render');
        const buf = new Uint8Array(W * H * 4);
        renderer.readRenderTargetPixels(rt, 0, 0, W, H, buf);
        mark('readpixels');
        const cv2 = document.createElement('canvas');
        cv2.width = W; cv2.height = H;
        const cx2 = cv2.getContext('2d');
        const img = cx2.createImageData(W, H);
        const rowBytes = W * 4;
        for (let y = 0; y < H; y++) {
          img.data.set(buf.subarray((H - 1 - y) * rowBytes, (H - y) * rowBytes), y * rowBytes);
        }
        cx2.putImageData(img, 0, 0);
        mark('flip');
        // B"H — cinematic vignette: gentle edge falloff, applied in 2D (free).
        {
          const vg = cx2.createRadialGradient(
            W / 2, H / 2, Math.min(W, H) * 0.44,
            W / 2, H / 2, Math.max(W, H) * 0.74);
          vg.addColorStop(0, 'rgba(6,8,14,0)');
          vg.addColorStop(1, 'rgba(6,8,14,0.30)');
          cx2.fillStyle = vg;
          cx2.fillRect(0, 0, W, H);
        }
        mark('vignette');
        // B"H — reference-matched grade (2026-10-13 Phase 7): sampled from the
        // NEW mossy-forest reference (1000154884_15_0jsd.webp). Deep natural
        // greens, warm-white dappled highlights, cool green-blue shadows.
        // Less golden than the old grade — restraint.
        {
          cx2.globalCompositeOperation = 'overlay';
          const gg = cx2.createLinearGradient(0, 0, 0, H);
          gg.addColorStop(0, 'rgba(255,242,205,0.12)');
          gg.addColorStop(0.35, 'rgba(180,200,130,0.06)');
          gg.addColorStop(0.65, 'rgba(60,100,50,0.08)');
          gg.addColorStop(1, 'rgba(18,32,24,0.22)');
          cx2.fillStyle = gg;
          cx2.fillRect(0, 0, W, H);
          cx2.globalCompositeOperation = 'source-over';
          // grain: tiled 128px noise stamp at very low alpha
          const gs = 128;
          let grain = null;
          try { grain = window.__realityGrain || null; } catch {}
          if (!grain) {
            grain = document.createElement('canvas');
            grain.width = grain.height = gs;
            const gx = grain.getContext('2d');
            const gid = gx.createImageData(gs, gs);
            const gr = mulberry32(90210);
            for (let i = 0; i < gid.data.length; i += 4) {
              const gv = (gr() * 255) | 0;
              gid.data[i] = gid.data[i + 1] = gid.data[i + 2] = gv;
              gid.data[i + 3] = 255;
            }
            gx.putImageData(gid, 0, 0);
            try { window.__realityGrain = grain; } catch {}
          }
          cx2.globalAlpha = 0.05;
          cx2.globalCompositeOperation = 'overlay';
          cx2.fillStyle = cx2.createPattern(grain, 'repeat');
          cx2.fillRect(0, 0, W, H);
          cx2.globalAlpha = 1;
          cx2.globalCompositeOperation = 'source-over';
        }
        mark('grade');
        blob = await new Promise(res => cv2.toBlob(res, 'image/png'));
        rt.dispose();
      } catch (rtErr) {
        mark('rt-fallback:' + String(rtErr && rtErr.message || rtErr).slice(0, 60));
        blob = await new Promise(res => renderer.domElement.toBlob(res, 'image/png'));
      }
      mark('toblob-done');
      if (blob) {
        await fetch(`http://127.0.0.1:${signalPort}/png?view=${encodeURIComponent(view)}${sp ? `&sp=${encodeURIComponent(sp)}` : ''}&t=${encodeURIComponent(JSON.stringify(_marks))}`, {
          method: 'POST', body: blob,
        }).catch(() => {});
        mark('fetch-done');
      }
    }
  } catch {}
  window.__realityDebug = { scene, camera, renderer, water, waterUniforms };
  return { renderer, scene, camera };
}
