// B"H
/**
 * QuestMarkerRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function markerForNpc(npcId,missions=[]){ return missions.some(m=>m.giver===npcId)?'!':missions.some(m=>m.turnIn===npcId)?'?':''; }
export default { markerForNpc };
