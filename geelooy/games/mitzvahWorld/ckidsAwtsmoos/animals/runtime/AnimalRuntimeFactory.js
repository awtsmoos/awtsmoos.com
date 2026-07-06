// B"H
/** @file AnimalRuntimeFactory.js @description Kosher creatures become entities with genes, physiology, herd behavior, and daily needs. */
import { speciesProfile } from "./KosherAnimalSpecies.js";
import { animalGenes } from "./AnimalGeneticsModel.js";
import { animalBehaviorPlan } from "./AnimalBehaviorModel.js";
import { animalPhysiology } from "./AnimalPhysiologyModel.js";
import { animalDailyNeeds } from "./AnimalDailyNeeds.js";
import { buildHerd } from "./AnimalHerdRuntime.js";
export function createAnimalEntity(spec = {}, world = {}) { const species = spec.species || "sheep", seed = spec.seed || spec.name || species; const genes = animalGenes(species, seed); const needs = animalDailyNeeds(spec); return { id:spec.id || `animal_${species}_${String(seed).replace(/\s+/g,"_")}`, kind:"animal", name:spec.name || species, tags:["animal", species, "kosher"], profile:speciesProfile(species), genes, physiology:animalPhysiology(species, genes), behavior:animalBehaviorPlan({ ...spec, ...needs }, world), herdId:spec.herdId || `${species}_herd`, needs, senses:{ smell:.8, hearing:.7, sight:species.match(/bird|duck|goose|dove|pigeon/) ? .9 : .65 }, realism:"physiology-herd-needs-v1" }; }
export function installAnimals(runtime, specs = [], world = {}) { const animals = specs.map(spec => createAnimalEntity(spec, world)); const herds = buildHerd(animals); for (const animal of animals) runtime?.registerEntity?.(animal); for (const herd of herds) runtime?.registerEntity?.({ id:`herd_${herd.id}`, kind:"herd", tags:["herd", herd.species], ...herd }); runtime?.markReady?.("animals:runtime", { count:animals.length, herds:herds.length, realism:"physiology-herd-needs-v1" }); return animals; }
export default createAnimalEntity;
