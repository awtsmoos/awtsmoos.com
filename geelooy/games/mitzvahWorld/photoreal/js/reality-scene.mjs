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
// B"H — Reality Engine commit 1: the river is now a Catmull-Rom S-curve spine
// (js/river-lut.mjs) with a width profile (7m shallows -> 3.5m rapids narrows
// -> 5m background) instead of the old sine hack. Everything derives from it.
import { riverX, riverHalfWidth, riverDepthAt } from './river-lut.mjs';
const WORLD = 240;
const WATER_Y = -0.55;

function groundHeight(x, z, noise) {
  let h = noise(x * 0.02, z * 0.02) * 3.2
        + noise(x * 0.06 + 9, z * 0.06) * 1.1
        + noise(x * 0.18, z * 0.18 + 4) * 0.35;
  const w = riverHalfWidth(z);
  const d = Math.abs(x - riverX(z));
  const R = w * 2.6;                       // carve radius
  if (d < R) {
    const t = Math.min(1, d / R);
    let target;
    if (d < w) {
      // riverbed: WATER_Y - depth profile + slight noise
      target = WATER_Y - riverDepthAt(z) + noise(x * 0.3, z * 0.3) * 0.12;
    } else {
      // bank: rise from water edge to bank height + levee mound
      const bt = (d - w) / (R - w);         // 0..1 across bank zone
      const levee = Math.sin(Math.min(bt * 1.15, 1) * Math.PI) * 0.28;
      target = WATER_Y + 0.18 + bt * bt * 1.1 + levee;
    }
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
// B"H — PROCEDURAL BARK SHADER (Yaakov 2026-10-13: "massively improved
// algorithms", "better math"). Fundamental rethink of bark shading:
// the old approach (bark photo texture on baked UVs) rendered trunks as
// flat brown slabs — the texture never read. This replaces albedo with
// UV-INDEPENDENT procedural bark in the fragment shader:
//   - FISSURES: ridged FBM noise stretched vertically (bark cracks run
//     along the trunk). Infinite detail at any zoom, zero texture fetch.
//   - PLATES: large-scale mottling between fissures (bark plate variation).
//   - MOSS: world-normal-driven (up-facing = mossy) × noise breakup ×
//     height falloff (moss hugs the lower trunk). Physically motivated.
//   - CREVICE AO: deep fissures darken (cheap ambient occlusion).
// Works on regular Mesh AND InstancedMesh (ifdef handles instanceMatrix).
// The Sobel-derived normalMap stays for micro-surface detail — math for
// large structure, texture for micro. 60fps: ~15 ALU in fragment.
function applyProceduralBark(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        varying vec3 vBarkWPos; varying vec3 vBarkWNormal;`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        {
          vec4 bwp4 = vec4(transformed, 1.0);
          vec3 bwn3 = objectNormal;
          #ifdef USE_INSTANCING
            bwp4 = instanceMatrix * bwp4;
            bwn3 = mat3(instanceMatrix) * bwn3;
          #endif
          bwp4 = modelMatrix * bwp4;
          vBarkWPos = bwp4.xyz;
          vBarkWNormal = normalize(mat3(modelMatrix) * bwn3);
        }`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vBarkWPos; varying vec3 vBarkWNormal;
        float bh_hash(vec2 p) {
          p = fract(p * vec2(234.34, 435.345));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }
        float bh_noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          float a = bh_hash(i), b = bh_hash(i + vec2(1.0, 0.0));
          float c = bh_hash(i + vec2(0.0, 1.0)), d = bh_hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }
        float bh_fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int k = 0; k < 4; k++) { v += a * bh_noise(p); p *= 2.03; a *= 0.5; }
          return v;
        }`)
      .replace('#include <map_fragment>', `{
          vec3 bwp = vBarkWPos;
          vec3 bwn = normalize(vBarkWNormal);
          // B"H commit 3: CYLINDRICAL bark — fissures in angle/height space so
          // they read at real scale (old world-xz frequencies aliased to flat
          // mud on thin trunks). 10-16 plates around, cracks run vertically.
          float ang = atan(bwp.z, bwp.x);
          vec2 around = vec2(cos(ang), sin(ang)); // seamless around trunk
          float plate = bh_fbm(around * 2.5 + vec2(0.0, bwp.y * 0.30));
          float fr = 1.0 - abs(2.0 * bh_fbm(around * 6.0 + vec2(3.1, bwp.y * 0.9)) - 1.0);
          float fiss = smoothstep(0.35, 0.85, fr);
          float grain = bh_fbm(around * 14.0 + vec2(7.7, bwp.y * 3.0));
          vec3 barkCol = mix(vec3(0.09, 0.06, 0.045), vec3(0.38, 0.30, 0.21),
                              clamp(fiss * 0.75 + plate * 0.45, 0.0, 1.0));
          barkCol *= 0.82 + 0.36 * grain;
          // moss: up-facing + noise breakup, concentrated low on trunk
          float mossN = bh_fbm(bwp.xz * 2.0 + 3.1);
          float upFace = clamp(bwn.y * 0.5 + 0.5, 0.0, 1.0);
          float mossMask = smoothstep(0.45, 0.8, upFace * 0.6 + mossN * 0.55);
          mossMask *= 1.0 - smoothstep(2.0, 7.0, bwp.y);
          vec3 mossCol = mix(vec3(0.10, 0.20, 0.05), vec3(0.30, 0.44, 0.15), mossN);
          vec3 col = mix(barkCol, mossCol, clamp(mossMask, 0.0, 1.0));
          col *= 0.70 + 0.50 * fiss; // crevice AO
          // B"H — preserve per-instance tint (branch wood uses instanceColor
          // for bark/moss variation); color_fragment already multiplied it
          // into diffuseColor, so re-apply here after override.
          #ifdef USE_INSTANCING_COLOR
            col *= vColor;
          #endif
          diffuseColor.rgb = col;
        }`);
  };
  // B"H — distinct program cache key: three.js caches compiled programs by
  // onBeforeCompile.toString(); the closure is identical per call, so set a
  // customProgramCacheKey to avoid collisions with non-bark materials.
  mat.customProgramCacheKey = () => 'procedural-bark-v1';
}
// B"H — normal maps must stay LINEAR (NoColorSpace). sRGB-decoding a normal
// map corrupts the vectors (Yaakov 2026-10-13: "never enough textures,
// including normals").
function loadNormalTexture(url, repeatX = 1, repeatY = 1) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      tex.anisotropy = 8;
      tex.colorSpace = THREE.NoColorSpace;
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
  forest:    { pos: [riverX(18) + 4.5, 1.9, 18],  look: [riverX(-25) - 1, 1.2, -25] },
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
    // B"H — 99% push: reference has DEEP shadows + BRIGHT highlights (contrast).
    // Lower ambient for shadow depth, stronger sun for dappled highlights.
    // B"H commit 2: sun moved DOWN-RIVER (-z) and up (34° elevation) so the
    // forest-view camera looks TOWARD it — backlit canopy, god rays down the
    // corridor, sparkle path on the water (plan §1).
    sunDir: [0.42, 0.52, -0.65], sunColor: 0xfff6e8, sunI: 2.8,
    hemiSky: 0xa8c8d8, hemiGround: 0x4a5a3a, hemiI: 0.45,
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
  // B"H commit 2: 2048 shadow map (plan §1 — dappled leaf shadows need teeth).
  const SHADOW = fast ? 512 : 2048;
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
    grad.addColorStop(0, 'rgba(255,240,210,0.45)');
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
      depthWrite: false, side: THREE.DoubleSide, fog: false, opacity: 0.14,
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

  /* B"H commit 2: MIST billboards (plan §3) — luminous haze in the background
     gap and along the distant river so the distance reads as glowing mist,
     not dark collapse. 14 sprites, canvas-generated soft texture with fbm
     breakup, slow drift + opacity breathing via per-frame updater. */
  const mistUpdaters = [];
  if (!night) {
    const mc = document.createElement('canvas'); mc.width = mc.height = 256;
    const mx = mc.getContext('2d');
    // base radial falloff
    const mg = mx.createRadialGradient(128, 128, 10, 128, 128, 126);
    mg.addColorStop(0, 'rgba(235,242,230,0.55)');
    mg.addColorStop(0.6, 'rgba(230,238,225,0.22)');
    mg.addColorStop(1, 'rgba(225,235,220,0)');
    mx.fillStyle = mg; mx.fillRect(0, 0, 256, 256);
    // fbm breakup so edges aren't perfect circles
    mx.globalCompositeOperation = 'destination-out';
    const bn = makeNoise2D(mulberry32(seed ^ 0xbeef));
    const bid = mx.getImageData(0, 0, 256, 256);
    const bd = bid.data;
    for (let y = 0; y < 256; y += 2) for (let x = 0; x < 256; x += 2) {
      const n = bn(x * 0.03, y * 0.03) * 0.5 + 0.5;
      const erase = Math.max(0, (n - 0.62)) * 2.2;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const ii = ((y + dy) * 256 + (x + dx)) * 4 + 3;
        bd[ii] = Math.max(0, bd[ii] - erase * 255);
      }
    }
    mx.putImageData(bid, 0, 0);
    const mistTex = new THREE.CanvasTexture(mc); mistTex.colorSpace = THREE.SRGBColorSpace;
    const mrand = mulberry32(seed ^ 0x7157);
    for (let mi = 0; mi < 14; mi++) {
      // background gap + distant river: z -35..-105, clustered near centerline
      const mz = -35 - mrand() * 70;
      const mxp = riverX(mz) + (mrand() - 0.5) * 26;
      const myp = WATER_Y + 2.5 + mrand() * 5;
      const mscale = 10 + mrand() * 12;
      const smat = new THREE.SpriteMaterial({
        map: mistTex, transparent: true, depthWrite: false,
        opacity: 0.16 + mrand() * 0.12, fog: false,
      });
      const spr = new THREE.Sprite(smat);
      spr.position.set(mxp, myp, mz);
      spr.scale.set(mscale, mscale * 0.62, 1);
      scene.add(spr);
      const phase = mrand() * 6.28, baseO = smat.opacity;
      mistUpdaters.push((t) => {
        spr.position.x = mxp + Math.sin(t * 0.05 + phase) * 1.5;
        smat.opacity = baseO * (0.8 + 0.2 * Math.sin(t * 0.11 + phase * 2));
      });
    }
    mark('mist');
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
    // B"H commit 2: tighter frustum (±45) — 2048px over 90m = 4.4cm/texel.
    sun.shadow.camera.left = -45; sun.shadow.camera.right = 45;
    sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
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
      const fill = new THREE.DirectionalLight(0xffe8c8, 0.65);
      fill.position.set(vpos[0], vpos[1] + 6, vpos[2] + 5);
      fill.target.position.set(vpos[0], 1.5, vpos[2] - 25);
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
         leafClusterTex, denseCanopyTex, backlitCanopyTex, impostorTex1, impostorTex2, impostorTex3, impostorTex4,
         pebbleTex, fallenLogTex, leafLitterTex,
         barkNormalTex, mossNormalTex, pebbleNormalTex, wetRockNormalTex,
         waterRippleNormalTex, leafVeinNormalTex] = await Promise.all([
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
    // B"H — 99% push: photoreal pebble riverbed, visible through clear water.
    loadTexture(TEX + 'new/tex-pebbles.webp', 8, 8),
    // B"H — 99% push: fallen mossy log + leaf litter for foreground detail.
    loadTexture(TEX + 'new/tex-fallen-log.webp', 2, 1),
    loadTexture(TEX + 'new/tex-leaf-litter.webp', 6, 6),
    // B"H — normal maps (Yaakov 2026-10-13: "never enough textures, including
    // normals"). Bark/moss/pebble/wet-rock derived geometrically via Sobel
    // from height maps (better math); water ripple + leaf vein AI-generated.
    // Repeats match their albedo counterparts so relief aligns with color.
    loadNormalTexture(TEX + 'new/tex-mossy-bark-v2-normal.webp', 1, 2),
    loadNormalTexture(TEX + 'new/tex-moss-floor-v2-normal.webp', 36, 36),
    loadNormalTexture(TEX + 'new/tex-pebbles-normal.webp', 8, 8),
    loadNormalTexture(TEX + 'new/tex-wet-rock-normal.webp', 1, 1),
    loadNormalTexture(TEX + 'new/tex-water-ripple-normal.webp', 24, 24),
    loadNormalTexture(TEX + 'new/tex-leaf-vein-normal.webp', 1, 1),
  ]);
  mark('textures');

  /* tree placement — BEFORE terrain so canopy shade bakes into vertex colors.
     B"H reference match 2026-10-13: enclosed river corridor, denser forest. */
  const treeSpots = [];
  const CLEAR = {
    // B"H 2026-10-13 "Fix it": forest camera was buried in crown filler —
    // filler reaches ~10 units past the trunk, so 12 was not enough.
    // B"H 2026-10-13 rethink: procedural bark is now GOOD (FBM fissures in
    // shader), so procedural trees OWN the foreground. 22→14; impostors
    // pushed to 48u+ background. Foreground = real 3D bark, not billboards.
    forest: 14, river: 15, grassland: 26, particles: 15,
    'character-forest': 14, 'character-river': 14, 'character-sitting': 14,
    'character-portrait': 12, night: 14, 'character-older': 12,
  }[view] || 15;
  const clearPts = [[VIEWS[view].pos[0], VIEWS[view].pos[2]]];
  if (vc) clearPts.push(vc.at);
  let guard = 0;
  while (treeSpots.length < (fast ? 24 : 40) && guard++ < 6000) {
    const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 200;
    if (Math.abs(x - riverX(z)) < 7.5) continue;                      // keep river clear (99%: narrowed)
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
    const x = riverX(z) + side * (7.0 + rand() * 3.5);
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
        // B"H 2026-10-13: 15-33u put impostor quads in the FOREGROUND where
        // their flat photo trunks hid the procedural bark. 30-52u still too
        // close (22u-tall quads subtend 40° at 30u). 48-78u = true background
        // mass; procedural trees own the foreground/midground.
        const dist = 48 + rand() * 30; // 48-78 units — background mass only
        const x = riverX(z) + side * dist;
        // don't block the camera
        if (Math.hypot(x - camPos[0], z - camPos[2]) < 30) continue;
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
  // B"H commit 1: 120->160 segments (1.5m quads resolve the carved banks).
  const terrGeo = new THREE.PlaneGeometry(WORLD, WORLD, 160, 160);
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
      // B"H commit 1: WET BAND — dark damp shoreline where terrain meets
      // water level (plan §4). Every reference shoreline has this.
      const wet = 1 - THREE.MathUtils.smoothstep(Math.abs(h - WATER_Y), 0, 0.45);
      const wetZone = d < riverHalfWidth(z) * 2.6 ? 1 : 0;
      const wetM = 1 - wet * wetZone * 0.45;
      r *= wetM; g *= wetM * 0.96; b *= wetM * 0.94;
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
    // B"H — moss relief normals: ground stops being a flat plane under sun.
    normalMap: mossNormalTex, normalScale: new THREE.Vector2(0.9, 0.9),
  }));
  terrain.receiveShadow = true;
  scene.add(terrain);
  mark('terrain');

  /* riverbed ribbon (dirt under water) */
  // B"H commit 1: ribbon takes a width function of z (river width profile).
  function ribbon(widthFn, yFn, vRepeat) {
    const segs = 200, verts = [], uvs = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const z = -WORLD / 2 + (WORLD * i) / segs;
      const cx = riverX(z);
      const w = typeof widthFn === 'function' ? widthFn(z) : widthFn;
      for (let s = -1; s <= 1; s += 2) {
        const x = cx + s * w / 2;
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
    // B"H commit 1: riverbed follows the width profile (wider than water so
    // the bed extends under the banks).
    ribbon(z => riverHalfWidth(z) * 2 * 1.35, (x, z) => groundHeight(x, z, noise) - 0.12, 24),
    new THREE.MeshStandardMaterial({
      map: pebbleTex, roughness: 0.7,
      // B"H — rounded pebble normals: stones read 3D through clear water.
      normalMap: pebbleNormalTex, normalScale: new THREE.Vector2(1.0, 1.0),
    })
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
      // B"H — 99% water rewrite: natural river colors, not swimming-pool teal.
      // Deep water: dark green-teal. Shallow: nearly clear warm tint.
      uDeep: { value: new THREE.Color(0x1e4f48) },
      uShallow: { value: new THREE.Color(0x6aa898) },
      uSky: { value: new THREE.Color(0xd8ecef) },
      uFogColor: { value: new THREE.Color(T.fog) },
      uFogNear: { value: T.fogNear },
      uFogFar: { value: T.fogFar },
    },
  ]);
  // UniformsUtils.merge clones — restore live references
  waterUniforms.uSunDir.value = sunDir;
  // B"H — 99% push: river narrowed 19.5 -> 13. Reference river is a winding
  // stream, not a lake. Banks visible on both sides.
  // B"H commit 1: water width follows the LUT profile (no more fixed 13).
  const water = new THREE.Mesh(
    ribbon(z => riverHalfWidth(z) * 2 * 1.04, () => WATER_Y, 24),
    new THREE.ShaderMaterial({
      transparent: true, uniforms: waterUniforms, fog: false,
      side: THREE.DoubleSide, depthWrite: false,
      vertexShader: `varying vec2 vUv; varying vec3 vPos;
        void main(){ vUv = uv; vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; varying vec3 vPos;
        uniform float uTime, uFogNear, uFogFar;
        uniform vec3 uSunDir, uGlitterDir, uDeep, uShallow, uSky, uFogColor;
        // B"H — 99% water rewrite (Yaakov: "Especially water shaders").
        // Growth-rule approach: water follows terrain.
        // - Flow direction follows the river curve (tangent), not uniform -v
        // - Speed varies: faster in center channel, slower at edges
        // - Depth from UV: center = deep, edges = shallow
        // - Foam forms where water meets banks and around rocks
        float hgt(vec2 p, float t){
          // Directional flow: stretched along downstream, choppy across.
          // Two layers at different speeds for natural current variation.
          return sin(p.x*3.1 + t*1.4)*0.22 + sin(p.y*1.1 - t*1.8)*0.20
               + sin(p.x*2.2 + p.y*0.8 + t*2.4)*0.15
               + sin(p.x*7.3 - t*3.1)*sin(p.y*2.1 + t*2.6)*0.10;
        }
        vec2 slopeAt(vec2 p, float t){
          float e = 0.18;
          float hC = hgt(p, t);
          return vec2(hgt(p+vec2(e,0.0),t)-hC, hgt(p+vec2(0.0,e),t)-hC)/e;
        }
        float hash22(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        // Smooth noise for foam breakup
        float vnoise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash22(i), hash22(i+vec2(1,0)), f.x),
                     mix(hash22(i+vec2(0,1)), hash22(i+vec2(1,1)), f.x), f.y);
        }
        void main(){
          // world-ish coords: u spans 13 units across, v spans ~8.33 per tile
          vec2 pw = vec2(vUv.x*13.0, vUv.y*8.33);
          // Depth: 1.0 at center channel, 0.0 at banks
          float centerDepth = 1.0 - abs(vUv.x*2.0 - 1.0);
          float depth = smoothstep(0.0, 1.0, centerDepth);
          // Flow speed: faster in center, slower at edges (real river hydraulics)
          float flowSpeed = mix(0.4, 1.6, depth);
          // Two ripple layers drifting downstream at speed-scaled rates
          vec2 p1 = pw + vec2(uTime*0.25*flowSpeed, -uTime*1.2*flowSpeed);
          vec2 p2 = pw*2.1 + vec2(-uTime*0.5*flowSpeed, -uTime*2.4*flowSpeed) + 7.3;
          vec2 grad = slopeAt(p1, uTime)*0.5 + slopeAt(p2, uTime*1.3)*0.28;
          vec3 n = normalize(vec3(-grad.x, 1.0, -grad.y));
          vec3 viewDir = normalize(cameraPosition - vPos);
          // Fresnel: mirror at grazing angle, transparent looking straight down
          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 5.0);
          fres = mix(0.02, 1.0, fres); // Schlick's approximation base
          vec3 r = reflect(-viewDir, n);
          // Sun glitter: sharp sparkles on wave crests only
          float gdot = max(dot(r, uGlitterDir), 0.0);
          float glint = pow(gdot, 900.0);
          // Twinkle: each sparkle cell shimmers independently
          float tw = 0.3 + 0.7*(0.5 + 0.5*sin(uTime*8.0 + hash22(floor(pw*9.0))*43.0));
          // Pebble bed: procedural stones, refracted by surface ripple
          vec2 gp = pw*4.2 + grad*2.0;
          vec2 gid = floor(gp); vec2 gf = fract(gp);
          vec2 pc = vec2(0.5) + (vec2(hash22(gid+7.3), hash22(gid+3.1))-0.5)*0.6;
          float pd = length((gf-pc)*vec2(1.0,1.25));
          float peb = smoothstep(0.46, 0.36, pd);
          float prnd = hash22(gid+1.7);
          vec3 pebCol = mix(vec3(0.25,0.23,0.20), vec3(0.48,0.45,0.40), prnd);
          pebCol *= 0.8 + 0.4*hash22(gid+9.2);
          // Wet darkening: pebbles darker where submerged deeper
          pebCol *= mix(0.55, 1.0, 1.0-depth*0.5);
          vec3 bed = mix(vec3(0.18,0.16,0.13), pebCol, peb);
          // Water body color: depth-graded, NOT uniform teal
          vec3 col = mix(uShallow, uDeep, smoothstep(0.0, 0.9, depth));
          // Bed shows through: strong in shallows, faint in deep center
          // B"H 2026-10-13: was milky (sky reflection dominated at grazing
          // angle). Reference is a CLEAR shallow stream — pebbles visible.
          float bedVisibility = mix(0.98, 0.60, smoothstep(0.1, 0.8, depth));
          col = mix(col, bed, bedVisibility);
          // Sky reflection via fresnel (stronger at grazing = far water)
          // B"H 2026-10-13: 0.35→0.16, was washing out to milk at low camera.
          col = mix(col, uSky, fres*0.16);
          // Sun glitter: sharp, sparse, on crests — not milky wash
          float sdot = max(dot(r, uSunDir), 0.0);
          col += vec3(1.0,0.97,0.90) * glint * 8.0 * tw * (0.3 + 0.7*depth);
          col += vec3(1.0,0.95,0.85) * pow(sdot, 200.0) * 0.4;
          // Dappled sunlight: bright patches where sun breaks through canopy.
          float dapple = vnoise(pw*0.35 + vec2(uTime*0.05, -uTime*0.08));
          dapple = smoothstep(0.55, 0.85, dapple);
          col += vec3(1.0, 0.96, 0.82) * dapple * 0.35 * (0.4 + 0.6*depth);
          // Foam: at banks (waterline) + around procedural rock positions
          float edge = smoothstep(0.0, 0.12, vUv.x)*smoothstep(1.0, 0.88, vUv.x);
          float bankFoamBand = 1.0 - edge;
          float fn = vnoise(pw*vec2(4.0, 12.0) + vec2(0.0, -uTime*1.5));
          float lap = 0.5 + 0.5*sin(uTime*1.8 + pw.y*2.2 + fn*6.28);
          float bankFoam = bankFoamBand * smoothstep(0.4, 0.8, fn*0.5 + lap*0.5) * 0.7;
          // Rock foam: rings around procedural rock spots
          vec2 rp = pw*1.8;
          vec2 rid = floor(rp); vec2 rf = fract(rp);
          float rockHere = step(0.93, hash22(rid+4.7));
          vec2 rc = vec2(0.5) + (vec2(hash22(rid+1.1), hash22(rid+8.8))-0.5)*0.4;
          float rdist = length(rf - rc);
          float rockFoam = rockHere * smoothstep(0.30, 0.20, rdist) * smoothstep(0.12, 0.22, rdist);
          rockFoam *= 0.3 + 0.3*sin(uTime*3.0 + hash22(rid)*20.0);
          rockFoam *= 0.4 + 0.6*vnoise(pw*8.0); // break up the ring
          float foam = clamp(bankFoam*0.7 + rockFoam*0.35, 0.0, 1.0);
          col = mix(col, vec3(0.92,0.96,0.94), foam);
          // Alpha: depth-based transparency. Shallows nearly clear, deep more opaque.
          // Banks fade to zero (no hard waterline).
          float alpha = mix(0.15, 0.72, smoothstep(0.0, 0.85, depth));
          alpha *= edge; // fade at banks
          alpha = max(alpha, foam*0.85);
          // Distance fog: river melts into mist downstream
          float fd = distance(cameraPosition, vPos);
          float f2 = smoothstep(uFogNear, uFogFar, fd);
          col = mix(col, uFogColor, f2);
          alpha = mix(alpha, 1.0, f2*0.9);
          gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.97)); }`
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
    roughness: 0.95,
    // B"H — albedo is FULLY procedural (applyProceduralBark): UV-independent
    // FBM fissures + world-normal moss. Sobel normalMap stays for micro detail.
    normalMap: barkNormalTex, normalScale: new THREE.Vector2(1.6, 1.6),
    color: new THREE.Color(0.95, 0.90, 0.82),
    emissive: new THREE.Color(0.04, 0.03, 0.02),
  });
  applyProceduralBark(barkMat);
  // B"H DIAGNOSTIC — wireframe if trunks are barkMat (remove after test)
  // barkMat.wireframe = true;
  const canopyMat = new THREE.MeshStandardMaterial({
    // B"H 2026-10-13 texture-detail: was pale sage tint (0.58,0.66,0.55) washing
    // the rich leaf photo to flat paper. Deep forest tint lets real leaf detail
    // show. depthWrite kills alpha-test flicker.
    // B"H 2026-10-13 leaf audit: shadow-side baked leaves went BLACK (the dark
    // canopy blob). Emissive lift keeps transmitted light on the shadow side —
    // real leaves are translucent, never pure black.
    map: leafClusterTex, alphaTest: 0.35, side: THREE.DoubleSide,
    roughness: 0.9, color: new THREE.Color(0.42, 0.50, 0.38),
    emissive: new THREE.Color(0.10, 0.13, 0.05),
    emissiveMap: backlitCanopyTex,
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
      const barkG = bufferGeometryFromStream(t.bark || t.branches);
      const leavesG = bufferGeometryFromStream(t.leaves, 0.85);
      // B"H 2026-10-13: baked JSONs are GIGANTIC (oak bark spans 124u!).
      // Normalize to real tree height (16-22u) or trunks fill the frame as
      // flat columns. Scale baked into geometry so all downstream systems
      // (crown filler, shells, roots) use correct proportions.
      for (const g of [barkG, leavesG]) {
        g.computeBoundingBox();
        const bb = g.boundingBox;
        const h = Math.max(1, bb.max.y - bb.min.y);
        const targetH = 16 + rand() * 6; // 16-22u tall trees
        const s = targetH / h;
        g.scale(s, s, s);
        // recenter so base sits at y=0
        g.computeBoundingBox();
        g.translate(0, -g.boundingBox.min.y, 0);
      }
      out.push({ bark: barkG, leaves: leavesG });
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

  /* B"H — ROOT FLARE (Yaakov 2026-10-13: audit every tree algorithm).
     Fundamental gap: trunks met the ground as straight cylinders — real
     trees flare into buttress roots. New geometry: 6-8 tapered roots per
     tree radiate from the trunk base, arcing slightly down into the soil.
     Procedural bark shader applies automatically (world-normal moss lands
     on the up-facing root tops, like the reference). One instanced draw. */
  {
    const rootGeo = new THREE.CylinderGeometry(0.09, 0.42, 2.6, 6);
    rootGeo.translate(0, 1.3, 0); // base at origin, extends +Y
    const PER_TREE = 7;
    const rootInst = new THREE.InstancedMesh(rootGeo, barkMat, treeSpots.length * PER_TREE);
    const rdummy = new THREE.Object3D();
    const rdir = new THREE.Vector3();
    const rup = new THREE.Vector3(0, 1, 0);
    let rp = 0;
    for (const s of treeSpots) {
      const sc = s.overhang ? 1.35 : 1.0;
      const y = groundHeight(s.x, s.z, noise);
      const n = 6 + ((rand() * 3) | 0);
      for (let i = 0; i < n && rp < treeSpots.length * PER_TREE; i++) {
        const a = (i / n) * Math.PI * 2 + rand() * 0.4;
        // root arcs outward and slightly down into the soil
        rdir.set(Math.cos(a), -0.38 - rand() * 0.15, Math.sin(a)).normalize();
        rdummy.position.set(s.x + Math.cos(a) * 0.35 * sc, y + 0.25, s.z + Math.sin(a) * 0.35 * sc);
        rdummy.quaternion.setFromUnitVectors(rup, rdir);
        const rl = (1.4 + rand() * 1.2) * sc;
        rdummy.scale.set(sc * (0.8 + rand() * 0.4), rl, sc * (0.8 + rand() * 0.4));
        rdummy.updateMatrix();
        rootInst.setMatrixAt(rp++, rdummy.matrix);
      }
    }
    rootInst.count = rp;
    rootInst.castShadow = true; rootInst.receiveShadow = true;
    scene.add(rootInst);
  }
  mark('root-flare');

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
      roughness: 1.0,
      // B"H — procedural bark albedo (UV-independent); per-instance colors
      // preserved via vColor in the shader. normalMap adds micro relief.
      normalMap: barkNormalTex, normalScale: new THREE.Vector2(1.0, 1.0),
      color: new THREE.Color(0xffffff), // per-instance colors carry bark/moss tint
    });
    applyProceduralBark(segMat);
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

    // ---- leaf quads — phyllotactic clusters (Yaakov 2026-10-13: "Better algorithms").
    // Real leaf growth rules encoded:
    // - PHYLLOTAXIS: leaves spiral around the stem at the golden angle (137.5°).
    //   This is how real plants pack maximum leaves with minimum overlap.
    // - SUN ORIENTATION: outer leaves tilt toward the sun (phototropism);
    //   inner leaves are more vertical (reaching up through the canopy).
    // - LAYERED DEPTH: outer layer = sunlit bright, middle = mid-tone,
    //   inner = deep shadow. Real canopies have 3-4 leaf layers.
    // - SIZE GRADIENT: outer leaves larger (more light), inner smaller.
    // Foliage hugs the wood: quads sit within ~1.3u of their anchor. ----
    const quadGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const quadMat = new THREE.MeshStandardMaterial({
      map: denseCanopyTex, alphaTest: 0.30, side: THREE.DoubleSide,
      roughness: 0.9, color: new THREE.Color(0.24, 0.38, 0.18),
      emissive: new THREE.Color(0.35, 0.42, 0.20),
      emissiveMap: backlitCanopyTex,
      depthWrite: true,
    });
    const PER_ANCHOR = fast ? 5 : 7;
    const inst = new THREE.InstancedMesh(quadGeo, quadMat, anchors.length * PER_ANCHOR);
    const out = new THREE.Vector3();
    const tint = new THREE.Color();
    // Golden angle for phyllotaxis (radians)
    const GOLDEN_ANGLE = 2.399963;
    // Sun direction for phototropic tilt (normalized, points toward sun)
    const sunDirN = sunDir.clone().normalize();
    let placed = 0;
    for (const an of anchors) {
      for (let i = 0; i < PER_ANCHOR; i++) {
        // Phyllotactic spiral: each leaf at golden angle from the previous,
        // radius expanding with the square root (equal-area packing)
        const spiralAngle = i * GOLDEN_ANGLE + rand() * 0.3;
        const spiralRad = 1.3 * Math.sqrt((i + 0.5) / PER_ANCHOR);
        // Layer: 0=outer (sunlit), 1=mid, 2=inner (shadowed)
        const layer = Math.min(2, Math.floor(i / Math.ceil(PER_ANCHOR / 3)));
        const layerDepth = layer / 2; // 0.0=outer, 1.0=inner

        const bx = an.x + Math.cos(spiralAngle) * spiralRad;
        const by = an.y + (rand() - 0.5) * 0.8 - layerDepth * 0.4;
        const bz = an.z + Math.sin(spiralAngle) * spiralRad;

        // Size: outer leaves larger (growth rule: more light = bigger leaves)
        const bs = (1.3 - layerDepth * 0.5) * (0.9 + rand() * 0.5);

        dummy.position.set(bx, by, bz);
        // Orientation: face outward + tilt toward sun (phototropism).
        // Outer leaves tilt more toward sun; inner leaves point upward.
        out.set(bx - an.x, (by - an.y) * 0.8, bz - an.z);
        // Blend with sun direction: outer leaves reach for light
        const sunBlend = (1 - layerDepth) * 0.6;
        out.lerp(sunDirN, sunBlend).normalize();
        // Add slight upward bias (leaves angle up, not straight out)
        out.y += 0.25 * (1 - layerDepth);
        out.normalize();
        if (out.lengthSq() < 1e-6) out.set(0, 1, 0);
        dummy.lookAt(bx + out.x, by + out.y, bz + out.z);
        // In-plane rotation: aligned to spiral (not fully random)
        dummy.rotateZ(spiralAngle * 0.5 + rand() * 0.6);
        dummy.scale.set(bs, bs, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(placed, dummy.matrix);
        // Color: outer = bright sunlit, inner = deep shadow green
        // (growth rule: light determines chlorophyll density)
        const brightness = 1.05 - layerDepth * 0.45;
        const v = brightness * (0.88 + rand() * 0.24);
        // B"H — BACKLIT TRANSLUCENCY (Yaakov: leaves glow where sun shines
        // THROUGH). Quads facing away from the sun show their shadow side —
        // real leaves transmit warm light there. Baked per-instance into
        // instanceColor: zero shader cost, 60fps-safe.
        const backlit = Math.max(0, -out.dot(sunDirN));
        const glow = 1 + 0.55 * Math.pow(backlit, 1.5);
        // Outer leaves slightly yellow-green (sun-bleached), inner deep green
        tint.setRGB(
          v * (0.96 + layerDepth * -0.06 + rand() * 0.06) * glow * (1 + 0.18 * backlit),
          v * (1.00 + rand() * 0.04) * glow,
          v * (0.88 + layerDepth * 0.06 + rand() * 0.04) * (1 + 0.05 * backlit)
        );
        inst.setColorAt(placed, tint);
        placed++;
      }
    }
    inst.count = placed;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.castShadow = true; inst.receiveShadow = true;
    scene.add(inst);

    // ---- individual 3D leaves — near-canopy detail (Yaakov 2026-10-13:
    // "better leaf system": individual leaves visible at canopy edges).
    // Small leaf quads (not billboards) hang from every L3+ twig tip with
    // petiole-style orientation: droop below horizontal + golden-angle
    // azimuth (phyllotaxis continues to the leaf stem). Leaf-vein normals
    // give each leaf light response; backlit tint glows against the sun.
    // One instanced draw call.
    if (tips.length > 0) {
      const leafGeo = new THREE.PlaneGeometry(0.34, 0.44);
      const leafMat = new THREE.MeshStandardMaterial({
        map: leafClusterTex, alphaTest: 0.35, side: THREE.DoubleSide,
        roughness: 0.85, color: new THREE.Color(0.50, 0.58, 0.42),
        normalMap: leafVeinNormalTex, normalScale: new THREE.Vector2(0.7, 0.7),
        depthWrite: true,
      });
      const PER_TIP = fast ? 3 : 5;
      const leafInst = new THREE.InstancedMesh(leafGeo, leafMat, tips.length * PER_TIP);
      const ldir = new THREE.Vector3();
      let lp = 0;
      for (const tp of tips) {
        for (let k = 0; k < PER_TIP && lp < tips.length * PER_TIP; k++) {
          // Phyllotactic azimuth + natural droop (leaves hang, not stick out)
          const az = k * GOLDEN_ANGLE + rand() * 0.5;
          const droop = 0.35 + rand() * 0.55; // radians below horizontal
          const cd = Math.cos(droop), sd = Math.sin(droop);
          ldir.set(Math.cos(az) * cd, -sd, Math.sin(az) * cd).normalize();
          const lx = tp.x + ldir.x * (0.12 + rand() * 0.22);
          const ly = tp.y + ldir.y * (0.12 + rand() * 0.22);
          const lz = tp.z + ldir.z * (0.12 + rand() * 0.22);
          dummy.position.set(lx, ly, lz);
          dummy.lookAt(lx + ldir.x, ly + ldir.y, lz + ldir.z);
          dummy.rotateZ(rand() * Math.PI * 2); // blade roll variety
          const ls = 0.8 + rand() * 0.6;
          dummy.scale.set(ls, ls, 1);
          dummy.updateMatrix();
          leafInst.setMatrixAt(lp, dummy.matrix);
          // Backlit translucency: leaves glow when sun is behind them
          const lb = Math.max(0, -ldir.dot(sunDirN));
          const lg = 1 + 0.6 * Math.pow(lb, 1.5);
          const lv = 0.9 + rand() * 0.25;
          tint.setRGB(
            lv * lg * (1 + 0.20 * lb),
            lv * lg,
            lv * (0.92 + rand() * 0.06)
          );
          leafInst.setColorAt(lp, tint);
          lp++;
        }
      }
      leafInst.count = lp;
      if (leafInst.instanceColor) leafInst.instanceColor.needsUpdate = true;
      leafInst.castShadow = false; leafInst.receiveShadow = true;
      scene.add(leafInst);
    }
    mark('individual-leaves');

    // ---- canopy shells: nested depth layers (Yaakov 2026-10-13 leaf system).
    // Two icosahedron shells per tree (0.55x / 0.78x crown radius) — INTERIOR
    // density only. Earlier versions at 0.70x/0.95x poked through the crown
    // silhouette and rendered as dark blobs (shells show their shadow side).
    // Interior shells read as deep canopy mass; the outer surface belongs to
    // individual leaves + crown quads. 1 instanced draw.
    {
      const shellGeo = new THREE.IcosahedronGeometry(1, 1);
      const shellMat = new THREE.MeshStandardMaterial({
        // B"H — alphaTest 0.5: shells read as BROKEN leaf clusters with sky
        // gaps, not solid blobs (0.22 rendered as a dark fake ball).
        map: denseCanopyTex, alphaTest: 0.5, side: THREE.DoubleSide,
        roughness: 0.95, color: new THREE.Color(0.38, 0.50, 0.28),
        depthWrite: true,
      });
      const shellInst = new THREE.InstancedMesh(shellGeo, shellMat, treeSpots.length * 2);
      let sp = 0;
      for (const s of treeSpots) {
        const ccx = (s.crownX !== undefined ? s.crownX : s.x);
        for (const f of [0.55, 0.78]) {
          dummy.position.set(ccx, s.crownY, s.z);
          dummy.quaternion.identity();
          dummy.rotateY(rand() * Math.PI * 2);
          const sr = s.crownR * f * (0.92 + rand() * 0.16);
          dummy.scale.set(sr, sr * 0.75, sr); // flattened — canopy spread
          dummy.updateMatrix();
          shellInst.setMatrixAt(sp, dummy.matrix);
          const sv = 0.85 + rand() * 0.3;
          tint.setRGB(sv, sv, sv * 0.95);
          shellInst.setColorAt(sp, tint);
          sp++;
        }
      }
      shellInst.count = sp;
      if (shellInst.instanceColor) shellInst.instanceColor.needsUpdate = true;
      shellInst.castShadow = true; shellInst.receiveShadow = true;
      scene.add(shellInst);
    }
    mark('canopy-shells');
  }
  mark('crown-filler');

  /* overhead canopy — enclosing leaf layer (Yaakov 2026-10-13: 99% push).
     The reference has dense canopy closing over the top of frame. This is a
     dedicated layer of large leaf quads positioned above the camera (y 8-16),
     angled downward, creating the enclosed forest-tunnel feel. The quads use
     the backlit canopy texture so sun glows through from above.
     60fps: single instanced draw, ~120 quads. */
  if (view === 'forest') {
    const ohGeo = new THREE.PlaneGeometry(6, 6);
    const ohMat = new THREE.MeshStandardMaterial({
      map: denseCanopyTex, alphaTest: 0.28, side: THREE.DoubleSide,
      roughness: 0.9, color: new THREE.Color(0.35, 0.48, 0.25),
      emissive: new THREE.Color(0.28, 0.36, 0.16),
      emissiveMap: backlitCanopyTex,
      depthWrite: true,
    });
    const OH_COUNT = fast ? 60 : 120;
    const ohInst = new THREE.InstancedMesh(ohGeo, ohMat, OH_COUNT);
    const ohDummy = new THREE.Object3D();
    const ohTint = new THREE.Color();
    const camX = VIEWS.forest.pos[0], camZ = VIEWS.forest.pos[2];
    let ohPlaced = 0, ohGuard = 0;
    const ohr = mulberry32(seed ^ 0x0c4);
    while (ohPlaced < OH_COUNT && ohGuard++ < OH_COUNT * 10) {
      // Cover the sky above and ahead of the camera
      const x = camX + (ohr() - 0.5) * 60;
      const z = camZ - 10 - ohr() * 70; // ahead of camera (looking -z)
      const y = 9 + ohr() * 8;
      ohDummy.position.set(x, y, z);
      // Angle downward toward camera (like real overhanging branches)
      ohDummy.rotation.set(
        -Math.PI/2 + (ohr() - 0.5) * 0.9, // mostly facing down
        ohr() * Math.PI * 2,
        (ohr() - 0.5) * 0.5
      );
      const os = 0.8 + ohr() * 1.2;
      ohDummy.scale.set(os, os, 1);
      ohDummy.updateMatrix();
      ohInst.setMatrixAt(ohPlaced, ohDummy.matrix);
      const ov = 0.75 + ohr() * 0.4;
      ohTint.setRGB(ov, ov * (0.95 + ohr()*0.1), ov * 0.85);
      ohInst.setColorAt(ohPlaced, ohTint);
      ohPlaced++;
    }
    ohInst.count = ohPlaced;
    if (ohInst.instanceColor) ohInst.instanceColor.needsUpdate = true;
    scene.add(ohInst);
  }
  mark('overhead-canopy');


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
      if (Math.abs(x - riverX(z)) < 6.8) continue; // B"H 99%: clear of narrowed water
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
        x = riverX(z) + side * (7.0 + rand() * 7); // B"H 2026-10-13: at the banks
      } else {
        const t = treeSpots[(rand() * treeSpots.length) | 0];
        if (!t) continue;
        const a = rand() * Math.PI * 2, r = 2 + rand() * 6;
        x = t.x + Math.cos(a) * r; z = t.z + Math.sin(a) * r;
      }
      if (Math.abs(x - riverX(z)) < 6.8) continue; // B"H 99%: not in the narrowed water
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
      // B"H — mossGroundTex was never loaded (undefined map = untextured rocks).
      // Wet-rock normals give bank stones real surface; vertexColors carry tint.
      vertexColors: true, roughness: 0.85,
      normalMap: wetRockNormalTex, normalScale: new THREE.Vector2(1.1, 1.1),
    });
    const COUNT = fast ? 90 : 160;
    const inst = new THREE.InstancedMesh(rockGeo, rockMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, g2 = 0;
    while (placed < COUNT && g2++ < COUNT * 30) {
      const z = (srand() - 0.5) * 200;
      const side = srand() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * (7.0 + srand() * 6); // B"H 2026-10-13: banks, not in the widened water
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

  /* moss — growth-rule mounds (Yaakov 2026-10-13: "Better algorithms").
     Real moss growth rules encoded:
     - DIRECTIONAL: moss thrives on north-facing (shaded) surfaces and in
       crevices where moisture collects. Mounds are thicker on the shaded side.
     - AGE GRADIENT: bright yellow-green new growth on top/exterior,
       dark olive-brown old moss underneath/in crevices.
     - 3D STRUCTURE: not flat blobs — bumpy tufts with individual sporophyte
       spikes (tiny stalks). Height varies with moisture (near water = taller).
     - SPREAD PATTERN: moss creeps outward from establishment points,
       forming irregular patches (not circles).
     60fps: instanced, one draw call. */
  {
    // Moss tuft: bumpy hemisphere with vertex-color age gradient
    const tuftGeo = new THREE.IcosahedronGeometry(1, 2);
    const mp = tuftGeo.attributes.position, mc = [];
    const mor2 = mulberry32(seed ^ 0xf055);
    for (let i = 0; i < mp.count; i++) {
      const vx = mp.getX(i), vy = mp.getY(i), vz = mp.getZ(i);
      // Growth-rule bumpiness: multi-frequency displacement for organic lumps
      const bump = 1 + 0.22 * Math.sin(vx*5.1+1.2) * Math.sin(vy*4.3+0.7) * Math.sin(vz*5.8+2.1)
                     + 0.10 * Math.sin(vx*11.7+0.3) * Math.sin(vz*9.2+1.8);
      // Flatten bottom (moss hugs the ground), dome the top
      const ny = vy < 0 ? vy * 0.3 : vy;
      mp.setXYZ(i, vx * bump, ny * bump * 0.55, vz * bump);
      // Growth-rule color: top = bright new growth, sides/bottom = dark old moss
      // Also: north-facing (-z, away from sun) gets brighter (more moisture)
      const upness = Math.max(0, vy);
      const northness = Math.max(0, -vz * 0.5 + 0.5);
      const brightness = 0.45 + upness * 0.75 + northness * 0.15;
      // New growth: yellow-green. Old moss: deep olive.
      const newness = upness;
      mc.push(
        (0.28 + newness*0.38) * brightness,
        (0.50 + newness*0.32) * brightness,
        (0.14 + newness*0.08) * brightness
      );
    }
    tuftGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(mc), 3));
    tuftGeo.computeVertexNormals();
    const moundMat = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 1.0,
      emissive: new THREE.Color(0.06, 0.10, 0.02),
      // B"H — lumpy moss normals on the moss mounds: relief in every tuft.
      normalMap: mossNormalTex, normalScale: new THREE.Vector2(0.8, 0.8),
    });
    const COUNT = fast ? 150 : 280;
    const inst = new THREE.InstancedMesh(tuftGeo, moundMat, COUNT);
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();
    let placed = 0, g4 = 0;
    while (placed < COUNT && g4++ < COUNT * 30) {
      const z = (mor2() - 0.5) * 200;
      const side = mor2() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * (7.0 + mor2() * 9);
      if (clearPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < 8)) continue;
      // Growth rule: moss taller near water (more moisture)
      const distToWater = Math.abs(x - riverX(z)) - 6.5;
      const moisture = Math.max(0, 1 - distToWater / 10);
      const s = (0.4 + mor2() * 1.0) * (0.7 + moisture * 0.6);
      // Growth rule: irregular patch shape (not circular)
      const stretch = 0.7 + mor2() * 0.8;
      dummy.position.set(x, groundHeight(x, z, noise) + 0.02, z);
      dummy.rotation.set(0, mor2() * Math.PI * 2, 0);
      dummy.scale.set(s * stretch, s * 0.6, s / stretch);
      dummy.updateMatrix();
      inst.setMatrixAt(placed, dummy.matrix);
      // Per-mound variation: some patches lusher than others
      const v = 0.8 + mor2() * 0.4;
      tint.setRGB(v, v, v * (0.9 + mor2()*0.2));
      inst.setColorAt(placed, tint);
      placed++;
    }
    inst.count = placed;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.castShadow = false; inst.receiveShadow = true;
    scene.add(inst);
  }
  mark('moss-mounds');

  /* fallen log + leaf litter — foreground detail (Yaakov 2026-10-13: 99% push).
     The reference has a prominent mossy log in the foreground left and
     scattered dead leaves on the ground. These ground the scene in reality.
     60fps: 2 instanced draws. */
  {
    // Fallen log: horizontal cylinder with mossy log texture
    const logGeo = new THREE.CylinderGeometry(0.35, 0.45, 6, 10);
    logGeo.rotateZ(Math.PI / 2); // lay horizontal
    const logMat = new THREE.MeshStandardMaterial({
      map: fallenLogTex, roughness: 0.95,
      color: new THREE.Color(0.9, 0.95, 0.85),
    });
    const LOG_COUNT = 3;
    const logInst = new THREE.InstancedMesh(logGeo, logMat, LOG_COUNT);
    const ld = new THREE.Object3D();
    const lr = mulberry32(seed ^ 0x106);
    const camX = VIEWS.forest.pos[0], camZ = VIEWS.forest.pos[2];
    for (let i = 0; i < LOG_COUNT; i++) {
      // Place logs near camera on the banks (foreground detail)
      const side = i % 2 === 0 ? -1 : 1;
      const lz = camZ - 5 - i * 12 + (lr() - 0.5) * 6;
      const lx = riverX(lz) + side * (8 + lr() * 4);
      ld.position.set(lx, groundHeight(lx, lz, noise) + 0.25, lz);
      ld.rotation.set(0, (lr() - 0.5) * 0.8 + (side > 0 ? 0.3 : -0.3), 0);
      const ls = 0.8 + lr() * 0.6;
      ld.scale.set(ls, ls, ls);
      ld.updateMatrix();
      logInst.setMatrixAt(i, ld.matrix);
    }
    logInst.castShadow = true; logInst.receiveShadow = true;
    scene.add(logInst);

    // Leaf litter: scattered dead leaves on the ground
    const litterGeo = new THREE.PlaneGeometry(0.3, 0.3);
    litterGeo.rotateX(-Math.PI / 2); // lay flat
    const litterMat = new THREE.MeshStandardMaterial({
      map: leafLitterTex, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1,
      color: new THREE.Color(0.85, 0.80, 0.70),
    });
    const LITTER_COUNT = fast ? 400 : 800;
    const litterInst = new THREE.InstancedMesh(litterGeo, litterMat, LITTER_COUNT);
    let litPlaced = 0, litGuard = 0;
    while (litPlaced < LITTER_COUNT && litGuard++ < LITTER_COUNT * 10) {
      const lz = (lr() - 0.5) * 180;
      const side = lr() < 0.5 ? -1 : 1;
      const lx = riverX(lz) + side * (7 + lr() * 15);
      if (Math.abs(lx - riverX(lz)) < 6.8) continue;
      litterInst.setMatrixAt(litPlaced, (() => {
        ld.position.set(lx, groundHeight(lx, lz, noise) + 0.03, lz);
        ld.rotation.set(0, lr() * Math.PI * 2, 0);
        const ls = 0.7 + lr() * 0.8;
        ld.scale.set(ls, 1, ls);
        ld.updateMatrix();
        return ld.matrix;
      })());
      litPlaced++;
    }
    litterInst.count = litPlaced;
    litterInst.receiveShadow = true;
    scene.add(litterInst);
  }
  mark('forest-floor-props');

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

  /* grass — growth-rule tufts (Yaakov 2026-10-13: "Better algorithms").
     Real grass growth rules encoded:
     - CLUMPING: grass grows in tufts (3-9 blades per cluster), not evenly spaced.
       Cluster centers are Poisson-ish distributed; blades cluster around them.
     - BLADE CURVE: each blade bends naturally — stiff base, flexible tip.
       Bend direction is random but consistent within a tuft (wind-shaped).
     - COLOR GRADIENT: dark base (shadowed) → vibrant mid → sunlit tip.
       Per-blade hue variation (some yellow-green, some deep green).
     - HEIGHT VARIATION: outer blades shorter (grazed/trampled), inner taller.
     60fps: single InstancedMesh, no per-frame CPU work. */
  {
    // Blade geometry: curved, tapered, with vertex color gradient
    const bladeGeo = new THREE.PlaneGeometry(0.16, 0.7, 1, 4);
    bladeGeo.translate(0, 0.35, 0);
    const bp = bladeGeo.attributes.position, bc = [];
    for (let i = 0; i < bp.count; i++) {
      const t = bp.getY(i) / 0.7; // 0=base, 1=tip
      // Growth-rule taper: blade narrows to a point (not linear)
      const width = Math.pow(1 - t, 0.7);
      bp.setX(i, bp.getX(i) * width);
      // Growth-rule curve: quadratic bend (stiff base, floppy tip)
      bp.setZ(i, t * t * 0.22);
      // Growth-rule color: dark moist base → deep forest green → sunlit tip
      const shade = 0.32 + t * 1.0;
      bc.push(0.22 * shade * (0.8 + t*0.35), 0.52 * shade, 0.16 * shade * (1.1 - t*0.3));
    }
    bladeGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(bc), 3));
    bladeGeo.computeVertexNormals();

    const bladeMat = new THREE.MeshStandardMaterial({
      vertexColors: true, side: THREE.DoubleSide, roughness: 0.9,
    });
    // 60fps: one instanced draw call for all blades
    // B"H — PATCH-BASED distribution (Yaakov 2026-10-13: "grass grows in
    // PATCHES in the real image"). Two-scale value noise defines patch
    // centers: large patches (~22u) modulated by small patches (~9u), so
    // patches vary in size and shape. Dense tufts inside patches, sparse
    // strays outside — bare moss/soil shows between, like the reference.
    const patchNoise = makeNoise2D(mulberry32(seed ^ 0x9a7c));
    function patchMask(x, z) {
      const n1 = patchNoise(x * 0.045 + 31.7, z * 0.045 - 12.3);
      const n2 = patchNoise(x * 0.11 - 7.1, z * 0.11 + 5.9);
      const m = n1 * 0.65 + n2 * 0.35; // ~[-1,1]
      return THREE.MathUtils.smoothstep(m, 0.02, 0.55); // 0=bare, 1=patch heart
    }
    const MAX_BLADES = 9;
    const TUFTS = fast ? 500 : 900;
    const COUNT = TUFTS * MAX_BLADES;
    const inst = new THREE.InstancedMesh(bladeGeo, bladeMat, COUNT);
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();
    let placed = 0; guard = 0;
    const gr = mulberry32(seed ^ 0x6a55);

    while (placed < COUNT && guard++ < COUNT * 20) {
      // Cluster center: 62% near river (lush banks), 38% scattered
      let cx, cz;
      if (gr() < 0.62) {
        cz = (gr() - 0.5) * 190;
        cx = riverX(cz) + (gr() < 0.5 ? -1 : 1) * (7.0 + gr() * 17);
      } else {
        cx = (gr() - 0.5) * 190; cz = (gr() - 0.5) * 190;
      }
      if (Math.abs(cx - riverX(cz)) < 6.8) continue;
      if (clearPts.some(([px, pz]) => Math.hypot(cx - px, cz - pz) < 3)) continue;
      // Patch gate: tufts concentrate in patches; ~10% strays survive outside
      const pm = patchMask(cx, cz);
      if (gr() > 0.10 + 0.90 * pm) continue;
      // Blades per tuft scale with patch density: 3 at patch edge → 9 in heart
      const bladesHere = 3 + Math.round(pm * 6);
      const gy = groundHeight(cx, cz, noise);

      // Tuft growth rules: dominant wind direction for this tuft
      const tuftLean = gr() * Math.PI * 2;
      const tuftLeanAmt = 0.1 + gr() * 0.25;
      // Tuft hue: some tufts yellower, some deeper green (soil variation)
      const tuftHue = 0.85 + gr() * 0.3;

      // Place blades in a tight cluster around center
      for (let b = 0; b < bladesHere && placed < COUNT; b++) {
        // Blade position: Gaussian-ish falloff from tuft center
        const ang = gr() * Math.PI * 2;
        const rad = Math.pow(gr(), 0.6) * 0.35; // denser at center
        const x = cx + Math.cos(ang) * rad;
        const z = cz + Math.sin(ang) * rad;
        // Outer blades shorter (growth rule: edge blades get trampled/grazed)
        const edgeFactor = rad / 0.35; // 0=center, 1=edge
        // Patch-heart tufts grow taller and lusher; edge tufts stay short
        const heightScale = (1.0 - edgeFactor * 0.35) * (0.7 + gr() * 0.7) * (0.75 + 0.5 * pm);

        dummy.position.set(x, groundHeight(x, z, noise), z);
        // Blade orientation: random Y rotation + tuft lean direction
        dummy.rotation.set(0, gr() * Math.PI * 2, 0);
        // Lean: combination of tuft wind direction + individual variation
        dummy.rotateX(Math.cos(tuftLean) * tuftLeanAmt + (gr() - 0.5) * 0.2);
        dummy.rotateZ(Math.sin(tuftLean) * tuftLeanAmt + (gr() - 0.5) * 0.2);

        dummy.scale.set(0.9 + gr()*0.3, heightScale, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(placed, dummy.matrix);
        // Per-blade color variation (growth rule: no two blades identical)
        const v = tuftHue * (0.85 + gr() * 0.3);
        tint.setRGB(v, v, v);
        inst.setColorAt(placed, tint);
        placed++;
      }
    }
    inst.count = placed;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
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
  // B"H commit 2: mist billboard drift/breathing joins the updater loop.
  for (const mu of mistUpdaters) updaters.push(mu);
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
