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
  forest:    { pos: [19, 6.5, 36],  look: [-8, 7.5, -8] },
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
    sunDir: [0.72, 0.30, 0.28], sunColor: 0xffd9a8, sunI: 2.9,
    hemiSky: 0xd8c4a8, hemiGround: 0x4e5a3a, hemiI: 0.70,
    fog: 0xdccfb4, fogNear: 60, fogFar: 270, exposure: 1.18,
    golden: 1.0, warm: 0.55,
  },
  dusk: {
    sunDir: [0.78, 0.13, 0.18], sunColor: 0xff9e5e, sunI: 2.3,
    hemiSky: 0x9a7a90, hemiGround: 0x333a28, hemiI: 0.55,
    fog: 0xc9a48e, fogNear: 55, fogFar: 250, exposure: 1.15,
    golden: 1.6, warm: 1.0,
  },
};

export async function buildRealityScene(container, { view = 'forest', seed = 20261011, fast = false, tod = 'midday' } = {}) {
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
      blending: THREE.AdditiveBlending, fog: false, opacity: 0.85 + warm * 0.15,
    }));
    glow.position.copy(sunDir).multiplyScalar(420);
    glow.scale.setScalar(150 + warm * 60);
    scene.add(glow);
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

  /* textures (real photographs, Awtsmoos Drive) */
  const [grassTex, dirtTex, barkTex, canopyTex, leafTex] = await Promise.all([
    loadTexture(TEX + 'grass1.jpg', 30, 30),
    loadTexture(TEX + 'dirt1.jpg', 40, 3),
    loadTexture(TEX + 'bark1.webp', 1, 2),
    makeCanopyCutout(TEX + 'leaves1.png'),
    loadTexture(TEX + 'leaf1.jpg', 1, 1),
  ]);
  mark('textures');

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
      // macro color variation: meadow patches
      const patch = noise(x * 0.03 + 40, z * 0.03) * 0.5 + 0.5;
      let r = 0.92 + patch * 0.16, g = 0.95 + patch * 0.10, b = 0.82 + patch * 0.10;
      // sandy blend near river banks
      if (d < 10) { const t = 1 - d / 10; r = r + (1.02 - r) * t * 0.7; g = g + (0.88 - g) * t * 0.7; b = b + (0.66 - b) * t * 0.7; }
      // darken hollows
      const shade = THREE.MathUtils.clamp(1 + h * 0.05, 0.82, 1.06);
      colors[i * 3] = r * shade; colors[i * 3 + 1] = g * shade; colors[i * 3 + 2] = b * shade;
    }
    terrGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrGeo.computeVertexNormals();
  }
  const terrain = new THREE.Mesh(terrGeo, new THREE.MeshStandardMaterial({
    map: grassTex, vertexColors: true, roughness: 1.0, metalness: 0.0,
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
    ribbon(13.5, (x, z) => groundHeight(x, z, noise) - 0.12, 24),
    new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 1 })
  );
  riverbed.receiveShadow = true;
  scene.add(riverbed);

  /* water — animated shader */
  const waterUniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uSunDir: { value: sunDir },
      uDeep: { value: new THREE.Color(0x1d4e5f) },
      uShallow: { value: new THREE.Color(0x5fa8a0) },
      uSky: { value: new THREE.Color(0xbfe0ee) },
    },
  ]);
  // UniformsUtils.merge clones — restore live references
  waterUniforms.uSunDir.value = sunDir;
  const water = new THREE.Mesh(
    ribbon(11, () => WATER_Y, 24),
    new THREE.ShaderMaterial({
      transparent: true, uniforms: waterUniforms, fog: false,
      side: THREE.DoubleSide,
      vertexShader: `varying vec2 vUv; varying vec3 vPos;
        void main(){ vUv = uv; vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; varying vec3 vPos;
        uniform float uTime; uniform vec3 uSunDir, uDeep, uShallow, uSky;
        float wave(vec2 p){ return sin(p.x*1.3 + uTime*0.9) * sin(p.y*2.1 - uTime*0.7)
          + 0.3*sin(p.x*3.9 - uTime*1.4) * sin(p.y*4.7 + uTime*1.1); }
        void main(){
          // B"H — finer ripple field: kills the concentric-banding look.
          vec2 p = vec2(vUv.x * 10.0, vUv.y * 150.0);
          float w = wave(p);
          float w2 = wave(p * 2.3 + 7.0);
          float w3 = wave(p * 5.1 + 3.0);
          vec3 n = normalize(vec3(w * 0.05, 1.0, w2 * 0.05));
          vec3 viewDir = normalize(cameraPosition - vPos);
          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 2.2);
          vec3 col = mix(uDeep, uShallow, 0.30 + 0.22 * w + 0.10 * w3);
          col = mix(col, uSky, fres * 0.55);
          vec3 hv = normalize(viewDir + uSunDir);
          float spec = pow(max(dot(n, hv), 0.0), 220.0) * 1.6;
          // tight sun glints dancing on the ripple field
          float glint = pow(max(dot(normalize(vec3(w3 * 0.35, 1.0, w * 0.35)), hv), 0.0), 700.0) * 3.2;
          col += vec3(1.0, 0.97, 0.9) * (spec + glint);
          float edge = smoothstep(0.0, 0.10, vUv.x) * smoothstep(1.0, 0.90, vUv.x);
          // soft foam lapping at the banks
          float foamBand = (1.0 - edge);
          float foam = foamBand * smoothstep(0.25, 0.9, 0.5 + 0.5 * w2) * 0.55;
          col = mix(col, vec3(0.88, 0.94, 0.92), foam);
          gl_FragColor = vec4(col, 0.90 * (0.35 + 0.65 * edge) + foam * 0.1); }`
    })
  );
  scene.add(water);
  mark('water');

  /* trees — ez-tree-derived procedural generator, real bark + canopy photos */
  const barkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.92 });
  const canopyMat = new THREE.MeshStandardMaterial({
    map: canopyTex, alphaTest: 0.30, side: THREE.DoubleSide,
    roughness: 0.9, color: new THREE.Color(0.55, 0.85, 0.50),
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
  const treeSpots = [];
  const CLEAR = {
    forest: 26, river: 15, grassland: 26, particles: 15,
    'character-forest': 14, 'character-river': 14, 'character-sitting': 14,
    'character-portrait': 12, night: 14, 'character-older': 12,
  }[view] || 15;
  const clearPts = [[VIEWS[view].pos[0], VIEWS[view].pos[2]]];
  if (vc) clearPts.push(vc.at);
  let guard = 0;
  while (treeSpots.length < (fast ? 16 : 30) && guard++ < 4000) {
    const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 200;
    if (Math.abs(x - riverX(z)) < 11) continue;                       // keep river clear
    if (clearPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < CLEAR)) continue;
    if (treeSpots.some(s => Math.hypot(s.x - x, s.z - z) < 9)) continue;
    treeSpots.push({ x, z });
  }
  for (const s of treeSpots) {
    const a = treeGeos[(rand() * treeGeos.length) | 0];
    const sc = 0.85 + rand() * 0.75;
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
    s.crownY = y + 8 * sc; s.crownR = 5.5 * sc;
  }
  scene.add(treeGroup);
  mark('trees-placed');

  /* canopy crown filler — dense instanced foliage blobs in each tree's crown */
  {
    const crownGeo = new THREE.IcosahedronGeometry(1, 1);
    const cp = crownGeo.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      const s = 1 + 0.3 * Math.sin(cp.getX(i) * 4.7 + 2.1) * Math.sin(cp.getZ(i) * 5.3 + 0.9);
      cp.setXYZ(i, cp.getX(i) * s, cp.getY(i) * s * 0.75, cp.getZ(i) * s);
    }
    crownGeo.computeVertexNormals();
    const crownMat = new THREE.MeshStandardMaterial({
      map: canopyTex, alphaTest: 0.30, side: THREE.DoubleSide,
      roughness: 0.95, color: new THREE.Color(0.75, 0.95, 0.70),
    });
    const PER_TREE = fast ? 22 : 36;
    const COUNT = treeSpots.length * PER_TREE;
    const inst = new THREE.InstancedMesh(crownGeo, crownMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0;
    for (const s of treeSpots) {
      for (let i = 0; i < PER_TREE; i++) {
        // distribute in a flattened sphere around the crown center
        const th = rand() * Math.PI * 2;
        const ph = Math.acos(2 * rand() - 1);
        const rr = s.crownR * (0.25 + 0.75 * Math.cbrt(rand()));
        const bx = s.x + rr * Math.sin(ph) * Math.cos(th);
        const by = s.crownY + rr * Math.cos(ph) * 0.7;
        const bz = s.z + rr * Math.sin(ph) * Math.sin(th);
        const bs = 1.4 + rand() * 2.0;
        dummy.position.set(bx, by, bz);
        dummy.rotation.set(rand() * Math.PI, rand() * Math.PI * 2, 0);
        dummy.scale.set(bs, bs * 0.8, bs);
        dummy.updateMatrix();
        if (placed < COUNT) inst.setMatrixAt(placed++, dummy.matrix);
      }
    }
    inst.count = placed;
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
    });
    const COUNT = fast ? 120 : 240;
    const inst = new THREE.InstancedMesh(blobGeo, blobMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, guard2 = 0;
    while (placed < COUNT && guard2++ < COUNT * 20) {
      const t = treeSpots[(rand() * treeSpots.length) | 0];
      if (!t) break;
      const a = rand() * Math.PI * 2, r = 2.5 + rand() * 9;
      const x = t.x + Math.cos(a) * r, z = t.z + Math.sin(a) * r;
      if (Math.abs(x - riverX(z)) < 8.5) continue;
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
      // vibrant meadow green: dark base → bright yellow-green tips
      const shade = 0.55 + t * 1.1;
      bc.push(0.32 * shade, 0.62 * shade, 0.18 * shade);
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
    while (placed < COUNT && guard++ < COUNT * 12) {
      const x = (rand() - 0.5) * 190, z = (rand() - 0.5) * 190;
      if (Math.abs(x - riverX(z)) < 8.5) continue;
      dummy.position.set(x, groundHeight(x, z, noise), z);
      dummy.rotation.y = rand() * Math.PI * 2;
      // natural lean: slight random tilt
      dummy.rotation.x = (rand() - 0.5) * 0.25;
      dummy.rotation.z = (rand() - 0.5) * 0.25;
      const s = 0.8 + rand() * 1.4;
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
        // B"H — cinematic grade: warm sky lift, cool shadow floor, whisper of
        // grain. All in 2D, essentially free next to SwiftShader rasterization.
        {
          cx2.globalCompositeOperation = 'overlay';
          const gg = cx2.createLinearGradient(0, 0, 0, H);
          gg.addColorStop(0, 'rgba(255,214,160,0.10)');
          gg.addColorStop(0.55, 'rgba(255,214,160,0)');
          gg.addColorStop(1, 'rgba(24,44,80,0.14)');
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
