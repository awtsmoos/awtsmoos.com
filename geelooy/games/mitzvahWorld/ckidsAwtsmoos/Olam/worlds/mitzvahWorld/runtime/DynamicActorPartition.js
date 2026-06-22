// B"H
/**
 * @file DynamicActorPartition.js
 * @description
 * Time-phased actor scheduling with a per-frame budget. The Awtsmoos does not
 * demand that every fox, villager, bird, and wandering thought calculate in
 * the same breath. Nearby danger stays alive; far actors rotate through small
 * slices so the frame can keep singing.
 */
function now() {
  const perf = typeof globalThis !== "undefined" ? globalThis.performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
}

const ACTIVE = new Set(["chase", "windup", "strike", "recover", "attack", "flee", "fleePlayer"]);
const CADENCE = { critical: 1, near: 1, mid: 3, far: 10, sleep: 45 };
const DEFAULT_BUDGET = { critical: 999, near: 42, mid: 18, far: 8, sleep: 2 };

function phaseOf(actor) {
  if (Number.isInteger(actor.__partitionPhase)) return actor.__partitionPhase;
  const text = String(actor.id || actor.name || Math.random());
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  actor.__partitionPhase = Math.abs(hash) % 120;
  return actor.__partitionPhase;
}

function meshOf(actor) { return actor && actor.mesh ? actor.mesh : null; }
function positionOfActor(actor) { const mesh = meshOf(actor); return mesh ? mesh.position : null; }
function dist(position, player) { return position && player && typeof position.distanceTo === "function" ? position.distanceTo(player) : 0; }

export class DynamicActorPartition {
  constructor({ near = 48, mid = 120, far = 260, budget = DEFAULT_BUDGET } = {}) {
    this.near = near; this.mid = mid; this.far = far;
    this.budget = { ...DEFAULT_BUDGET, ...budget };
    this.stats = this.freshStats(0);
  }

  freshStats(epoch) {
    return { epoch, checks: 0, updated: 0, skipped: 0, capped: 0, raycasts: this?.stats?.raycasts || 0, byTier: {} };
  }

  configure(options = {}) {
    this.near = Number(options.near) || this.near;
    this.mid = Number(options.mid) || this.mid;
    this.far = Number(options.far) || this.far;
    if (options.budget) this.budget = { ...this.budget, ...options.budget };
    return this;
  }

  playerPosition(olam) {
    if (!olam) return null;
    if (olam.player?.mesh) return olam.player.mesh.position;
    if (olam.chossid?.mesh) return olam.chossid.mesh.position;
    return olam.camera?.position || null;
  }

  selected(olam) {
    if (!olam?.combatManager) return null;
    return olam.combatManager.targeting?.selected || olam.combatManager.selectedTarget || null;
  }

  tier(actor, olam) {
    const selected = this.selected(olam);
    if (ACTIVE.has(actor?.stateName) || selected === actor || meshOf(selected) === meshOf(actor)) return "critical";
    const position = positionOfActor(actor), player = this.playerPosition(olam);
    if (!position || !player) return "near";
    const d = dist(position, player);
    return d < this.near ? "near" : d < this.mid ? "mid" : d < this.far ? "far" : "sleep";
  }

  beginEpochIfNeeded() {
    const epoch = Math.floor(now() / 16.667);
    if (epoch !== this.stats.epoch) this.stats = this.freshStats(epoch);
    return epoch;
  }

  budgetAllows(tier) {
    this.stats.byTier[tier] ||= { checked: 0, updated: 0, skipped: 0, capped: 0 };
    const row = this.stats.byTier[tier];
    row.checked += 1;
    if (row.updated >= (this.budget[tier] ?? 8)) { row.capped += 1; this.stats.capped += 1; return false; }
    row.updated += 1;
    return true;
  }

  shouldUpdate(actor, olam) {
    const epoch = this.beginEpochIfNeeded();
    const tier = this.tier(actor, olam), phase = phaseOf(actor), cadence = CADENCE[tier] || 8;
    actor.__partitionTier = tier;
    this.stats.checks += 1;
    const scheduled = cadence === 1 || epoch % cadence === phase % cadence;
    if (!scheduled || !this.budgetAllows(tier)) {
      this.stats.skipped += 1;
      this.stats.byTier[tier] && (this.stats.byTier[tier].skipped += 1);
      return false;
    }
    this.stats.updated += 1;
    return true;
  }

  recordRaycast(count = 1) { this.stats.raycasts += count; }
}

export function getDynamicActorPartition(olam) {
  if (!olam.__dynamicActorPartition) olam.__dynamicActorPartition = new DynamicActorPartition();
  return olam.__dynamicActorPartition;
}
