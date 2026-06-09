// B"H
/**
 * @file levelNavigator.js
 * @description Chapter 369: Direct navigation catches failure without killing
 * the NPC overlay flow.
 */
import { normalizeLevelId } from './levelIdNormalizer.js';
import { launchLevel } from './levelLauncher.js';
export function navigateLevel(manager, data = {}) {
  const next = normalizeLevelId(data.next || data.path || '');
  if (next) launchLevel(manager, next).catch(error => console.error('B"H - direct level navigation failed', error));
}
