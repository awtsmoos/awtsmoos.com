// B"H
/** @file AnimalNeedsModel.js @description Animal needs tick model. */
export function needsFor(species){return {hunger:.4,thirst:.35,fear:species==='rabbit'?.8:.2,sleep:.1,territoryWeight:.7};}
