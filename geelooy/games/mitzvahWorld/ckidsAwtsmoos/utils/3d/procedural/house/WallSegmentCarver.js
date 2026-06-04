// B"H
/**
 * @module WallSegmentCarver
 * @description
 * Chapter 328: Bricks without betrayal.
 *
 * The Awtsmoos now separates a wall into deterministic brick vessels. Each brick
 * is a real box in the final merged BufferGeometry, slightly overlapping its
 * neighbors so no sky leaks through. Door holes are skipped by interval math,
 * not by visual guessing. Collision will use a different clean slab path.
 */
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash = (a, b, c) => {
  const x = Math.sin(a * 37.17 + b * 91.41 + c * 13.33) * 43758.5453;
  return x - Math.floor(x);
};

function normalizedHoles(wallWidth, holes) {
  return [...holes].map(hole => {
    const width = n(hole.width, 4) + 0.44;
    const height = n(hole.height, 5.5) + 0.18;
    const center = n(hole.offset, 0);
    const minX = center - width * 0.5;
    const maxX = center + width * 0.5;
    return { minX, maxX, minY: 0, maxY: height + 0.5 };
  }).sort((a, b) => a.minX - b.minX);
}
function overlapsHole(cx, cy, bw, bh, holes) {
  const minX = cx - bw * 0.5, maxX = cx + bw * 0.5;
  const minY = cy - bh * 0.5, maxY = cy + bh * 0.5;
  return holes.some(h => maxX > h.minX && minX < h.maxX && maxY > h.minY && minY < h.maxY);
}
function segmentMods(localX, localY, localZ, rotY, pos) {
  const mods = [{ type: 'translate', x: localX, y: localY, z: localZ }];
  if (rotY) mods.push({ type: 'rotateY', angle: rotY });
  mods.push({ type: 'translate', ...pos });
  return mods;
}
function pushBrick(out, cfg) {
  out.push({
    type: 'box',
    params: { width: cfg.w, height: cfg.h, depth: cfg.d },
    modifiers: segmentMods(cfg.x, cfg.y, cfg.z, cfg.rotY, cfg.pos),
    materialGroup: 0
  });
}

export default class WallSegmentCarver {
  /** Emits one merged visual brick wall with mathematically carved holes. */
  static carve({ wallWidth, wallHeight, thickness, holes, rotY, pos, out }) {
    const brickH = 0.42;
    const brickLong = 1.18;
    const overlap = 0.035;
    const rows = Math.ceil(wallHeight / brickH);
    const cutouts = normalizedHoles(wallWidth, holes || []);
    for (let row = 0; row < rows; row += 1) {
      const y0 = row * brickH;
      const h = Math.min(brickH + overlap, wallHeight - y0 + overlap);
      const cy = y0 + h * 0.5 - overlap * 0.5;
      const offset = row % 2 ? brickLong * 0.5 : 0;
      let x = -wallWidth * 0.5 - offset;
      let col = 0;
      while (x < wallWidth * 0.5) {
        const left = Math.max(-wallWidth * 0.5, x);
        const right = Math.min(wallWidth * 0.5, x + brickLong);
        const w = right - left + overlap;
        const cx = (left + right) * 0.5;
        if (w > 0.12 && !overlapsHole(cx, cy, w, h, cutouts)) {
          const seed = hash(row, col, wallWidth);
          pushBrick(out, {
            w, h,
            d: thickness + 0.025 + seed * 0.16,
            x: cx,
            y: cy,
            z: (seed - 0.5) * 0.045,
            rotY,
            pos
          });
        }
        x += brickLong;
        col += 1;
      }
    }
  }

  /** Emits clean invisible collider slabs with the same carved holes. */
  static carveCollider({ wallWidth, wallHeight, thickness, holes, rotY, pos, out }) {
    let cursor = -wallWidth * 0.5;
    for (const hole of normalizedHoles(wallWidth, holes || [])) {
      const left = clamp(hole.minX, -wallWidth * 0.5, wallWidth * 0.5);
      const right = clamp(hole.maxX, -wallWidth * 0.5, wallWidth * 0.5);
      if (left > cursor) WallSegmentCarver._slab(out, cursor, left, wallHeight, thickness, rotY, pos);
      const lintelH = wallHeight - hole.maxY;
      if (lintelH > 0.2) {
        out.push({
          type: 'box',
          params: { width: Math.max(0.1, right - left), height: lintelH, depth: thickness },
          modifiers: segmentMods((left + right) * 0.5, hole.maxY + lintelH * 0.5, 0, rotY, pos),
          materialGroup: 4
        });
      }
      cursor = Math.max(cursor, right);
    }
    if (cursor < wallWidth * 0.5) WallSegmentCarver._slab(out, cursor, wallWidth * 0.5, wallHeight, thickness, rotY, pos);
  }

  static _slab(out, left, right, height, depth, rotY, pos) {
    out.push({
      type: 'box',
      params: { width: right - left, height, depth },
      modifiers: segmentMods((left + right) * 0.5, height * 0.5, 0, rotY, pos),
      materialGroup: 4
    });
  }
}
