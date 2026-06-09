// B"H
/**
 * @file emeraldHudFallback.js
 * @description Chapter 422: The Emerald HUD can be summoned by UI fallback
 * data when the entry scene wants to look like the reference image.
 */
import { renderEmeraldEntryHud } from './emeraldHud/emeraldHudRenderer.js';
export function handleEmeraldHudFallback(shaym, ob = {}) {
  if (shaym !== 'emeraldEntryHud') return false;
  renderEmeraldEntryHud(ob.entryScene || ob);
  return true;
}
