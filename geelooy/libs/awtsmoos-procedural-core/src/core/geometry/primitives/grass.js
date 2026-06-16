// B"H
/**
 * @file grass.js
 * @brief Deterministic curved multi-blade grass tufts for living terrain fields.
 */
const TAU = Math.PI * 2;
const fract = v => v - Math.floor(v);
function rand(a, b, s = 1) { return fract(Math.sin(a * 12.9898 + b * 78.233 + s * 37.719) * 43758.5453); }
function blade(out, width, height, bend, yaw) {
  const start = out.positions.length / 3, hw = width * .5;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const push = (x, y, z, u, v) => {
    const bx = x + bend * y * y, bz = z;
    out.positions.push(bx * c - bz * s, y * height, bx * s + bz * c);
    out.normals.push(-bend, .7, .25); out.uvs.push(u, v);
  };
  push(-hw, 0, 0, 0, 0); push(hw, 0, 0, 1, 0);
  push(-hw * .55, .58, .01, 0, .58); push(hw * .55, .58, .01, 1, .58);
  push(0, 1, .018, .5, 1);
  out.indices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2, start + 2, start + 3, start + 4);
}
function tuftGeometry(blades = 7) {
  const out = { positions: [], normals: [], uvs: [], indices: [], colors: [] };
  for (let i = 0; i < blades; i++) {
    blade(out, .05 + rand(i,1)*.055, .75 + rand(i,2)*.55, (rand(i,3)-.5)*.34, i / blades * TAU + rand(i,4));
  }
  for (let i = 0; i < out.positions.length / 3; i++) out.colors.push(.25, .75, .18, 1);
  return out;
}
function pickPoint(patches, width, i, seed) {
  if (!patches.length) return [(rand(i,seed)-.5)*width, (rand(i,seed+7)-.5)*width];
  const p = patches[Math.floor(rand(i,seed+2) * patches.length) % patches.length];
  const r = p[3] * Math.sqrt(rand(i, seed + 3));
  const a = rand(i, seed + 4) * TAU;
  return [p[0] + Math.cos(a) * r, p[2] + Math.sin(a) * r];
}
export function createGrassFieldMesh(params = {}) {
  const count = params.count || 1000, width = params.width || 20, seed = params.seed || 777;
  const geometry = tuftGeometry(params.blades || 7), patches = params.patches || [];
  const instanceOffsets = [], instanceScales = [], instanceRotations = [], instanceBends = [];
  let generated = 0, attempts = 0;
  while (generated < count && attempts < count * 20) {
    attempts++;
    const [x, z] = pickPoint(patches, width, attempts, seed);
    if (patches.length && rand(Math.floor(x*.2), Math.floor(z*.2), seed) < .08) continue;
    instanceOffsets.push(x, 0, z);
    instanceScales.push(.72 + rand(attempts, seed + 6) * .88);
    instanceRotations.push(rand(attempts, seed + 8) * TAU);
    instanceBends.push(.4 + rand(attempts, seed + 9) * .9);
    generated++;
  }
  return { ...geometry, instanceOffsets:new Float32Array(instanceOffsets), instanceScales:new Float32Array(instanceScales), instanceRotations:new Float32Array(instanceRotations), instanceBends:new Float32Array(instanceBends), instanceCount:generated, drawMode:"TRIANGLES" };
}
