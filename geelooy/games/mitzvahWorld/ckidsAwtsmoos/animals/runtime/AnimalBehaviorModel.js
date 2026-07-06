// B"H
/** @file AnimalBehaviorModel.js @description Herds eat, drink, sleep, panic, defend, migrate, and remember. */
export const ANIMAL_BEHAVIORS = Object.freeze(["idle","graze","drink","sleep","panic","defend","migrate","follow-parent","seek-herd","mate","raise-offspring"]);
export function nextAnimalBehavior(animal = {}, world = {}) { if (animal.threat) return "panic"; if (animal.thirst > .7) return "drink"; if (animal.hunger > .6) return "graze"; if (world.night) return "sleep"; if (animal.separated) return "seek-herd"; return "idle"; }
export function animalBehaviorPlan(animal, world) { const state = nextAnimalBehavior(animal, world); return { state, allowed:ANIMAL_BEHAVIORS, gait:state === "panic" ? "run" : state === "migrate" ? "walk" : "idle" }; }
export default animalBehaviorPlan;
