// B"H
/** @file AnimalDailyNeeds.js @description Needs drift over time so animals seek food, water, sleep, herd, and safety. */
export function animalDailyNeeds(spec = {}) { return { hunger:spec.hunger ?? .35, thirst:spec.thirst ?? .3, sleep:spec.sleep ?? .25, social:spec.social ?? .45, safety:spec.threat ? .9 : .15, health:spec.health ?? 1 }; }
export function tickAnimalNeeds(needs, dt = 1) { return { hunger:Math.min(1, needs.hunger + dt * .015), thirst:Math.min(1, needs.thirst + dt * .02), sleep:Math.min(1, needs.sleep + dt * .01), social:Math.min(1, needs.social + dt * .005), safety:Math.max(0, needs.safety - dt * .01), health:needs.health }; }
export default animalDailyNeeds;
