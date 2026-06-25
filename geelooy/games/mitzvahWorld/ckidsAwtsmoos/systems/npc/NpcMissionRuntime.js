// B"H
/**
 * NpcMissionRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function npcMissionOffer(npcId,missions=[]){ return missions.find(m=>m.npc===npcId||m.giver===npcId)||null; }
export default { npcMissionOffer };
