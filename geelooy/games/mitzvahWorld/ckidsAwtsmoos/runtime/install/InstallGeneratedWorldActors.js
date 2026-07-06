// B"H
/** @file InstallGeneratedWorldActors.js @description NPC and animal generators pour compact world intent into the shared entity registry. */
import { installGeneratedNpcs } from "../../npcs/runtime/NpcGenerator.js";
import { installAnimals } from "../../animals/runtime/AnimalRuntimeFactory.js";
export function installGeneratedWorldActors(runtime, intent = {}) { const npcs = installGeneratedNpcs(runtime, intent.npcs || []); const animals = installAnimals(runtime, intent.animals || [], intent); runtime?.markReady?.("world:actors", { npcs:npcs.length, animals:animals.length }); return { npcs, animals }; }
export default installGeneratedWorldActors;
