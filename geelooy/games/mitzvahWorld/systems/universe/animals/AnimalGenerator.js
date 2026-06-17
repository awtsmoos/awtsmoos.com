// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js";
import { animalLootBridge } from "./AnimalLootBridge.js";
export function generateAnimalCommands(zone = {}) { return (zone.animals || []).map((a, i) => withModifierStack(applyManualOverride({ type:"animal", id:a.id || `animal_${i+1}`, species:a.species || "deer", behavior:a.behavior || "wander", loot:animalLootBridge(a), combat:a.combat || { hp:8 }, command:"spawn_animal", source:a }, a), a)); }
