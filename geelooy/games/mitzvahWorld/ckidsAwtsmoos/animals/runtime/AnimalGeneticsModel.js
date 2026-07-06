// B"H
/** @file AnimalGeneticsModel.js @description Procedural variation without inventing non-kosher wildlife. */
function hash(seed = "") { let h = 2166136261; for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return Math.abs(h); }
function gene(seed, key, min, max) { const h = hash(`${seed}:${key}`) % 10000 / 10000; return +(min + h * (max - min)).toFixed(3); }
export function animalGenes(species, seed = species) { return { species, seed, age:gene(seed,"age",.1,1), bodyFat:gene(seed,"fat",.2,.9), muscle:gene(seed,"muscle",.2,1), hornScale:gene(seed,"horn",0,1), colorHue:gene(seed,"hue",0,360), temperament:gene(seed,"temper",0,1), gaitVariance:gene(seed,"gait",.8,1.2) }; }
export default animalGenes;
