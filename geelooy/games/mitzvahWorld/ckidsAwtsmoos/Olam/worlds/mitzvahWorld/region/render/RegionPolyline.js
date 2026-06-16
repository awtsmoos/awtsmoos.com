// B"H
/** @file RegionPolyline.js @description Clear path sampling for roads, flowers, lamps, and trails. */
export function samplePolyline(points = [], spacing = 3) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const x1 = Array.isArray(a) ? a[0] : a.x;
    const z1 = Array.isArray(a) ? a[1] : a.z;
    const x2 = Array.isArray(b) ? b[0] : b.x;
    const z2 = Array.isArray(b) ? b[1] : b.z;
    const dx = x2 - x1;
    const dz = z2 - z1;
    const distance = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.floor(distance / spacing));
    for (let s = 0; s < steps; s++) {
      const t = (s + 0.5) / steps;
      out.push({ x:x1 + dx * t, z:z1 + dz * t, yaw:Math.atan2(dx, dz), segment:i, t });
    }
  }
  return out;
}
export function offsetPoint(p, distance) {
  return { x:p.x + Math.cos(p.yaw) * distance, z:p.z - Math.sin(p.yaw) * distance, yaw:p.yaw };
}
