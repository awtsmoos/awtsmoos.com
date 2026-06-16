// B"H
/** @file AnimalNeedsModel.js @description Hunger, thirst, fear, sleep, and territory pressure as clear bounded numbers. */
function clamp(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }
function traitFear(traits) { return traits && traits.fear !== undefined ? traits.fear : .35; }
export function needsFor(species, traits = {}) { const predator = Boolean(traits.predator), water = Boolean(traits.water); return { hunger:predator ? .62 : .38, thirst:water ? .18 : .42, fear:traitFear(traits), sleep:.12, territoryWeight:predator ? .9 : .64, state:traits.state || "wander" }; }
export function advanceNeeds(needs, dt = 1 / 60) { const k = Math.min(.08, Number(dt) || 1 / 60); needs.hunger = clamp(needs.hunger + k * .018); needs.thirst = clamp(needs.thirst + k * .014); needs.sleep = clamp(needs.sleep + k * .006); return needs; }
