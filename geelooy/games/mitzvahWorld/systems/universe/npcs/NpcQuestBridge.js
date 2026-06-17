// B"H
export function npcQuestHooks(npc = {}) { return { npcId:npc.id, starts:npc.startsQuests || [], advances:npc.advancesQuests || [], completes:npc.completesQuests || [] }; }
export function npcQuestBridge(npcs = []) { return npcs.map(npcQuestHooks).filter(h => h.starts.length || h.advances.length || h.completes.length); }
