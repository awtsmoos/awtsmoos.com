// B"H
import { animalNeeds } from "./AnimalNeeds.js";
import { animalMovementIntent } from "./AnimalMovementIntent.js";
export function animalDecision(animal = {}) { const needs = animalNeeds(animal); const action = needs.fear > .7 ? "flee" : needs.hunger > .6 ? "graze" : needs.rest > .8 ? "sleep" : "wander"; return { animalId:animal.id, needs, action, movement:animalMovementIntent(animal, action) }; }
