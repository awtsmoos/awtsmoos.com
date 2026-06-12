import { allItems } from '../definitions/itemCatalog.js';

/**
 * B"H
 * Item mood weights.
 *
 * Chapter 177: the stage chooses gifts according to its temper. Gevurah favors
 * gloves, Chesed favors shields and healing, Netzach favors speed, Hod favors
 * charge and magnetism, and Yesod favors wings.
 */
export function weightedStageItems(mood = {}, supply = {}) {
  return allItems().map(item => ({ ...item, weight: Math.max(1, item.weight + moodBonus(item, mood) + supplyBonus(item, supply)) }));
}

function moodBonus(item, mood) {
  const p = mood.personality;
  if (p === 'gevurah' && ['heavyGloves', 'gevurahFragment', 'shofar'].includes(item.id)) return 22;
  if (p === 'chesed' && ['shieldCrystal', 'chesedFragment'].includes(item.id)) return 22;
  if (p === 'netzach' && ['speedBoots', 'netzachFragment'].includes(item.id)) return 22;
  if (p === 'hod' && ['rageScroll', 'hodScroll', 'magneticOrb'].includes(item.id)) return 18;
  if (p === 'yesod' && ['wingRelic', 'crown'].includes(item.id)) return 20;
  if (mood.restless > 50 && item.role === 'burst') return 10;
  return 0;
}

function supplyBonus(item, supply) {
  if (supply.need === 'comeback' && ['shieldCrystal', 'wingRelic', 'chesedFragment'].includes(item.id)) return 28;
  if (supply.need === 'violence' && ['heavyGloves', 'rageScroll', 'shofar'].includes(item.id)) return 24;
  if (supply.need === 'chase' && ['speedBoots', 'magneticOrb', 'netzachFragment'].includes(item.id)) return 22;
  return 0;
}
