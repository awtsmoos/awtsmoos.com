// B"H
/**
 * Chapter 332: Heichel beauty returns its existing oath when already awake.
 * The scroll listener remains singular; repeated health passes only refresh the
 * ambient data marker and preserve the true cleanup handle.
 */

import { bindScrollHeroState } from './scrollHeroState.js';
import { blessHeichelAmbientMotion } from './ambientMotion.js';

export function runHeichelBeauty(root = document) {
  blessHeichelAmbientMotion(root);
  if (window.__awtsmoosHeichelBeauty?.active) return window.__awtsmoosHeichelBeauty;
  const unbindHero = bindScrollHeroState(root);
  window.__awtsmoosHeichelBeauty = { active: true, unbindHero };
  return window.__awtsmoosHeichelBeauty;
}
