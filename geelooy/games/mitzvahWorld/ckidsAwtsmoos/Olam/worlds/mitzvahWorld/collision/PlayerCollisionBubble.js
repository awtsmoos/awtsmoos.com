// B"H
/**
 * @file PlayerCollisionBubble.js
 * @description Split capsule authority for the current player: house sidecar,
 * ground authority, and diagnostics are now separate vessels.
 */
import CollisionBudget from "./CollisionBudget.js";
import { ensureGroundCollisionWorld } from "./GroundCollisionWorld.js";
import { ensureHouseCollisionWorld } from "./HouseCollisionWorld.js";
import { houseCollisionDisabled } from "./player/PlayerCollisionFlags.js?v=default-test-npcs-animals-20260702-bh1";
import { groundPlayer, hitPayload, rising } from "./player/PlayerCollisionGround.js?v=default-test-npcs-animals-20260702-bh1";
import { resolveHouseMovement, updateHouseFocus } from "./player/PlayerCollisionHouse.js?v=default-test-npcs-animals-20260702-bh1";

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

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
    updateHouseFocus(this.olam, pos); return pos;
  }
  groundPlayer(player, options = {}) {
    const result = groundPlayer(this.olam, player, this.nearRadius, options);
    if (result && typeof result === "object") { this.lastGround = result.hit || null; return Boolean(result.grounded); }
    this.lastGround = null; return Boolean(result);
  }
  resolveMovement(player) {
    const result = resolveHouseMovement(this.olam, player, this.radius);
    this.lastHouse = result.last; return Boolean(result.resolved);
  }
  frame(player, options = {}) {
    this.frames += 1; this.budget.beginFrame(); this.updateFromPlayer(player);
    const houseResolved = this.budget.measure("house", () => this.resolveMovement(player));
    const grounded = this.budget.measure("ground", () => this.groundPlayer(player, options));
    this.budget.endFrame({ houseResolved, grounded, jumpRising:rising(player) }); return { houseResolved, grounded };
  }
  diag() {
    const ground = ensureGroundCollisionWorld(this.olam), houses = houseCollisionDisabled(this.olam) ? null : ensureHouseCollisionWorld(this.olam);
    return { radius:this.radius, layers:{ player:this.radius, near:this.nearRadius, village:this.villageRadius, visual:this.visualRadius, dormant:Infinity }, frames:this.frames, terrainMeshes:ground?.meshes?.size || 0, houseColliders:houses?.colliders?.size || 0, lastGround:this.lastGround ? hitPayload(this.lastGround, { start:{ y:this.lastGround.y } }) : null, lastHouse:this.lastHouse, budget:this.budget.diag(), flatHits:ground?.flatHits || 0, skipHouseCollision:houseCollisionDisabled(this.olam) };
  }
}
export function ensurePlayerCollisionBubble(olam) { if (!olam) return null; if (!olam.__awtsmoosPlayerCollisionBubble) olam.__awtsmoosPlayerCollisionBubble = new PlayerCollisionBubble(olam); return olam.__awtsmoosPlayerCollisionBubble; }
