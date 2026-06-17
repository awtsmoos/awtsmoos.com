// B"H
import { normalizeLootTable } from "../loot/LootTable.js";
export function animalLootBridge(animal = {}) { return { animalId:animal.id, species:animal.species || "animal", lootTable:normalizeLootTable(animal.loot || {}) }; }
