// B"H
/**
 * @file waterPass.js
 * @description Chapter 302: Water features now arrive as three vessels: well,
 * fountain, and brook.
 */
import { addBrookFeature } from './brookFeature.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addFountainFeature } from './fountainFeature.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { WATER_FEATURES } from './waterConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addWellFeature } from './wellFeature.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addWaterFeatures(n) {
  addWellFeature(n, WATER_FEATURES);
  addFountainFeature(n, WATER_FEATURES);
  addBrookFeature(n, WATER_FEATURES);
}
