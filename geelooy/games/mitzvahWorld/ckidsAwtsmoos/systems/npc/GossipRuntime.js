// B"H
/**
 * GossipRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { storyLine } from './NpcStoryRuntime.js';
const cache=new Map();
const defaultChoices=Object.freeze([{ id:"quest", label:"Shlichus" },{ id:"vendor", label:"Trade" },{ id:"gossip", label:"Rumors" },{ id:"train", label:"Training" }]);
export function gossipPayload(npc={},ctx={}){ const key=JSON.stringify([npc.id||npc.npcId||npc.name,ctx.reputation,ctx.weather,ctx.questHash]); if(cache.has(key))return cache.get(key); const payload={ open:true, ok:true, npcId:npc.id||npc.npcId||npc.name||"villager", npcName:npc.name||npc.title||"Villager", title:npc.name||npc.title||"Villager", greeting:storyLine(npc,ctx), line:storyLine(npc,ctx), choices:npc.choices||defaultChoices }; cache.set(key,payload); if(cache.size>80)cache.delete(cache.keys().next().value); return payload; }
export function clearGossipCache(){ cache.clear(); }
export default { gossipPayload, clearGossipCache };
