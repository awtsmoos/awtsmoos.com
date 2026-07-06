// B"H
/** @file AnimalBehaviorModel.js @description Animals eat, drink, sleep, wake, herd, flee, play, rest, return, and protect. */
export const ANIMAL_BEHAVIORS=Object.freeze(["idle","seek-food","walk-to-food","eat","drink","sleep","wake","graze","hunt","flee","panic","protect-family","follow-herd","migrate","seek-water","play","rest","communicate","return-home","raise-offspring","hurt","death","jump","swim","look-around"]);
export function nextAnimalBehavior(animal={},world={}){ const n=animal.needs||animal; if(animal.threat||n.safety>.75) return "panic"; if(n.thirst>.72) return "seek-water"; if(n.hunger>.62) return "seek-food"; if(world.night&&n.sleep>.45) return "sleep"; if(animal.separated) return "follow-herd"; if(n.social>.75) return "communicate"; return "idle"; }
export function animalBehaviorPlan(animal,world){ const state=nextAnimalBehavior(animal,world); return { state, allowed:ANIMAL_BEHAVIORS, gait:["panic","flee"].includes(state)?"run":["migrate","seek-food","seek-water","follow-herd"].includes(state)?"walk":"idle", head:state.includes("food")||state==="eat"?"lowered":"watching" }; }
export default animalBehaviorPlan;
