// B"H
<<<<<<< HEAD
/**
 * QuestMarkerRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_MISSIONS } from "./MissionRegistry.js";
export function markerForNpc(npcId,missions=[]){ return missions.some(m=>m.giver===npcId)?'!':missions.some(m=>m.turnIn===npcId)?'?':''; }
export function questMarkersPayload(olam={}){ const active=Object.values(olam.__activeMissions||olam.activeMissions||{}); const missions=active.length?active:STARTER_MISSIONS; const markers=missions.map(m=>({ npcId:m.giver||m.turnIn||"rebbe", npcName:String(m.giver||m.turnIn||"Rebbe").replace(/_/g," "), missionId:m.id, title:m.title, marker:markerForNpc(m.giver,missions)||"!" })); return { count:markers.length, markers }; }
=======
/** Quest markers as pure data so UI can render only on changed hashes. */
export function markerForNpc(npcId, missions=[]) { return missions.some(m=>m.giver===npcId)?'!':missions.some(m=>m.turnIn===npcId)?'?':''; }
export function questMarkersPayload(npcs=[], missions=[]) { return { markers:npcs.map(n=>({ npcId:n.id||n.npcId, marker:markerForNpc(n.id||n.npcId, missions) })).filter(m=>m.marker) }; }
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
export default { markerForNpc, questMarkersPayload };
