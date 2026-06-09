// B"H
/**
 * @file npcDialogueMarkup.js
 * @description Chapter 264: The dialogue text is separated from behavior so
 * the card can move toward the clean screenshot composition.
 */
import { esc } from './domKit.js';
export function linesHtml(lines) {
  return (Array.isArray(lines) ? lines : [lines]).slice(0, 4).map(line => `<p>${esc(line)}</p>`).join('');
}
export function actionButtonsHtml(data = {}) {
  if (data.chatOnly || data.chooserOpen) return '';
  return `<button type="button" data-npc-choose class="awts-npc-btn awts-primary">CHOOSE LEVELS</button><button type="button" data-npc-buy class="awts-npc-btn awts-shop-warm">BUY</button><button type="button" data-npc-sell class="awts-npc-btn awts-shop-warm">SELL</button>`;
}
