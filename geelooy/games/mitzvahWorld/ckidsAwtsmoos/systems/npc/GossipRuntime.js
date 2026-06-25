// B"H
/**
 * GossipRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { storyLine } from './NpcStoryRuntime.js';
const cache=new Map();
export function gossipPayload(npc={},ctx={}){ const key=JSON.stringify([npc.id||npc.npcId,ctx.reputation,ctx.weather,ctx.questHash]); if(cache.has(key))return cache.get(key); const payload={ npcId:npc.id||npc.npcId, title:npc.name||'Villager', line:storyLine(npc,ctx), choices:['Ask about work','Offer help','Trade rumors'] }; cache.set(key,payload); if(cache.size>80)cache.delete(cache.keys().next().value); return payload; }
export function clearGossipCache(){ cache.clear(); }
export default { gossipPayload, clearGossipCache };
