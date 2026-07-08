// B"H
import { normalizeLootTable } from "../loot/LootTable.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { deterministicLootPreview, rollLoot } from "../loot/LootRoller.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function animalLootRuntime(animal = {}) { const table = animal.loot?.lootTable || normalizeLootTable(animal.source?.loot || animal.loot || {}); return { animalId:animal.id, table, preview:deterministicLootPreview(table), roll:(random=Math.random)=>rollLoot(table, random) }; }
