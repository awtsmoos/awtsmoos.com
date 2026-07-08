// B"H
/** @file AggroRuntime.js @description Proximity, attack, guard, and social aggro entry points. */
import { setCreatureState, ensureCreatureState } from "./CreatureStateMachine.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addThreat } from "./ThreatRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function shouldAggro(creature, player, range = 18) { const a = creature?.mesh?.position || creature?.position, b = player?.mesh?.position || player?.position; if (!a || !b) return false; if (creature?.mesh?.userData?.peaceful || creature?.peaceful) return false; return Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)) <= range; }
export function forceAggro(creature, sourceId = "player", reason = "forced", amount = 10) { addThreat(creature, sourceId, amount); const s = setCreatureState(creature, "combat", reason); s.lastAggroAt = Date.now(); return s; }
export function updateAggro(creature, player, range = 18) { if (!shouldAggro(creature, player, range)) return false; return forceAggro(creature, "player", "proximity", 1); }
export function aggroPayload(creature) { const s = ensureCreatureState(creature); return { state:s.state, threat:s.threat, lastAggroAt:s.lastAggroAt }; }
export default { shouldAggro, updateAggro, forceAggro, aggroPayload };
