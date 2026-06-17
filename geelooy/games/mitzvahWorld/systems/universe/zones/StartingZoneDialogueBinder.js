// B"H
export function bindDialogueToNpcs(objects = [], dialogues = []) { const ids = new Set(dialogues.map(d => d.id)); return objects.filter(o => o.type === "zone_npc" && ids.has(o.dialogue)).map(o => ({ npcId:o.id, dialogueId:o.dialogue })); }
