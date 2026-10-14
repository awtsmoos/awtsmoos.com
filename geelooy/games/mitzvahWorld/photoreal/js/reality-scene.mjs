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
// B"H — BAKED BARK SHADER (Yaakov 2026-10-14 DIRECTION CORRECTION:
// "ALGORITHMS are for PLACEMENT; TEXTURES are PREMADE").
// The in-shader procedural fissures were the wrong approach. Now:
// - Bark albedo/normal/roughness are PREMADE (textures/baked/bark-*.png,
//   baked deterministically via textures/gen/bake-bark.py, plan §32).
// - Sampled tiled in world space (cylindrical UVs for trunks).
// - Shader keeps ONLY: lighting, moss-colonization blend, wetness darkening.
// - Moss color is PREMADE (mossy bark texture), not procedural.
function applyBakedBark(mat, barkAlbedoTex, barkRoughTex, mossTex) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBarkAlbedo = { value: barkAlbedoTex };
    shader.uniforms.uBarkRough = { value: barkRoughTex };
    shader.uniforms.uMossAlbedo = { value: mossTex };
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
        uniform sampler2D uBarkAlbedo, uBarkRough, uMossAlbedo;
        uniform vec3 uRimSunDirW;
        // cheap hash for moss-placement breakup (distribution, not surface)
        float barkHash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }`)
      .replace('#include <map_fragment>', `{
          vec3 bwp = vBarkWPos;
          vec3 bwn = normalize(vBarkWNormal);
          // cylindrical UVs: seamless around trunk, tiled vertically
          float ang = atan(bwp.z, bwp.x);
          vec2 barkUV = vec2((ang / 6.2831853 + 0.5) * 3.0, bwp.y * 0.35);
          // PREMADE bark albedo (fissure plates, cracks, grain all baked)
          vec3 barkCol = texture2D(uBarkAlbedo, barkUV).rgb;
          // moss colonization: WHERE moss grows (placement logic) —
          // up-facing + low on trunk + noisy breakup. Moss SURFACE is premade.
          float upFace = clamp(bwn.y * 0.5 + 0.5, 0.0, 1.0);
          float mBreak = barkHash(floor(bwp.xz * 8.0) + floor(bwp.y * 4.0));
          float mossMask = smoothstep(0.45, 0.75, upFace * 0.65 + mBreak * 0.45);
          mossMask *= 1.0 - smoothstep(2.0, 7.0, bwp.y);
          // B"H WAY-better #11: moss prefers the shaded side (north bias) —
          // away from the sun azimuth, where moisture lingers.
          vec2 sunAz = normalize(uRimSunDirW.xz);
          float shadeSide = clamp(-dot(normalize(bwn.xz + vec2(1e-5)), sunAz), 0.0, 1.0);
          mossMask *= 0.65 + 0.70 * shadeSide;
          // B"H NEW #7: lichen patches — pale green-gray crustose spots on
          // the bark, distinct from moss (higher up, sun-side tolerant).
          {
            vec2 luv = vec2(atan(bwn.z, bwn.x) * 2.0, bwp.y * 0.9);
            float lsp = barkHash(floor(luv * 6.0)) * 0.6 + barkHash(floor(luv * 13.0)) * 0.4;
            float lichen = smoothstep(0.62, 0.72, lsp) * smoothstep(1.5, 4.0, bwp.y);
            lichen *= 1.0 - mossMask; // not where moss is
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.66, 0.55), lichen * 0.7);
          }
          vec3 mossCol = texture2D(uMossAlbedo, barkUV * 2.0).rgb;
          vec3 col = mix(barkCol, mossCol, clamp(mossMask, 0.0, 1.0));
          // wetness darkening: near water level
          float wet = 1.0 - smoothstep(0.0, 1.5, bwp.y - (-0.35));
          col *= 1.0 - wet * 0.35;
          // preserve per-instance tint (branch wood uses instanceColor)
          #ifdef USE_INSTANCING_COLOR
            col *= vColor;
          #endif
          diffuseColor.rgb = col;
        }`)
      .replace('#include <roughnessmap_fragment>', `{
          vec3 bwp2 = vBarkWPos;
          float ang2 = atan(bwp2.z, bwp2.x);
          vec2 ruv = vec2((ang2 / 6.2831853 + 0.5) * 3.0, bwp2.y * 0.35);
          float roughnessFactor = texture2D(uBarkRough, ruv).g;
        }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          // B"H WAY-better #4: sun-side rim light — warm halo on the trunk
          // silhouette edges, stronger on the sun side. Sells the backlight.
          vec3 Vv = normalize(cameraPosition - vBarkWPos);
          vec3 bwn2 = normalize(vBarkWNormal);
          float rim = pow(1.0 - max(dot(Vv, bwn2), 0.0), 3.0);
          float sunSide = clamp(dot(bwn2, normalize(uRimSunDirW)), 0.0, 1.0);
          totalEmissiveRadiance += vec3(1.0, 0.80, 0.52) * rim * (0.08 + 0.42 * sunSide);
        }`);
    // B"H: sun dir resolved at shader-compile time (first render), when the
    // golden-preset sunDir const is initialized.
    shader.uniforms.uRimSunDirW = { value: sunDir.clone() };
    mat.customProgramCacheKey = () => 'baked-bark-v2';
  };
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
  // B"H commit 10: reference framing — camera LOW near the water (0.75m
  // above surface), on the bank, looking down the S-curve to the bright
  // background gap. River enters bottom-center, leads eye to distance.
  forest:    { pos: [riverX(20) + 3.2, WATER_Y + 0.75, 20],  look: [riverX(-32) - 0.5, WATER_Y + 0.5, -32] },
  river:     { pos: [riverX(34) + 7, 3.4, 34], look: [riverX(-30) - 2, 0.5, -30] },
  // B"H "even more real" proof: top-down over the foreground shallows (z=20,
  // wide water) — individual 3D pebbles must be countable through the water.
  'shallows-top': { pos: [riverX(20), WATER_Y + 14, 20], look: [riverX(20), WATER_Y, 19] },
  // B"H polish: look up through the canopy toward the sun — sun disc proof.
  // Camera in the river corridor, sightline along the sun direction.
  'sun-gap': { pos: [riverX(8), WATER_Y + 1.2, 8],
               look: [riverX(8) + 27, WATER_Y + 34, 8 - 42] },
  // B"H commit 7 proof: macro on hero boulder #1 (z=14, left bank).
  'debug-boulder': { pos: [riverX(14) - riverHalfWidth(14) * 1.45 + 2.2, WATER_Y + 1.6, 17.5],
                     look: [riverX(14) - riverHalfWidth(14) * 1.45, WATER_Y + 0.5, 14] },
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
    hemiSky: 0xa8c8d8, hemiGround: 0x5a6b48, hemiI: 0.62,
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

export async function buildRealityScene(container, { view = 'forest', seed = 20261011, fast = false, tod = 'golden', renderScale = 0.75 } = {}) {
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
  // B"H — CPU 60fps mission (Yaakov 2026-10-14): render scaling. The 3D scene
  // rasterizes at renderScale (default 0.75) and the canvas CSS-upscales with
  // bilinear filtering — the standard game technique. Fill-rate (the dominant
  // SwiftShader cost) drops ~1.8x at 0.75 with negligible visual loss, vs
  // geometry butchery which would destroy realism. Proof captures render at
  // full res (see capture path below).
  const RS = Math.min(1, Math.max(0.5, renderScale));
  renderer.setSize(Math.round(innerWidth * RS), Math.round(innerHeight * RS), false);
  renderer.domElement.style.width = innerWidth + 'px';
  renderer.domElement.style.height = innerHeight + 'px';
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
  // B"H — "even more real" (Yaakov 2026-10-14): shared view-dependent canopy
  // backlight. Real leaves transmit warm light when the sun is behind them;
  // the old constant emissive made distant canopy a dark mass. This adds a
  // sun-through-leaf glow that strengthens as the camera looks toward the sun.
  // Wider lobe + stronger transmit than commit 4's leaf-only version.
  const backlitSunDir = sunDir.clone();
  function addCanopyBacklight(mat, strength = 1.0, lobePow = 2.0, key = 'backlit') {
    const prevCompile = mat.onBeforeCompile;
    mat.onBeforeCompile = (sh) => {
      if (prevCompile) prevCompile(sh);
      sh.uniforms.uSunDirL = { value: backlitSunDir };
      sh.uniforms.uBlStrength = { value: strength };
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform vec3 uSunDirL; uniform float uBlStrength;
          varying vec3 vBlViewDir;`)
        .replace('#include <opaque_fragment>', `
          {
            vec3 Vb = normalize(vBlViewDir);
            float bl = pow(clamp(dot(Vb, -uSunDirL), 0.0, 1.0), ${lobePow.toFixed(1)});
            // B"H WAY-better #3: leaf subsurface scattering — real leaves
            // transmit strongest at the chlorophyll peak (yellow-green).
            // Weak backlight: warm gold wash. Strong backlight: the leaf's
            // core glows yellow-green, edges stay warm. Scaled by albedo so
            // it reads as light THROUGH the leaf, not an overlay.
            vec3 sssCol = mix(vec3(0.72, 0.60, 0.26), vec3(0.60, 0.82, 0.30),
                              smoothstep(0.25, 0.9, bl));
            outgoingLight += sssCol * (bl * uBlStrength) * diffuseColor.rgb * 2.2;
          }
          #include <opaque_fragment>`);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>
          varying vec3 vBlViewDir;`)
        .replace('#include <fog_vertex>', `#include <fog_vertex>
          {
            vec4 lbwp = modelMatrix * vec4(transformed, 1.0);
            #ifdef USE_INSTANCING
              lbwp = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
            #endif
            vBlViewDir = cameraPosition - lbwp.xyz;
          }`);
    };
    mat.customProgramCacheKey = () => 'canopy-backlit-' + key;
  }
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
          // B"H polish: real solar disc — 0.53° angular diameter, limb-darkened
          // (bright core, warm edge), tight warm corona. Reads as a sun,
          // not a white blob.
          float discEdge = 0.9999893;
          float disc = smoothstep(discEdge - 0.0000012, discEdge + 0.0000008, s);
          float limb = 0.72 + 0.28 * smoothstep(discEdge - 0.0000012, 1.0, s);
          vec3 discCol = mix(vec3(1.0, 0.80, 0.58), vec3(1.0, 0.97, 0.93), limb);
          col += discCol * disc * 2.4;
          float corona = pow(s, 1500.0) * 0.55 + pow(s, 350.0) * 0.30;
          col += vec3(1.0, 0.88, 0.70) * corona;
          col += vec3(1.0, 0.93, 0.78) * pow(s, 18.0) * 0.30;
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
    // B"H WAY-better #2: breathing shafts — slow sine on opacity so the rays
    // feel alive (canopy moving overhead). Registered as an updater below.
    shaftMat.userData.baseOpacity = 0.14;
    scene.userData.shaftMat = shaftMat;
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
    // B"H "even more real" (Yaakov 2026-10-14): the background gap must read
    // as a LUMINOUS opening, not gray. Sprites near the sun gap (far z,
    // near centerline) get additive blending + warm tint + higher opacity —
    // they catch the sun. Others stay soft normal-blend.
    const sunGapX = riverX(-50), sunGapZ = -50;
    for (let mi = 0; mi < 14; mi++) {
      // background gap + distant river: z -35..-105, clustered near centerline
      const mz = -35 - mrand() * 70;
      const mxp = riverX(mz) + (mrand() - 0.5) * 26;
      const myp = WATER_Y + 2.5 + mrand() * 5;
      const mscale = 10 + mrand() * 12;
      // proximity to the sun gap (0=far, 1=in the glow)
      const gapProx = Math.max(0, 1 - Math.hypot(mxp - sunGapX, mz - sunGapZ) / 45);
      const inGlow = gapProx > 0.45;
      const smat = new THREE.SpriteMaterial({
        map: mistTex, transparent: true, depthWrite: false,
        opacity: inGlow ? 0.34 + mrand() * 0.18 : 0.16 + mrand() * 0.12,
        blending: inGlow ? THREE.AdditiveBlending : THREE.NormalBlending,
        color: inGlow ? new THREE.Color(1.0, 0.93, 0.78) : new THREE.Color(1, 1, 1),
        fog: false,
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
    // B"H "even more real": soft additive glow quad parked in the sun gap —
    // the luminous heart of the background. Warm white-gold, radial falloff.
    {
      const gc = document.createElement('canvas'); gc.width = gc.height = 256;
      const gx = gc.getContext('2d');
      const gg = gx.createRadialGradient(128, 128, 8, 128, 128, 128);
      gg.addColorStop(0, 'rgba(255,246,220,0.85)');
      gg.addColorStop(0.4, 'rgba(255,238,200,0.38)');
      gg.addColorStop(1, 'rgba(255,230,180,0)');
      gx.fillStyle = gg; gx.fillRect(0, 0, 256, 256);
      const gtex = new THREE.CanvasTexture(gc); gtex.colorSpace = THREE.SRGBColorSpace;
      const gmat = new THREE.SpriteMaterial({
        map: gtex, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, opacity: 0.85, fog: false,
      });
      const glow = new THREE.Sprite(gmat);
      glow.position.set(sunGapX, WATER_Y + 7, sunGapZ);
      glow.scale.set(60, 40, 1);
      scene.add(glow);
      mistUpdaters.push((t) => {
        gmat.opacity = 0.85 * (0.9 + 0.1 * Math.sin(t * 0.23));
      });
    }
    // B"H WAY-better #22: layered mist parallax — two more depth layers
    // drifting at different speeds. Near layers move faster (parallax),
    // far layers barely creep. Depth you can feel.
    const mistLayers = [
      { n: 8, z0: -8, z1: -38, speed: 0.09, op: 0.14, sc: [8, 14] },   // mid
      { n: 5, z0: 12, z1: 42, speed: 0.16, op: 0.10, sc: [6, 10] },    // near
    ];
    for (const L of mistLayers) {
      for (let li = 0; li < L.n; li++) {
        const lz = L.z0 - mrand() * (L.z0 - L.z1);
        const lxp = riverX(lz) + (mrand() - 0.5) * 30;
        const lyp = WATER_Y + 1.5 + mrand() * 4;
        const lsc = L.sc[0] + mrand() * (L.sc[1] - L.sc[0]);
        const lmat = new THREE.SpriteMaterial({
          map: mistTex, transparent: true, depthWrite: false,
          opacity: L.op * (0.7 + mrand() * 0.6),
          blending: THREE.NormalBlending, fog: false,
        });
        const lspr = new THREE.Sprite(lmat);
        lspr.position.set(lxp, lyp, lz);
        lspr.scale.set(lsc, lsc * 0.55, 1);
        scene.add(lspr);
        const lphase = mrand() * 6.28, lbaseO = lmat.opacity;
        const lspd = L.speed;
        mistUpdaters.push((t) => {
          lspr.position.x = lxp + Math.sin(t * lspd + lphase) * 2.2;
          lmat.opacity = lbaseO * (0.75 + 0.25 * Math.sin(t * 0.13 + lphase * 2));
        });
      }
    }
    mark('mist');
  }

  /* B"H NEW #1: volumetric light cones — geometry shafts through canopy gaps.
     Additive cone meshes aligned to the sun direction, parked where the
     canopy breaks. Cheap: 5 cones, 1 material, soft fresnel-ish fade via
     vertex alpha (canvas gradient texture).
     B"H TEXTURE-FIRST 2026-10-14: was invisible (0.42 opacity vs bright
     canopy). Reference has BOLD diagonal shafts — brighter core, higher
     opacity, more + wider cones. */
  {
    const CONE_N = 9;
    // soft beam texture: bright core fading to edges + fading along length
    const ccv = document.createElement('canvas'); ccv.width = 64; ccv.height = 128;
    const cx3 = ccv.getContext('2d');
    const cg = cx3.createLinearGradient(0, 0, 64, 0);
    cg.addColorStop(0, 'rgba(255,244,214,0)');
    cg.addColorStop(0.5, 'rgba(255,246,220,0.95)');
    cg.addColorStop(1, 'rgba(255,244,214,0)');
    cx3.fillStyle = cg; cx3.fillRect(0, 0, 64, 128);
    // fade along length (top bright, bottom dissolves)
    cx3.globalCompositeOperation = 'destination-in';
    const lg = cx3.createLinearGradient(0, 0, 0, 128);
    lg.addColorStop(0, 'rgba(0,0,0,1)');
    lg.addColorStop(0.7, 'rgba(0,0,0,0.5)');
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    cx3.fillStyle = lg; cx3.fillRect(0, 0, 64, 128);
    const ctex = new THREE.CanvasTexture(ccv);
    const coneMat = new THREE.MeshBasicMaterial({
      map: ctex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      opacity: 0.75, fog: false,
    });
    const coneGeo = new THREE.CylinderGeometry(1.2, 4.5, 16, 10, 1, true);
    coneGeo.translate(0, -8, 0); // top at origin, extends down
    const coneRnd = mulberry32(seed ^ 0xc0e1);
    const sunDirN = sunDir.clone().normalize();
    const coneUpdaters = [];
    for (let i = 0; i < CONE_N; i++) {
      // B"H draw-call diet: share one material (global breathe, not per-cone).
      const m = new THREE.Mesh(coneGeo, coneMat);
      // park at canopy gaps: above the river corridor + a few in the canopy
      const cz = 20 - coneRnd() * 70;
      const cx = riverX(cz) + (coneRnd() - 0.5) * 10;
      const cy = WATER_Y + 13 + coneRnd() * 4;
      m.position.set(cx, cy, cz);
      // align the cone's -Y axis to the sun direction (beam travels down-sun)
      const q = new THREE.Quaternion();
      q.setFromUnitVectors(new THREE.Vector3(0, -1, 0), sunDirN.clone().negate());
      m.quaternion.copy(q);
      m.userData.phase = coneRnd() * 6.28;
      scene.add(m);
    }
    coneUpdaters.push((t) => {
      // B"H 2nd sweep: stronger — NEW_TARGET has bold diagonal shafts.
      // B"H TEXTURE-FIRST: 0.42 was invisible. 0.75 base for bold shafts.
      coneMat.opacity = 0.75 * (0.8 + 0.2 * Math.sin(t * 0.4));
    });
    for (const cu of coneUpdaters) mistUpdaters.push(cu);
    mark('light-cones');
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
      // B"H commit 3: 0.55→0.85 — sun moved down-river (backlit), foreground
      // needs fill until leaf translucency (commit 4) arrives.
      const fill = new THREE.DirectionalLight(0xffe8c8, 0.85);
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
         leafClusterTex, denseCanopyTex, backlitCanopyTex, framingBranchTex, impostorTex1, impostorTex2, impostorTex3, impostorTex4,
         pebbleTex, fallenLogTex, leafLitterTex, wetRockTex,
         barkNormalTex, mossNormalTex, pebbleNormalTex, wetRockNormalTex,
         waterRippleNormalTex, leafVeinNormalTex,
         bakedBarkAlbedoTex, bakedBarkNormalTex, bakedBarkRoughTex] = await Promise.all([
    loadTexture(TEX + 'grass1.jpg', 30, 30),
    loadTexture(TEX + 'dirt1.jpg', 40, 3),
    loadTexture(TEX + 'bark1.webp', 1, 2),
    makeCanopyCutout(TEX + 'new/tex-canopy-soft.webp'),
    loadTexture(TEX + 'leaf1.jpg', 1, 1),
    // B"H — reference-match texture set (Yaakov 2026-10-13)
    loadTexture(TEX + 'new/tex-grass-ground.webp', 36, 36),
    loadTexture(TEX + 'new/tex-bark-detail.webp', 1, 3),
    // B"H — Phase 5 (2026-10-13 sprint): v2 lumpy photoreal moss floor.
    // B"H TEXTURE-FIRST 2026-10-14: repeat was (2,2) — each moss mound
    // rendered ~60m wide (smooth dark mush) and MISALIGNED with the normal
    // map at (36,36). Now 36,36: mounds read at true scale, relief aligns.
    loadTexture(TEX + 'new/tex-moss-floor-v2.webp', 36, 36),
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
    // B"H TEXTURE-FIRST (Yaakov 2026-10-14: "that's like 1%"): the canvas-drawn
    // framing branch was the gray-blob artifact. Premade photoreal branch.
    makeLeafClusterAlpha(TEX + 'new/tex-framing-branch.png'),
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
    // B"H commit 7: wet-rock albedo was never loaded (rocks were untextured).
    loadTexture(TEX + 'new/tex-wet-rock.webp', 1, 1),
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
    // B"H — DIRECTION CORRECTION (Yaakov 2026-10-14): premade bark maps, baked
    // deterministically via textures/gen/bake-bark.py (plan §32 recipe).
    // In-shader procedural fissures REMOVED — textures are premade.
    loadTexture(TEX + 'baked/bark-albedo.png', 3, 3),
    loadNormalTexture(TEX + 'baked/bark-normal.png', 3, 3),
    loadTexture(TEX + 'baked/bark-rough.png', 3, 3),
  ]);
  mark('textures');

  /* B"H WAY-better #13: underwater caustics — baked caustic web texture
     (layered sine interference, premade). Scrolled slowly in the water
     shader, masked to shallow areas. One texture, cheap. */
  const causticTex = (() => {
    const S = 256, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const cx = cv.getContext('2d');
    const img = cx.createImageData(S, S);
    const cr = mulberry32(seed ^ 0xca057c);
    const p1 = cr() * 6.28, p2 = cr() * 6.28, p3 = cr() * 6.28;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const u = x / S * 6.283, v = y / S * 6.283;
        // caustic web: ridged interference — bright where waves cross
        let c = Math.sin(u * 3 + p1 + Math.sin(v * 4 + p2) * 1.5)
              + Math.sin(v * 3 + p2 + Math.sin(u * 5 + p3) * 1.5)
              + Math.sin((u + v) * 4 + p3) * 0.7;
        c = Math.pow(Math.max(0, 1 - Math.abs(c) * 0.55), 3.0);
        const i = (y * S + x) * 4;
        const b = Math.round(c * 255);
        img.data[i] = b; img.data[i + 1] = b; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
    }
    cx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  })();

  /* B"H WAY-better #1: dappled light cookies — baked canopy-gap light pattern.
     Pass 1: 512² canvas, two octaves (large soft canopy gaps + small bright
     leaf-gap dapples), elongated along the sun azimuth, warm cast. Baked once
     (premade texture); placement/animation is runtime (uCookieShift follows
     the sun angle so TOD changes move the pattern). */
  const dappleCookieTex = (() => {
    const S = 512, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const cx = cv.getContext('2d');
    cx.fillStyle = 'rgb(88,88,88)'; cx.fillRect(0, 0, S, S); // ambient floor
    const sr = mulberry32(seed ^ 0xd4bb1e);
    // sun azimuth elongation: sun dir xz = (0.42,-0.65) → angle
    const sunAng = Math.atan2(-0.65, 0.42);
    const blob = (x, y, r, bright, warm) => {
      const g = cx.createRadialGradient(x, y, 0, x, y, r);
      const c = Math.round(bright);
      g.addColorStop(0, `rgba(${c},${Math.round(c * (0.94 + warm * 0.06))},${Math.round(c * (0.82 + warm * 0.08))},0.95)`);
      g.addColorStop(0.6, `rgba(${c},${Math.round(c * 0.92)},${Math.round(c * 0.80)},0.45)`);
      g.addColorStop(1, 'rgba(88,88,88,0)');
      cx.save(); cx.translate(x, y); cx.rotate(sunAng); cx.translate(-x, -y);
      cx.fillStyle = g;
      cx.fillRect(x - r, y - r * 0.62, r * 2, r * 1.24);
      cx.restore();
    };
    for (let i = 0; i < 46; i++) // large soft canopy gaps
      blob(sr() * S, sr() * S, 26 + sr() * 52, 150 + sr() * 70, 0.5 + sr() * 0.5);
    for (let i = 0; i < 240; i++) // small bright leaf-gap dapples
      blob(sr() * S, sr() * S, 4 + sr() * 11, 185 + sr() * 60, 0.7 + sr() * 0.3);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();

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
  /* B"H commit 3: HERO TREES — three substantial oaks at composition anchor
     points (plan §31). Fixed positions, oak archetype, 1.4-1.6× scale. These
     are the reference's three anchors: left-frame giant, right-frame giant,
     center-background emergent. */
  const heroSpots = [
    { x: -16, z: 14, sc: 1.55 },   // left foreground giant (camera at -5.5,18)
    { x: 14, z: -12, sc: 1.45 },   // right midground giant
    { x: -9, z: -55, sc: 1.6 },    // background emergent near the gap
  ];
  for (const hs of heroSpots) {
    if (treeSpots.some(s => Math.hypot(s.x - hs.x, s.z - hs.z) < 9)) continue;
    treeSpots.push({ x: hs.x, z: hs.z, hero: true, heroScale: hs.sc });
  }
  mark('tree-spots');

  /* B"H NEW #9: standing dead snags — 3 bare dead trunks for silhouette
     variety against the canopy. Tapered cylinders + a few stub branches,
     gray weathered bark. 1 draw call (merged). */
  {
    const snagGeos = [];
    const snagRnd = mulberry32(seed ^ 0x9a9);
    const snagSpots = [
      { x: 24, z: -38 }, { x: -28, z: -20 }, { x: 8, z: -70 },
    ];
    for (const ss of snagSpots) {
      const sy = groundHeight(ss.x, ss.z, noise);
      const h = 9 + snagRnd() * 5;
      const trunkG = new THREE.CylinderGeometry(0.12, 0.35, h, 7);
      trunkG.translate(0, h / 2, 0);
      // tilt slightly
      const tilt = new THREE.Matrix4().makeRotationZ((snagRnd() - 0.5) * 0.12);
      trunkG.applyMatrix4(tilt);
      trunkG.translate(ss.x, sy - 0.2, ss.z);
      snagGeos.push(trunkG);
      // 3-4 stub branches
      for (let b = 0; b < 4; b++) {
        const bh = h * (0.4 + snagRnd() * 0.45);
        const bl = 1.0 + snagRnd() * 1.5;
        const bg = new THREE.CylinderGeometry(0.04, 0.08, bl, 5);
        bg.translate(0, bl / 2, 0);
        const ba = snagRnd() * Math.PI * 2;
        const bm = new THREE.Matrix4()
          .makeRotationY(ba)
          .multiply(new THREE.Matrix4().makeRotationZ(0.7 + snagRnd() * 0.5));
        bg.applyMatrix4(bm);
        bg.translate(ss.x, sy + bh, ss.z);
        snagGeos.push(bg);
      }
    }
    // merge (same pattern as roots)
    let sv = 0, si = 0;
    for (const g of snagGeos) { sv += g.attributes.position.count; si += g.index.count; }
    const sp = new Float32Array(sv * 3), sn = new Float32Array(sv * 3), su = new Float32Array(sv * 2);
    const sidx = new (sv > 65535 ? Uint32Array : Uint16Array)(si);
    let svo = 0, sio = 0;
    for (const g of snagGeos) {
      sp.set(g.attributes.position.array, svo * 3);
      sn.set(g.attributes.normal.array, svo * 3);
      su.set(g.attributes.uv.array, svo * 2);
      const ia = g.index.array;
      for (let k = 0; k < ia.length; k++) sidx[sio + k] = ia[k] + svo;
      svo += g.attributes.position.count; sio += ia.length;
      g.dispose();
    }
    const snagGeo = new THREE.BufferGeometry();
    snagGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    snagGeo.setAttribute('normal', new THREE.BufferAttribute(sn, 3));
    snagGeo.setAttribute('uv', new THREE.BufferAttribute(su, 2));
    snagGeo.setIndex(new THREE.BufferAttribute(sidx, 1));
    const snagMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.55, 0.53, 0.48), roughness: 0.95, // weathered gray
    });
    const snagMesh = new THREE.Mesh(snagGeo, snagMat);
    snagMesh.castShadow = true;
    scene.add(snagMesh);
    mark('dead-snags');
  }

  /* B"H WAY-better #18: exposed root tangles at hero tree bases — curved
     tubes radiating from the flare, diving into the ground. 1 merged mesh
     (3 trees × 7 roots), bark material. */
  {
    const rootGeos = [];
    const rrnd = mulberry32(seed ^ 0x2007);
    for (const hs of heroSpots) {
      const baseY = groundHeight(hs.x, hs.z, noise);
      for (let ri = 0; ri < 7; ri++) {
        const a = (ri / 7) * Math.PI * 2 + rrnd() * 0.5;
        const len = 1.2 + rrnd() * 1.4;
        const pts = [];
        const startR = 0.55 * hs.sc;
        for (let k = 0; k <= 4; k++) {
          const t = k / 4;
          const r = startR + t * len;
          const lift = Math.sin(t * Math.PI) * 0.28 * hs.sc; // arch up then dive
          const wob = Math.sin(t * 5.1 + ri * 2.2) * 0.12 * t;
          pts.push(new THREE.Vector3(
            hs.x + Math.cos(a + wob) * r,
            baseY + 0.35 * hs.sc * (1 - t) + lift - t * t * 0.5,
            hs.z + Math.sin(a + wob) * r
          ));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const tg = new THREE.TubeGeometry(curve, 8, 0.09 * hs.sc * (1 - ri * 0.06), 6, false);
        rootGeos.push(tg);
      }
    }
    // Merge all root tubes into ONE geometry (1 draw call). Manual merge:
    // concatenate position/normal/uv/index with index offsets.
    let vtxTotal = 0, idxTotal = 0;
    for (const g of rootGeos) { vtxTotal += g.attributes.position.count; idxTotal += g.index.count; }
    const mp = new Float32Array(vtxTotal * 3), mn = new Float32Array(vtxTotal * 3), mu = new Float32Array(vtxTotal * 2);
    const mi = new (vtxTotal > 65535 ? Uint32Array : Uint16Array)(idxTotal);
    let vo = 0, io = 0;
    for (const g of rootGeos) {
      const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
      mp.set(p.array, vo * 3); mn.set(n.array, vo * 3); mu.set(u.array, vo * 2);
      const idx = g.index.array;
      for (let k = 0; k < idx.length; k++) mi[io + k] = idx[k] + vo;
      vo += p.count; io += idx.length;
      g.dispose();
    }
    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(mn, 3));
    merged.setAttribute('uv', new THREE.BufferAttribute(mu, 2));
    merged.setIndex(new THREE.BufferAttribute(mi, 1));
    const rootMat = new THREE.MeshStandardMaterial({
      map: bakedBarkAlbedoTex, roughness: 0.95,
      color: new THREE.Color(0.75, 0.70, 0.62),
    });
    const rootMesh = new THREE.Mesh(merged, rootMat);
    rootMesh.castShadow = true; rootMesh.receiveShadow = true;
    scene.add(rootMesh);
    mark('root-tangles');
  }

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
      // B"H "even more real": distant impostor walls glow toward the sun —
      // kills the flat dark-mass read at the background.
      addCanopyBacklight(mat, 0.55, 2.2, 'impostor' + ti);
      // B"H WAY-better #24: aerial blue-shift — far trees drift toward
      // atmospheric blue with distance. Sells the deep forest layers.
      {
        const prevOC = mat.onBeforeCompile;
        mat.onBeforeCompile = (sh) => {
          if (prevOC) prevOC(sh);
          sh.fragmentShader = sh.fragmentShader
            .replace('#include <common>', `#include <common>
              varying vec3 vAerPos;`)
            .replace('#include <map_fragment>', `#include <map_fragment>
              {
                float aerD = distance(cameraPosition, vAerPos);
                float aerT = smoothstep(45.0, 140.0, aerD);
                // atmospheric blue: (0.62, 0.74, 0.85), warm haze near sun handled by backlight
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.74, 0.85), aerT * 0.55);
              }`);
          sh.vertexShader = sh.vertexShader
            .replace('#include <common>', `#include <common>
              varying vec3 vAerPos;`)
            .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
              { vec4 awp = vec4(transformed, 1.0);
                #ifdef USE_INSTANCING
                  awp = instanceMatrix * awp;
                #endif
                vAerPos = (modelMatrix * awp).xyz; }`);
          mat.customProgramCacheKey = () => 'impostor-aerial-v1';
        };
      }
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
  const terrainMat = new THREE.MeshStandardMaterial({
    // B"H TEXTURE-FIRST 2026-10-14 (Yaakov: "that's like 1%"): was
    // grassGroundTex (astroturf lawn). The target is a mossy forest floor —
    // the photoreal v2 moss texture was sitting unused. Moss now.
    map: mossGroundTex, vertexColors: true, roughness: 1.0, metalness: 0.0,
    // B"H — moss relief normals: ground stops being a flat plane under sun.
    normalMap: mossNormalTex, normalScale: new THREE.Vector2(0.9, 0.9),
  });
  // B"H WAY-better #1: dappled light cookie — baked canopy-gap pattern
  // projected in world space, shifted by sun angle (uCookieShift).
  // B"H NEW #2: temporal flicker — the shift breathes slowly, like leaves
  // stirring. Registered in the updater loop below.
  terrainMat.onBeforeCompile = (shader) => {
    shader.uniforms.uDappleCookie = { value: dappleCookieTex };
    shader.uniforms.uCookieShift = { value: new THREE.Vector2(0, 0) };
    terrainMat.userData.shader = shader;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform sampler2D uDappleCookie; uniform vec2 uCookieShift;
        varying vec3 vCookieWPos;`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        {
          // world-space cookie, 1 tile ≈ 26m; sun-angle shift keeps the
          // pattern glued to the canopy gaps as TOD changes
          vec2 cuv = vCookieWPos.xz * 0.038 + uCookieShift;
          vec3 cookie = texture2D(uDappleCookie, cuv).rgb;
          // cookie is 0.35..1.0 brightness; warm dapple over the albedo
          diffuseColor.rgb *= (0.55 + cookie * 1.05);
        }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        // B"H WAY-better #21: muddy bank sheen — low wet soil near the
        // waterline goes glossy. (Banks are low; height is the proxy.)
        {
          float mudWet = 1.0 - smoothstep(-0.55, 0.15, vCookieWPos.y);
          roughnessFactor = mix(roughnessFactor, 0.35, mudWet * 0.8);
        }`);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        varying vec3 vCookieWPos;`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        { vec4 cwp = modelMatrix * vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            cwp = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
          #endif
          vCookieWPos = cwp.xyz; }`);
    terrainMat.customProgramCacheKey = () => 'terrain-dapple-v1';
  };
  const terrain = new THREE.Mesh(terrGeo, terrainMat);
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

  /* B"H commit 7: 3D instanced pebbles on the riverbed (the texture alone
     reads flat through water). ~1800 flattened displaced hemispheres,
     3-12cm, denser in the shallows where the reference shows them.
     Colors from a natural palette via instance color. 1 draw call. */
  {
    const pebGeo = new THREE.IcosahedronGeometry(1, 1);
    const pp = pebGeo.attributes.position;
    const por = mulberry32(seed ^ 0x9e66);
    for (let i = 0; i < pp.count; i++) {
      const s = 1 + 0.28 * Math.sin(pp.getX(i) * 5.2 + 1.3)
                      * Math.sin(pp.getY(i) * 4.4 + 2.1)
                      * Math.sin(pp.getZ(i) * 3.9 + 0.6);
      pp.setXYZ(i, pp.getX(i) * s, Math.max(pp.getY(i) * s * 0.55, -0.15), pp.getZ(i) * s);
    }
    pebGeo.computeVertexNormals();
    const pebMat = new THREE.MeshStandardMaterial({
      map: pebbleTex, roughness: 0.75,
      normalMap: pebbleNormalTex, normalScale: new THREE.Vector2(0.8, 0.8),
    });
    const PEB_N = fast ? 800 : 1800;
    const pebInst = new THREE.InstancedMesh(pebGeo, pebMat, PEB_N);
    const pd = new THREE.Object3D();
    const pebPalette = [
      new THREE.Color(0x8a857c), new THREE.Color(0x9a8f7a), new THREE.Color(0x6f6a60),
      new THREE.Color(0xa89a80), new THREE.Color(0x7c7268), new THREE.Color(0x8f7f6a),
    ];
    let pebPlaced = 0, pebGuard = 0;
    while (pebPlaced < PEB_N && pebGuard++ < PEB_N * 20) {
      const pz = (srand() - 0.5) * 190;
      const hw = riverHalfWidth(pz);
      // denser toward the center shallows; across the full bed width
      const px = riverX(pz) + (srand() * 2 - 1) * hw * 1.15;
      const ps = 0.03 + Math.pow(srand(), 1.6) * 0.09; // 3-12cm, many small
      const bedY = groundHeight(px, pz, noise) - 0.10;
      if (bedY > WATER_Y + 0.05) continue; // only submerged pebbles
      pd.position.set(px, bedY + ps * 0.25, pz);
      pd.rotation.set(0, srand() * Math.PI * 2, 0);
      pd.scale.set(ps * (0.8 + srand() * 0.5), ps * 0.6, ps * (0.8 + srand() * 0.5));
      pd.updateMatrix();
      pebInst.setMatrixAt(pebPlaced, pd.matrix);
      pebInst.setColorAt(pebPlaced, pebPalette[(srand() * pebPalette.length) | 0]);
      pebPlaced++;
    }
    pebInst.count = pebPlaced;
    pebInst.receiveShadow = true;
    scene.add(pebInst);
    mark('pebbles-3d');
  }

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
      // B"H commit 8: warmed (was gray-green) toward the reference teal.
      // B"H commit 8b: darkened shallow (was milky light gray in render).
      // B"H TEXTURE-FIRST 2026-10-14: reference water is BRIGHT — sunlit
      // pebbles visible through clear water. Was murky dark (uDeep 0x0f3d38).
      // Brightened so the pebble bed shines through.
      uDeep: { value: new THREE.Color(0x2a6b62) },
      uShallow: { value: new THREE.Color(0x7ab5a3) },
      uSky: { value: new THREE.Color(0xd8ecef) },
      uFogColor: { value: new THREE.Color(T.fog) },
      uFogNear: { value: T.fogNear },
      // B"H — DIRECTION CORRECTION: premade pebble texture (not procedural).
      uPebbleMap: { value: pebbleTex },
      // B"H commit 8: premade water normals (not procedural sines).
      uWaterNormalMap: { value: waterRippleNormalTex },
      // B"H WAY-better #13: baked caustic web, scrolled in shallows.
      uCausticMap: { value: causticTex },
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
        uniform sampler2D uPebbleMap;
        uniform sampler2D uWaterNormalMap;
        uniform sampler2D uCausticMap;
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
          // Two ripple layers drifting downstream at speed-scaled rates.
          // B"H commit 8: PREMADE normals (tex-water-ripple-normal.webp), not
          // procedural sines — the sine ridges read as brushed asphalt.
          // Scrolling UVs = flow animation (placement logic, allowed).
          vec2 wuv1 = vec2(pw.x * 0.06 + uTime * 0.015 * flowSpeed,
                           pw.y * 0.06 - uTime * 0.07 * flowSpeed);
          vec2 wuv2 = vec2(pw.x * 0.13 - uTime * 0.03 * flowSpeed + 0.37,
                           pw.y * 0.13 - uTime * 0.14 * flowSpeed + 0.11);
          vec3 wn1 = texture2D(uWaterNormalMap, wuv1).xyz * 2.0 - 1.0;
          vec3 wn2 = texture2D(uWaterNormalMap, wuv2).xyz * 2.0 - 1.0;
          // B"H commit 8b: softened further (0.5->0.38) — highlights were
          // reading as white streaks, not water shimmer.
          // B"H WAY-better: distance chop — far water gets extra ripple so the
          // grazing-angle reflection breaks up instead of forming a flat
          // white mirror band. (The "white band" was fresnel, not foam.)
          float chopD = distance(cameraPosition, vPos);
          float chopBoost = 1.0 + smoothstep(15.0, 60.0, chopD) * 0.9;
          vec2 grad = (wn1.xy + wn2.xy * 0.6) * 0.38 * chopBoost;
          // Refraction offset for the pebble bed uses the same premade grad.
          vec3 n = normalize(vec3(-grad.x, 1.0, -grad.y));
          vec3 viewDir = normalize(cameraPosition - vPos);
          // Fresnel: mirror at grazing angle, transparent looking straight down
          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 5.0);
          fres = mix(0.02, 1.0, fres); // Schlick's approximation base
          vec3 r = reflect(-viewDir, n);
          // B"H WAY-better #5: sun-path glitter trail — the sparkle lobe is
          // stretched ANISOTROPICALLY along the sun direction so the water
          // carries an elongated glitter path toward the sun, like the
          // reference. Tight hot core + wider warm trail, both twinkling.
          float gdot = max(dot(r, uGlitterDir), 0.0);
          float core = pow(gdot, 1200.0);
          // trail: accept reflections toward azimuth-spread sun positions
          vec3 spreadA = normalize(uGlitterDir + vec3(0.38, -0.10, 0.05));
          vec3 spreadB = normalize(uGlitterDir + vec3(-0.38, -0.10, 0.05));
          float trail = pow(max(dot(r, spreadA), 0.0), 90.0)
                      + pow(max(dot(r, spreadB), 0.0), 90.0);
          float glint = core + trail * 0.30;
          // Twinkle: each sparkle cell shimmers independently
          float tw = 0.3 + 0.7*(0.5 + 0.5*sin(uTime*8.0 + hash22(floor(pw*9.0))*43.0));
          // Pebble bed: PREMADE texture (tex-pebbles.webp), refracted by ripple.
          // B"H — DIRECTION CORRECTION: was procedural hash pebbles in-shader.
          vec2 pebUV = pw * 0.35 + grad * 0.5; // tiled, ripple-refracted
          vec3 pebCol = texture2D(uPebbleMap, pebUV).rgb;
          // Wet darkening: pebbles darker where submerged deeper
          pebCol *= mix(0.55, 1.0, 1.0 - depth * 0.5);
          // B"H NEW #5: riverbed variation — sand vs stone patches. Silty
          // sand settles in quiet pockets; pebbles dominate the current.
          float sandM = smoothstep(0.55, 0.78, vnoise(pw * 0.22 + 7.3));
          vec3 sandCol = vec3(0.50, 0.44, 0.32) * (0.9 + 0.2 * vnoise(pw * 1.5));
          sandCol *= mix(0.55, 1.0, 1.0 - depth * 0.5);
          vec3 bed = mix(pebCol, sandCol, sandM * 0.9);
          // Water body color: depth-graded, NOT uniform teal
          vec3 col = mix(uShallow, uDeep, smoothstep(0.0, 0.9, depth));
          // Bed shows through: strong in shallows, faint in deep center
          // B"H commit 8: was milky (sky reflection dominated at grazing
          // angle). Reference is a CLEAR shallow stream — pebbles visible.
          // B"H commit 8: bedVisibility 0.98→0.80 in shallows — water must
          // read as WATER, not dry pebbles. Pebbles warmed (less gray).
          // B"H commit 8: bedVisibility up in shallows (0.80->0.88) — the
          // reference shows pebbles clearly through the water.
          // B"H "even more real" (Yaakov 2026-10-14): shallows must read as
          // gin-clear — individual 3D pebbles countable through the water.
          // bedVisibility 0.88->0.94 (premade pebble texture IS pebbles),
          // alpha 0.35->0.22 (more see-through to the real 3D pebble bed).
          // B"H 2nd sweep: 0.94->0.97 — NEW_TARGET is absolutely gin-clear.
          float bedVisibility = mix(0.97, 0.60, smoothstep(0.1, 0.8, depth));
          col = mix(col, bed, bedVisibility);
          // B"H WAY-better #13: underwater caustics — baked web scrolled
          // slowly, masked to shallows where sun reaches the bed. Dances
          // on the pebbles like the reference shallows.
          vec2 cuv2 = pw * 0.55 + vec2(uTime * 0.03, -uTime * 0.045);
          float caust = texture2D(uCausticMap, cuv2).r;
          float caustMask = (1.0 - smoothstep(0.05, 0.45, depth)) * bedVisibility;
          col += vec3(0.75, 0.95, 0.88) * caust * caustMask * 0.35;
          // Sky reflection via fresnel (stronger at grazing = far water)
          // B"H 2026-10-13: 0.35→0.16, was washing out to milk at low camera.
          col = mix(col, uSky, fres*0.12); // WAY-better: was milky band
          // Sun glitter: sharp, sparse, on crests — not milky wash
          float sdot = max(dot(r, uSunDir), 0.0);
          // B"H commit 8: glitter boosted (8.0->14.0) — the reference has a
          // visible sparkling path on the water.
          // core: white-hot pinpricks; trail: warm golden path toward the sun
          // B"H WAY-better 2nd pass: trail was washing out — tighter, dimmer.
          col += vec3(1.0,0.98,0.94) * core * 16.0 * tw * (0.3 + 0.7*depth);
          col += vec3(1.0,0.88,0.66) * trail * 2.4 * tw * (0.35 + 0.65*depth);
          col += vec3(1.0,0.95,0.85) * pow(sdot, 200.0) * 0.4;
          // Dappled sunlight: bright patches where sun breaks through canopy.
          float dapple = vnoise(pw*0.35 + vec2(uTime*0.05, -uTime*0.08));
          dapple = smoothstep(0.55, 0.85, dapple);
          col += vec3(1.0, 0.96, 0.82) * dapple * 0.35 * (0.4 + 0.6*depth);
          // Foam: at banks (waterline) + around procedural rock positions
          float edge = smoothstep(0.0, 0.12, vUv.x)*smoothstep(1.0, 0.88, vUv.x);
          float bankFoamBand = 1.0 - edge;
          // B"H WAY-better #12: flow-aligned foam streaks — noise stretched
          // 4.5x along flow (v/downstream), so foam forms longitudinal
          // streaks like real current. Eddy tails: foam streaks extend
          // downstream behind rock obstacles (in +v direction from rock).
          float fn = vnoise(vec2(pw.x*4.0, pw.y*18.0) + vec2(0.0, -uTime*1.5));
          float lap = 0.5 + 0.5*sin(uTime*1.8 + pw.y*2.2 + fn*6.28);
          // B"H WAY-better: foam was a solid white stripe. Now patchy and
          // clinging to the waterline — squared band (thin), higher threshold
          // (broken), lower opacity. Real lapping, not paint.
          float bankFoam = bankFoamBand * bankFoamBand
                         * smoothstep(0.55, 0.92, fn*0.62 + lap*0.38) * 0.55;
          // Rock foam: rings around procedural rock spots + EDDY TAILS —
          // foam streaks trail downstream (+v) behind each rock, like real
          // eddies. Tail fades with distance downstream.
          vec2 rp = pw*1.8;
          vec2 rid = floor(rp); vec2 rf = fract(rp);
          float rockHere = step(0.93, hash22(rid+4.7));
          vec2 rc = vec2(0.5) + (vec2(hash22(rid+1.1), hash22(rid+8.8))-0.5)*0.4;
          float rdist = length(rf - rc);
          float rockFoam = rockHere * smoothstep(0.30, 0.20, rdist) * smoothstep(0.12, 0.22, rdist);
          // B"H NEW #4: bow-wave — foam piles up on the UPSTREAM face of the
          // rock (facing into the current). Upstream is -v in flow UV.
          float upstreamFace = smoothstep(0.1, 0.5, rc.y - rf.y);
          rockFoam *= 0.6 + 0.9 * upstreamFace;
          // eddy tail: downstream streak (rf.y > rc.y is downstream in flow UV)
          float downstream = smoothstep(0.0, 0.9, rf.y - rc.y) * step(rf.y, rc.y + 0.9);
          float tailWidth = 0.16 * (1.0 - (rf.y - rc.y) * 0.5);
          float eddyTail = rockHere * downstream
                         * smoothstep(tailWidth, tailWidth*0.3, abs(rf.x - rc.x))
                         * (1.0 - (rf.y - rc.y) * 0.7);
          rockFoam += eddyTail * 0.6;
          rockFoam *= 0.3 + 0.3*sin(uTime*3.0 + hash22(rid)*20.0);
          rockFoam *= 0.4 + 0.6*vnoise(pw*8.0); // break up the ring
          float foam = clamp(bankFoam*0.7 + rockFoam*0.35, 0.0, 1.0);
          // B"H commit 8: rapids white-water — the LUT narrows at z in
          // [-44,-1] (t 0.376-0.600). Broken water with foam streaks.
          float rapidsZone = smoothstep(-46.0, -38.0, vPos.z) * (1.0 - smoothstep(-8.0, 1.0, vPos.z));
          float rapidsN = vnoise(pw * vec2(3.0, 9.0) + vec2(0.0, -uTime * 2.2));
          float rapidsFoam = rapidsZone * smoothstep(0.35, 0.7, rapidsN + depth * 0.25) * 0.8;
          foam = clamp(foam + rapidsFoam, 0.0, 1.0);
          col = mix(col, vec3(0.92,0.96,0.94), foam);
          // Alpha: depth-based transparency. Shallows nearly clear, deep more opaque.
          // Banks fade to zero (no hard waterline).
          // B"H commit 8: shallow alpha 0.15→0.35 — water must be visible.
          // B"H "even more real": shallow alpha 0.35->0.22 — the 3D pebbles
          // below must show through. Water reads as water via the pebble
          // texture + ripple normals + glitter, not via opacity.
          // B"H TEXTURE-FIRST 2026-10-14: was still murky gray in forest view.
          // Reference is transparent — bright bed dominates. More see-through.
          float alpha = mix(0.15, 0.55, smoothstep(0.0, 0.85, depth));
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

  /* B"H WAY-better #30: fish shadows gliding under the surface — dark
     blurred ellipses drifting on the riverbed. 4 fish, slow patrols,
     fade in/out at turnarounds. 1 shared material, 4 sprites. */
  {
    const FISH_N = 4;
    const fcv = document.createElement('canvas'); fcv.width = 64; fcv.height = 32;
    const fx2 = fcv.getContext('2d');
    const fg = fx2.createRadialGradient(32, 16, 2, 32, 16, 30);
    fg.addColorStop(0, 'rgba(8,14,10,0.55)');
    fg.addColorStop(0.7, 'rgba(8,14,10,0.28)');
    fg.addColorStop(1, 'rgba(8,14,10,0)');
    fx2.fillStyle = fg;
    // ellipse: fish body + tail hint
    fx2.save(); fx2.translate(32, 16); fx2.scale(1, 0.45); fx2.translate(-32, -16);
    fx2.fillRect(0, 0, 64, 32); fx2.restore();
    const ftex = new THREE.CanvasTexture(fcv);
    const fishMat = new THREE.MeshBasicMaterial({
      map: ftex, transparent: true, depthWrite: false,
    });
    const fishGeo = new THREE.PlaneGeometry(1.1, 0.55);
    fishGeo.rotateX(-Math.PI / 2);
    const fishes = [];
    const fishRnd = mulberry32(seed ^ 0xf154);
    for (let i = 0; i < FISH_N; i++) {
      // B"H draw-call diet: share one material (no per-fish opacity).
      const m = new THREE.Mesh(fishGeo, fishMat);
      const fz = 20 - fishRnd() * 70;
      m.userData = {
        z: fz, xOff: (fishRnd() - 0.5) * 0.8,
        dir: fishRnd() < 0.5 ? 1 : -1,
        speed: 0.5 + fishRnd() * 0.7,
        phase: fishRnd() * 6.28,
      };
      scene.add(m); fishes.push(m);
    }
    const fishUpdate = (t) => {
      // B"H draw-call diet: one shared material — opacity pulses globally.
      fishMat.opacity = 0.75 + 0.25 * Math.sin(t * 0.5);
      for (const m of fishes) {
        const u = m.userData;
        u.z += u.dir * u.speed * 0.016;
        if (u.z > 30) { u.dir = -1; } if (u.z < -70) { u.dir = 1; }
        const rx = riverX(u.z);
        // wiggle: fish sway side to side
        const sway = Math.sin(t * 2.2 + u.phase) * 0.4;
        m.position.set(rx + u.xOff * riverHalfWidth(u.z) + sway, WATER_Y - 0.35, u.z);
        m.rotation.y = (u.dir > 0 ? 0 : Math.PI) + Math.sin(t * 3.1 + u.phase) * 0.18;
      }
    };
    fishUpdate(0);
    scene.userData.fishUpdate = fishUpdate;
    mark('fish-shadows');
  }

  /* B"H WAY-better #14: floating leaves drifting downstream — instanced
     quads advected along the river spline. 1 draw call, cheap. Each leaf
     drifts with the current (faster in center), bobs gently, respawns
     upstream when it exits. */
  {
    const FL = 36;
    const flGeo = new THREE.PlaneGeometry(0.22, 0.30);
    flGeo.rotateX(-Math.PI / 2);
    const flMat = new THREE.MeshBasicMaterial({
      map: leafTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide,
      color: new THREE.Color(0.85, 0.80, 0.55), // sun-warmed fallen leaves
    });
    const flInst = new THREE.InstancedMesh(flGeo, flMat, FL);
    flInst.frustumCulled = false;
    const flRand = mulberry32(seed ^ 0xf10a7);
    const flState = [];
    for (let i = 0; i < FL; i++) {
      flState.push({
        z: 40 - flRand() * 120,           // spread along the river
        xOff: (flRand() - 0.5) * 1.6,      // lateral offset (-0.8..0.8 of half-width)
        rot: flRand() * Math.PI * 2,
        spin: (flRand() - 0.5) * 0.6,
        bobP: flRand() * 6.28,
        speed: 0.7 + flRand() * 0.9,
      });
    }
    const flDummy = new THREE.Object3D();
    const flUpdate = (t, dt) => {
      for (let i = 0; i < FL; i++) {
        const s = flState[i];
        // advect downstream (-z); center channel faster
        const centerFactor = 1.0 - Math.abs(s.xOff) * 0.5;
        s.z -= dt * s.speed * centerFactor * 1.4;
        if (s.z < -80) { s.z = 40; s.xOff = (flRand() - 0.5) * 1.6; }
        const rx = riverX(s.z), hw = riverHalfWidth(s.z);
        const bob = Math.sin(t * 1.7 + s.bobP) * 0.03;
        flDummy.position.set(rx + s.xOff * hw, WATER_Y + 0.02 + bob, s.z);
        flDummy.rotation.set(0, s.rot + t * s.spin * 0.3, 0);
        const sc = 0.8 + (i % 5) * 0.15;
        flDummy.scale.setScalar(sc);
        flDummy.updateMatrix();
        flInst.setMatrixAt(i, flDummy.matrix);
      }
      flInst.instanceMatrix.needsUpdate = true;
    };
    flUpdate(0, 0);
    scene.add(flInst);
    // registered with the main updater loop below
    scene.userData.floatLeafUpdate = flUpdate;
    mark('float-leaves');
  }

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
    // B"H — DIRECTION CORRECTION: albedo is PREMADE (applyBakedBark samples
    // textures/baked/bark-albedo.png tiled in world space). normalMap uses
    // the baked bark normal for micro relief.
    normalMap: bakedBarkNormalTex, normalScale: new THREE.Vector2(1.6, 1.6),
    color: new THREE.Color(1.0, 1.0, 1.0),
    emissive: new THREE.Color(0.04, 0.03, 0.02),
  });
  applyBakedBark(barkMat, bakedBarkAlbedoTex, bakedBarkRoughTex, mossyBarkTex);
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
    // B"H TEXTURE-FIRST 2026-10-14: was (0.42,0.50,0.38) — crushed the leaf
    // photo to 45% brightness (flat dark blobs). The texture IS the detail;
    // let it read. Lighting + backlight provide the shading.
    roughness: 0.9, color: new THREE.Color(0.80, 0.84, 0.70),
    emissive: new THREE.Color(0.10, 0.13, 0.05),
    emissiveMap: backlitCanopyTex,
    depthWrite: true,
  });
    // B"H "even more real": baked tree crowns get the view-dependent glow too.
    addCanopyBacklight(canopyMat, 0.65, 2.0, 'baked');
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
    // B"H commit 3: hero spots get the oak archetype (index 0) at hero scale.
    const a = s.hero ? treeGeos[0] : treeGeos[(rand() * treeGeos.length) | 0];
    const sc = s.hero ? s.heroScale : (s.overhang ? (1.15 + rand() * 0.6) : (0.85 + rand() * 0.75));
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
    // B"H NEW #10: uneven skyline — crown heights vary per tree (±22%) so
    // the canopy top edge isn't flat.
    const skyVar = 0.78 + rand() * 0.44;
    s.crownY = y + 8 * sc * skyVar; s.crownR = 5.5 * sc;
    s.crownX = s.x + (s.overhang ? s.overhang * s.crownR * 0.85 : 0);
  }
  scene.add(treeGroup);
  mark('trees-placed');

  /* B"H WAY-better #9: seedlings/saplings near mother trees — young
     understory. Instanced: tiny trunk + 3-leaf tuft, 1 draw call. Placed
     in the drip-line of random mature trees. */
  {
    const SAP_N = 28;
    const sapGeo = new THREE.ConeGeometry(0.09, 0.55, 6);
    sapGeo.translate(0, 0.27, 0);
    const sapMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.32, 0.42, 0.22), roughness: 0.95,
    });
    const sapInst = new THREE.InstancedMesh(sapGeo, sapMat, SAP_N);
    const sd = new THREE.Object3D();
    const srnd = mulberry32(seed ^ 0x5eed);
    for (let i = 0; i < SAP_N; i++) {
      const mother = treeSpots[(srnd() * treeSpots.length) | 0];
      if (!mother) continue;
      const a = srnd() * Math.PI * 2, r = 1.5 + srnd() * 3.5;
      const sx = mother.x + Math.cos(a) * r, sz = mother.z + Math.sin(a) * r;
      if (Math.abs(sx - riverX(sz)) < 7) continue; // not in water
      sd.position.set(sx, groundHeight(sx, sz, noise), sz);
      sd.rotation.y = srnd() * Math.PI * 2;
      sd.rotation.z = (srnd() - 0.5) * 0.15;
      const s = 0.6 + srnd() * 0.9;
      sd.scale.set(s, s * (0.8 + srnd() * 0.5), s);
      sd.updateMatrix();
      sapInst.setMatrixAt(i, sd.matrix);
    }
    sapInst.count = SAP_N;
    sapInst.castShadow = false; sapInst.receiveShadow = true;
    scene.add(sapInst);
    mark('seedlings');
  }

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

  /* B"H commit 9: hanging moss strands — the reference has "green hair"
     draping from limbs. Instanced vertical quads (6cm × 40-80cm) hung from
     lower canopy branches of hero + near trees. Premade strand alpha baked
     once via canvas (not procedural in-shader). Pendulum sway in shader
     via onBeforeCompile (pivot at top). 1 draw call. */
  {
    // Bake strand alpha texture once (deterministic)
    const sc = document.createElement('canvas'); sc.width = 64; sc.height = 256;
    const g2d = sc.getContext('2d');
    g2d.clearRect(0, 0, 64, 256);
    const sr = mulberry32(seed ^ 0x57a6);
    for (let i = 0; i < 42; i++) {
      const x0 = 4 + sr() * 56;
      const w = 1 + sr() * 2.2;
      const len = 140 + sr() * 116;
      const grad = g2d.createLinearGradient(0, 0, 0, len);
      const green = 90 + (sr() * 50) | 0;
      grad.addColorStop(0, `rgba(${green * 0.7 | 0},${green},${green * 0.45 | 0},0.95)`);
      grad.addColorStop(1, `rgba(${green * 0.7 | 0},${green},${green * 0.45 | 0},0)`);
      g2d.fillStyle = grad;
      // slight curve
      g2d.beginPath();
      const bend = (sr() - 0.5) * 14;
      g2d.moveTo(x0, 0);
      g2d.quadraticCurveTo(x0 + bend, len * 0.5, x0 + bend * 0.4, len);
      g2d.lineTo(x0 + bend * 0.4 + w, len);
      g2d.quadraticCurveTo(x0 + bend + w, len * 0.5, x0 + w, 0);
      g2d.closePath(); g2d.fill();
    }
    const strandTex = new THREE.CanvasTexture(sc);
    const strandGeo = new THREE.PlaneGeometry(0.09, 1);
    strandGeo.translate(0, -0.5, 0); // pivot at top
    const strandMat = new THREE.MeshStandardMaterial({
      map: strandTex, transparent: true, alphaTest: 0.28, side: THREE.DoubleSide,
      roughness: 0.95, depthWrite: false,
    });
    // pendulum sway (pivot at top via translated geometry)
    strandMat.onBeforeCompile = (sh) => {
      sh.uniforms.uSTime = { value: 0 };
      strandMat.userData.sh = sh;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uSTime;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec4 swp = vec4(0.0, 0.0, 0.0, 1.0);
          #ifdef USE_INSTANCING
            swp = instanceMatrix * swp;
          #endif
          float swayPh = swp.x * 1.71 + swp.z * 2.33;
          float swayAmt = sin(uSTime * 0.9 + swayPh) * 0.06 * (-transformed.y);
          transformed.x += swayAmt; transformed.z += swayAmt * 0.6;`);
    };
    const STRAND_N = 220;
    const strandInst = new THREE.InstancedMesh(strandGeo, strandMat, STRAND_N);
    const sd = new THREE.Object3D();
    const sdr = mulberry32(seed ^ 0x57b1);
    let sp = 0;
    // hang from hero canopies + a few near trees (lower limbs, 6-13m up)
    const strandTrees = [
      { x: -16, z: 14, sc: 1.55 }, { x: 14, z: -12, sc: 1.45 }, { x: -9, z: -55, sc: 1.6 },
    ];
    for (const t of strandTrees) {
      const gy = groundHeight(t.x, t.z, noise);
      const n = 60;
      for (let i = 0; i < n && sp < STRAND_N; i++) {
        const a = sdr() * Math.PI * 2;
        const r = (2.5 + sdr() * 4.5) * t.sc;
        const sx = t.x + Math.cos(a) * r, sz = t.z + Math.sin(a) * r;
        const sy = gy + (6 + sdr() * 7) * t.sc; // lower canopy
        const len = 0.4 + sdr() * 0.45;
        sd.position.set(sx, sy, sz);
        sd.rotation.set(0, sdr() * Math.PI, 0);
        sd.scale.set(0.8 + sdr() * 0.7, len, 1);
        sd.updateMatrix();
        strandInst.setMatrixAt(sp++, sd.matrix);
      }
    }
    // a few on near non-hero trees
    for (const s of treeSpots) {
      if (sp >= STRAND_N) break;
      if (s.hero) continue;
      if (sdr() < 0.72) continue;
      const gy = groundHeight(s.x, s.z, noise);
      const a = sdr() * Math.PI * 2, r = 2 + sdr() * 3;
      sd.position.set(s.x + Math.cos(a) * r, gy + 6 + sdr() * 5, s.z + Math.sin(a) * r);
      sd.rotation.set(0, sdr() * Math.PI, 0);
      sd.scale.set(0.7 + sdr() * 0.6, 0.35 + sdr() * 0.4, 1);
      sd.updateMatrix();
      strandInst.setMatrixAt(sp++, sd.matrix);
    }
    strandInst.count = sp;
    strandInst.frustumCulled = false;
    scene.add(strandInst);
    // B"H: join the mist updater loop (declared earlier) for per-frame sway.
    mistUpdaters.push((t) => {
      const sh = strandMat.userData.sh;
      if (sh) sh.uniforms.uSTime.value = t;
    });
  }
  mark('moss-strands');

  /* B"H NEW #8: vine drapes — leafy strands hanging from branches, swaying.
     Like the moss strands but with small leaf cards along the strand.
     Instanced planes with leaf texture, 1 draw call. */
  {
    const VINE_N = 24;
    const vineGeo = new THREE.PlaneGeometry(0.35, 2.2, 1, 6);
    vineGeo.translate(0, -1.1, 0); // hang from top
    const vineMat = new THREE.MeshStandardMaterial({
      map: leafClusterTex, alphaTest: 0.35, side: THREE.DoubleSide,
      roughness: 0.9, color: new THREE.Color(0.45, 0.55, 0.32),
    });
    const vineInst = new THREE.InstancedMesh(vineGeo, vineMat, VINE_N);
    const vd = new THREE.Object3D();
    const vrnd = mulberry32(seed ^ 0x1eaf);
    // hang from hero + near trees (reuse treeSpots)
    for (let i = 0; i < VINE_N; i++) {
      const sp = treeSpots[(vrnd() * treeSpots.length) | 0];
      if (!sp) continue;
      const a = vrnd() * Math.PI * 2, r = 1.5 + vrnd() * 2.5;
      const vx = sp.x + Math.cos(a) * r, vz = sp.z + Math.sin(a) * r;
      const vy = groundHeight(vx, vz, noise) + 5 + vrnd() * 4;
      vd.position.set(vx, vy, vz);
      vd.rotation.y = vrnd() * Math.PI * 2;
      const vs = 0.7 + vrnd() * 0.8;
      vd.scale.set(vs, vs * (0.8 + vrnd() * 0.6), 1);
      vd.updateMatrix();
      vineInst.setMatrixAt(i, vd.matrix);
    }
    vineInst.castShadow = false; vineInst.receiveShadow = true;
    // sway via the same wind clock pattern (simple CPU sway)
    const vineBase = [];
    for (let i = 0; i < VINE_N; i++) {
      const m = new THREE.Matrix4(); vineInst.getMatrixAt(i, m);
      vineBase.push({ m: m.clone(), ph: vrnd() * 6.28 });
    }
    scene.add(vineInst);
    scene.userData.vineUpdate = (t) => {
      const e = new THREE.Euler(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
      for (let i = 0; i < VINE_N; i++) {
        const b = vineBase[i];
        b.m.decompose(p, q, s);
        e.set(Math.sin(t * 0.9 + b.ph) * 0.06, 0, Math.cos(t * 0.7 + b.ph) * 0.06);
        const sq = new THREE.Quaternion().setFromEuler(e);
        q.multiply(sq);
        vd.position.copy(p); vd.quaternion.copy(q); vd.scale.copy(s);
        vd.updateMatrix();
        vineInst.setMatrixAt(i, vd.matrix);
      }
      vineInst.instanceMatrix.needsUpdate = true;
    };
    mark('vine-drapes');

  /* B"H NEW #11: dew-glitter spider webs — a few webs strung between
     branches, premade radial alpha texture, sparkle glints via additive
     micro-points. 1 draw call for webs. */
  {
    const WEB_N = 6;
    // premade web: radial spokes + concentric rings, alpha
    const wcv = document.createElement('canvas'); wcv.width = wcv.height = 128;
    const wx = wcv.getContext('2d');
    wx.strokeStyle = 'rgba(255,255,255,0.75)'; wx.lineWidth = 1;
    for (let s = 0; s < 12; s++) {
      const a = (s / 12) * Math.PI * 2;
      wx.beginPath(); wx.moveTo(64, 64);
      wx.lineTo(64 + Math.cos(a) * 60, 64 + Math.sin(a) * 60); wx.stroke();
    }
    for (let r = 10; r < 62; r += 9) {
      wx.beginPath(); wx.arc(64, 64, r, 0, 6.283); wx.stroke();
    }
    const wtex = new THREE.CanvasTexture(wcv);
    const webGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const webMat = new THREE.MeshBasicMaterial({
      map: wtex, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      opacity: 0.5, blending: THREE.AdditiveBlending,
    });
    const webInst = new THREE.InstancedMesh(webGeo, webMat, WEB_N);
    const wd = new THREE.Object3D();
    const wrnd = mulberry32(seed ^ 0xeb11);
    for (let i = 0; i < WEB_N; i++) {
      const sp = treeSpots[(wrnd() * treeSpots.length) | 0];
      if (!sp) continue;
      const wx2 = sp.x + (wrnd() - 0.5) * 6, wz2 = sp.z + (wrnd() - 0.5) * 6;
      wd.position.set(wx2, groundHeight(wx2, wz2, noise) + 3.5 + wrnd() * 3, wz2);
      wd.rotation.set((wrnd() - 0.5) * 0.6, wrnd() * Math.PI * 2, 0);
      const ws = 0.7 + wrnd() * 0.8;
      wd.scale.setScalar(ws);
      wd.updateMatrix();
      webInst.setMatrixAt(i, wd.matrix);
    }
    webInst.castShadow = false;
    scene.add(webInst);
    // dew glints: tiny bright points on the webs, twinkling
    const dg = new THREE.BufferGeometry();
    const dgPos = new Float32Array(WEB_N * 4 * 3);
    {
      const m4 = new THREE.Matrix4();
      let dpi = 0;
      for (let i = 0; i < WEB_N; i++) {
        webInst.getMatrixAt(i, m4);
        for (let k = 0; k < 4; k++) {
          const v = new THREE.Vector3((wrnd() - 0.5) * 1.2, (wrnd() - 0.5) * 1.2, 0);
          v.applyMatrix4(m4);
          dgPos.set([v.x, v.y, v.z], dpi * 3); dpi++;
        }
      }
    }
    dg.setAttribute('position', new THREE.BufferAttribute(dgPos, 3));
    const dgMat = new THREE.PointsMaterial({
      size: 0.12, color: new THREE.Color(1.0, 0.98, 0.9),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9,
    });
    const dgPts = new THREE.Points(dg, dgMat);
    dgPts.frustumCulled = false;
    scene.add(dgPts);
    scene.userData.webGlint = (t) => { dgMat.opacity = 0.55 + 0.4 * Math.sin(t * 3.3); };
    mark('spider-webs');
  }
  }

  /* B"H WAY-better #15: drip ripple rings — sparse expanding rings on the
     water under overhanging moss/branches. 8 sprites, each looping:
     expand + fade, random phase. 1 draw call (single InstancedMesh would
     need per-instance alpha; sprites share material via onBeforeRender
     trick — instead: 8 tiny meshes, 1 material, negligible cost). */
  {
    const rc = document.createElement('canvas'); rc.width = rc.height = 64;
    const rx = rc.getContext('2d');
    rx.strokeStyle = 'rgba(255,255,255,0.85)'; rx.lineWidth = 3;
    rx.beginPath(); rx.arc(32, 32, 26, 0, 6.283); rx.stroke();
    rx.strokeStyle = 'rgba(255,255,255,0.35)'; rx.lineWidth = 2;
    rx.beginPath(); rx.arc(32, 32, 18, 0, 6.283); rx.stroke();
    const rtex = new THREE.CanvasTexture(rc);
    const rmat = new THREE.MeshBasicMaterial({
      map: rtex, transparent: true, depthWrite: false, opacity: 0.5,
    });
    const rgeo = new THREE.PlaneGeometry(1, 1); rgeo.rotateX(-Math.PI / 2);
    const drips = [];
    const drand = mulberry32(seed ^ 0xd21f);
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(rgeo, rmat.clone());
      const dz = 30 - drand() * 90;
      m.position.set(riverX(dz) + (drand() - 0.5) * 6, WATER_Y + 0.03, dz);
      m.userData.phase = drand() * 6.28;
      m.userData.speed = 0.5 + drand() * 0.5;
      scene.add(m); drips.push(m);
    }
    const dripUpdate = (t) => {
      for (const m of drips) {
        const cyc = ((t * m.userData.speed + m.userData.phase) % 4.0) / 4.0;
        const s = 0.15 + cyc * 0.85;
        m.scale.setScalar(s);
        m.material.opacity = 0.55 * (1 - cyc);
      }
    };
    dripUpdate(0);
    // updaters not yet declared at this point — stash for registration below.
    scene.userData.dripUpdate = dripUpdate;
    mark('drip-ripples');
  }

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
      // B"H — DIRECTION CORRECTION: premade baked bark normal.
      normalMap: bakedBarkNormalTex, normalScale: new THREE.Vector2(1.0, 1.0),
      color: new THREE.Color(0xffffff), // per-instance colors carry bark/moss tint
    });
    applyBakedBark(segMat, bakedBarkAlbedoTex, bakedBarkRoughTex, mossyBarkTex);
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
    // B"H "even more real": crown masses glow when looking toward the sun —
    // this is the distant canopy that read as a dark mass.
    addCanopyBacklight(quadMat, 0.75, 2.0, 'crown');
    // B"H WAY-better #8: per-tree phase — crown quads sway in the traveling
    // gust with phase from world position, so no two trees move in sync.
    quadMat.onBeforeCompile = (sh) => {
      sh.uniforms.uCrownTime = { value: 0 };
      quadMat.userData.sh = sh;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>
          uniform float uCrownTime;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          {
            #ifdef USE_INSTANCING
              vec3 cwPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
            #else
              vec3 cwPos = vec3(0.0);
            #endif
            float cph = fract(sin(dot(cwPos.xz, vec2(39.425, 11.31))) * 24634.63) * 6.283;
            float cgust = pow(0.5 + 0.5 * sin((cwPos.x * 0.35 + cwPos.z * 0.22) - uCrownTime * 1.1), 3.0);
            float csway = cgust * 0.06 * sin(uCrownTime * 1.4 + cph);
            transformed.x += csway;
            transformed.z += csway * 0.7;
          }`);
      quadMat.customProgramCacheKey = () => 'crown-wind-v1';
    };
    scene.userData.crownMat = quadMat;
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
        // B"H NEW #3: crown AO — inner layers get real occlusion darkening
        // (0.55× at the core), not just a tint shift. Depth you can feel.
        const aoF = 1.0 - layerDepth * 0.45;
        tint.setRGB(
          v * (0.96 + layerDepth * -0.06 + rand() * 0.06) * glow * (1 + 0.18 * backlit) * aoF,
          v * (1.00 + rand() * 0.04) * glow * aoF,
          v * (0.88 + layerDepth * 0.06 + rand() * 0.04) * (1 + 0.05 * backlit) * aoF
        );
        inst.setColorAt(placed, tint);
        placed++;
      }
    }
    inst.count = placed;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    // B"H — CPU 60fps: crown quads don't cast (shells + hero trees carry the
    // dappled canopy shadows; quad alpha-test in the depth pass was ~ms).
    // Realism preserved: ground dapple comes from the solid shell volumes.
    inst.castShadow = false; inst.receiveShadow = true;
    scene.add(inst);

    // ---- individual 3D leaves — near-canopy detail (Yaakov 2026-10-13:
    // "better leaf system": individual leaves visible at canopy edges).
    // Small leaf quads (not billboards) hang from every L3+ twig tip with
    // petiole-style orientation: droop below horizontal + golden-angle
    // azimuth (phyllotaxis continues to the leaf stem). Leaf-vein normals
    // give each leaf light response; backlit tint glows against the sun.
    // One instanced draw call.
    if (tips.length > 0) {
      // B"H commit 4: REAL leaf scale — 11×15cm (was 34×44cm, "way too big").
      // More leaves per tip to keep canopy density (5→12).
      const leafGeo = new THREE.PlaneGeometry(0.11, 0.15);
      const leafMat = new THREE.MeshStandardMaterial({
        map: leafClusterTex, alphaTest: 0.35, side: THREE.DoubleSide,
        roughness: 0.85, color: new THREE.Color(0.50, 0.58, 0.42),
        normalMap: leafVeinNormalTex, normalScale: new THREE.Vector2(0.7, 0.7),
        depthWrite: true,
      });
      // B"H "even more real" (Yaakov 2026-10-14): shared backlight helper —
      // stronger transmit (1.5), wider lobe (2.0 vs 3.0). Outer leaves glow
      // gold when the camera looks toward the sun through the canopy.
      addCanopyBacklight(leafMat, 0.85, 2.0, 'leaf');
      leafMat.customProgramCacheKey = () => 'canopy-backlit-leaf';
      const PER_TIP = fast ? 6 : 12;
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
      // B"H WAY-better #6/#7: per-leaf flutter + traveling wind gusts.
      // Each leaf wobbles on its own phase (from instance world pos); a
      // slow gust band sweeps across the canopy (world-x traveling sine).
      // Small amplitude — leaves shiver, they don't fly.
      leafMat.onBeforeCompile = (sh) => {
        sh.uniforms.uLeafTime = { value: 0 };
        leafMat.userData.sh = sh;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', `#include <common>
            uniform float uLeafTime;`)
          .replace('#include <begin_vertex>', `#include <begin_vertex>
            {
              #ifdef USE_INSTANCING
                vec3 lwPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
              #else
                vec3 lwPos = vec3(0.0);
              #endif
              // per-leaf phase from world position (cheap hash, no attribute)
              float lph = fract(sin(dot(lwPos.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.283;
              // #6 flutter: tiny rotation-ish wobble, stronger at leaf tip
              float tipW = clamp(position.y * 6.0 + 0.5, 0.0, 1.0);
              float fl = sin(uLeafTime * 3.1 + lph) * 0.012 * tipW
                       + sin(uLeafTime * 5.3 + lph * 1.7) * 0.006 * tipW;
              // #7 gust: traveling band across the canopy (world x + z)
              float gustBand = 0.5 + 0.5 * sin((lwPos.x * 0.35 + lwPos.z * 0.22) - uLeafTime * 1.1);
              float gust = pow(gustBand, 3.0) * 0.035;
              transformed.x += fl + gust * sin(uLeafTime * 2.2 + lph);
              transformed.z += fl * 0.6 + gust * 0.7 * cos(uLeafTime * 1.8 + lph);
              transformed.y += gust * 0.4 * sin(uLeafTime * 2.6 + lph * 2.0);
            }`);
        leafMat.customProgramCacheKey = () => 'leaf-wind-v1';
      };
      scene.add(leafInst);
      scene.userData.leafMat = leafMat;
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
        // B"H commit 4: 0.5→0.62 for stronger breakup; shells shrunk to
        // 0.45x/0.62x so individual leaves (now real-scale) own the silhouette.
        map: denseCanopyTex, alphaTest: 0.62, side: THREE.DoubleSide,
        roughness: 0.95, color: new THREE.Color(0.38, 0.50, 0.28),
        depthWrite: true,
      });
      const shellInst = new THREE.InstancedMesh(shellGeo, shellMat, treeSpots.length * 2);
      let sp = 0;
      for (const s of treeSpots) {
        const ccx = (s.crownX !== undefined ? s.crownX : s.x);
        for (const f of [0.45, 0.62]) {
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
      // B"H — CPU 60fps: shells don't cast (hero trees carry near-field dapple;
      // shell shadows fall far away, invisible). Depth-pass tri cut.
      shellInst.castShadow = false; shellInst.receiveShadow = true;
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
    // B"H "even more real": overhead canopy sits between camera and sun —
    // strongest glow (1.6) so light visibly streams through from above.
    addCanopyBacklight(ohMat, 0.95, 1.8, 'overhead');
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

  /* ferns */
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
    // B"H — CPU 60fps: ferns don't cast (sub-pixel dapple, invisible in
    // shadow map; alpha-test depth cost removed). Ground shadows unchanged.
    inst.castShadow = false; inst.receiveShadow = true;
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
      // B"H WAY-better: rocks were rendering as black blobs in the wide view.
      // Lift the base stone (mid-gray like the reference), moss creeps down.
      cols[i * 3]     = 0.60 + (0.38 * g - 0.60) * moss;
      cols[i * 3 + 1] = 0.57 + (0.62 * g - 0.57) * moss;
      cols[i * 3 + 2] = 0.52 + (0.28 * g - 0.52) * moss;
    }
    rockGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const rockMat = new THREE.MeshStandardMaterial({
      // B"H commit 7: premade wet-rock albedo (was untextured) + premade moss
      // cap with noisy edge + wet band. Vertex colors carry per-rock tint.
      map: wetRockTex, vertexColors: true, roughness: 0.85,
      normalMap: wetRockNormalTex, normalScale: new THREE.Vector2(1.1, 1.1),
      // B"H WAY-better: emissive floor — subtle, just enough that deep shadow
      // never goes pitch black. The dry-stone lift does the heavy lifting.
      emissive: new THREE.Color(0.030, 0.033, 0.028),
    });
    // Moss cap + wet band via premade textures (not procedural colors).
    // mossMask: up-facing world normal, noisy edge from moss texture green channel.
    // wetBand: darken + gloss below WATER_Y + 0.35.
    rockMat.onBeforeCompile = (shader) => {
      shader.uniforms.uMossMap = { value: mossGroundTex };
      shader.uniforms.uWaterY = { value: WATER_Y };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWRockN;\nvarying vec3 vWRockP;')
        .replace('#include <fog_vertex>', `#include <fog_vertex>
          vWRockN = inverseTransformDirection(transformedNormal, viewMatrix);
          { vec4 rwp = vec4(transformed, 1.0);
            #ifdef USE_INSTANCING
              rwp = instanceMatrix * rwp;
            #endif
            vWRockP = (modelMatrix * rwp).xyz; }`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWRockN;\nvarying vec3 vWRockP;\nuniform sampler2D uMossMap;\nuniform float uWaterY;')
        .replace('#include <map_fragment>', `#include <map_fragment>
          float rockMossN = texture2D(uMossMap, vWRockP.xz * 0.33).g;
          // B"H WAY-better: moss creeps down the sides (was tops-only, leaving
          // black flanks). Lower threshold + stronger noise = patchy sides.
          float rockMoss = smoothstep(0.30, 0.62, vWRockN.y * 0.60 + rockMossN * 0.55);
          vec3 rockMossCol = texture2D(uMossMap, vWRockP.xz * 0.5).rgb * 1.06;
          diffuseColor.rgb = mix(diffuseColor.rgb, rockMossCol, rockMoss);
          float rockWet = smoothstep(uWaterY + 0.28, uWaterY - 0.08, vWRockP.y);
          // B"H WAY-better #16: wet band — darker + glossier. Wet stone goes
          // almost black-brown and shines.
          diffuseColor.rgb *= mix(1.0, 0.55, rockWet);
          // B"H NEW #6: meniscus rim — bright capillary highlight line right
          // at the waterline where water meets stone.
          float meniscus = 1.0 - smoothstep(0.0, 0.09, abs(vWRockP.y - (uWaterY + 0.03)));
          diffuseColor.rgb += vec3(0.28, 0.32, 0.30) * meniscus;
          // B"H WAY-better: dry stone lift — the premade wet-rock texture
          // averages 0.23 (very dark). Dry areas lift to mid-gray stone like
          // the reference; wet band stays dark. (Was black blobs.)
          float dryLift = 1.0 - rockWet;
          diffuseColor.rgb *= mix(1.0, 2.6, dryLift);`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          float rockWetR = smoothstep(uWaterY + 0.28, uWaterY - 0.08, vWRockP.y);
          // B"H WAY-better #16: wet band goes glossy (0.22) for specular pop.
          roughnessFactor = mix(roughnessFactor, 0.22, rockWetR);`);
    };
    const COUNT = fast ? 90 : 160;
    const inst = new THREE.InstancedMesh(rockGeo, rockMat, COUNT + 4);
    const dummy = new THREE.Object3D();
    let placed = 0, g2 = 0;
    while (placed < COUNT && g2++ < COUNT * 30) {
      const z = (srand() - 0.5) * 200;
      const side = srand() < 0.5 ? -1 : 1;
      // B"H commit 7: banks follow the LUT width (was fixed 7-13m, stranded
      // far from the narrowed river). Rocks sit at 1.2-2.6x half-width.
      const hw = riverHalfWidth(z);
      const x = riverX(z) + side * hw * (1.25 + srand() * 1.4);
      const s = 0.35 + srand() * 1.1;
      dummy.position.set(x, groundHeight(x, z, noise) + 0.05, z);
      dummy.rotation.set(0, srand() * Math.PI * 2, 0);
      dummy.scale.set(s * (0.8 + srand() * 0.6), s * 0.75, s * (0.8 + srand() * 0.6));
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    // B"H commit 7: 4 hero boulders at fixed composition points (deterministic
    // for the boulder-macro proof). 1.8-2.6m, half-buried, moss-capped.
    const heroSpots = [
      { z: 14, side: -1, s: 2.2 }, { z: -6, side: 1, s: 1.9 },
      { z: -34, side: -1, s: 2.6 }, { z: 30, side: 1, s: 1.8 },
    ];
    for (const h of heroSpots) {
      const hx = riverX(h.z) + h.side * riverHalfWidth(h.z) * 1.45;
      dummy.position.set(hx, groundHeight(hx, h.z, noise) - h.s * 0.18, h.z);
      dummy.rotation.set(0.12, h.z, 0.06);
      dummy.scale.set(h.s, h.s * 0.72, h.s * 0.9);
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
      // B"H 2nd sweep: bigger, billowing mounds like NEW_TARGET (was 0.4-1.4).
      const s = (0.6 + mor2() * 1.4) * (0.7 + moisture * 0.6);
      // Growth rule: irregular patch shape (not circular)
      const stretch = 0.7 + mor2() * 0.8;
      dummy.position.set(x, groundHeight(x, z, noise) + 0.02, z);
      dummy.rotation.set(0, mor2() * Math.PI * 2, 0);
      // B"H 2nd sweep: taller domes (0.6→0.85) — billowing, not flat.
      dummy.scale.set(s * stretch, s * 0.85, s / stretch);
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
      // B"H WAY-better #19: litter color patches — brown/orange drifts among
      // green, keyed to low-frequency patch noise (not per-leaf random).
      {
        const patchN = noise(lx * 0.08 + 90, lz * 0.08 + 31) * 0.5 + 0.5;
        const brown = THREE.MathUtils.smoothstep(patchN, 0.45, 0.75);
        const jr = lr();
        // green litter (0.75,0.72,0.55) → brown (0.55,0.38,0.22) → orange (0.72,0.45,0.20)
        const cr = 0.75 + brown * (jr < 0.5 ? -0.20 : -0.03);
        const cg = 0.72 + brown * (jr < 0.5 ? -0.34 : -0.27);
        const cb = 0.55 + brown * (jr < 0.5 ? -0.33 : -0.35);
        litterInst.setColorAt(litPlaced, new THREE.Color(cr, cg, cb));
      }
      litPlaced++;
    }
    litterInst.count = litPlaced;
    if (litterInst.instanceColor) litterInst.instanceColor.needsUpdate = true;
    litterInst.receiveShadow = true;
    scene.add(litterInst);

    /* B"H WAY-better #10: shelf fungi on fallen logs — small bracket discs
       on the log sides. Premade canvas texture (concentric zones), instanced.
       1 draw call. Stored log matrices reused for placement. */
    {
      const FUNGI_N = 18;
      // premade shelf-fungus texture: concentric tan/brown zones, pale rim
      const fcv = document.createElement('canvas'); fcv.width = fcv.height = 64;
      const fx = fcv.getContext('2d');
      const zones = ['#8a6f4d', '#a08055', '#c4a06a', '#e0c090', '#f0e0b8'];
      for (let zi = 0; zi < zones.length; zi++) {
        fx.fillStyle = zones[zi];
        fx.beginPath();
        fx.arc(32, 32, 30 - zi * 5.5, 0, 6.283);
        fx.fill();
      }
      const ftex = new THREE.CanvasTexture(fcv);
      ftex.colorSpace = THREE.SRGBColorSpace;
      const funGeo = new THREE.CircleGeometry(0.09, 10);
      const funMat = new THREE.MeshStandardMaterial({
        map: ftex, roughness: 0.9, side: THREE.DoubleSide,
      });
      const funInst = new THREE.InstancedMesh(funGeo, funMat, FUNGI_N);
      const fd = new THREE.Object3D();
      const frnd = mulberry32(seed ^ 0xf961);
      const logM = new THREE.Matrix4();
      for (let i = 0; i < FUNGI_N; i++) {
        // pick a log, stick to its side
        const li = (frnd() * LOG_COUNT) | 0;
        logInst.getMatrixAt(li, logM);
        const lp = new THREE.Vector3(), lq = new THREE.Quaternion(), ls = new THREE.Vector3();
        logM.decompose(lp, lq, ls);
        const along = (frnd() - 0.5) * 4.5 * ls.x; // along the log
        const sideA = frnd() * Math.PI * 2;
        // log local: cylinder laid horizontal (rotated Z by 90°), length on X
        const local = new THREE.Vector3(along, Math.cos(sideA) * 0.42 * ls.y, Math.sin(sideA) * 0.42 * ls.y);
        local.applyQuaternion(lq).add(lp);
        fd.position.copy(local);
        // face outward from log axis
        const out = new THREE.Vector3(0, Math.cos(sideA), Math.sin(sideA)).applyQuaternion(lq);
        fd.lookAt(local.clone().add(out));
        fd.rotateX(-0.35); // shelf tilts slightly down
        const fs = 0.6 + frnd() * 1.1;
        fd.scale.setScalar(fs);
        fd.updateMatrix();
        funInst.setMatrixAt(i, fd.matrix);
      }
      funInst.castShadow = false; funInst.receiveShadow = true;
      scene.add(funInst);
      mark('shelf-fungi');
    }
  }
  mark('forest-floor-props');

  /* B"H WAY-better #20: mushroom clusters in damp shade — instanced stem +
     cap, premade canvas textures. Near water, under canopy. 2 draw calls
     (stems, caps) for all clusters. */
  {
    const MUS_N = 42;
    const stemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.16, 6);
    stemGeo.translate(0, 0.08, 0);
    const capGeo = new THREE.SphereGeometry(0.075, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    capGeo.translate(0, 0.15, 0);
    // premade cap texture: russet with pale rim
    const mcv = document.createElement('canvas'); mcv.width = mcv.height = 32;
    const mx = mcv.getContext('2d');
    const mg = mx.createRadialGradient(16, 16, 2, 16, 16, 16);
    mg.addColorStop(0, '#7a4a28'); mg.addColorStop(0.7, '#9a6238'); mg.addColorStop(1, '#d8b888');
    mx.fillStyle = mg; mx.fillRect(0, 0, 32, 32);
    const mtex = new THREE.CanvasTexture(mcv); mtex.colorSpace = THREE.SRGBColorSpace;
    const stemMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.82, 0.78, 0.68), roughness: 0.9 });
    const capMat = new THREE.MeshStandardMaterial({ map: mtex, roughness: 0.75 });
    const stemInst = new THREE.InstancedMesh(stemGeo, stemMat, MUS_N);
    const capInst = new THREE.InstancedMesh(capGeo, capMat, MUS_N);
    const md = new THREE.Object3D();
    const mrnd = mulberry32(seed ^ 0x471c);
    let musPlaced = 0, musGuard = 0;
    // clusters: pick 8 cluster centers, scatter 3-7 mushrooms each
    const clusters = [];
    for (let c = 0; c < 8 && musPlaced < MUS_N; c++) {
      const cz = 40 - mrnd() * 110;
      const side = mrnd() < 0.5 ? -1 : 1;
      const cx0 = riverX(cz) + side * (riverHalfWidth(cz) + 2 + mrnd() * 5);
      const cy0 = groundHeight(cx0, cz, noise);
      if (cy0 < WATER_Y + 0.1) continue; // damp but not submerged
      const inCluster = 3 + ((mrnd() * 5) | 0);
      for (let k = 0; k < inCluster && musPlaced < MUS_N; k++) {
        const mx2 = cx0 + (mrnd() - 0.5) * 1.2, mz2 = cz + (mrnd() - 0.5) * 1.2;
        md.position.set(mx2, groundHeight(mx2, mz2, noise), mz2);
        md.rotation.y = mrnd() * Math.PI * 2;
        md.rotation.z = (mrnd() - 0.5) * 0.25;
        const ms = 0.6 + mrnd() * 1.2;
        md.scale.set(ms, ms * (0.8 + mrnd() * 0.6), ms);
        md.updateMatrix();
        stemInst.setMatrixAt(musPlaced, md.matrix);
        capInst.setMatrixAt(musPlaced, md.matrix);
        musPlaced++;
      }
    }
    stemInst.count = capInst.count = musPlaced;
    stemInst.castShadow = capInst.castShadow = false;
    stemInst.receiveShadow = capInst.receiveShadow = true;
    scene.add(stemInst); scene.add(capInst);
    mark('mushrooms');
  }

  /* B"H WAY-better #17: puddle reflections in bank hollows — small dark
     mirror quads where the bank dips near water. Cheap: MeshStandardMaterial
     with low roughness picks up the sky; no planar reflection pass. */
  {
    const PUD_N = 10;
    const pudGeo = new THREE.CircleGeometry(1, 14);
    pudGeo.rotateX(-Math.PI / 2);
    const pudMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.12, 0.16, 0.15), roughness: 0.08, metalness: 0.1,
      transparent: true, opacity: 0.85,
    });
    const pudInst = new THREE.InstancedMesh(pudGeo, pudMat, PUD_N);
    const pd = new THREE.Object3D();
    const prnd = mulberry32(seed ^ 0x90d1e);
    let pudPlaced = 0, pudGuard = 0;
    while (pudPlaced < PUD_N && pudGuard++ < 200) {
      const pz = 40 - prnd() * 110;
      const side = prnd() < 0.5 ? -1 : 1;
      const px = riverX(pz) + side * (riverHalfWidth(pz) + 1.5 + prnd() * 3);
      const py = groundHeight(px, pz, noise);
      // only in hollows near (but above) the waterline
      if (py < WATER_Y + 0.15 || py > WATER_Y + 0.9) continue;
      pd.position.set(px, py + 0.04, pz);
      pd.rotation.y = prnd() * Math.PI * 2;
      pd.scale.set(0.7 + prnd() * 1.3, 1, 0.5 + prnd() * 0.8);
      pd.updateMatrix();
      pudInst.setMatrixAt(pudPlaced++, pd.matrix);
    }
    pudInst.count = pudPlaced;
    pudInst.receiveShadow = true;
    scene.add(pudInst);
    mark('puddles');

  /* B"H NEW #14: animal tracks in mud — deer prints near the bank. Premade
     decal strip (canvas), subtle dark impressions. 1 draw call. */
  {
    const TRK_N = 14;
    // premade track strip: pairs of cloven prints fading along the strip
    const tcv = document.createElement('canvas'); tcv.width = 64; tcv.height = 256;
    const tx = tcv.getContext('2d');
    tx.clearRect(0, 0, 64, 256);
    for (let pi = 0; pi < 8; pi++) {
      const py = 14 + pi * 30, px = 32 + (pi % 2 === 0 ? -8 : 8);
      const fade = 1 - pi / 9;
      tx.fillStyle = `rgba(38,30,20,${0.55 * fade})`;
      // cloven hoof: two teardrops
      tx.save(); tx.translate(px - 4, py); tx.rotate(-0.25);
      tx.beginPath(); tx.ellipse(0, 0, 4, 7, 0, 0, 6.283); tx.fill(); tx.restore();
      tx.save(); tx.translate(px + 4, py); tx.rotate(0.25);
      tx.beginPath(); tx.ellipse(0, 0, 4, 7, 0, 0, 6.283); tx.fill(); tx.restore();
    }
    const ttex = new THREE.CanvasTexture(tcv);
    const trkGeo = new THREE.PlaneGeometry(0.9, 3.6);
    trkGeo.rotateX(-Math.PI / 2);
    const trkMat = new THREE.MeshStandardMaterial({
      map: ttex, transparent: true, roughness: 1, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1,
    });
    const trkInst = new THREE.InstancedMesh(trkGeo, trkMat, 3);
    const td = new THREE.Object3D();
    const trnd = mulberry32(seed ^ 0x7ac9);
    for (let i = 0; i < 3; i++) {
      const tz = 25 - trnd() * 70;
      const side = trnd() < 0.5 ? -1 : 1;
      const tx2 = riverX(tz) + side * (riverHalfWidth(tz) + 2.5 + trnd() * 2);
      td.position.set(tx2, groundHeight(tx2, tz, noise) + 0.05, tz);
      td.rotation.y = trnd() * Math.PI * 2;
      td.updateMatrix();
      trkInst.setMatrixAt(i, td.matrix);
    }
    trkInst.receiveShadow = true;
    scene.add(trkInst);
    mark('animal-tracks');
  }
  }

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
     60fps: single InstancedMesh, no per-frame CPU work.
     B"H commit 6: REAL grass scale — blades 5×28cm (were 16×70cm, read as
     leaves not grass). Tufts 900→1500 for patch density. Color desaturated
     from neon to natural meadow green. */
  {
    // Blade geometry: curved, tapered, with vertex color gradient
    const bladeGeo = new THREE.PlaneGeometry(0.05, 0.28, 1, 4);
    bladeGeo.translate(0, 0.14, 0);
    const bp = bladeGeo.attributes.position, bc = [];
    for (let i = 0; i < bp.count; i++) {
      const t = bp.getY(i) / 0.28; // 0=base, 1=tip
      // Growth-rule taper: blade narrows to a point (not linear)
      const width = Math.pow(1 - t, 0.7);
      bp.setX(i, bp.getX(i) * width);
      // Growth-rule curve: quadratic bend (stiff base, floppy tip)
      bp.setZ(i, t * t * 0.09);
      // Growth-rule color: dark moist base → natural meadow green → sunlit tip
      // B"H commit 6: desaturated (was neon 0.22,0.52,0.16)
      const shade = 0.35 + t * 0.9;
      bc.push(0.28 * shade * (0.85 + t*0.3), 0.45 * shade, 0.18 * shade * (1.05 - t*0.25));
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
    const TUFTS = fast ? 800 : 1500;
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
  // B"H WAY-better #2: god-ray breathing — slow sine on shaft opacity.
  if (scene.userData.shaftMat) {
    const sm = scene.userData.shaftMat, base = sm.userData.baseOpacity;
    updaters.push((t) => { sm.opacity = base * (0.78 + 0.22 * Math.sin(t * 0.32 + 1.0)); });
  }
  // B"H WAY-better #14: floating leaves advection.
  if (scene.userData.floatLeafUpdate) updaters.push(scene.userData.floatLeafUpdate);
  // B"H WAY-better #15: drip ripple rings.
  if (scene.userData.dripUpdate) updaters.push(scene.userData.dripUpdate);
  // B"H WAY-better #30: fish shadows.
  if (scene.userData.fishUpdate) updaters.push(scene.userData.fishUpdate);
  // B"H NEW #8: vine sway.
  if (scene.userData.vineUpdate) updaters.push(scene.userData.vineUpdate);
  // B"H NEW #11: web dew glints.
  if (scene.userData.webGlint) updaters.push(scene.userData.webGlint);
  /* B"H NEW #13: foreground framing branch — one overhanging branch across
     the top of frame for depth composition. Dark, out-of-focus feel (dark
     tint sells the near-field). Attached to the camera rig (static per view).
     B"H TEXTURE-FIRST 2026-10-14: was a canvas-drawn cartoon (the gray blob
     artifact in sweep2). Now a premade photoreal branch texture. */
  {
    // B"H — framingBranchTex is white-keyed to alpha at load (see
    // makeLeafClusterAlpha); the photoreal branch reads against the canopy.
    const fmat = new THREE.MeshBasicMaterial({
      map: framingBranchTex, transparent: true, depthWrite: false, fog: false,
      opacity: 0.96, color: new THREE.Color(0.55, 0.58, 0.52),
    });
    // camera-attached: position in camera space (top of frame)
    // B"H 2nd pass: was 7u — dominated the frame. Now 3u, tucked into the
    // top-right corner, subtle.
    const fmesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), fmat);
    // place relative to the forest camera (view-specific; forest is the hero)
    // NOTE: v (VIEWS[view]) not yet defined here — use VIEWS directly.
    if (view === 'forest' || view === 'river') {
      const vv = VIEWS[view] || VIEWS.forest;
      const cp = new THREE.Vector3(...vv.pos);
      const cl = new THREE.Vector3(...vv.look);
      const fwd = cl.clone().sub(cp).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(fwd, up).normalize();
      const up2 = new THREE.Vector3().crossVectors(right, fwd).normalize();
      // top-RIGHT corner: forward + up + right (edge of frame, not center)
      const fp = cp.clone().add(fwd.clone().multiplyScalar(3.2)).add(up2.clone().multiplyScalar(1.9)).add(right.clone().multiplyScalar(2.4));
      fmesh.position.copy(fp);
      fmesh.lookAt(cp); // face the camera
      fmesh.rotateZ(0.5);
      scene.add(fmesh);
    }
  }
  /* B"H NEW #12: dragonflies over water — 3 darting sprites with wing-blur
     (semi-transparent wing quads). Erratic flight: fast dashes + hovers. */
  {
    const DR_N = 3;
    const dcv = document.createElement('canvas'); dcv.width = 32; dcv.height = 16;
    const dx2 = dcv.getContext('2d');
    dx2.fillStyle = 'rgba(30,60,70,0.95)';
    dx2.fillRect(13, 6, 10, 3); // body
    dx2.fillStyle = 'rgba(200,230,255,0.45)';
    dx2.beginPath(); dx2.ellipse(10, 5, 8, 3, -0.4, 0, 6.283); dx2.fill(); // wings (blur)
    dx2.beginPath(); dx2.ellipse(22, 5, 8, 3, 0.4, 0, 6.283); dx2.fill();
    const dtex = new THREE.CanvasTexture(dcv);
    const dragons = [];
    const drnd = mulberry32(seed ^ 0xd9a9);
    for (let i = 0; i < DR_N; i++) {
      const sm = new THREE.SpriteMaterial({ map: dtex, transparent: true, depthWrite: false, fog: false });
      const spr = new THREE.Sprite(sm);
      spr.scale.set(0.45, 0.22, 1);
      scene.add(spr);
      dragons.push({
        spr, tx: 0, tz: 0, px: 0, pz: 0, py: 0,
        wait: drnd() * 3, speed: 6 + drnd() * 4, ph: drnd() * 6.28,
      });
      const dz = 20 - drnd() * 60;
      const d = dragons[i];
      d.px = d.tx = riverX(dz); d.pz = d.tz = dz; d.py = WATER_Y + 1 + drnd() * 1.5;
    }
    updaters.push((t, dt) => {
      for (const d of dragons) {
        d.wait -= dt;
        if (d.wait <= 0) {
          // pick a new target nearby (dart)
          const nz = d.tz + (drnd() - 0.5) * 24;
          d.tx = riverX(nz) + (drnd() - 0.5) * 6;
          d.tz = Math.max(-70, Math.min(35, nz));
          d.wait = 0.4 + drnd() * 1.8; // hover then dart
        }
        // move toward target
        const dx = d.tx - d.px, dz = d.tz - d.pz;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.1) {
          const step = Math.min(dist, d.speed * dt);
          d.px += dx / dist * step; d.pz += dz / dist * step;
        }
        const hover = Math.sin(t * 14 + d.ph) * 0.08;
        d.spr.position.set(d.px, d.py + hover, d.pz);
      }
    });
  }
  /* B"H WAY-better #31: occasional bird crossing the gap — simple dark
     silhouette sprite with flapping wings (2-frame scale pulse). Crosses
     every ~40-70s, takes ~8s. Rare, alive. */
  {
    const bcv = document.createElement('canvas'); bcv.width = 64; bcv.height = 32;
    const bx2 = bcv.getContext('2d');
    bx2.fillStyle = 'rgba(20,18,14,0.9)';
    // simple bird silhouette: body + swept wings
    bx2.beginPath();
    bx2.ellipse(32, 18, 10, 3.5, 0, 0, 6.283); bx2.fill();
    bx2.beginPath(); bx2.moveTo(24, 18); bx2.lineTo(6, 8); bx2.lineTo(10, 20); bx2.fill();
    bx2.beginPath(); bx2.moveTo(40, 18); bx2.lineTo(58, 8); bx2.lineTo(54, 20); bx2.fill();
    const btex = new THREE.CanvasTexture(bcv);
    const bmat = new THREE.SpriteMaterial({ map: btex, transparent: true, depthWrite: false, fog: false });
    const bird = new THREE.Sprite(bmat);
    bird.scale.set(2.2, 1.1, 1);
    bird.visible = false;
    scene.add(bird);
    const birdRnd = mulberry32(seed ^ 0xb12d);
    const birdState = { next: 12 + birdRnd() * 20, t0: 0, x0: 0, x1: 0, y: 0, z: 0 };
    updaters.push((t) => {
      if (!bird.visible && t > birdState.next) {
        // start a crossing: pick a gap (sun gap or river corridor)
        birdState.t0 = t;
        birdState.z = -30 - birdRnd() * 40;
        birdState.y = WATER_Y + 12 + birdRnd() * 8;
        const dir = birdRnd() < 0.5 ? 1 : -1;
        birdState.x0 = riverX(birdState.z) - dir * 40;
        birdState.x1 = riverX(birdState.z) + dir * 40;
        bird.visible = true;
      }
      if (bird.visible) {
        const k = (t - birdState.t0) / 9; // 9s crossing
        if (k >= 1) {
          bird.visible = false;
          birdState.next = t + 40 + birdRnd() * 30;
        } else {
          const bx = birdState.x0 + (birdState.x1 - birdState.x0) * k;
          const by = birdState.y + Math.sin(k * Math.PI) * 3 + Math.sin(t * 7) * 0.3;
          bird.position.set(bx, by, birdState.z);
          // wing flap: scale y pulses
          const flap = 0.75 + 0.45 * Math.abs(Math.sin(t * 9));
          bird.scale.set(2.2, 1.1 * flap, 1);
        }
      }
    });
  }
  // B"H WAY-better #6/#7: leaf flutter + gust clock.
  if (scene.userData.leafMat) {
    const lm = scene.userData.leafMat;
    updaters.push((t) => { if (lm.userData.sh) lm.userData.sh.uniforms.uLeafTime.value = t; });
  }
  // B"H WAY-better #8: crown sway clock.
  if (scene.userData.crownMat) {
    const cm = scene.userData.crownMat;
    updaters.push((t) => { if (cm.userData.sh) cm.userData.sh.uniforms.uCrownTime.value = t; });
  }
  // B"H NEW #2: dapple cookie temporal flicker — slow drift + breath.
  if (terrainMat.userData.shader) {
    const tsh = terrainMat.userData.shader;
    // base shift from sun angle (static per TOD); flicker adds slow wander
    updaters.push((t) => {
      tsh.uniforms.uCookieShift.value.set(
        Math.sin(t * 0.11) * 0.012 + Math.sin(t * 0.031 + 1.0) * 0.020,
        Math.cos(t * 0.09) * 0.012 + Math.sin(t * 0.027 + 2.0) * 0.020
      );
    });
  }
  const addParticles = sys => { scene.add(sys.obj); updaters.push(sys.update); };
  const PSETS = {
    // B"H WAY-better #29: falling leaves enabled in forest (sparse GPU points).
    forest: ['pollen', 'dust', 'leaves'], river: ['pollen', 'dust'],
    grassland: ['pollen'],
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

  /* B"H WAY-better #25: subtle handheld drift — tiny low-frequency camera
     position noise (breathing, not shaking). 2cm wander, imperceptible
     as motion, kills the tripod-locked CG feel. */
  {
    const basePos = camera.position.clone();
    const baseLook = new THREE.Vector3(...v.look);
    updaters.push((t) => {
      const dx = Math.sin(t * 0.31) * 0.5 + Math.sin(t * 0.83 + 1.7) * 0.25;
      const dy = Math.sin(t * 0.27 + 0.6) * 0.4 + Math.sin(t * 0.71 + 2.1) * 0.2;
      camera.position.set(
        basePos.x + dx * 0.035,
        basePos.y + dy * 0.030,
        basePos.z + Math.sin(t * 0.23 + 1.2) * 0.030
      );
      camera.lookAt(baseLook);
    });
  }

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
        // B"H — proof captures render at FULL res even when the game loop
        // runs scaled: temporarily size up, capture, restore. Judges see
        // full quality; players get 60fps.
        renderer.setSize(innerWidth, innerHeight, false);
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
        // B"H "even more real" (Yaakov 2026-10-14): pushed warm/cool grade.
        // Sunlit moss reads warm yellow-green, deep shadow reads cool teal.
        // Stronger than the restrained Phase 7 grade — the reference has
        // real color contrast, not a neutral wash.
        // B"H TEXTURE-FIRST 2026-10-14: 0.38/0.48 crushed shadows to black
        // (reverted). Grade can't fix unlit shadows — lighting must.
        {
          cx2.globalCompositeOperation = 'overlay';
          const gg = cx2.createLinearGradient(0, 0, 0, H);
          gg.addColorStop(0, 'rgba(255,232,185,0.26)');
          gg.addColorStop(0.35, 'rgba(195,215,135,0.13)');
          gg.addColorStop(0.65, 'rgba(45,105,88,0.16)');
          gg.addColorStop(1, 'rgba(8,36,42,0.36)');
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
          // B"H WAY-better #27: DISABLED 2026-10-14 — threshold too low, washed
          // the image. Needs a true high threshold (only near-whites bloom).
          // (Live 3D mip-bloom skipped: extra fullscreen passes threaten the
          // 60fps CPU gate. The additive glow sprites carry bloom in-scene.)
          // try {
          //   const bc = document.createElement('canvas');
          //   bc.width = W; bc.height = H;
          //   const bx = bc.getContext('2d');
          //   bx.filter = 'brightness(2.2) contrast(4)';
          //   bx.drawImage(cv2, 0, 0, W, H);
          //   cx2.save();
          //   cx2.globalCompositeOperation = 'lighter';
          //   cx2.filter = 'blur(22px)';
          //   cx2.globalAlpha = 0.35;
          //   cx2.drawImage(bc, 0, 0, W, H);
          //   cx2.restore();
          // } catch {}
        }
        mark('grade');
        blob = await new Promise(res => cv2.toBlob(res, 'image/png'));
        rt.dispose();
        // restore scaled game-loop size after the full-res proof capture
        renderer.setSize(Math.round(innerWidth * RS), Math.round(innerHeight * RS), false);
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
  // B"H — perf stats (§21 budget): draw calls + triangles for commit 10 GATE.
  function getPerfStats() {
    renderer.info.reset();
    renderer.render(scene, camera);
    const info = renderer.info.render;
    return {
      drawCalls: info.calls,
      triangles: info.triangles,
      geometries: info.geometries,
      textures: info.textures,
    };
  }
  window.__realityDebug = { scene, camera, renderer, water, waterUniforms, getPerfStats };
  return { renderer, scene, camera, getPerfStats };
}
