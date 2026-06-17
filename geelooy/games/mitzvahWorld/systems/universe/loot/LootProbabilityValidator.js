// B"H
export function validateLootProbability(value) { const n = Number(value); return Number.isFinite(n) && n >= 0 && n <= 1; }
export function validateLootTable(table = []) { const invalid = table.filter(row => !validateLootProbability(row.probability)); return { ok:invalid.length === 0, invalid }; }
