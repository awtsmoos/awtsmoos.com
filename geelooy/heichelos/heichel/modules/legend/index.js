// B"H
/** Chapter 339: Heichel legend behavior runs safely above beauty. */
import { bindCardDepthObserver } from './cardDepthObserver.js';
import { bindHeroScrollDepth } from './heroScrollDepth.js';
import { blessEmptyStates } from './emptyStateBlessing.js';

export function runHeichelLegend(root = document) {
  const previous = window.__awtsmoosHeichelLegend;
  previous?.unbindCards?.();
  previous?.unbindHero?.();
  const unbindCards = bindCardDepthObserver(root);
  const unbindHero = bindHeroScrollDepth(root);
  const emptyGridCount = blessEmptyStates(root);
  const state = { active: true, unbindCards, unbindHero, emptyGridCount };
  window.__awtsmoosHeichelLegend = state;
  return state;
}
