// B"H
/**
 * @file WorldInterestScheduler.js
 * @description
 * Central permission oracle for less per-frame work. The Awtsmoos does not ask
 * every NPC, animal, marker, and scroll to awaken in one frame. Critical beings
 * speak now; near beings breathe often; far beings dream in staggered slices.
 */
const DEFAULTS = Object.freeze({ critical:999, near:28, mid:10, far:4, sleep:1, ui:6, social:5 });
const CADENCE = Object.freeze({ critical:1, near:1, mid:4, far:14, sleep:60 });
const pos = e => e?.mesh?.position || e?.position || null;
const now = () => globalThis.performance?.now?.() || Date.now();
function phase(entity) { if (Number.isInteger(entity.__interestPhase)) return entity.__interestPhase; const s = String(entity.id || entity.name || Math.random()); let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); entity.__interestPhase = Math.abs(h) % 240; return entity.__interestPhase; }

export class WorldInterestScheduler {
  constructor(options = {}) { this.budget = { ...DEFAULTS, ...(options.budget || {}) }; this.near = options.near || 48; this.mid = options.mid || 120; this.far = options.far || 260; this.epoch = -1; this.dirty = new Set(); this.stats = this.fresh(0); }
  fresh(epoch) { return { epoch, checked:0, allowed:0, skipped:0, dirty:0, capped:0, byTier:{}, bySubsystem:{} }; }
  begin() { const epoch = Math.floor(now() / 16.667); if (epoch !== this.epoch) { this.epoch = epoch; this.stats = this.fresh(epoch); } return epoch; }
  markDirty(key) { this.dirty.add(String(key)); this.stats.dirty = this.dirty.size; }
  clearDirty(key) { this.dirty.delete(String(key)); }
  isDirty(key) { return this.dirty.has(String(key)); }
  playerPosition(olam) { return olam?.player?.mesh?.position || olam?.chossid?.mesh?.position || olam?.camera?.position || null; }
  selected(olam) { return olam?.combatManager?.targeting?.selected || olam?.combatManager?.selectedTarget || olam?.__selectedNpc || null; }
  tier(entity, olam) { if (!entity) return "sleep"; const selected = this.selected(olam); if (selected === entity || selected?.mesh === entity?.mesh || entity.__critical || entity.userData?.critical) return "critical"; if (this.isDirty(entity.id || entity.name || entity.mesh?.name)) return "critical"; const a = pos(entity), b = this.playerPosition(olam); if (!a || !b || typeof a.distanceTo !== "function") return "near"; const d = a.distanceTo(b); return d < this.near ? "near" : d < this.mid ? "mid" : d < this.far ? "far" : "sleep"; }
  row(map, key) { map[key] ||= { checked:0, allowed:0, skipped:0, capped:0 }; return map[key]; }
  allow(entity, olam, subsystem = "main") { const epoch = this.begin(), tier = this.tier(entity, olam), cadence = CADENCE[tier] || 12, scheduled = cadence === 1 || epoch % cadence === phase(entity) % cadence; const trow = this.row(this.stats.byTier, tier), srow = this.row(this.stats.bySubsystem, subsystem); this.stats.checked++; trow.checked++; srow.checked++; if (!scheduled) { this.stats.skipped++; trow.skipped++; srow.skipped++; return false; } const limit = this.budget[subsystem] ?? this.budget[tier] ?? 4; if (srow.allowed >= limit) { this.stats.capped++; trow.capped++; srow.capped++; return false; } this.stats.allowed++; trow.allowed++; srow.allowed++; return true; }
  animationLevel(entity, olam) { const tier = this.tier(entity, olam); return tier === "critical" || tier === "near" ? "full" : tier === "mid" ? "medium" : tier === "far" ? "low" : "frozen"; }
  report() { return { near:this.near, mid:this.mid, far:this.far, budget:this.budget, dirty:this.dirty.size, stats:this.stats }; }
}
export function getWorldInterestScheduler(olam, options = {}) { olam.__worldInterestScheduler ||= new WorldInterestScheduler(options); return olam.__worldInterestScheduler; }
export default WorldInterestScheduler;
