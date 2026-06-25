// B"H
/** NPC interactions turn memory, reputation, and rumors into visible dialogue. */
import { gossipPayload } from './GossipRuntime.js';
import { createNpcMemoryRuntime } from './NpcMemoryRuntime.js';
export function npcInteractionIndex(npcs=[]){ return Object.fromEntries(npcs.map(n=>[n.id||n.npcId,n])); }
export function openNpcInteraction(npcId='villager', context={}, npcs=[]){ const store=context.store||globalThis.__MITZVAH_WORLD_STATE__||{}; const memory=createNpcMemoryRuntime(store); const npc=npcInteractionIndex(npcs)[npcId] || { id:npcId, name:npcId }; memory.remember(npcId,{kind:'player_spoke',text:'The player stopped to speak.',place:context.place||npc.currentPlace}); const effects=memory.effects(npcId); return { npcId, name:npc.name, greeting:effects.greetingTone==='warm'?`${npc.name} remembers your kindness.`:effects.greetingTone==='wary'?`${npc.name} watches carefully.`:`${npc.name} greets you.`, memoryEffects:effects, gossip:gossipPayload(npcId,store), serviceHint:npc.workplace, questBias:effects.questBias }; }
export default { openNpcInteraction, npcInteractionIndex };
