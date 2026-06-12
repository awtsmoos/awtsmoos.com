// B"H
/** @file MaterialSynthesisPrimitives.js @description Chapter 962: sharp reusable material laws. */
export const clamp01 = v => Math.max(0, Math.min(1, v));
export const fract = x => x - Math.floor(x);
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp01((x - a) / Math.max(0.00001, b - a)); return t * t * (3 - 2 * t); };
export const byte = v => Math.max(0, Math.min(255, Math.round(v * 255)));
export function hash(x, y, s = 1) { return fract(Math.sin(x * 127.1 + y * 311.7 + s * 91.7) * 43758.5453); }
export function noise(x, y, s = 1) { const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(0, 1, fract(x)), fy = smooth(0, 1, fract(y)); return mix(mix(hash(ix, iy, s), hash(ix + 1, iy, s), fx), mix(hash(ix, iy + 1, s), hash(ix + 1, iy + 1, s), fx), fy); }
export function fbm(x, y, s = 1, octaves = 5) { let v = 0, a = 0.52, f = 1; for (let i = 0; i < octaves; i++) { v += noise(x * f, y * f, s + i * 17.3) * a; f *= 2.13; a *= 0.48; } return clamp01(v); }
export function rgb(r, g, b) { return [r, g, b]; }
export function cmix(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
export function add(a, b, k = 1) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
export function mul(a, k = 1) { return [a[0] * k, a[1] * k, a[2] * k]; }
export function stripe(x, w = 0.02) { return 1 - smooth(0, w, Math.min(fract(x), 1 - fract(x))); }
export function line(x, center = 0.5, w = 0.02) { return 1 - smooth(0, w, Math.abs(x - center)); }
export function capsule(px, py, ax, ay, bx, by, r) { const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay, t = clamp01((wx * vx + wy * vy) / Math.max(0.00001, vx * vx + vy * vy)); const dx = px - (ax + vx * t), dy = py - (ay + vy * t); return 1 - smooth(0, r, Math.hypot(dx, dy)); }
export function cellInfo(u, v, cells = 12, seed = 1) { const x = u * cells, y = v * cells, ix = Math.floor(x), iy = Math.floor(y); let best = 99, second = 99, id = 0, cxBest = 0, cyBest = 0; for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) { const cx = ix + ox + hash(ix + ox, iy + oy, seed); const cy = iy + oy + hash(ix + ox, iy + oy, seed + 4); const d = Math.hypot(x - cx, y - cy); if (d < best) { second = best; best = d; id = hash(ix + ox, iy + oy, seed + 9); cxBest = cx; cyBest = cy; } else if (d < second) second = d; } return { d: best, edge: second - best, id, cx: cxBest / cells, cy: cyBest / cells }; }
export function crystalMask(u, v, cells, seed) { const c = cellInfo(u, v, cells, seed); const boundary = 1 - smooth(0.012, 0.08, c.edge); const core = 1 - smooth(0.12, 0.48, c.d); return { ...c, boundary, core }; }
export function branchVeins(u, v, seed = 1) { let m = capsule(u, v, 0.5, 0.02, 0.5 + Math.sin(v * 8) * 0.045, 0.98, 0.035); for (let i = 0; i < 10; i++) { const y = 0.08 + i * 0.085, side = i % 2 ? -1 : 1, len = 0.22 + hash(i, 0, seed) * 0.25; m = Math.max(m, capsule(u, v, 0.5, y, 0.5 + side * len, y + 0.09 + hash(i, 2, seed) * 0.08, 0.012)); } return clamp01(m); }
export function threadWeave(u, v, density = 44, seed = 1) { const wu = fbm(u * 5, v * 8, seed) * 0.04, wv = fbm(u * 9, v * 5, seed + 2) * 0.04; const warp = stripe((u + wu) * density, 0.018); const weft = stripe((v + wv) * density * 0.7, 0.014); const over = hash(Math.floor(u * density), Math.floor(v * density * 0.7), seed + 8) > 0.5 ? warp : weft; return { warp, weft, over, weave: Math.max(warp, weft) * 0.75 + over * 0.25 };
}
export function crackNetwork(u, v, seed = 1, scale = 9) { const c = cellInfo(u, v, scale, seed); const edge = 1 - smooth(0.006, 0.04, c.edge); const hair = 1 - smooth(0.002, 0.018, Math.abs(Math.sin((u * 13 + v * 17 + fbm(u * 3, v * 3, seed)) * Math.PI))); return clamp01(edge * 0.85 + hair * 0.15); }
export function petalSdf(u, v, petals = 8, seed = 1) { const qx = fract(u * 2.8) - 0.5, qy = fract(v * 2.8) - 0.5, a = Math.atan2(qy, qx), r = Math.hypot(qx, qy); const star = Math.abs(Math.sin(a * petals + hash(Math.floor(u * 3), Math.floor(v * 3), seed))); return clamp01(star * (1 - smooth(0.14, 0.5, r))); }
export function potatoEyes(u, v, seed = 1) { const c = cellInfo(u, v, 10, seed); return (c.id > 0.48 && c.d < 0.13) ? 1 - smooth(0.025, 0.13, c.d) : 0; }
export function ringLayer(u, v, density = 12, warp = 0.08, seed = 1) { return stripe((u + fbm(u * 4, v * 4, seed) * warp) * density, 0.035); }
