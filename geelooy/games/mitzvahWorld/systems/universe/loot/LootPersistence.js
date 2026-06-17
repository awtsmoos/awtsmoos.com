// B"H
export function persistLootState(state = {}) { return { kind:"loot_persistence", version:1, savedAt:new Date().toISOString(), state }; }
