// B"H
/**
 * QuestMarkerRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_MISSIONS } from "./MissionRegistry.js";
export function markerForNpc(npcId,missions=[]){ return missions.some(m=>m.giver===npcId)?'!':missions.some(m=>m.turnIn===npcId)?'?':''; }
export function questMarkersPayload(olam={}){ const active=Object.values(olam.__activeMissions||olam.activeMissions||{}); const missions=active.length?active:STARTER_MISSIONS; const markers=missions.map(m=>({ npcId:m.giver||m.turnIn||"rebbe", npcName:String(m.giver||m.turnIn||"Rebbe").replace(/_/g," "), missionId:m.id, title:m.title, marker:markerForNpc(m.giver,missions)||"!" })); return { count:markers.length, markers }; }
export default { markerForNpc, questMarkersPayload };
