// B"H
import { normalizeLootTable } from "./LootTable.js";
import { deterministicLootPreview, rollLoot } from "./LootRoller.js";
export class LootRuntime { constructor(tables = {}) { this.tables = tables; } table(id) { return normalizeLootTable(this.tables[id] || {}); } roll(id, random) { return rollLoot(this.table(id), random); } preview(id) { return deterministicLootPreview(this.table(id)); } }
export default LootRuntime;
