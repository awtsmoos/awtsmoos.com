// B"H
/**
 * @file PlayerCollisionBubble.js
 * @description Layer-0 player capsule authority for real mesh collision.
 */
import CollisionBudget from "./CollisionBudget.js";
import { ensureGroundCollisionWorld } from "./GroundCollisionWorld.js";
import { ensureHouseCollisionWorld } from "./HouseCollisionWorld.js";
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function hitPayload(hit, c) {
  return { distance:c.start.y - hit.y, position:hit.point, normal:hit.normal, object:hit.object,
    meshGroundAuthority:hit.source === "mesh", fallback:hit.fallback, source:hit.source,
    surfaceKey:hit.surfaceKey || null, materialKey:hit.materialKey || null,
    biomeKey:hit.biomeKey || null, walkable:hit.walkable !== false, slopeDegrees:hit.slopeDegrees ?? null };
}
function authorityPayload(hit, lift) {
  return { at:Date.now(), groundY:hit.y, lift, source:hit.source, fallback:hit.fallback,
    mesh:hit.mesh || null, surfaceKey:hit.surfaceKey || null, materialKey:hit.materialKey || null,
    biomeKey:hit.biomeKey || null, walkable:hit.walkable !== false };
}
/**
 * Purpose: keep the player capsule reconciled against nearby collision layers.
 * Owner: live player physics wrapper.
 * Inputs: player collider, registered ground mesh world, house collider world.
 * Outputs: grounded capsule position and diagnostic hit records.
 * Runtime authority: writes capsule correction only after real collision hits.
 * Failure modes: missing mesh can fall back only with explicit fallback:true.
 */
export default class PlayerCollisionBubble {
  constructor(olam, options = {}) {
    this.olam = olam || null; this.radius = Math.max(1, finite(options.radius, 9));
    this.nearRadius = Math.max(this.radius, finite(options.nearRadius, 28));
    this.villageRadius = Math.max(this.nearRadius, finite(options.villageRadius, 72));
    this.visualRadius = Math.max(this.villageRadius, finite(options.visualRadius, 160));
    this.budget = options.budget || new CollisionBudget({ frameBudgetMs:finite(options.frameBudgetMs, 2.5) });
    this.lastGround = null; this.lastHouse = null; this.frames = 0;
  }
  updateFromPlayer(player) {
    const pos = player?.collider?.start || player?.mesh?.position || player?.position; if (!pos) return null;
    ensureGroundCollisionWorld(this.olam)?.index?.setPlayerPosition(pos.x, pos.z);
    ensureHouseCollisionWorld(this.olam)?.index?.setPlayerPosition(pos.x, pos.z); return pos;
  }
  groundPlayer(player, options = {}) {
    const c = player?.collider; if (!c?.start || !c?.end) return false;
    const radius = finite(c.radius || player.radius, 0.45), feetY = c.start.y - radius;
    const hit = ensureGroundCollisionWorld(this.olam)?.groundAt(c.start.x, c.start.z, { fallback:feetY, radius:this.nearRadius, fallbackFn:options.fallbackFn });
    this.lastGround = hit || null; if (!hit || !Number.isFinite(hit.y) || hit.walkable === false) return false;
    const targetFeet = hit.y + finite(options.slack, 0.025);
    if (feetY >= targetFeet && !(player.onFloor && Math.abs(feetY - targetFeet) < 1.25)) return false;
    const lift = targetFeet - feetY; if (!Number.isFinite(lift) || Math.abs(lift) > 30) return false;
    c.start.y += lift; c.end.y += lift; if (player.velocity) player.velocity.y = Math.max(0, finite(player.velocity.y));
    player.onFloor = true; player.grounded = true; player.isOnGround = true;
    player.groundHitResult = hitPayload(hit, c); player.__meshGroundAuthority = authorityPayload(hit, lift); return true;
  }
  resolveMovement(player) {
    const c = player?.collider; if (!c?.start || !c?.end) return false;
    const hit = ensureHouseCollisionWorld(this.olam)?.resolveCapsule(c, { radius:this.radius }); if (!hit) return false;
    const correction = hit.normal.clone().multiplyScalar(hit.depth); c.start.add(correction); c.end.add(correction);
    if (player.velocity) player.velocity.addScaledVector(hit.normal, -hit.normal.dot(player.velocity)); this.lastHouse = ensureHouseCollisionWorld(this.olam).lastCollision; return true;
  }
  frame(player, options = {}) { this.frames += 1; this.budget.beginFrame(); this.updateFromPlayer(player); const houseResolved = this.budget.measure("house", () => this.resolveMovement(player)); const grounded = this.budget.measure("ground", () => this.groundPlayer(player, options)); this.budget.endFrame({ houseResolved, grounded }); return { houseResolved, grounded }; }
  diag() { const ground = ensureGroundCollisionWorld(this.olam), houses = ensureHouseCollisionWorld(this.olam); return { radius:this.radius, layers:{ player:this.radius, near:this.nearRadius, village:this.villageRadius, visual:this.visualRadius, dormant:Infinity }, frames:this.frames, terrainMeshes:ground?.meshes?.size || 0, houseColliders:houses?.colliders?.size || 0, lastGround:this.lastGround ? hitPayload(this.lastGround, { start:{ y:this.lastGround.y } }) : null, lastHouse:this.lastHouse, budget:this.budget.diag() }; }
}
export function ensurePlayerCollisionBubble(olam) { if (!olam) return null; if (!olam.__awtsmoosPlayerCollisionBubble) olam.__awtsmoosPlayerCollisionBubble = new PlayerCollisionBubble(olam); return olam.__awtsmoosPlayerCollisionBubble; }
