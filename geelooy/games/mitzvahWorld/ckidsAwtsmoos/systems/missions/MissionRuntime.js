// B"H
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
export default createMissionRuntime;
