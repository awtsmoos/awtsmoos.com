// B"H
/**
 * @file npcLevelMarkup.js
 * @description Chapter 263: each ladder gate bears a human title while its
 * transport filename remains hidden beneath the threshold.
 */
import { esc, LEVELS } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/** @returns {string} Complete level-selection card markup. */
export function levelCardsHtml() {
  return LEVELS.map(([id, label], index) => `
    <button type="button" data-level-id="${esc(id)}" class="awts-npc-level-card">
      <span class="awts-npc-level-number">${String(index + 1).padStart(2, '0')}</span>
      <strong>${esc(label)}</strong>
      <span>Enter challenge</span>
    </button>`).join('');
}
