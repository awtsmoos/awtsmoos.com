// B"H
/** Story runtime compresses causal state into a playable village beat. */
export function npcStoryBeat(npc={}, state={}){ const memories=(state.npcMemories?.[npc.id]||[]).slice(-2); const rumor=(state.rumors||[]).slice(-1)[0]; return { npcId:npc.id, title:`${npc.name||npc.id} has a day`, place:npc.currentPlace||npc.home, line:rumor?.currentText || memories.at(-1)?.text || 'The village breathes quietly.', memories }; }
export function villageStoryPayload(state={}){ return (state.npcs||[]).map(n=>npcStoryBeat(n,state)); }
export default { npcStoryBeat, villageStoryPayload };
