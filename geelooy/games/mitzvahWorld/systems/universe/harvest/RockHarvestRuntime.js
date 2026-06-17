// B"H
import { normalizeLootTable } from "../loot/LootTable.js";
import { deterministicLootPreview } from "../loot/LootRoller.js";
export function rockHarvestRuntime(rock = {}) { const table = normalizeLootTable(rock.loot || { stone:.9, ore:.1 }); return { targetId:rock.id, kind:"rock_harvest", tool:rock.harvestTool || "pickaxe", table, preview:deterministicLootPreview(table), cooldownSeconds:rock.cooldownSeconds || 60 }; }
