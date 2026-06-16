// B"H
/**
 * @file NpcMissionRuntime.js
 * @description Mission and Torah teaching bridges for NPC dialogue responses.
 */
import MissionRegistry from "../missions/MissionRegistry.js";
import { acceptMission, completeMission, ensureMissionState } from "../missions/MissionRuntime.js";
import { readSefer, learnPassage } from "../torah/TorahSpellbookRuntime.js";
import { SeferIndex } from "../../tochen/torah/SeferIndex.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function npcMissionIds(npc) { return npc?.customData?.missionIds || MissionRegistry.filter(m => m.giverNpc === npc?.name).map(m => m.id); }
function npcTeachIds(npc) { return npc?.customData?.teachPassages || Object.values(SeferIndex).filter(s => (npc?.customData?.teachSefarim || []).includes(s.id)).flatMap(s => s.passages); }
export function availableNpcMissions(npc, olam) {
  const state = ensureMissionState(olam) || { active: {}, completed: {} };
  return npcMissionIds(npc).map(id => MissionRegistry.find(m => m.id === id)).filter(Boolean).filter(m => !state.completed[m.id] && !state.active[m.id]);
}
export function activeNpcTurnins(npc, olam) {
  const state = ensureMissionState(olam) || { active: {}, completed: {} };
  return Object.values(state.active).filter(m => m.giverNpc === npc?.name || npcMissionIds(npc).includes(m.id)).filter(m => m.objectives?.every(o => Number(o.progress || 0) >= Number(o.required || 1)));
}
export function npcMissionResponses(npc, olam) {
  const out = [];
  for (const m of availableNpcMissions(npc, olam).slice(0, 3)) out.push({ text: `Accept shlichus: ${m.title}`, action: () => acceptMission(olam, m.id), type: "mission" });
  for (const m of activeNpcTurnins(npc, olam).slice(0, 2)) out.push({ text: `Complete shlichus: ${m.title}`, action: () => completeMission(olam, m.id), type: "mission" });
  return out;
}
export function npcTorahTeachingResponses(npc, olam) {
  const out = [];
  for (const seferId of npc?.customData?.teachSefarim || []) { const s = SeferIndex[seferId]; if (s) out.push({ text: `Read ${s.name}`, action: () => readSefer(olam, seferId), type: "torah" }); }
  for (const passageId of npcTeachIds(npc).slice(0, 4)) out.push({ text: `Learn passage: ${passageId}`, action: () => learnPassage(olam, passageId), type: "torah" });
  return out;
}
export function emitNpcMissionPayload(npc, olam) { const payload = { npcId: npc?.id, npcName: npc?.name, missions: availableNpcMissions(npc, olam), turnins: activeNpcTurnins(npc, olam), teachPassages: npcTeachIds(npc) }; olam?.ayshPeula?.("ui event", "npcMission", payload); return payload; }
export default { availableNpcMissions, activeNpcTurnins, npcMissionResponses, npcTorahTeachingResponses, emitNpcMissionPayload };
