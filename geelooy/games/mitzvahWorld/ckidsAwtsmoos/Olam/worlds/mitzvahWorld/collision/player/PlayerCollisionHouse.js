// B"H
/** Tight house sidecar lookup: query only near the actual body. */
import { ensureHouseCollisionWorld } from "../HouseCollisionWorld.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { houseCollisionDisabled } from "./PlayerCollisionFlags.js?compact=true&v=perf-tight-collision-20260703-bh2";
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
export function updateHouseFocus(olam, pos) {
  if (!houseCollisionDisabled(olam)) ensureHouseCollisionWorld(olam)?.index?.setPlayerPosition(pos.x, pos.z);
}
export function resolveHouseMovement(olam, player, radius) {
  if (houseCollisionDisabled(olam)) return { resolved:false, last:null };
  const c = player?.collider; if (!c?.start || !c?.end) return { resolved:false, last:null };
  const world = ensureHouseCollisionWorld(olam); if (!world?.colliders?.size) return { resolved:false, last:null };
  const tightRadius = Math.max(0.32, Math.min(0.82, num(radius, c.radius || 0.48)));
  const hit = world.resolveCapsule(c, { radius:tightRadius, queryRadius:tightRadius + 1.1 });
  if (!hit) return { resolved:false, last:world.lastCollision || null };
  const correction = hit.normal.clone().multiplyScalar(Math.min(hit.depth, tightRadius * 1.3));
  c.start.add(correction); c.end.add(correction);
  if (player.velocity) player.velocity.addScaledVector(hit.normal, -hit.normal.dot(player.velocity));
  return { resolved:true, last:world.lastCollision || null };
}
