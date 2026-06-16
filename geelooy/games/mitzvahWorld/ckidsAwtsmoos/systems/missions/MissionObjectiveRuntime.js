// B"H
/** @file MissionObjectiveRuntime.js @description Progress active objectives with exact, typed, and payload-aware matching. */
import { ensureMissionState, progressMission } from "./MissionRuntime.js";
function keysFor(type = "", payload = {}) { return [type, payload.id && `${type}:${payload.id}`, payload.zone && `${type}:${payload.zone}`, payload.rareId && `${type}:${payload.rareId}`, payload.factionId && `${type}:${payload.factionId}`, payload.profession && `${type}:${payload.profession}`, payload.bossId && `${type}:${payload.bossId}`].filter(Boolean); }
function matchesObjective(obj, objectiveType, payload = {}) { const keys = keysFor(objectiveType, payload); return keys.includes(obj.type) || keys.includes(obj.id) || obj.type === objectiveType || obj.id === objectiveType; }
export function progressActiveObjectives(olam, objectiveType, amount = 1, payload = {}) {
  const state = ensureMissionState(olam); if (!state) return [];
  const touched = [];
  for (const mission of Object.values(state.active || {})) for (const obj of mission.objectives || []) {
    if (!matchesObjective(obj, objectiveType, payload)) continue;
    const result = progressMission(olam, mission.id, obj.id || objectiveType, amount);
    if (result) touched.push({ missionId:mission.id, objectiveId:obj.id || objectiveType, progress:result.progress, required:result.required });
  }
  olam?.ayshPeula?.("ui event", "objectiveProgress", { objectiveType, payload, touched }); return touched;
}
export default { progressActiveObjectives };
