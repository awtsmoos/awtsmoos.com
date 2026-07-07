// B"H
/** Tiny vector helpers, footsteps of form inside the Infinite. */
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / Math.max(1e-9, b - a), 0, 1); return t * t * (3 - 2 * t); };
export const vec3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
export const distance2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const mixVec3 = (a, b, t) => vec3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
export const pathPoint = (points, t) => {
  if (!points.length) return vec3();
  const scaled = clamp(t, 0, 0.999999) * (points.length - 1);
  const i = Math.floor(scaled);
  return mixVec3(points[i], points[Math.min(points.length - 1, i + 1)], scaled - i);
};
