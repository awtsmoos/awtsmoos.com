// B"H
/** @file AnimalEatingRuntime.js @description Visible grazing/nibbling state helpers. */
export function eatingStateFor(species = "rabbit") {
  return ({ cow:"graze", goat:"nibble", rabbit:"nibble", deer:"graze", frog:"bugCrouch", bird:"hopPeck" }[species] || "eat");
}

export default { eatingStateFor };
