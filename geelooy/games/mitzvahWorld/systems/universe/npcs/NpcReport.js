// B"H
export function npcReport({ npcs = [], brains = [], questHooks = [], dialogueReport = null } = {}) { return { npcs:npcs.length, brains:brains.length, questHooks:questHooks.length, dialogue:dialogueReport }; }
