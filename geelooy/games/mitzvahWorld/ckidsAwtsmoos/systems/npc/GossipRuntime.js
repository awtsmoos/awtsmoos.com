// B"H
<<<<<<< HEAD
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
=======
/** GossipRuntime: rumors mutate gently as the Awtsmoos lets village speech ripple. */
const MUTATIONS = ['The player delivered bread.','The player helped Miriam.','The player saved the bakery.','The whole village says the player brings blessing.'];
export function mutateRumorText(rumor={}){ const spreads=rumor.spreadCount||0; if(spreads>=10) return MUTATIONS[3]; if(spreads>=5) return MUTATIONS[2]; if(spreads>=2) return MUTATIONS[1]; return rumor.originalText||rumor.currentText||MUTATIONS[0]; }
export function createRumor(sourceNpc='village', text='A kindness happened.', topic='kindness'){ return { id:`rumor_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, sourceNpc, originalText:text, currentText:text, truthValue:true, distortionAmount:0, spreadCount:0, heardBy:[sourceNpc], timestamp:Date.now(), topic, emotionalTone:'warm' }; }
export function spreadRumor(rumor={}, npcId='villager'){ const heard=new Set(rumor.heardBy||[]); heard.add(npcId); const spreadCount=(rumor.spreadCount||0)+1; return { ...rumor, spreadCount, heardBy:[...heard], distortionAmount:Math.min(1,(rumor.distortionAmount||0)+0.1), currentText:mutateRumorText({...rumor,spreadCount}), timestamp:Date.now() }; }
export function gossipPayload(npcId='villager', store=globalThis.__MITZVAH_WORLD_STATE__||{}){ const rumors=(store.rumors||[]).filter(r => !r.heardBy || r.heardBy.includes(npcId) || r.spreadCount>1).slice(-4); return { npcId, rumors, lines:rumors.map(r=>r.currentText), tone:rumors.some(r=>r.emotionalTone==='worried')?'worried':'warm' }; }
export function propagateRumors(store=globalThis.__MITZVAH_WORLD_STATE__||{}, npcIds=[]){ store.rumors ||= []; const next=[]; for(const rumor of store.rumors.slice(-12)){ const target=npcIds.find(id=>!(rumor.heardBy||[]).includes(id)); next.push(target?spreadRumor(rumor,target):rumor); } store.rumors=next; return store.rumors; }
export default { createRumor, spreadRumor, mutateRumorText, gossipPayload, propagateRumors };
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
