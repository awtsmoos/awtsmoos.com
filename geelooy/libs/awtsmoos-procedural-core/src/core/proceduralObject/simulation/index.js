// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos.com simulation surface lets one world inspect conserved water, combustion, smoke, and blast.
 * Each export remains a small vessel, so deeper physics can grow without hiding one giant shadow in the mast.
 */

export * from "./grid2d.js";
export * from "./sampleGrid2d.js";
export * from "./advectGrid2d.js";
export * from "./projectVelocity2d.js";
export * from "./createShallowWaterState.js";
export * from "./stepShallowWater.js";
export * from "./shallowWaterStability.js";
export * from "./shallowWaterForces.js";
export * from "./shallowWaterDiagnostics.js";
export * from "./sampleShallowWater.js";
export * from "./createCombustionState.js";
export * from "./stepCombustion.js";
export * from "./createExplosionEvent.js";
export * from "./applyExplosion.js";
