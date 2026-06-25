// B"H
/**
 * QuestGossipRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_MISSIONS } from './MissionRegistry.js';
export function questChoicesForNpc(npcId,completed=[]){ return STARTER_MISSIONS.filter(m=>(m.giver===npcId)&&!completed.includes(m.id)).map(m=>({id:m.id,label:m.title})); }
export default { questChoicesForNpc };
