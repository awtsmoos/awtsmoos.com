// B"H
/** @file effectsFallback.js @description Chapter 399: Effect fallback routes named effects to tiny modules. */
import { showSpikeResetOverlay, tzedakahLetters } from './effects.js';
export function handleEffectsFallback(manager, shaym, ob = {}) {
  if (shaym !== 'effectsOverlay') return false;
  if (ob?.effect === 'spikeDeath') showSpikeResetOverlay(manager);
  if (ob?.effect === 'tzedakahBlessing') tzedakahLetters(ob);
  return true;
}
