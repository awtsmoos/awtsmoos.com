// B"H
/** @file AnimalNeeds.js @description Lightweight animal need state. */
export function ensureAnimalNeeds(actor) {
  actor.userData ||= {};
  actor.userData.needs ||= { hunger:.55, fear:0, rest:.2, play:.25 };
  return actor.userData.needs;
}

export default { ensureAnimalNeeds };
