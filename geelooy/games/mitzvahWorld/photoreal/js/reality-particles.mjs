// B"H — Particle systems for the Reality Engine photorealism scene.
// Glowing fireflies (night), drifting pollen (day), falling leaves (autumn gust),
// god-ray dust motes, ember/spark trail (night). All systems return { obj, update(t, dt) }.
import * as THREE from '../../../scripts/build/three.module.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function softSprite(colorInner, colorOuter) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const cx = cv.getContext('2d');
  const grad = cx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, colorInner);
  grad.addColorStop(0.45, colorOuter);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = grad; cx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------------- fireflies: glowing, blinking, night ---------------- */
export function makeFireflies({ count = 220, area = 60, yMax = 7, seed = 4242 } = {}) {
  const rand = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const scale = new Float32Array(count);
  const base = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * area, y = 0.4 + rand() * yMax, z = (rand() - 0.5) * area;
    pos.set([x, y, z], i * 3);
    base.push({ x, y, z, fx: rand() * 6.28, fy: rand() * 6.28, sp: 0.3 + rand() * 0.7 });
    phase[i] = rand() * 6.28;
    scale[i] = 0.7 + rand() * 0.9;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
  const uniforms = { uTime: { value: 0 }, uMap: { value: softSprite('rgba(255,246,180,1)', 'rgba(190,230,120,0.5)') } };
  const m = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aPhase; attribute float aScale;
      uniform float uTime; varying float vTw;
      void main(){ vTw = 0.5 + 0.5 * sin(uTime * 2.4 + aPhase);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aScale * (260.0 / -mv.z) * (0.55 + 0.45 * vTw);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uMap; varying float vTw;
      void main(){ vec4 c = texture2D(gl_PointCoord, uMap);
        gl_FragColor = vec4(c.rgb, c.a * (0.30 + 0.70 * vTw)); }`,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  const update = (t) => {
    uniforms.uTime.value = t;
    const p = g.attributes.position;
    for (let i = 0; i < count; i++) {
      const b = base[i];
      p.setXYZ(i,
        b.x + Math.sin(t * b.sp + b.fx) * 1.6,
        b.y + Math.sin(t * b.sp * 0.7 + b.fy) * 0.7,
        b.z + Math.cos(t * b.sp * 0.8 + b.fx) * 1.6);
    }
    p.needsUpdate = true;
  };
  return { obj: pts, update };
}

/* ---------------- pollen: soft drifting motes, day ---------------- */
export function makePollen({ count = 320, area = 80, seed = 5150, gust = 0 } = {}) {
  const rand = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const drift = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * area, y = 0.3 + rand() * 8, z = (rand() - 0.5) * area;
    pos.set([x, y, z], i * 3);
    drift.push({ x, y, z, ph: rand() * 6.28, sp: 0.2 + rand() * 0.5, wx: (rand() - 0.5) * 0.6 });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.16, map: softSprite('rgba(255,252,235,0.9)', 'rgba(255,244,200,0.35)'),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55,
  }));
  pts.frustumCulled = false;
  const update = (t) => {
    const p = g.attributes.position;
    for (let i = 0; i < count; i++) {
      const d = drift[i];
      // wind gust: slow global swell sweeps the field, per-particle phase offset
      const gs = 1 + gust * (0.5 + 0.5 * Math.sin(t * 0.45 + d.ph * 0.31));
      p.setXYZ(i,
        d.x + Math.sin(t * d.sp + d.ph) * 2.0 * gs + t * d.wx * (0.15 + gust * 0.55),
        d.y + Math.sin(t * d.sp * 0.6 + d.ph * 2.0) * 0.5,
        d.z + Math.cos(t * d.sp * 0.8 + d.ph) * 2.0 * gs);
    }
    p.needsUpdate = true;
  };
  return { obj: pts, update };
}

/* ---------------- falling leaves: autumn gust, instanced textured quads ---------------- */
export function makeFallingLeaves(leafTex, groundY, { count = 130, area = 70, seed = 6161, gust = 0 } = {}) {
  const rand = mulberry32(seed);
  const geo = new THREE.PlaneGeometry(0.16, 0.20);
  const m = new THREE.MeshStandardMaterial({
    map: leafTex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.9,
    color: new THREE.Color(1.0, 0.82, 0.62), // autumn tint
  });
  const inst = new THREE.InstancedMesh(geo, m, count);
  inst.frustumCulled = false;
  const L = [];
  for (let i = 0; i < count; i++) {
    L.push({
      x: (rand() - 0.5) * area, y: rand() * 12, z: (rand() - 0.5) * area,
      vy: 0.5 + rand() * 0.9, ph: rand() * 6.28, sp: 1 + rand() * 2.2,
      rx: rand() * 6.28, rz: rand() * 6.28, sway: 0.6 + rand() * 1.4,
    });
  }
  const dummy = new THREE.Object3D();
  const update = (t, dt) => {
    for (let i = 0; i < count; i++) {
      const l = L[i];
      l.y -= l.vy * dt;
      if (l.y < groundY(l.x, l.z) + 0.05) { l.y = 9 + rand() * 4; l.x = (rand() - 0.5) * area; l.z = (rand() - 0.5) * area; }
      // wind gust: swell pushes leaves sideways and spins them harder
      const gs = 1 + gust * (0.5 + 0.5 * Math.sin(t * 0.5 + l.ph * 0.27));
      dummy.position.set(
        l.x + Math.sin(t * l.sp + l.ph) * l.sway * gs + t * gust * 0.35,
        l.y,
        l.z + Math.cos(t * l.sp * 0.7 + l.ph) * l.sway * 0.7 * gs);
      dummy.rotation.set(l.rx + t * l.sp * 0.5, l.ph, l.rz + t * l.sp * 0.35);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  };
  update(0, 0.016);
  return { obj: inst, update };
}

/* ---------------- god-ray dust motes: concentrated in the sun shaft ---------------- */
export function makeDustMotes(sunDir, { count = 240, seed = 7171 } = {}) {
  const rand = mulberry32(seed);
  // shaft volume: slanted column along -sunDir through the clearing
  const pos = new Float32Array(count * 3);
  const ph = [];
  for (let i = 0; i < count; i++) {
    const along = rand() * 34 - 4;                    // distance along shaft
    const r = Math.pow(rand(), 0.6) * 7;              // radius, denser near axis
    const a = rand() * 6.283;
    const cx = 4 - sunDir.x * along, cy = 14 - sunDir.y * along, cz = 8 - sunDir.z * along;
    // perpendicular offsets
    pos.set([cx + Math.cos(a) * r, Math.max(0.3, cy + (rand() - 0.5) * 6), cz + Math.sin(a) * r], i * 3);
    ph.push(rand() * 6.28);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.30, map: softSprite('rgba(255,250,225,0.85)', 'rgba(255,244,205,0.30)'),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5,
  }));
  pts.frustumCulled = false;
  const update = (t) => {
    pts.position.y = Math.sin(t * 0.25) * 0.35;
    pts.rotation.y = t * 0.004;
  };
  return { obj: pts, update };
}

/* ---------------- embers: rising sparks for the night scene ---------------- */
export function makeEmbers({ count = 110, area = 40, seed = 8181 } = {}) {
  const rand = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const E = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * area, z = (rand() - 0.5) * area;
    E.push({ x, z, y: rand() * 6, vy: 0.8 + rand() * 1.6, ph: rand() * 6.28, sp: 1 + rand() * 2 });
    pos.set([x, E[i].y, z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.34, map: softSprite('rgba(255,180,90,1)', 'rgba(255,110,40,0.4)'),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1.0,
  }));
  pts.frustumCulled = false;
  const update = (t, dt) => {
    const p = g.attributes.position;
    for (let i = 0; i < count; i++) {
      const e = E[i];
      e.y += e.vy * dt;
      if (e.y > 8) { e.y = 0.2; e.x = (rand() - 0.5) * area; e.z = (rand() - 0.5) * area; }
      p.setXYZ(i, e.x + Math.sin(t * e.sp + e.ph) * 0.5, e.y, e.z + Math.cos(t * e.sp * 0.8 + e.ph) * 0.5);
    }
    p.needsUpdate = true;
  };
  return { obj: pts, update };
}
