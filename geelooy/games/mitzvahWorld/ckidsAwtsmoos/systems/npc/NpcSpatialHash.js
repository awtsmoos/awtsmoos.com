// B"H
/**
 * @file NpcSpatialHash.js
 * @description
 * NPC nearest lookup without sweeping the whole village. The Awtsmoos makes a
 * coarse grid, and the shliach asks only nearby cells who is close enough to
 * speak.
 */
import { getWorldInterestGrid } from "../../Olam/worlds/mitzvahWorld/runtime/WorldInterestGrid.js?compact=true&v=world-interest-20260621-bh1";
import { npcById } from "./NpcServiceRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const TTL = 360;
const pos = e => e?.mesh?.position || e?.position || null;
const idOf = e => e?.id || e?.name || e?.mesh?.name || e?.mesh?.userData?.npcId || null;
const serviceNpc = e => npcById(idOf(e));
function playerPosition(olam) { return olam?.player?.mesh?.position || olam?.chossid?.mesh?.position || olam?.camera?.position || null; }
function candidates(olam) { return (olam?.npcs || olam?.interactables || olam?.nivrayim || []).filter(e => serviceNpc(e)); }
function cacheKey(olam, range) { const p = playerPosition(olam); return `${Math.round((p?.x || 0) / 3)}:${Math.round((p?.z || 0) / 3)}:${range}:${candidates(olam).length}`; }

export function rebuildNpcSpatialHash(olam) {
  const grid = getWorldInterestGrid(olam, 18);
  grid.rebuild(candidates(olam));
  olam.__npcSpatialHashReport = { ...grid.report(), at:Date.now(), source:"npc-spatial-hash" };
  return grid;
}

export function nearestNpcBySpatialHash(olam, range = 9) {
  if (!olam) return null;
  const key = cacheKey(olam, range), now = Date.now();
  olam.__npcSpatialNearestCache ||= { key:null, at:0, value:null };
  if (olam.__npcSpatialNearestCache.key === key && now - olam.__npcSpatialNearestCache.at < TTL) return olam.__npcSpatialNearestCache.value;
  const grid = olam.__worldInterestGrid || rebuildNpcSpatialHash(olam), p = playerPosition(olam);
  let entity = grid.nearest(p, e => !!serviceNpc(e), range);
  if (!entity) { rebuildNpcSpatialHash(olam); entity = olam.__worldInterestGrid.nearest(p, e => !!serviceNpc(e), range); }
  const value = serviceNpc(entity);
  olam.__npcSpatialNearestCache = { key, at:now, value };
  return value;
}

export function markNpcSpatialDirty(olam) { if (olam) { olam.__npcSpatialNearestCache = null; rebuildNpcSpatialHash(olam); } }
export default { rebuildNpcSpatialHash, nearestNpcBySpatialHash, markNpcSpatialDirty };
