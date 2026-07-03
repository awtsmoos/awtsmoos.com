// B"H
/** @file PlayerCollisionGround.js @description Grounding that respects the upward jump breath. */
import { ensureGroundCollisionWorld } from "../GroundCollisionWorld.js";
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export function rising(player) { const vy = finite(player?.velocity?.y, 0); return vy > 0.05 || (player?.jumped && !player?.onFloor && vy > -0.01); }
export function hitPayload(hit, c) { return { distance:c.start.y - hit.y, position:hit.point, normal:hit.normal, object:hit.object, meshGroundAuthority:hit.source === "mesh" || hit.source === "flat-test-ground", fallback:hit.fallback, source:hit.source, surfaceKey:hit.surfaceKey || null, materialKey:hit.materialKey || null, biomeKey:hit.biomeKey || null, walkable:hit.walkable !== false, slopeDegrees:hit.slopeDegrees ?? null }; }
export function groundPlayer(olam, player, nearRadius, options = {}) {
  const c = player?.collider; if (!c?.start || !c?.end) return false;
  if (!options.force && rising(player)) { player.onFloor = false; player.grounded = false; player.isOnGround = false; return false; }
  const radius = finite(c.radius || player.radius, 0.45), feetY = c.start.y - radius;
  const hit = ensureGroundCollisionWorld(olam)?.groundAt(c.start.x, c.start.z, { fallback:feetY, radius:nearRadius, fallbackFn:options.fallbackFn });
  if (!hit || !Number.isFinite(hit.y) || hit.walkable === false) return { grounded:false, hit:null };
  const targetFeet = hit.y + finite(options.slack, 0.01);
  if (feetY >= targetFeet && !(player.onFloor && Math.abs(feetY - targetFeet) < 1.25)) return { grounded:false, hit };
  const lift = targetFeet - feetY; if (!Number.isFinite(lift) || Math.abs(lift) > 30) return { grounded:false, hit };
  c.start.y += lift; c.end.y += lift; if (player.velocity) player.velocity.y = Math.max(0, finite(player.velocity.y));
  player.onFloor = true; player.grounded = true; player.isOnGround = true; player.groundHitResult = hitPayload(hit, c);
  player.__meshGroundAuthority = { at:Date.now(), groundY:hit.y, lift, source:hit.source, fallback:hit.fallback, mesh:hit.mesh || null, walkable:hit.walkable !== false };
  return { grounded:true, hit };
}
