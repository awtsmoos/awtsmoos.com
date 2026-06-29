// B"H
/**
 * @file npcOverlay.js
 * @description Chapter 622: NPC speech now opens with a portrait, like a fast
 * sacred RPG conversation panel. Stats, choices, shop, and level cards remain
 * intact, but the speaker now has a visible face in the corner.
 */
import { closePanels, esc, sealIsland } from './domKit.js?v=npc-scroll-pass-through-20260609-bh638';
import { installNpcCss } from './npcCss.js?v=npc-portrait-20260628-bh1';
import { actionButtonsHtml, linesHtml } from './npcDialogueMarkup.js?v=village-polish-20260612-bh810';
import { portraitHtml } from './npcPortraitMarkup.js?v=npc-portrait-20260628-bh1';
import { levelCardsHtml } from './npcLevelMarkup.js';
import { bindNpcOverlayActions } from './npcOverlayActions.js?v=village-polish-20260612-bh810';
import { statsHtml } from './npcStatsMarkup.js';
function subtitle(data = {}) { return data.areaName || data.role || data.npcRole || 'Friendly NPC'; }
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
  const title = esc(data.title || data.fromNpc || 'Village Guide');
  overlay.innerHTML = `<section class="awts-npc-card awts-npc-card-wow"><div class="awts-npc-hero">${portraitHtml(data)}<div class="awts-npc-heading"><h2 class="awts-npc-title">${title}</h2><div class="awts-npc-subtitle">${esc(subtitle(data))}</div></div></div><div class="awts-npc-layout"><main><div class="awts-npc-lines">${linesHtml(data.lines || [])}</div>${chooser}</main>${statsHtml(data)}</div><div class="awts-npc-actions"><button type="button" data-npc-close class="awts-npc-btn awts-close">CLOSE</button>${actionButtonsHtml(data)}</div></section>`;
  document.body.appendChild(overlay);
  sealIsland(overlay);
  bindNpcOverlayActions(overlay, manager, data, openLevelSelect);
}
