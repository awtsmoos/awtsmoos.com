// B"H
import { normalizeLootTable } from "../loot/LootTable.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { deterministicLootPreview } from "../loot/LootRoller.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function treeHarvestRuntime(tree = {}) { const table = normalizeLootTable(tree.lootTable || tree.source?.loot || { wood:.8 }); return { targetId:tree.id, kind:"tree_harvest", tool:tree.harvestTool || "axe", table, preview:deterministicLootPreview(table), cooldownSeconds:tree.cooldownSeconds || 45 }; }
