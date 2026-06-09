// B"H
/**
 * @file npcCss.js
 * @description Chapter 274: The NPC style is now assembled from small vessels:
 * tokens, layout, cards, buttons, shop, and responsive rules.
 */
import { NPC_UI_BUTTONS } from './npcCssButtons.js';
import { NPC_UI_CARDS } from './npcCssCards.js';
import { NPC_UI_LAYOUT } from './npcCssLayout.js';
import { NPC_UI_RESPONSIVE } from './npcCssResponsive.js';
import { NPC_UI_SHOP } from './npcCssShop.js';
import { NPC_UI_TOKENS } from './npcCssTokens.js';
export function installNpcCss() {
  document.getElementById('awts-npc-ui-style')?.remove();
  const style = document.createElement('style');
  style.id = 'awts-npc-ui-style';
  style.textContent = [NPC_UI_TOKENS, NPC_UI_LAYOUT, NPC_UI_CARDS, NPC_UI_BUTTONS, NPC_UI_SHOP, NPC_UI_RESPONSIVE].join('\n');
  document.head.appendChild(style);
}
