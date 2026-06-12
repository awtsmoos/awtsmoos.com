/**
 * B"H
 * Wall-bounce helpers.
 *
 * Chapter 187: ricochet is not merely collision; it is combo texture. These
 * helpers expose wall-bounce tuning for AI and effects without duplicating the
 * swept collision resolver.
 */
export function wallBouncePower(f) {
  return Math.min(34, Math.max(8, Math.abs(f.vx || 0), Math.abs(f.vy || 0)) * 0.85 + (f.damage || 0) * 0.03);
}

export function isWallBounceStage(map) {
  return !!map.rules?.wallBounce || (map.walls || []).length > 0;
}

export function nearWall(f, map, margin = 150) {
  const walls = map.walls || [];
  return walls.some(w => Math.abs(f.x - w.x) < margin || Math.abs(f.x - (w.x + w.w)) < margin);
}
