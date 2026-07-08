// B"H
/** @file PatrolRuntime.js @description Patrol routes for living solo roads and dangerous camps. */
import { ensureCreatureState, setCreatureState } from "./CreatureStateMachine.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function assignPatrol(creature, points = []) { const s = ensureCreatureState(creature); s.patrol = points.map(p => ({ x:Number(p.x || 0), y:Number(p.y || 0), z:Number(p.z || 0) })); s.patrolIndex = 0; setCreatureState(creature, s.patrol.length ? "patrol" : "idle", "patrol-assigned"); return s.patrol; }
export function nextPatrolPoint(creature) { const s = ensureCreatureState(creature); if (!s.patrol?.length) return null; const p = s.patrol[s.patrolIndex % s.patrol.length]; s.patrolIndex = (s.patrolIndex + 1) % s.patrol.length; return p; }
export function patrolPayload(creature) { const s = ensureCreatureState(creature); return { points:s.patrol || [], index:s.patrolIndex || 0, state:s.state }; }
export default { assignPatrol, nextPatrolPoint, patrolPayload };
