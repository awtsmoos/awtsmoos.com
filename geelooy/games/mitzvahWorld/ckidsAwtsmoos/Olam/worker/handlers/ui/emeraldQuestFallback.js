// B"H
/**
 * @file emeraldQuestFallback.js
 * @description Chapter 441: The current quest card can be summoned on its own,
 * matching the top-right screenshot panel.
 */
import { renderEntryQuest } from './emeraldQuest/questRenderer.js';
export function handleEmeraldQuestFallback(shaym, ob = {}) {
  if (shaym !== 'emeraldQuestCard') return false;
  renderEntryQuest(ob.entryScene || ob);
  return true;
}
