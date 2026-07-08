// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalLootBridge } from "./AnimalLootBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateAnimalCommands(zone = {}) { return (zone.animals || []).map((a, i) => withModifierStack(applyManualOverride({ type:"animal", id:a.id || `animal_${i+1}`, species:a.species || "deer", behavior:a.behavior || "wander", loot:animalLootBridge(a), combat:a.combat || { hp:8 }, command:"spawn_animal", source:a }, a), a)); }
