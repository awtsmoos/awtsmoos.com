// B"H
/**
 * @file npcPortraitFallback.js
 * @description Chapter 442: The right-side guide portrait can be shown as its
 * own screenshot-style UI surface.
 */
import { renderNpcPortrait } from './npcPortrait/npcPortraitRenderer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function handleNpcPortraitFallback(shaym, ob = {}) {
  if (shaym !== 'emeraldNpcPortrait') return false;
  renderNpcPortrait(ob.portrait || ob);
  return true;
}
