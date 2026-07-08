// B"H
/** @file InstallGeneratedWorldActors.js @description NPC and animal generators pour compact world intent into the shared entity registry. */
import { installGeneratedNpcs } from "../../npcs/runtime/NpcGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { installAnimals } from "../../animals/runtime/AnimalRuntimeFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function installGeneratedWorldActors(runtime, intent = {}) { const npcs = installGeneratedNpcs(runtime, intent.npcs || []); const animals = installAnimals(runtime, intent.animals || [], intent); runtime?.markReady?.("world:actors", { npcs:npcs.length, animals:animals.length }); return { npcs, animals }; }
export default installGeneratedWorldActors;
