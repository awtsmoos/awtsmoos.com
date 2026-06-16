// B"H
/** @file QuestTrackerRuntime.js @description Compact right-side tracker payload: active objectives, completion, and return-to-NPC guidance. */
import MissionRegistry from "./MissionRegistry.js";
import { ensureMissionState, missionProgress, isMissionComplete } from "./QuestGossipRuntime.js";
function titleLine(mission, rows) { const done = rows.filter(r => r.complete).length; return `${mission.title} (${done}/${rows.length})`; }
export function objectiveLine(mission, objective, row = null) { const current = Number(row?.current ?? objective.progress ?? 0), needed = Number(objective.required || row?.needed || 1); return { id:objective.id, type:objective.type, text:objective.label, current, needed, complete:current >= needed, line:`${objective.label}: ${current}/${needed}` }; }
export function questTrackerPayload(olam) { const state = ensureMissionState(olam), active = [], completedReady = []; for (const id of Object.keys(state.active)) { const mission = MissionRegistry.find(m => m.id === id); if (!mission) continue; const rows = missionProgress(olam, id), complete = isMissionComplete(olam, id); const block = { id, title:mission.title, line:titleLine(mission, rows), complete, returnTo:complete ? mission.giverNpc : null, objectives:mission.objectives.map((o, i) => objectiveLine(mission, o, rows[i])) }; active.push(block); if (complete && !state.turnedIn[id]) completedReady.push({ id, title:mission.title, returnTo:mission.giverNpc }); } return { active, completedReady, count:active.length }; }
export function emitQuestTracker(olam) { const payload = questTrackerPayload(olam); olam?.ayshPeula?.("ui event", "questTracker", payload); return payload; }
export default { questTrackerPayload, emitQuestTracker, objectiveLine };
