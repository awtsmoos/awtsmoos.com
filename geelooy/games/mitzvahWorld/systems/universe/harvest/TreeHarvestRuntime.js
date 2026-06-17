// B"H
import { normalizeLootTable } from "../loot/LootTable.js";
import { deterministicLootPreview } from "../loot/LootRoller.js";
export function treeHarvestRuntime(tree = {}) { const table = normalizeLootTable(tree.lootTable || tree.source?.loot || { wood:.8 }); return { targetId:tree.id, kind:"tree_harvest", tool:tree.harvestTool || "axe", table, preview:deterministicLootPreview(table), cooldownSeconds:tree.cooldownSeconds || 45 }; }
