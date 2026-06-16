// B"H
/** @file CreatureStateMachine.js @description Creature states, home, patrol, casts, and solo-WoW state payloads. */
export const CREATURE_STATES = Object.freeze(["idle", "patrol", "alert", "combat", "casting", "flee", "return_home", "evade"]);
function posOf(creature) { return creature?.mesh?.position || creature?.position || null; }
function clonePos(p) { return p && typeof p.clone === "function" ? p.clone() : { x:Number(p?.x || 0), y:Number(p?.y || 0), z:Number(p?.z || 0) }; }
function homeOf(creature) { const motion = creature?.userData?.motion || creature?.motion; if (Number.isFinite(Number(motion?.homeX)) && Number.isFinite(Number(motion?.homeZ))) return { x:Number(motion.homeX), y:0, z:Number(motion.homeZ) }; return clonePos(posOf(creature)); }
export function ensureCreatureState(creature) { creature.__creatureState ||= { state:"idle", threat:{}, home:homeOf(creature), leashRadius:45, patrolIndex:0, socialLinks:[], cast:null, lastAggroAt:0 }; if (!creature.__creatureState.home) creature.__creatureState.home = homeOf(creature); return creature.__creatureState; }
export function setCreatureState(creature, state, reason = "") { const s = ensureCreatureState(creature); if (CREATURE_STATES.includes(state)) s.state = state; s.reason = reason; s.changedAt = Date.now(); return s; }
export function creatureStatePayload(creature) { const s = ensureCreatureState(creature); return { name:creature?.name || creature?.mesh?.name, state:s.state, reason:s.reason, threat:s.threat, cast:s.cast, home:s.home, leashRadius:s.leashRadius }; }
export default { CREATURE_STATES, ensureCreatureState, setCreatureState, creatureStatePayload };
