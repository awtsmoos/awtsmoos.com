// B"H
/** MissionRuntime: accepts, progresses, and finishes state-born quests, with compatibility exports for older UI/chat imports. */
import { STARTER_MISSIONS, missionsForState } from './MissionRegistry.js';
function ensureStore(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { store.activeMissions ||= {}; store.completedMissions ||= []; return store; }
export function createMissionRuntime(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  store = ensureStore(store);
  function available() { return missionsForState(store).filter(m => !store.activeMissions[m.id] && !store.completedMissions.includes(m.id)); }
  function accept(id) { const found = [...STARTER_MISSIONS, ...available()].find(m => m.id === id); if (!found) return null; return store.activeMissions[id] = { ...found, acceptedAt:Date.now(), source:'world_state' }; }
  function progress(kind, amount = 1) { const rows = []; for (const m of Object.values(store.activeMissions)) for (const o of m.objectives || []) if (o.kind === kind) { o.done = Math.min(o.needed, (o.done || o.current || 0) + amount); o.current = o.done; rows.push({ missionId:m.id, objective:o }); } return rows; }
  function finish(id) { const m = store.activeMissions[id]; if (!m || !(m.objectives || []).every(o => (o.done || o.current || 0) >= o.needed)) return false; delete store.activeMissions[id]; store.completedMissions.push(id); return m; }
  return { store, available, accept, progress, finish, all(){ return { active:store.activeMissions, completed:store.completedMissions, available:available() }; } };
}
export function ensureMissionState(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { store = ensureStore(store); return { active:store.activeMissions, completed:store.completedMissions, available:missionsForState(store) }; }
export function missionUiPayload(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { const state = ensureMissionState(store); return { active:Object.values(state.active || {}), completed:state.completed || [], available:state.available || [] }; }
export default createMissionRuntime;
