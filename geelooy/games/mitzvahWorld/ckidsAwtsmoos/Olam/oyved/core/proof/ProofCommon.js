// B"H
/**
 * B"H
 *
 * Proof common helpers are small measuring tools for a living world. They move
 * the player only when a proof must touch something directly, then restore the
 * place so the test leaves as little footprint as possible.
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export const cloneVec = v => v ? { x:n(v.x), y:n(v.y), z:n(v.z) } : null;
export const distance = (a, b) => a && b ? Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y), n(a.z) - n(b.z)) : Infinity;

export function player(olam) { return olam?.player || olam?.chossid || null; }
export function pos(entity) { return entity?.mesh?.position || entity?.modelMesh?.position || entity?.position || null; }

export function setPlayerNear(olam, target, offset = { x:1.2, y:0, z:1.2 }) {
  const p = player(olam), pp = pos(p), tp = pos(target);
  if (!p || !pp || !tp) return null;
  const before = cloneVec(pp);
  if (typeof p.setPosition === "function") p.setPosition({ x:tp.x + offset.x, y:tp.y + offset.y, z:tp.z + offset.z });
  else pp.set(tp.x + offset.x, tp.y + offset.y, tp.z + offset.z);
  p.mesh?.position?.set?.(tp.x + offset.x, tp.y + offset.y, tp.z + offset.z);
  return before;
}

export function restorePlayer(olam, before) {
  const p = player(olam);
  if (!p || !before) return false;
  if (typeof p.setPosition === "function") p.setPosition(before);
  else p.mesh?.position?.set?.(before.x, before.y, before.z);
  return true;
}

export function animals(olam) {
  return Array.from(olam?.__livingRegionWildlifeRoot?.children || []).filter(a => a?.userData?.motion);
}
