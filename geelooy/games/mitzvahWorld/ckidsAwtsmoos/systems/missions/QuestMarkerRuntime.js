// B"H
/** Quest markers as pure data so UI can render only on changed hashes. */
export function markerForNpc(npcId, missions=[]) { return missions.some(m=>m.giver===npcId)?'!':missions.some(m=>m.turnIn===npcId)?'?':''; }
export function questMarkersPayload(npcs=[], missions=[]) { return { markers:npcs.map(n=>({ npcId:n.id||n.npcId, marker:markerForNpc(n.id||n.npcId, missions) })).filter(m=>m.marker) }; }
export default { markerForNpc, questMarkersPayload };
