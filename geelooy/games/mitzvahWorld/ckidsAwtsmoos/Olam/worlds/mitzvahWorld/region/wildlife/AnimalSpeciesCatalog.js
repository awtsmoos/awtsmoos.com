// B"H
/** @file AnimalSpeciesCatalog.js @description Chapter 1005: species carry instincts. */
export const ANIMAL_SPECIES = Object.freeze({
  rabbit: { prey: true, food: "grass", fear: .92, speed: 1.55, group: 12, biome: "farmBelt", state: "graze" },
  fox: { predator: "rabbit", fear: .18, speed: 1.38, group: 4, biome: "forestBelt", state: "hunt" },
  deer: { prey: true, food: "meadow", fear: .72, speed: 1.24, group: 8, biome: "forestBelt", state: "graze" },
  frog: { water: true, fear: .45, speed: .72, group: 10, biome: "marshlands", state: "drink" },
  goat: { slope: true, fear: .36, speed: .88, group: 6, biome: "rockyHighlands", state: "climb" },
  bird: { flight: true, fear: .55, speed: 1.8, group: 16, biome: "wilderness", state: "flock" }
});
