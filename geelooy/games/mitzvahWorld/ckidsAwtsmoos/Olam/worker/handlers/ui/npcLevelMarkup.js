// B"H
/**
 * @file npcLevelMarkup.js
 * @description Chapter 263: The lava ladder cards are rendered from LEVELS,
 * not from scattered button smoke.
 */
import { esc, LEVELS } from './domKit.js';
function labelFor(id, fallback) {
  return String(id).match(/ladder-(\d+)/)?.[1] ? `${fallback} — ${id}` : fallback;
}
export function levelCardsHtml() {
  return LEVELS.map(([id, label]) => `<button type="button" data-level-id="${esc(id)}" class="awts-npc-level-card"><strong>${esc(labelFor(id, label))}</strong><span>Load JSON challenge</span></button>`).join('');
}
