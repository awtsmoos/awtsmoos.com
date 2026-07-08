// B"H
/** MissionRuntime: accepts, progresses, finishes, and feeds older UI/chat imports. */
import { STARTER_MISSIONS, getMission, missionsForState } from "./MissionRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function ownerOf(store = {}) {
  return store.player || store.chossid || store;
}

function normalizeActive(active = {}) {
  if (Array.isArray(active)) return Object.fromEntries(active.filter(Boolean).map(m => [m.id, m]));
  return active || {};
}

function objectiveRows(mission = {}) {
  return (mission.objectives || []).map((o, index) => {
    const needed = Number(o.needed ?? o.count ?? 1) || 1;
    const progress = Number(o.done ?? o.current ?? o.progress ?? 0) || 0;
    return { ...o, index, needed, count:needed, progress, done:progress, current:progress, complete:progress >= needed };
  });
}

export function ensureMissionState(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  const owner = ownerOf(store);
  owner.activeMissions = normalizeActive(owner.activeMissions || store.activeMissions || {});
  owner.completedMissions ||= store.completedMissions || [];
  return owner;
}

export function missionUiPayload(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  const owner = ensureMissionState(store);
  owner.missionRuntime ||= null;
  const activeMap = normalizeActive(owner.activeMissions);
  const completed = [...(owner.completedMissions || [])];
  const stateAvailable = missionsForState(owner);
  const available = [...STARTER_MISSIONS, ...stateAvailable].filter((m, index, list) => list.findIndex(x => x.id === m.id) === index).filter(m => !activeMap[m.id] && !completed.includes(m.id));
  const active = Object.values(activeMap).map(m => ({ ...m, objectives:objectiveRows(m) }));
  return { open:true, title:"Shlichus Missions", active, completed, available, count:active.length };
}

export function createMissionRuntime(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  const owner = ensureMissionState(store);
  const active = owner.activeMissions = normalizeActive(owner.activeMissions);
  const complete = owner.completedMissions ||= [];
  function available() { return missionUiPayload(owner).available; }
  function accept(id) {
    const found = getMission(id) || available().find(m => m.id === id);
    if (!found) return null;
    if (!active[id] && !complete.includes(id)) active[id] = { ...found, acceptedAt:Date.now(), source:found.source || "world_state", objectives:objectiveRows(found) };
    return active[id];
  }
  function progress(idOrKind, amount = 1) {
    if (active[idOrKind]) {
      const mission = active[idOrKind];
      mission.progress = (mission.progress || 0) + amount;
      return mission;
    }
    const rows = [];
    for (const mission of Object.values(active)) {
      for (const objective of mission.objectives || []) {
        if (objective.kind === idOrKind || objective.id === idOrKind) {
          const needed = Number(objective.needed ?? objective.count ?? 1) || 1;
          objective.done = Math.min(needed, Number(objective.done ?? objective.current ?? objective.progress ?? 0) + amount);
          objective.current = objective.done;
          objective.progress = objective.done;
          rows.push({ missionId:mission.id, objective });
        }
      }
    }
    return rows;
  }
  function finish(id) {
    const mission = active[id];
    if (!mission) return null;
    const objectives = objectiveRows(mission);
    if (objectives.length && !objectives.every(o => o.complete)) return false;
    delete active[id];
    if (!complete.includes(id)) complete.push(id);
    globalThis.dispatchEvent?.(new CustomEvent("mitzvah-world:mission-complete", { detail:mission }));
    return mission;
  }
  return { store:owner, available, accept, progress, finish, all:() => ({ active, completed:complete, available:available() }), state:() => ({ active, complete }), payload:() => missionUiPayload(owner) };
}

export default createMissionRuntime;
