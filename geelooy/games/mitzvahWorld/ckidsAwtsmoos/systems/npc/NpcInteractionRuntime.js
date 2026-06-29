// B"H
/**
 * NpcInteractionRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { gossipPayload } from './GossipRuntime.js';
import { npcServices } from "./NpcServiceRegistry.js";
function allNpcs(olam){ return [olam?.npcs, olam?.nivrayim, olam?.interactables].flat().filter(Boolean).filter(n => n.interactable || n.options?.interactable || n.mesh?.userData?.npcId || /npc|rebbe|baker|guard|merchant|villager/i.test(String(n.name || n.id || ""))); }
function emit(scope,name,payload){ scope.__MITZVAH_UI_BRIDGE__?.receive?.(name,payload); try{ scope.dispatchEvent?.(new CustomEvent(`mitzvah-world:${name}`,{detail:payload})); }catch{} }
function findNpc(npcs,id){ return npcs.find(n => [n.id,n.npcId,n.name,n.mesh?.name,n.mesh?.userData?.npcId].filter(Boolean).map(String).includes(String(id))) || npcs[0] || { id, name:"Villager" }; }
export function createNpcInteractionRuntime(npcs=[],scope=globalThis){ return { open(id,ctx={}){ const npc=findNpc(npcs,id); const payload=gossipPayload(npc,ctx); emit(scope,"npcGossip",payload); return payload; }, choose(id,choice){ const npc=findNpc(npcs,id); const payload=gossipPayload(npc,{ choice }); payload.greeting = choice === "vendor" ? "Here is what I can sell and buy." : choice === "train" ? "Choose a skill and grow stronger." : choice === "quest" ? "A shlichus is waiting for you." : payload.greeting; emit(scope,"npcGossip",payload); return payload; }, nearest(){ return npcs[0]||null; } }; }
export function installNpcInteractionControls(scope=globalThis,olamGetter=()=>scope.__AWTSMOOS_OLAM__||scope.olam){ if(scope.__MITZVAH_NPC_INTERACTION__?.open) return scope.__MITZVAH_NPC_INTERACTION__; const runtime={ open(id,ctx={}){ return createNpcInteractionRuntime(allNpcs(olamGetter()),scope).open(id,ctx); }, choose(id,choice){ return createNpcInteractionRuntime(allNpcs(olamGetter()),scope).choose(id,choice); }, nearest(){ return createNpcInteractionRuntime(allNpcs(olamGetter()),scope).nearest(); } }; scope.__MITZVAH_NPC_INTERACTION__=runtime; return runtime; }
export function npcInteractionIndex(){ return { npcs:npcServices() }; }
export function openNpcInteraction(olam={},id="rebbe"){ const npc=npcServices().find(n=>n.id===id)||npcServices()[0]; const payload=gossipPayload(npc,{}); olam.__activeNpcInteraction=payload; olam.ayshPeula?.("ui event","npcGossip",payload); return { ok:true, ...payload }; }
export function performTalk(olam={},id=""){ const npcs=[...allNpcs(olam),...npcServices()], npc=findNpc(npcs,id); if(!npc) return { ok:false, reason:"no-npc" }; const payload=gossipPayload(npc,{}); olam.__activeNpcInteraction=payload; olam.ayshPeula?.("ui event","npcGossip",payload); return { ok:true, npc, payload }; }
export default createNpcInteractionRuntime;
