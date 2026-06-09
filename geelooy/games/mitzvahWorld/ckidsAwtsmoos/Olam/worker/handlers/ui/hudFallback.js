// B"H
/** @file hudFallback.js @description Chapter 398: HUD fallback peulos update progress and personal perutas. */
import { changeBag, updatePerutahHud } from './hudState.js';
export function handleHudFallback(shaym, ob = {}) {
  if (shaym !== 'gameHUD') return false;
  if (ob.perutahProgress) updatePerutahHud(ob.perutahProgress);
  if (ob.personalPerutas) changeBag(ob.personalPerutas.personalDelta || 0, ob.personalPerutas.reason);
  return true;
}
