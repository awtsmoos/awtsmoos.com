// B"H
/**
 * @file npcCss.js
 * @description Chapter 621: The NPC style gathers buttons, cards, shops, and
 * the new portrait frame into one installed style sheet. The Awtsmoos makes the
 * dialogue vessel feel inhabited before any word is spoken.
 */
import { NPC_UI_BUTTONS } from './npcCssButtons.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_UI_CARDS } from './npcCssCards.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_UI_LAYOUT } from './npcCssLayout.js?compact=true&v=npc-scroll-pass-through-20260609-bh638';
import { NPC_UI_PORTRAIT } from './npcCssPortrait.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_UI_RESPONSIVE } from './npcCssResponsive.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_UI_SHOP } from './npcCssShop.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_UI_TOKENS } from './npcCssTokens.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function installNpcCss() {
  document.getElementById('awts-npc-ui-style')?.remove();
  const style = document.createElement('style');
  style.id = 'awts-npc-ui-style';
  style.textContent = [NPC_UI_TOKENS, NPC_UI_LAYOUT, NPC_UI_CARDS, NPC_UI_PORTRAIT, NPC_UI_BUTTONS, NPC_UI_SHOP, NPC_UI_RESPONSIVE].join('\n');
  document.head.appendChild(style);
}
