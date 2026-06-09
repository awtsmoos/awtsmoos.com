// B"H
/**
 * @file npcOverlayActions.js
 * @description Chapter 265: Every NPC button gets sealed touch behavior from
 * one small binding vessel.
 */
import { bindPress, closePanels } from './domKit.js';
import { launchLevel } from './levelLauncher.js';
import { openShopOverlay } from './shopOverlay.js';
export function bindNpcOverlayActions(overlay, manager, data, openLevelSelect) {
  bindPress(overlay, e => { if (e.target === overlay) closePanels(e); });
  bindPress(overlay.querySelector('[data-npc-close]'), closePanels);
  bindPress(overlay.querySelector('[data-npc-choose]'), () => openLevelSelect(manager, { ...data, title: data.selectorTitle || 'NPC CHALLENGES' }));
  bindPress(overlay.querySelector('[data-npc-buy]'), () => openShopOverlay(manager, data, 'buy'));
  bindPress(overlay.querySelector('[data-npc-sell]'), () => openShopOverlay(manager, data, 'sell'));
  overlay.querySelectorAll('[data-level-id]').forEach(btn => bindPress(btn, async () => {
    try { closePanels(); await launchLevel(manager, btn.dataset.levelId); }
    catch (error) { console.error('B"H - NPC level launch failed', error); alert('Could not load that level yet.'); }
  }));
}
