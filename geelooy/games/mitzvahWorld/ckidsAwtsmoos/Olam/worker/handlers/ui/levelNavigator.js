// B"H
/**
 * @file levelNavigator.js
 * @description Chapter 369: Direct navigation catches failure without killing
 * the NPC overlay flow.
 */
import { normalizeLevelId } from './levelIdNormalizer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { launchLevel } from './levelLauncher.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function navigateLevel(manager, data = {}) {
  const next = normalizeLevelId(data.next || data.path || '');
  if (next) launchLevel(manager, next).catch(error => console.error('B"H - direct level navigation failed', error));
}
