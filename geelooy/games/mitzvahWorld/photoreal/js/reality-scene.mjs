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
    frame: { dpos: [2.2, 3.1, 3.2], dlook: [0, 2.55, 0] },
    character: { pose: 'stand', outfit: 'jacket', head: 'neutral', brim: 1, at: [4, 12], rotY: 0.60 } },
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

export async function buildRealityScene(container, { view = 'forest', seed = 20261011, fast = false } = {}) {
  const rand = mulberry32(seed);
  const noise = makeNoise2D(mulberry32(seed ^ 0x9e37));
  const night = Boolean((VIEWS[view] || {}).night);
  const vc = (VIEWS[view] || {}).character || null;
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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfdfe8, 70, 300);

  /* sky dome */
  const sunDir = new THREE.Vector3(0.55, 0.62, 0.35).normalize();
  const moonDir = new THREE.Vector3(-0.42, 0.30, -0.60).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        sunDir: { value: sunDir },
        uMoonDir: { value: moonDir },
        uNight: { value: night ? 1 : 0 },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vDir; uniform vec3 sunDir; uniform vec3 uMoonDir; uniform float uNight;
        float hash13(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
        void main(){
          float h = clamp(vDir.y, -0.1, 1.0);
          vec3 zen = vec3(0.19, 0.42, 0.72);
          vec3 hor = vec3(0.82, 0.90, 0.95);
          vec3 col = mix(hor, zen, pow(max(h, 0.0), 0.55));
          float s = max(dot(normalize(vDir), sunDir), 0.0);
          col += vec3(1.0, 0.93, 0.78) * (pow(s, 900.0) * 1.4 + pow(s, 18.0) * 0.22);
          // night sky: deep gradient + stars + moon
          vec3 nzen = vec3(0.006, 0.012, 0.032);
          vec3 nhor = vec3(0.028, 0.052, 0.098);
          vec3 d = normalize(vDir);
          vec3 ncol = mix(nhor, nzen, pow(max(h, 0.0), 0.5));
          float st = step(0.9986, hash13(floor(d * 220.0)));
          ncol += vec3(0.90, 0.93, 1.0) * st * smoothstep(0.02, 0.25, h);
          float m = max(dot(d, uMoonDir), 0.0);
          ncol += vec3(0.92, 0.95, 1.0) * (smoothstep(0.99850, 0.99950, m) * 1.6 + pow(m, 200.0) * 0.60);
          col = mix(col, ncol, uNight);
          gl_FragColor = vec4(col, 1.0);
        }`
    })
  );
  scene.add(sky);

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
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.6);
    sun.position.copy(sunDir).multiplyScalar(120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(SHADOW, SHADOW);
    sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
    sun.shadow.camera.far = 320; sun.shadow.bias = -0.0006;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xbdd8ee, 0x5d6b46, 0.85));
  }

  /* textures (real photographs, Awtsmoos Drive) */
  const [grassTex, dirtTex, barkTex, canopyTex, leafTex] = await Promise.all([
    loadTexture(TEX + 'grass1.jpg', 30, 30),
    loadTexture(TEX + 'dirt1.jpg', 40, 3),
    loadTexture(TEX + 'bark1.webp', 1, 2),
    loadTexture(TEX + 'leaves1.png', 1, 1),
    loadTexture(TEX + 'leaf1.jpg', 1, 1),
  ]);

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
          vec2 p = vec2(vUv.x * 6.0, vUv.y * 90.0);
          float w = wave(p);
          float w2 = wave(p * 2.3 + 7.0);
          vec3 n = normalize(vec3(w * 0.07, 1.0, w2 * 0.07));
          vec3 viewDir = normalize(cameraPosition - vPos);
          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 2.2);
          vec3 col = mix(uDeep, uShallow, 0.35 + 0.3 * w);
          col = mix(col, uSky, fres * 0.75);
          vec3 hv = normalize(viewDir + uSunDir);
          float spec = pow(max(dot(n, hv), 0.0), 220.0) * 1.6;
          col += vec3(1.0, 0.97, 0.9) * spec;
          float edge = smoothstep(0.0, 0.10, vUv.x) * smoothstep(1.0, 0.90, vUv.x);
          gl_FragColor = vec4(col, 0.88 * (0.35 + 0.65 * edge)); }`
    })
  );
  scene.add(water);

  /* trees — ez-tree-derived procedural generator, real bark + canopy photos */
  const barkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.92 });
  const canopyMat = new THREE.MeshStandardMaterial({
    map: canopyTex, alphaTest: 0.42, side: THREE.DoubleSide,
    roughness: 0.9, vertexColors: true, color: new THREE.Color(0.88, 1.0, 0.86),
  });
  const ARCHETYPES = ['Oak Large', 'Pine Large', 'Birch Elegant', 'Willow Weeping'];
  const treeGeos = ARCHETYPES.map(name => {
    const t = generateTreeProceduralData(name, { detail: 'balanced' });
    return { bark: bufferGeometryFromStream(t.branches), leaves: bufferGeometryFromStream(t.leaves, 0.55) };
  });
  const treeGroup = new THREE.Group();
  const treeSpots = [];
  const CLEAR = {
    forest: 15, river: 15, grassland: 26, particles: 15,
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
  }
  scene.add(treeGroup);

  /* grass tufts — instanced tapered blades, vertex-color gradient */
  {
    const blade = new THREE.PlaneGeometry(0.16, 0.38, 1, 3);
    blade.translate(0, 0.19, 0);
    const bp = blade.attributes.position, bc = [];
    for (let i = 0; i < bp.count; i++) {
      const t = bp.getY(i) / 0.38;
      bp.setX(i, bp.getX(i) * (1 - t * 0.9));              // taper to tip
      bp.setZ(i, t * t * 0.12);                            // gentle arc
      const shade = 0.55 + t * 0.85;                       // brighter meadow green
      bc.push(0.30 * shade, 0.55 * shade, 0.20 * shade);
    }
    blade.setAttribute('color', new THREE.BufferAttribute(new Float32Array(bc), 3));
    // cross two blades
    const tuft = new THREE.BufferGeometry();
    const g2 = blade.clone().rotateY(Math.PI / 2);
    const merge = (a, b) => {
      const pa = a.attributes.position.array, pb = b.attributes.position.array;
      const ca = a.attributes.color.array, cb = b.attributes.color.array;
      const ia = a.index.array, ib = b.index.array.map(i => i + pa.length / 3);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...pa, ...pb]), 3));
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array([...ca, ...cb]), 3));
      g.setIndex(new THREE.BufferAttribute(new Uint16Array([...ia, ...ib]), 1));
      g.computeVertexNormals();
      return g;
    };
    const tuftGeo = merge(blade, g2);
    const tuftMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 });
    const COUNT = fast ? 1400 : 2600;
    const inst = new THREE.InstancedMesh(tuftGeo, tuftMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0; guard = 0;
    while (placed < COUNT && guard++ < COUNT * 12) {
      const x = (rand() - 0.5) * 190, z = (rand() - 0.5) * 190;
      if (Math.abs(x - riverX(z)) < 8.5) continue;
      dummy.position.set(x, groundHeight(x, z, noise), z);
      dummy.rotation.y = rand() * Math.PI * 2;
      const s = 0.7 + rand() * 1.3;
      dummy.scale.set(s, s * (0.8 + rand() * 0.5), s);
      dummy.updateMatrix();
      inst.setMatrixAt(placed++, dummy.matrix);
    }
    inst.count = placed;
    inst.castShadow = false; inst.receiveShadow = true;
    scene.add(inst);
  }

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
  for (const pset of PSETS) {
    if (pset === 'fireflies') addParticles(makeFireflies({ count: Math.round(240 * PQ), area: 70, seed: seed + 11 }));
    else if (pset === 'pollen') addParticles(makePollen({ count: Math.round(300 * PQ), area: 80, seed: seed + 22 }));
    else if (pset === 'leaves') addParticles(makeFallingLeaves(leafTex, (x, z) => groundHeight(x, z, noise), { count: Math.round(120 * PQ), area: 70, seed: seed + 33 }));
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

  /* render loop (a few frames so water/particles settle, then hold) */
  const clock = new THREE.Clock();
  const FRAMES = fast ? 4 : 10;
  let frames = 0;
  await new Promise(resolve => {
    function tick() {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      waterUniforms.uTime.value = t;
      for (const u of updaters) u(t, dt);
      renderer.render(scene, camera);
      if (++frames >= FRAMES) resolve();
      else requestAnimationFrame(tick);
    }
    tick();
  });
  // hold final frame
  renderer.render(scene, camera);
  window.__realityDebug = { scene, camera, renderer, water, waterUniforms };
  return { renderer, scene, camera };
}
