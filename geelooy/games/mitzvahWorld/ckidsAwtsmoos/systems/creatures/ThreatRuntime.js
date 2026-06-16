// B"H
/** @file ThreatRuntime.js @description Tracks threat, decay, and top target for solo-readable combat. */
import { ensureCreatureState } from "./CreatureStateMachine.js";
export function addThreat(creature, sourceId = "player", amount = 1) { const s = ensureCreatureState(creature); s.threat[sourceId] = (s.threat[sourceId] || 0) + Math.max(0, Number(amount) || 0); return s.threat; }
export function decayThreat(creature, amount = .25) { const s = ensureCreatureState(creature); for (const id of Object.keys(s.threat)) { s.threat[id] = Math.max(0, Number(s.threat[id] || 0) - amount); if (s.threat[id] <= 0) delete s.threat[id]; } return s.threat; }
export function topThreat(creature) { const t = ensureCreatureState(creature).threat; return Object.entries(t).sort((a, b) => b[1] - a[1])[0] || null; }
export function threatPayload(creature) { const top = topThreat(creature); return { top:top ? { id:top[0], value:top[1] } : null, table:{ ...ensureCreatureState(creature).threat } }; }
export default { addThreat, decayThreat, topThreat, threatPayload };
