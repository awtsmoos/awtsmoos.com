// B"H
import { normalizeLootTable } from "../loot/LootTable.js";
import { deterministicLootPreview, rollLoot } from "../loot/LootRoller.js";
export function animalLootRuntime(animal = {}) { const table = animal.loot?.lootTable || normalizeLootTable(animal.source?.loot || animal.loot || {}); return { animalId:animal.id, table, preview:deterministicLootPreview(table), roll:(random=Math.random)=>rollLoot(table, random) }; }
