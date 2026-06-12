// B"H
/** @file AnimalNeedsModel.js @description Chapter 1006: hunger, thirst, fear, and sleep become numbers. */
export function needsFor(species, traits = {}) {
  return {
    hunger: traits.predator ? .62 : .38,
    thirst: traits.water ? .18 : .42,
    fear: traits.fear ?? .35,
    sleep: .12,
    territoryWeight: traits.predator ? .9 : .64,
    state: traits.state || "wander"
  };
}
export function advanceNeeds(needs, dt = 1 / 60) {
  const k = Math.min(.08, Number(dt) || 1 / 60);
  needs.hunger = clamp(needs.hunger + k * .018);
  needs.thirst = clamp(needs.thirst + k * .014);
  needs.sleep = clamp(needs.sleep + k * .006);
  return needs;
}
function clamp(v) { return Math.max(0, Math.min(1, Number(v) || 0)); }
