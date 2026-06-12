import { ITEM_CATALOG } from './definitions/itemCatalog.js';
import { chooseStageItem as chooseByBattle } from './spawn/itemChooser.js';

/**
 * B"H
 * Stage item registry compatibility gate.
 *
 * Chapter 180: the old doorway remains, but behind it the catalog has split
 * into clean vessels: concrete powerups, mythic relics, mood weights, and supply
 * pressure. Existing imports keep walking through safely.
 */
export const STAGE_ITEMS = ITEM_CATALOG;

export function chooseStageItem(moodOrState = {}) {
  if (moodOrState.map || moodOrState.fighters) return chooseByBattle(moodOrState);
  return chooseFallback(moodOrState);
}

function chooseFallback(mood) {
  const entries = Object.values(ITEM_CATALOG).map(item => ({ ...item, weight: item.weight + fallbackBonus(item, mood) }));
  const total = entries.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of entries) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return entries[0];
}

function fallbackBonus(item, mood = {}) {
  if (mood.personality === 'gevurah' && item.role === 'kill') return 18;
  if (mood.personality === 'netzach' && item.role === 'chase') return 18;
  if (mood.personality === 'hod' && item.role === 'pressure') return 16;
  if (mood.personality === 'chesed' && item.role === 'survive') return 16;
  return 0;
}
