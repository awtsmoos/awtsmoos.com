// B"H
/** @file QuestMarkerRuntime.js @description Yellow/gray ! and ? marker contracts for starter NPCs and minimap guidance. */
import MissionRegistry from "./MissionRegistry.js";
import { ensureMissionState, isMissionComplete, prerequisitesMet } from "./QuestGossipRuntime.js";
import { npcForGiver } from "../npc/NpcServiceRegistry.js";
export function markerForMissionState(olam, mission) { const s = ensureMissionState(olam); if (s.turnedIn[mission.id]) return null; if (s.active[mission.id]) return isMissionComplete(olam, mission.id) ? "yellow-question" : "gray-question"; return prerequisitesMet(olam, mission) ? "yellow-exclamation" : "gray-exclamation"; }
function priority(a, b) { const order = { "yellow-question":4, "yellow-exclamation":3, "gray-question":2, "gray-exclamation":1 }; return (order[b.marker] || 0) - (order[a.marker] || 0); }
export function questMarkersPayload(olam) { const markers = MissionRegistry.map(m => { const npc = npcForGiver(m.giverNpc), marker = markerForMissionState(olam, m); return npc && marker ? { npcId:npc.id, npcName:npc.name, missionId:m.id, title:m.title, marker, kind:marker.includes("question") ? "turn-in" : "offer" } : null; }).filter(Boolean).sort(priority); const byNpc = {}; for (const mark of markers) byNpc[mark.npcId] ||= mark; return { markers, byNpc, count:markers.length }; }
export function emitQuestMarkers(olam) { const payload = questMarkersPayload(olam); olam?.ayshPeula?.("ui event", "questMarkers", payload); return payload; }
export default { markerForMissionState, questMarkersPayload, emitQuestMarkers };
