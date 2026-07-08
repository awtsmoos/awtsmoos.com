// B"H
import { normalizeLootTable } from "./LootTable.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { deterministicLootPreview, rollLoot } from "./LootRoller.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class LootRuntime { constructor(tables = {}) { this.tables = tables; } table(id) { return normalizeLootTable(this.tables[id] || {}); } roll(id, random) { return rollLoot(this.table(id), random); } preview(id) { return deterministicLootPreview(this.table(id)); } }
export default LootRuntime;
