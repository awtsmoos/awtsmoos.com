// B"H
/** @file OctreeAcceptanceProbe.js @description Counts accepted collider bodies without guessing. */
export function probeOctreeAdd(olam, meshes = []) {
  const added = [], failed = [];
  for (const mesh of meshes) {
    try { const ok = Boolean(olam?.worldOctree?.addObject?.(mesh)); (ok ? added : failed).push(mesh?.name || "unnamed"); }
    catch (error) { failed.push(`${mesh?.name || "unnamed"}:${error.message}`); }
  }
  return { ok: failed.length === 0, added, failed, count: added.length };
}
export default { probeOctreeAdd };
