// B"H
/**
 * NpcInteractionRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { gossipPayload } from './GossipRuntime.js';
export function createNpcInteractionRuntime(npcs=[]){ return { open(id,ctx={}){ const npc=npcs.find(n=>(n.id||n.npcId)===id)||{id,name:'Villager'}; const payload=gossipPayload(npc,ctx); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:gossip',{detail:payload})); return payload; }, nearest(){ return npcs[0]||null; } }; }
export default createNpcInteractionRuntime;
