// B"H
export function lootDropPacket(sourceId, item, amount = 1, detail = {}) { return { kind:"loot_drop", sourceId, item, amount, detail, at:new Date().toISOString() }; }
export function lootDropPackets(sourceId, items = []) { return items.map(item => typeof item === "string" ? lootDropPacket(sourceId, item) : lootDropPacket(sourceId, item.item, item.amount || 1, item)); }
