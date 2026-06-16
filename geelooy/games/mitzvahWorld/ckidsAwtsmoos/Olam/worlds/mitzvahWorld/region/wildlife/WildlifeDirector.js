// B"H
/** @file WildlifeDirector.js @description Ecology generates animals, needs, territories, and predator-prey event rules. */
import { ANIMAL_SPECIES } from "./AnimalSpeciesCatalog.js?v=awtsmoos-animal-species-20260614-bh2";
import { needsFor } from "./AnimalNeedsModel.js?v=awtsmoos-animal-needs-20260614-bh2";
import { animalTerritories } from "./AnimalTerritories.js?v=awtsmoos-animal-territories-20260614-bh2";
import { predatorPreySchedule } from "./PredatorPreyScheduler.js?v=awtsmoos-predator-prey-20260614-bh2";
function traitsFor(species) { return ANIMAL_SPECIES[species] || {}; }
function makeAnimal(territory, traits, index) { const a = index * 2.399963, r = territory.radius * (.18 + ((index * 37) % 100) / 130); return { id:`${territory.species}_${index}`, species:territory.species, biome:territory.biome, x:territory.center.x + Math.cos(a)*r, z:territory.center.z + Math.sin(a)*r*.65, territory, traits, needs:needsFor(territory.species, traits), state:traits.state || "wander" }; }
function summarize(animals, events) { const bySpecies = {}; for (const animal of animals) bySpecies[animal.species] = (bySpecies[animal.species] || 0) + 1; return { animals:animals.length, bySpecies, events:events.length, predatorRules:events.filter(event => event.predator).length }; }
export function buildWildlifePlan(ctx = {}) { const territories = animalTerritories(ctx), events = predatorPreySchedule(), animals = []; for (const territory of territories) { const traits = traitsFor(territory.species); for (let i=0; i<territory.count; i++) animals.push(makeAnimal(territory, traits, i)); } return { version:"wildlife-plan-v3-skeletal-needs-predator-prey", territories, events, animals, summary:summarize(animals, events) }; }
