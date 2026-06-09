// B"H
/**
 * @file screenshotDetailPass.js
 * @description Chapter 487: Screenshot details now obey density: path center
 * cobbles and flowers become scalable beauty, not fixed weight.
 */
import { addFlowerClusters } from './foliage/flowerClusterPass.js';
import { addPathCenterCobbles } from './path/pathCenterCobblePass.js';
export function addScreenshotDetails(n, density = {}) {
  addPathCenterCobbles(n, density);
  addFlowerClusters(n, density);
}
