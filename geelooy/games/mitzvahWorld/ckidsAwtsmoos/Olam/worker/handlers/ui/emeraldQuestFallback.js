// B"H
/**
 * @file emeraldQuestFallback.js
 * @description Chapter 441: The current quest card can be summoned on its own,
 * matching the top-right screenshot panel.
 */
import { renderEntryQuest } from './emeraldQuest/questRenderer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function handleEmeraldQuestFallback(shaym, ob = {}) {
  if (shaym !== 'emeraldQuestCard') return false;
  renderEntryQuest(ob.entryScene || ob);
  return true;
}
