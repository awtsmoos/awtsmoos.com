// B"H
/**
 * NpcMemoryRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createNpcMemoryRuntime(store={}){ const memories=store.npcMemories||={}; return { remember(npcId,event){(memories[npcId]||=[]).push({...event,at:Date.now()}); memories[npcId]=memories[npcId].slice(-12); return memories[npcId];}, recall(npcId){return (memories[npcId]||[]).slice();}, disposition(npcId){return (memories[npcId]||[]).reduce((a,e)=>a+(e.kind==='help'?1:e.kind==='harm'?-2:0),0);} }; }
export default createNpcMemoryRuntime;
