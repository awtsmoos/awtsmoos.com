// B"H
/**
 * @module TerrainMath
 * @description
 * Chapter 232: The earth now listens to points, plateaus, roads, and old hills.
 *
 * The Awtsmoos gives one pure function for terrain height so mesh generation,
 * grounding, and future road/fence placement can share the same remembered law.
 */
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const smooth = t => t <= 0 ? 1 : t >= 1 ? 0 : (1 + Math.cos(Math.PI * t)) * 0.5;
const clamp01 = t => Math.max(0, Math.min(1, t));

function pointInfluence(x, z, p) {
  const radius = n(p.radius, 45), dx = x - n(p.x), dz = z - n(p.z);
  return smooth(Math.sqrt(dx * dx + dz * dz) / radius) * n(p.y ?? p.height, 0);
}
function oldHillInfluence(x, z, h) {
  const radius = n(h.radius, 50), dx = x - n(h.x), dz = z - n(h.z);
  return smooth(Math.sqrt(dx * dx + dz * dz) / radius) * n(h.height, 10);
}
function roadDistance(x, z, road) {
  let best = Infinity;
  const pts = road.points || [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i], b = pts[i + 1], ax = n(a[0] ?? a.x), az = n(a[1] ?? a.z), bx = n(b[0] ?? b.x), bz = n(b[1] ?? b.z);
    const vx = bx - ax, vz = bz - az, wx = x - ax, wz = z - az;
    const t = clamp01((wx * vx + wz * vz) / Math.max(0.0001, vx * vx + vz * vz));
    const px = ax + vx * t, pz = az + vz * t;
    best = Math.min(best, Math.hypot(x - px, z - pz));
  }
  return best;
}
function roadFlatten(height, x, z, roads = []) {
  let h = height;
  for (const road of roads) {
    const d = roadDistance(x, z, road), half = n(road.width, 7) * 0.5, feather = n(road.feather, 8);
    if (d < half + feather) h *= 1 - smooth(Math.max(0, d - half) / feather) * n(road.flatten, 0.55);
  }
  return h;
}
function plateauBlend(height, x, z, plateaus = []) {
  let h = height;
  for (const p of plateaus) {
    const dx = x - n(p.x), dz = z - n(p.z), d = Math.hypot(dx / n(p.rx, 12), dz / n(p.rz, 12));
    h = h * (1 - smooth(d)) + n(p.y, h) * smooth(d);
  }
  return h;
}

export default class TerrainMath {
  static calculateHeightAt(x, z, dataOrHills = []) {
    const data = Array.isArray(dataOrHills) ? { hills: dataOrHills } : dataOrHills || {};
    let height = n(data.baseY, 0);
    for (const h of data.hills || []) height += oldHillInfluence(x, z, h);
    for (const p of data.points || data.controlPoints || []) height += pointInfluence(x, z, p);
    height = roadFlatten(height, x, z, data.roads || []);
    height = plateauBlend(height, x, z, data.plateaus || []);
    const ripple = n(data.microNoise, 0);
    if (ripple) height += (Math.sin(x * 0.13) + Math.cos(z * 0.11)) * ripple;
    return height;
  }
}
