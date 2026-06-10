// B"H
/**
 * @file npcOverlay.js
 * @description Chapter 266: The NPC overlay is now a small conductor. Markup,
 * stats, levels, and actions each live in their own vessel.
 */
import { closePanels, esc, sealIsland } from './domKit.js?v=npc-scroll-pass-through-20260609-bh638';
import { installNpcCss } from './npcCss.js?v=npc-scroll-pass-through-20260609-bh638';
import { actionButtonsHtml, linesHtml } from './npcDialogueMarkup.js';
import { levelCardsHtml } from './npcLevelMarkup.js';
import { bindNpcOverlayActions } from './npcOverlayActions.js';
import { statsHtml } from './npcStatsMarkup.js';
export function openLevelSelect(manager, data = {}) {
  openNpcChallengeOverlay(manager, { ...data, title: data.title || 'Choose Levels', lines: data.lines || ['Pick any challenge.'], chooserOpen: true });
}
export function openNpcChallengeOverlay(manager, data = {}) {
  closePanels(); installNpcCss();
  const overlay = document.createElement('div');
  overlay.id = 'awtsmoos-npc-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  const chooser = data.chooserOpen ? `<div class="awts-npc-level-grid">${levelCardsHtml()}</div>` : '';
  overlay.innerHTML = `<section class="awts-npc-card"><h2 class="awts-npc-title">${esc(data.title || data.fromNpc || 'Village Guide')}</h2><div class="awts-npc-layout"><main><div class="awts-npc-lines">${linesHtml(data.lines || [])}</div>${chooser}</main>${statsHtml(data)}</div><div class="awts-npc-actions"><button type="button" data-npc-close class="awts-npc-btn awts-close">CLOSE</button>${actionButtonsHtml(data)}</div></section>`;
  document.body.appendChild(overlay);
  sealIsland(overlay);
  bindNpcOverlayActions(overlay, manager, data, openLevelSelect);
}
