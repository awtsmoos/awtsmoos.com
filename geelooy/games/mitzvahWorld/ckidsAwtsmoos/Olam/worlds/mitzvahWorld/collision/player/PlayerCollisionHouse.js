// B"H
/** @file PlayerCollisionHouse.js @description Capsule vs real cottage sidecar. */
import { ensureHouseCollisionWorld } from "../HouseCollisionWorld.js";
import { houseCollisionDisabled } from "./PlayerCollisionFlags.js?v=default-test-npcs-animals-20260702-bh1";

export function updateHouseFocus(olam, pos) {
  if (!houseCollisionDisabled(olam)) ensureHouseCollisionWorld(olam)?.index?.setPlayerPosition(pos.x, pos.z);
}

export function resolveHouseMovement(olam, player, radius) {
  if (houseCollisionDisabled(olam)) return { resolved:false, last:null };
  const c = player?.collider; if (!c?.start || !c?.end) return { resolved:false, last:null };
  const world = ensureHouseCollisionWorld(olam); if (!world?.colliders?.size) return { resolved:false, last:null };
  const hit = world.resolveCapsule(c, { radius }); if (!hit) return { resolved:false, last:world.lastCollision || null };
  const correction = hit.normal.clone().multiplyScalar(hit.depth); c.start.add(correction); c.end.add(correction);
  if (player.velocity) player.velocity.addScaledVector(hit.normal, -hit.normal.dot(player.velocity));
  return { resolved:true, last:world.lastCollision || null };
}
