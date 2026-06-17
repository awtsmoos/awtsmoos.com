// B"H
export function normalizeLootTable(loot = {}) { return Object.entries(loot).map(([item, probability]) => ({ item, probability:Number(probability) || 0 })); }
export function lootTableReport(table = []) { return { entries:table.length, guaranteed:table.filter(x => x.probability >= 1).length, rare:table.filter(x => x.probability > 0 && x.probability < .1).length }; }
