// B"H
/** NPC interactions turn memory, reputation, rumors, and starter arc signals into visible dialogue. */
import { gossipPayload } from './GossipRuntime.js';
import { createNpcMemoryRuntime } from './NpcMemoryRuntime.js';
function event(type, detail) { globalThis.dispatchEvent?.(new CustomEvent(type, { detail })); return detail; }
export function npcInteractionIndex(npcs = []) { return Object.fromEntries(npcs.map(n => [n.id || n.npcId, n])); }
export function openNpcInteraction(npcId = 'villager', context = {}, npcs = []) {
  const store = context.store || globalThis.__MITZVAH_WORLD_STATE__ || {};
  const memory = createNpcMemoryRuntime(store);
  const npc = npcInteractionIndex(npcs)[npcId] || { id:npcId, name:npcId };
  memory.remember(npcId, { kind:'player_spoke', text:'The player stopped to speak.', place:context.place || npc.currentPlace });
  const effects = memory.effects(npcId);
  const payload = { npcId, name:npc.name, greeting:effects.greetingTone === 'warm' ? `${npc.name} remembers your kindness.` : effects.greetingTone === 'wary' ? `${npc.name} watches carefully.` : `${npc.name} greets you.`, memoryEffects:effects, gossip:gossipPayload(npcId, store), serviceHint:npc.workplace, questBias:effects.questBias };
  event('mitzvah-world:starter-signal', { signal:'npc', evidence:payload });
  return payload;
}
export function performTalk(npcId = 'villager', textOrContext = {}, npcs = []) { const context = typeof textOrContext === 'string' ? { text:textOrContext } : textOrContext; return openNpcInteraction(npcId, context, npcs); }
export default { openNpcInteraction, npcInteractionIndex, performTalk };
