// B"H
/** Grounding refuses jump arcs until descent is real and the feet are near earth. */
import { ensureGroundCollisionWorld } from "../GroundCollisionWorld.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const MIN_AIR_MS = 650, MIN_LAND_VY = -0.55, MAX_GROUND_GAP = 0.045, MAX_LIFT = 0.14;
function jumpAge(player) { return Date.now() - Number(player?.__jumpStartedAt || 0); }
function feetYOf(player) { const c = player?.collider; return c?.start ? c.start.y - finite(c.radius || player.radius, 0.45) : NaN; }
export function rising(player) {
  const vy = finite(player?.velocity?.y, 0);
  return vy > 0.05 || Date.now() < Number(player?.__jumpAirborneUntil || 0) || Boolean(player?.jumped && (jumpAge(player) < MIN_AIR_MS || vy > MIN_LAND_VY));
}
export function hitPayload(hit, c) {
  return { distance:c.start.y - hit.y, position:hit.point, normal:hit.normal, object:hit.object, meshGroundAuthority:!hit.fallback, fallback:hit.fallback, source:hit.source, surfaceKey:hit.surfaceKey || null, materialKey:hit.materialKey || null, biomeKey:hit.biomeKey || null, walkable:hit.walkable !== false, slopeDegrees:hit.slopeDegrees ?? null };
}
function acceptable(hit) { return hit && Number.isFinite(hit.y) && hit.walkable !== false && !hit.fallback; }
function stillAirborne(player, feetY, targetFeet) {
  const vy = finite(player?.velocity?.y, 0), gap = feetY - targetFeet;
  if (!player?.jumped) return false;
  if (jumpAge(player) < MIN_AIR_MS || vy > MIN_LAND_VY) return true;
  return gap > MAX_GROUND_GAP;
}
export function groundPlayer(olam, player, nearRadius, options = {}) {
  const c = player?.collider;
  if (!c?.start || !c?.end) return false;
  const radius = finite(c.radius || player.radius, 0.45), feetY = feetYOf(player);
  const hit = ensureGroundCollisionWorld(olam)?.groundAt?.(c.start.x, c.start.z, { fallback:feetY, radius:nearRadius, fallbackFn:options.fallbackFn });
  if (!acceptable(hit)) return { grounded:false, hit:null };
  const targetFeet = hit.y + finite(options.slack, 0.01), gap = feetY - targetFeet;
  if (!options.force && (rising(player) || stillAirborne(player, feetY, targetFeet))) {
    player.onFloor = player.grounded = player.isOnGround = false;
    player.__lastGroundRefusal = { at:Date.now(), reason:"jump-air", vy:finite(player.velocity?.y, 0), gap, age:jumpAge(player), minAirMs:MIN_AIR_MS };
    return { grounded:false, hit };
  }
  if (gap > MAX_GROUND_GAP && !(player.onFloor && Math.abs(gap) < 0.2)) return { grounded:false, hit };
  const lift = targetFeet - feetY;
  if (!Number.isFinite(lift) || Math.abs(lift) > MAX_LIFT) return { grounded:false, hit };
  c.start.y += lift; c.end.y += lift;
  if (player.velocity) player.velocity.y = 0;
  player.onFloor = player.grounded = player.isOnGround = true; player.jumped = false;
  player.groundHitResult = hitPayload(hit, c);
  player.__meshGroundAuthority = { at:Date.now(), groundY:hit.y, lift, source:hit.source, fallback:false, mesh:hit.mesh || null, walkable:true };
  return { grounded:true, hit };
}
