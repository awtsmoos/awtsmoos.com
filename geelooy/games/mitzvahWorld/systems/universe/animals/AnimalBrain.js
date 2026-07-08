// B"H
import { animalNeeds } from "./AnimalNeeds.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalMovementIntent } from "./AnimalMovementIntent.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function animalDecision(animal = {}) { const needs = animalNeeds(animal); const action = needs.fear > .7 ? "flee" : needs.hunger > .6 ? "graze" : needs.rest > .8 ? "sleep" : "wander"; return { animalId:animal.id, needs, action, movement:animalMovementIntent(animal, action) }; }
