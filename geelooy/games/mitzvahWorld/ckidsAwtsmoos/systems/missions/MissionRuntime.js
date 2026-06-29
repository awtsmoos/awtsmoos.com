// B"H
<<<<<<< HEAD
/**
 * MissionRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_MISSIONS, getMission } from './MissionRegistry.js';
function ownerOf(store = {}) { return store.player || store.chossid || store; }
function normalizeActive(active = {}) {
  if (Array.isArray(active)) return Object.fromEntries(active.filter(Boolean).map(m => [m.id, m]));
  return active || {};
}
function objectiveRows(mission = {}) {
  return (mission.objectives || []).map((o, index) => ({ ...o, index, progress:o.progress || 0, done:(o.progress || 0) >= (o.count || 1) }));
}
export function ensureMissionState(store = {}) {
  const owner = ownerOf(store);
  owner.activeMissions = normalizeActive(owner.activeMissions || store.activeMissions || {});
  owner.completedMissions ||= store.completedMissions || [];
  owner.missionRuntime ||= createMissionRuntime(owner);
  return owner;
}
export function missionUiPayload(store = {}) {
  const owner = ensureMissionState(store), activeMap = normalizeActive(owner.activeMissions);
  const active = Object.values(activeMap);
  const completed = [...(owner.completedMissions || [])];
  const available = STARTER_MISSIONS.filter(m => !activeMap[m.id] && !completed.includes(m.id));
  return {
    open:true,
    active:active.map(m => ({ ...m, objectives:objectiveRows(m) })),
    completed,
    available,
    count:active.length,
    title:"Shlichus Missions"
  };
}
export function createMissionRuntime(store={}){ const owner=ownerOf(store), active=owner.activeMissions=normalizeActive(owner.activeMissions||store.activeMissions||{}), complete=owner.completedMissions||=[]; return { accept(id){const m=getMission(id); if(m&&!active[id]&&!complete.includes(id))active[id]={...m,progress:0,objectives:objectiveRows(m)}; return active[id]||null;}, progress(id,n=1){if(!active[id])return null; active[id].progress=(active[id].progress||0)+n; return active[id];}, finish(id){const m=active[id]; if(!m)return null; delete active[id]; if(!complete.includes(id))complete.push(id); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:mission-complete',{detail:m})); return m;}, state(){return {active,complete};}, payload(){return missionUiPayload(owner);} }; }
=======
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
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
export default createMissionRuntime;
