// B"H
/** @file WildlifeDirector.js @description Dense animal civilization planned statistically, materialized near player. */
import { ANIMAL_SPECIES, speciesTraits } from "./AnimalSpeciesCatalog.js?compact=true&v=awtsmoos-animal-species-20260614-bh2";
import { needsFor } from "./AnimalNeedsModel.js?compact=true&v=awtsmoos-animal-needs-20260614-bh2";
import { animalTerritories } from "./AnimalTerritories.js?compact=true&v=awtsmoos-animal-territories-20260614-bh2";
import { predatorPreySchedule } from "./PredatorPreyScheduler.js?compact=true&v=awtsmoos-predator-prey-20260614-bh2";
function seeded(index, salt = 1){ const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453; return x - Math.floor(x); }
function territoryList(ctx){ const base = animalTerritories(ctx); return base.length ? base : Object.keys(ANIMAL_SPECIES).map((species,i)=>({ species, biome:ANIMAL_SPECIES[species].biome, center:{x:(i-3)*32,z:(i%3-1)*42}, radius:55, count:ANIMAL_SPECIES[species].group })); }
function makeAnimal(territory, index) { const traits = speciesTraits(territory.species), a = index * 2.399963, r = territory.radius * (.16 + seeded(index, 2) * .82); return { id:`${territory.species}_${index}`, species:territory.species, biome:territory.biome, x:territory.center.x + Math.cos(a)*r, z:territory.center.z + Math.sin(a)*r*.66, territory, traits, needs:needsFor(territory.species, traits), memory:{ home:traits.memory, threats:[], food:[], water:[] }, state:traits.state || "wander", lod:"statistical" }; }
function summarize(animals, events){ const bySpecies={}; for(const a of animals) bySpecies[a.species]=(bySpecies[a.species]||0)+1; return { animals:animals.length, bySpecies, events:events.length, predatorRules:events.filter(e=>e.predator).length, tieredSimulation:true, statisticalFarAnimals:true }; }
export function buildWildlifePlan(ctx = {}) { const territories = territoryList(ctx), events = predatorPreySchedule(), animals = []; for(const t of territories){ const count = Math.max(4, Math.min(24, Number(t.count || speciesTraits(t.species).group || 8) * 2)); for(let i=0;i<count;i++) animals.push(makeAnimal(t,i)); } return { version:"wildlife-plan-v4-tiered-memory-herds", territories, events, animals, summary:summarize(animals, events) }; }
export function partitionWildlife(animals, player = {x:0,z:0}) { return animals.map(a=>{ const d=Math.hypot(a.x-player.x,a.z-player.z); return { ...a, distance:d, lod:d<32?"near":d<90?"mid":d<190?"far":"statistical", updateHz:d<32?30:d<90?4:d<190?1:0 }; }); }
export default buildWildlifePlan;
