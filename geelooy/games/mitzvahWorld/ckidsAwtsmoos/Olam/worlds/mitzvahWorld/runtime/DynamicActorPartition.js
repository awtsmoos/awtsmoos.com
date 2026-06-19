// B"H
/** @file DynamicActorPartition.js @description Time-phased actor scheduling without optional-chain or logical-assignment syntax. */
function now() { const perf = typeof globalThis !== "undefined" ? globalThis.performance : null; return perf && typeof perf.now === "function" ? perf.now() : Date.now(); }
const ACTIVE = new Set(["chase", "windup", "strike", "recover", "attack", "flee", "fleePlayer"]);
function phaseOf(actor) { if (Number.isInteger(actor.__partitionPhase)) return actor.__partitionPhase; const text = String(actor.id || actor.name || Math.random()); let hash = 2166136261; for (let i=0;i<text.length;i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619); actor.__partitionPhase = Math.abs(hash) % 120; return actor.__partitionPhase; }
function meshOf(actor) { return actor && actor.mesh ? actor.mesh : null; }
function positionOfActor(actor) { const mesh = meshOf(actor); return mesh ? mesh.position : null; }
export class DynamicActorPartition {
  constructor({ near = 48, mid = 120, far = 260 } = {}) { this.near = near; this.mid = mid; this.far = far; this.stats = { epoch:0, checks:0, updated:0, skipped:0, raycasts:0 }; }
  configure(options = {}) { this.near = Number(options.near) || this.near; this.mid = Number(options.mid) || this.mid; this.far = Number(options.far) || this.far; return this; }
  playerPosition(olam) { if (!olam) return null; if (olam.player && olam.player.mesh) return olam.player.mesh.position; if (olam.chossid && olam.chossid.mesh) return olam.chossid.mesh.position; if (olam.camera) return olam.camera.position; return null; }
  selected(olam) { if (!olam || !olam.combatManager) return null; if (olam.combatManager.targeting && olam.combatManager.targeting.selected) return olam.combatManager.targeting.selected; return olam.combatManager.selectedTarget || null; }
  tier(actor, olam) { const selected = this.selected(olam); if (ACTIVE.has(actor && actor.stateName) || selected === actor || meshOf(selected) === meshOf(actor)) return "critical"; const position = positionOfActor(actor), player = this.playerPosition(olam); if (!position || !player) return "near"; const distance = position.distanceTo(player); return distance < this.near ? "near" : distance < this.mid ? "mid" : distance < this.far ? "far" : "sleep"; }
  shouldUpdate(actor, olam) { const epoch = Math.floor(now() / 16.667); if (epoch !== this.stats.epoch) this.stats = { epoch, checks:0, updated:0, skipped:0, raycasts:this.stats.raycasts || 0 }; const tier = this.tier(actor, olam), phase = phaseOf(actor); actor.__partitionTier = tier; const cadence = { critical:1, near:1, mid:2, far:8, sleep:30 }[tier]; const update = cadence === 1 || epoch % cadence === phase % cadence; this.stats.checks += 1; if (update) this.stats.updated += 1; else this.stats.skipped += 1; return update; }
  recordRaycast(count = 1) { this.stats.raycasts += count; }
}
export function getDynamicActorPartition(olam) { if (!olam.__dynamicActorPartition) olam.__dynamicActorPartition = new DynamicActorPartition(); return olam.__dynamicActorPartition; }
