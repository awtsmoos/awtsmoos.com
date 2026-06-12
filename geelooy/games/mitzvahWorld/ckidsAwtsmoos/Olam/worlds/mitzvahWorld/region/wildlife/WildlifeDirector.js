// B"H
/** @file WildlifeDirector.js @description Chapter 1009: ecology generates animals, needs, and event rules. */
import { ANIMAL_SPECIES } from "./AnimalSpeciesCatalog.js";
import { needsFor } from "./AnimalNeedsModel.js";
import { animalTerritories } from "./AnimalTerritories.js";
import { predatorPreySchedule } from "./PredatorPreyScheduler.js";

export function buildWildlifePlan(ctx = {}) {
  const territories = animalTerritories(ctx);
  const events = predatorPreySchedule();
  const animals = [];
  for (const territory of territories) {
    const traits = ANIMAL_SPECIES[territory.species] || {};
    for (let i = 0; i < territory.count; i += 1) animals.push(makeAnimal(territory, traits, i));
  }
  return { version: "wildlife-plan-v2-needs-predator-prey", territories, events, animals, summary: summarize(animals, events) };
}

function makeAnimal(territory, traits, index) {
  const a = index * 2.399963;
  const r = territory.radius * (.18 + ((index * 37) % 100) / 130);
  return { id: `${territory.species}_${index}`, species: territory.species, biome: territory.biome, x: territory.center.x + Math.cos(a) * r, z: territory.center.z + Math.sin(a) * r * .65, territory, traits, needs: needsFor(territory.species, traits), state: traits.state || "wander" };
}
function summarize(animals, events) {
  const bySpecies = {};
  for (const animal of animals) bySpecies[animal.species] = (bySpecies[animal.species] || 0) + 1;
  return { animals: animals.length, bySpecies, events: events.length, predatorRules: events.filter(e => e.predator).length };
}
