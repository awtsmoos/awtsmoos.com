// B"H
import { normalizeLootTable } from "../loot/LootTable.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function animalLootBridge(animal = {}) { return { animalId:animal.id, species:animal.species || "animal", lootTable:normalizeLootTable(animal.loot || {}) }; }
