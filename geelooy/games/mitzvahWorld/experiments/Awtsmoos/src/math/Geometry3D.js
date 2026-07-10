// B"H
/** Geometry helpers: normals, barycentric tests, and raw capsule math vessels. */
export function v(x = 0, y = 0, z = 0) { return { x, y, z }; }
export function add(a, b) { return v(a.x + b.x, a.y + b.y, a.z + b.z); }
export function sub(a, b) { return v(a.x - b.x, a.y - b.y, a.z - b.z); }
export function scale(a, s) { return v(a.x * s, a.y * s, a.z * s); }
export function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
export function cross(a, b) { return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }
export function length(a) { return Math.hypot(a.x, a.y, a.z); }
export function normalize(a) { const n = length(a) || 1; return scale(a, 1 / n); }
export function negate(a) { return v(-a.x, -a.y, -a.z); }
export function clamp01(n) { return Math.max(0, Math.min(1, n)); }
export function rotateY(p, yaw) { const c = Math.cos(yaw || 0), s = Math.sin(yaw || 0); return v(p.x * c - p.z * s, p.y, p.x * s + p.z * c); }
export function transformPoint(p, position, yaw = 0) { return add(rotateY(p, yaw), position); }
export function triangleNormal(a, b, c) { return normalize(cross(sub(b, a), sub(c, a))); }
export function planeDistance(point, tri) { return dot(sub(point, tri.a), tri.normal); }
export function projectToPlane(point, tri) { return sub(point, scale(tri.normal, planeDistance(point, tri))); }
export function triangleContainsPoint(p, tri) {
  const v0 = sub(tri.c, tri.a), v1 = sub(tri.b, tri.a), v2 = sub(p, tri.a);
  const d00 = dot(v0, v0), d01 = dot(v0, v1), d02 = dot(v0, v2), d11 = dot(v1, v1), d12 = dot(v1, v2);
  const inv = 1 / ((d00 * d11 - d01 * d01) || 1);
  const u = (d11 * d02 - d01 * d12) * inv, w = (d00 * d12 - d01 * d02) * inv;
  return u >= -0.0001 && w >= -0.0001 && u + w <= 1.0001;
}
export function closestPointOnSegment(p, a, b) { const ab = sub(b, a); return add(a, scale(ab, clamp01(dot(sub(p, a), ab) / (dot(ab, ab) || 1)))); }
export function closestPointsSegmentSegment(a0, a1, b0, b1) {
  const d1 = sub(a1, a0), d2 = sub(b1, b0), r = sub(a0, b0);
  const a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r);
  let s = 0, t = 0;
  if (a <= 1e-8 && e <= 1e-8) return [a0, b0];
  if (a <= 1e-8) t = clamp01(f / e);
  else {
    const c = dot(d1, r);
    if (e <= 1e-8) s = clamp01(-c / a);
    else { const b = dot(d1, d2), denom = a * e - b * b; s = denom ? clamp01((b * f - c * e) / denom) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = clamp01(-c / a); } else if (t > 1) { t = 1; s = clamp01((b - c) / a); } }
  }
  return [add(a0, scale(d1, s)), add(b0, scale(d2, t))];
}
export function rayTriangle(origin, direction, tri, maxDistance = Infinity) {
  const edge1 = sub(tri.b, tri.a), edge2 = sub(tri.c, tri.a), h = cross(direction, edge2);
  const det = dot(edge1, h);
  if (Math.abs(det) < 0.000001) return null;
  const inv = 1 / det, s = sub(origin, tri.a), u = inv * dot(s, h);
  if (u < 0 || u > 1) return null;
  const q = cross(s, edge1), vv = inv * dot(direction, q);
  if (vv < 0 || u + vv > 1) return null;
  const t = inv * dot(edge2, q);
  if (t < 0.001 || t > maxDistance) return null;
  return { distance: t, point: add(origin, scale(direction, t)), normal: tri.normal, item: tri };
}
export function minMax(points) {
  const min = v(Infinity, Infinity, Infinity), max = v(-Infinity, -Infinity, -Infinity);
  for (const p of points) { min.x = Math.min(min.x, p.x); min.y = Math.min(min.y, p.y); min.z = Math.min(min.z, p.z); max.x = Math.max(max.x, p.x); max.y = Math.max(max.y, p.y); max.z = Math.max(max.z, p.z); }
  return { min, max };
}
