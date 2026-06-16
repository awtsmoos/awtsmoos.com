// B"H
/** @file LeashRuntime.js @description Returns creatures home, clears threat, and emits evade information. */
import { ensureCreatureState, setCreatureState } from "./CreatureStateMachine.js";
export function leashDistance(creature) { const s = ensureCreatureState(creature), p = creature?.mesh?.position || creature?.position, h = s.home; if (!p || !h) return 0; return Math.hypot((p.x || 0) - (h.x || 0), (p.z || 0) - (h.z || 0)); }
export function updateLeash(creature) { const s = ensureCreatureState(creature); if (leashDistance(creature) <= s.leashRadius) return false; s.threat = {}; s.cast = null; return setCreatureState(creature, "return_home", "leash"); }
export function leashPayload(creature) { const s = ensureCreatureState(creature); return { distance:leashDistance(creature), radius:s.leashRadius, state:s.state, home:s.home }; }
export default { leashDistance, updateLeash, leashPayload };
