// B"H
/**
 * @file brickWallGenerator.js
 * @description
 * Chapter 313: The mortar is not emptiness.
 *
 * The Awtsmoos reveals a wall as one breath: a hidden mortar body fills the
 * whole span, then every brick rises out from it with small depth variation.
 * There are no sky-holes between stones, no mesh-per-brick objects, and no
 * brick-picture painted onto a brick. Each cuboid is a real stone in one buffer.
 */
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash = (a, b, c = 1) => {
  const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return x - Math.floor(x);
};

function rgb(hex = 0xffffff) {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}
function shadeColor(hex, row, col) {
  const s = 0.9 + hash(row, col, 91) * 0.2;
  return rgb(hex).map(v => clamp(v * s, 0, 1));
}
function pickColor(row, col, palette = [0xffffff]) {
  const hex = palette[Math.abs((row * 7 + col * 11) % palette.length)] || palette[0] || 0xffffff;
  return shadeColor(hex, row, col);
}
function cutsAtY(y, openings = []) {
  return openings.filter(o => y >= n(o.yMin) && y <= n(o.yMax)).map(o => [n(o.xMin), n(o.xMax)]).sort((a, b) => a[0] - b[0]);
}
function intervals(xMin, xMax, cuts) {
  let cursor = xMin;
  const all = [];
  for (const [a, b] of cuts) {
    const start = clamp(a, xMin, xMax), end = clamp(b, xMin, xMax);
    if (start > cursor) all.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < xMax) all.push([cursor, xMax]);
  return all;
}
function v(out, x, y, z, nx, ny, nz, u, vv, color) {
  out.positions.push(x, y, z); out.normals.push(nx, ny, nz); out.uvs.push(u, vv); out.colors.push(...color);
}
function face(out, pts, normal, color) {
  const base = out.positions.length / 3;
  [[0, 0], [1, 0], [1, 1], [0, 1]].forEach((uv, i) => v(out, ...pts[i], ...normal, ...uv, color));
  out.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
function localBounds(span, x0, x1, y0, y1, depth, zOffset = 0) {
  const faceName = span.face || "front", x = n(span.x), z = n(span.z);
  if (faceName === "left" || faceName === "right") return { x0: x - depth / 2, x1: x + depth / 2, y0, y1, z0: x0 + zOffset, z1: x1 + zOffset };
  return { x0, x1, y0, y1, z0: z - depth / 2 + zOffset, z1: z + depth / 2 + zOffset };
}
function box(out, b, color) {
  const { x0, x1, y0, y1, z0, z1 } = b;
  face(out, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0], color);
  face(out, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], color);
  face(out, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, 1, 0], color);
  face(out, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0], color);
  face(out, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], color);
  face(out, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1], color);
}
function pushBacking(out, span) {
  const depth = n(span.mortarDepth, n(span.depth, 0.16) * 0.55);
  box(out, localBounds(span, n(span.xMin), n(span.xMax), n(span.yMin), n(span.yMax, 1), depth), rgb(span.mortarColor || 0x9e947c));
}
function rowSegments(span, row, y) {
  const brickW = n(span.brickW, 0.28), xMin = n(span.xMin), xMax = n(span.xMax);
  const pieces = [];
  for (const [a, b] of intervals(xMin, xMax, cutsAtY(y, span.openings || []))) {
    const start = row % 2 ? a - brickW / 2 : a;
    for (let x = start, guard = 0; x < b && guard++ < 1000; x += brickW) {
      const left = Math.max(a, x), right = Math.min(b, x + brickW);
      if (right - left > brickW * 0.14) pieces.push([left, right]);
    }
  }
  return pieces;
}
function pushBricks(out, span) {
  const yMin = n(span.yMin), yMax = n(span.yMax, 1), brickH = n(span.brickH, 0.12);
  const gap = n(span.mortarGap, 0.012), depth = n(span.depth, 0.16), rows = Math.ceil((yMax - yMin) / brickH);
  for (let row = 0; row < rows; row += 1) {
    const y0 = yMin + row * brickH, y1 = Math.min(yMax, y0 + brickH), yc = (y0 + y1) / 2;
    for (const [a, b] of rowSegments(span, row, yc)) {
      const col = Math.floor((a - n(span.xMin)) / n(span.brickW, 0.28));
      const inset = Math.min(gap, Math.max(0, (b - a) * 0.18), Math.max(0, (y1 - y0) * 0.25));
      const push = n(span.protrude, 0.035) * (0.35 + hash(row, col, 14));
      const bounds = localBounds(span, a + inset, b - inset, y0 + inset, y1 - inset, depth + push, push * 0.5);
      box(out, bounds, pickColor(row, col, span.palette));
      out.bricks += 1;
    }
  }
}
export function buildBrickWallRenderData(structure = {}) {
  const out = { positions: [], normals: [], uvs: [], colors: [], indices: [], bricks: 0 };
  for (const span of structure.spans || []) { pushBacking(out, span); pushBricks(out, span); }
  return out;
}
export default buildBrickWallRenderData;
