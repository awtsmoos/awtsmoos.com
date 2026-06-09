// B"H
/**
 * @file waterPass.js
 * @description Chapter 302: Water features now arrive as three vessels: well,
 * fountain, and brook.
 */
import { addBrookFeature } from './brookFeature.js';
import { addFountainFeature } from './fountainFeature.js';
import { WATER_FEATURES } from './waterConfig.js';
import { addWellFeature } from './wellFeature.js';
export function addWaterFeatures(n) {
  addWellFeature(n, WATER_FEATURES);
  addFountainFeature(n, WATER_FEATURES);
  addBrookFeature(n, WATER_FEATURES);
}
