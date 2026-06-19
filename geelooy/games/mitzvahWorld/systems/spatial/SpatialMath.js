// B"H
/** Tiny spatial math vessels: no classes, no allocation storms, only numbers. */
export const tmpBox = () => ({ minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 });

export function boxFromCenter(center, radius, out = tmpBox()) {
  const x = Number(center?.x || center?.[0] || 0);
  const y = Number(center?.y || center?.[1] || 0);
  const z = Number(center?.z || center?.[2] || 0);
  out.minX = x - radius; out.maxX = x + radius;
  out.minY = y - radius; out.maxY = y + radius;
  out.minZ = z - radius; out.maxZ = z + radius;
  return out;
}

export function readBox(item, out = tmpBox()) {
  const b = item?.box || item?.bounds || item?.aabb || item;
  out.minX = Number(b.minX ?? b.min?.x ?? b[0] ?? 0);
  out.minY = Number(b.minY ?? b.min?.y ?? b[1] ?? 0);
  out.minZ = Number(b.minZ ?? b.min?.z ?? b[2] ?? 0);
  out.maxX = Number(b.maxX ?? b.max?.x ?? b[3] ?? out.minX);
  out.maxY = Number(b.maxY ?? b.max?.y ?? b[4] ?? out.minY);
  out.maxZ = Number(b.maxZ ?? b.max?.z ?? b[5] ?? out.minZ);
  return out;
}

export function intersects(a, b) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
}

export function containsBox(a, b) {
  return a.minX <= b.minX && a.maxX >= b.maxX && a.minY <= b.minY && a.maxY >= b.maxY && a.minZ <= b.minZ && a.maxZ >= b.maxZ;
}

export function hashCell(x, y, z) { return `${x}|${y}|${z}`; }
