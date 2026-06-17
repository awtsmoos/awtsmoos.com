// B"H
export function rollLoot(table = [], random = Math.random) { return table.filter(row => random() <= row.probability).map(row => row.item); }
export function deterministicLootPreview(table = []) { return table.map(row => ({ item:row.item, chance:row.probability, expected:row.probability >= .5 ? "common" : row.probability >= .1 ? "uncommon" : "rare" })); }
