// B"H
/**
 * @file screenshotDetailPass.js
 * @description Chapter 487: Screenshot details now obey density: path center
 * cobbles and flowers become scalable beauty, not fixed weight.
 */
import { addFlowerClusters } from './foliage/flowerClusterPass.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addPathCenterCobbles } from './path/pathCenterCobblePass.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addScreenshotDetails(n, density = {}) {
  addPathCenterCobbles(n, density);
  addFlowerClusters(n, density);
}
