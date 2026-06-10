// B"H
/**
 * @file npcDialogueMarkup.js
 * @description Chapter 552: NPC actions can now include a travel gate. The
 * level guide keeps choose/buy/sell; village ferrymen can show one clear button
 * that loads another village without opening the challenge grid.
 */
import { esc } from './domKit.js';
export function linesHtml(lines) { return (Array.isArray(lines) ? lines : [lines]).slice(0, 4).map(line => `<p>${esc(line)}</p>`).join(''); }
export function actionButtonsHtml(data = {}) {
  if (data.chatOnly || data.chooserOpen) return '';
  const travel = data.travelPath ? `<button type="button" data-npc-travel class="awts-npc-btn awts-primary">${esc(data.travelLabel || 'TRAVEL')}</button>` : '';
  const levels = data.opensLevelSelect === false || data.travelOnly ? '' : `<button type="button" data-npc-choose class="awts-npc-btn awts-primary">CHOOSE LEVELS</button>`;
  const shop = data.hasShop === false || data.travelOnly ? '' : `<button type="button" data-npc-buy class="awts-npc-btn awts-shop-warm">BUY</button><button type="button" data-npc-sell class="awts-npc-btn awts-shop-warm">SELL</button>`;
  return `${travel}${levels}${shop}`;
}
