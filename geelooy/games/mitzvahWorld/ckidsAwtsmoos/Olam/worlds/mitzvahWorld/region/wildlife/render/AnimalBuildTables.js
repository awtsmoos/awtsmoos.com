// B"H
/**
 * @file AnimalBuildTables.js
 * @description
 * Animal build constants. The Awtsmoos keeps names and scale in a small table
 * so the forge can remain a focused act of creation.
 */
export const ANIMAL_SCALE = Object.freeze({
  rabbit: 0.55,
  frog: 0.42,
  bird: 0.45,
  fox: 0.72,
  goat: 0.85,
  deer: 0.95,
  cow: 1.18
});

export const ANIMAL_DISPLAY = Object.freeze({
  rabbit: "Rabbit",
  frog: "Frog",
  bird: "Bird",
  fox: "Fox",
  goat: "Goat",
  deer: "Deer",
  cow: "Cow"
});

export function displayNameFor(species = "rabbit") {
  return ANIMAL_DISPLAY[species] || "Animal";
}

export function scaleFor(species = "rabbit", data = {}) {
  const requested = Number(data.visualScale);
  return Number.isFinite(requested) ? requested : ANIMAL_SCALE[species] || 0.65;
}
