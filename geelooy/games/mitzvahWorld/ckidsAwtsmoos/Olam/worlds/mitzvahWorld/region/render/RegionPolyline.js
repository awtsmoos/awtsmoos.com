// B"H
/** @file RegionPolyline.js @description Samples path polylines for roads, lamps, trails, and flowers. */
export function samplePolyline(points = [], spacing = 3) {
  const out = []; for (let i = 0; i < points.length - 1; i++) { const [x1, z1] = points[i], [x2, z2] = points[i + 1]; const dx = x2 - x1, dz = z2 - z1, dist = Math.hypot(dx, dz); const steps = Math.max(1, Math.floor(dist / spacing)); for (let s = 0; s < steps; s++) { const t = (s + .5) / steps; out.push({ x: x1 + dx * t, z: z1 + dz * t, yaw: Math.atan2(dx, dz), segment: i, t }); } } return out;
}
export function offsetPoint(p, distance) { return { x: p.x + Math.cos(p.yaw) * distance, z: p.z - Math.sin(p.yaw) * distance, yaw: p.yaw }; }
