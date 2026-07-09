// B"H
/**
 * Current player collision bubble: tight body radius, broad ground radius.
 * The old 9m player radius made the Chossid strike invisible walls. Now the
 * body is near the capsule, while terrain still samples a forgiving nearby ray.
 */
import CollisionBudget from "./CollisionBudget.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureGroundCollisionWorld } from "./GroundCollisionWorld.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureHouseCollisionWorld } from "./HouseCollisionWorld.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { houseCollisionDisabled } from "./player/PlayerCollisionFlags.js?compact=true&v=perf-tight-collision-20260703-bh2";
import { groundPlayer, hitPayload, rising } from "./player/PlayerCollisionGround.js?compact=true&v=perf-tight-collision-20260703-bh2";
import { resolveHouseMovement, updateHouseFocus } from "./player/PlayerCollisionHouse.js?compact=true&v=perf-tight-collision-20260703-bh2";
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function bodyRadius(player, fallback) {
  return Math.max(0.32, Math.min(0.82, finite(player?.collider?.radius, finite(player?.radius, fallback))));
}
export default class PlayerCollisionBubble {
  constructor(olam, options = {}) {
    this.olam = olam || null;
    this.radius = Math.max(0.32, Math.min(0.82, finite(options.radius, 0.48)));
    this.nearRadius = Math.max(2, finite(options.nearRadius, 5));
    this.villageRadius = Math.max(this.nearRadius, finite(options.villageRadius, 36));
    this.visualRadius = Math.max(this.villageRadius, finite(options.visualRadius, 96));
    this.budget = options.budget || new CollisionBudget({ frameBudgetMs:finite(options.frameBudgetMs, 1.2) });
    this.lastGround = null; this.lastHouse = null; this.frames = 0;
  }
  updateFromPlayer(player) {
    const pos = player?.collider?.start || player?.mesh?.position || player?.position; if (!pos) return null;
    ensureGroundCollisionWorld(this.olam)?.index?.setPlayerPosition(pos.x, pos.z);
    updateHouseFocus(this.olam, pos); return pos;
  }
  groundPlayer(player, options = {}) {
    const result = groundPlayer(this.olam, player, this.nearRadius, options);
    if (result && typeof result === "object") { this.lastGround = result.hit || null; return Boolean(result.grounded); }
    this.lastGround = null; return Boolean(result);
  }
  resolveMovement(player) {
    const result = resolveHouseMovement(this.olam, player, bodyRadius(player, this.radius));
    this.lastHouse = result.last; return Boolean(result.resolved);
  }
  frame(player, options = {}) {
    this.frames++; this.budget.beginFrame(); this.updateFromPlayer(player);
    const houseResolved = this.budget.measure("house", () => this.resolveMovement(player));
    const grounded = this.budget.measure("ground", () => this.groundPlayer(player, options));
    this.budget.endFrame({ houseResolved, grounded, jumpRising:rising(player) }); return { houseResolved, grounded };
  }
  diag() {
    const ground = ensureGroundCollisionWorld(this.olam), houses = houseCollisionDisabled(this.olam) ? null : ensureHouseCollisionWorld(this.olam);
    return { radius:this.radius, layers:{ player:this.radius, near:this.nearRadius, village:this.villageRadius, visual:this.visualRadius, dormant:Infinity }, frames:this.frames, terrainMeshes:ground?.meshes?.size || 0, houseColliders:houses?.colliders?.size || 0, lastGround:this.lastGround ? hitPayload(this.lastGround, { start:{ y:this.lastGround.y } }) : null, lastHouse:this.lastHouse, budget:this.budget.diag(), flatHits:ground?.flatHits || 0, skipHouseCollision:houseCollisionDisabled(this.olam), seal:"tight-player-house-radius-bh1" };
  }
}
export function ensurePlayerCollisionBubble(olam) { if (!olam) return null; if (!olam.__awtsmoosPlayerCollisionBubble) olam.__awtsmoosPlayerCollisionBubble = new PlayerCollisionBubble(olam); return olam.__awtsmoosPlayerCollisionBubble; }
