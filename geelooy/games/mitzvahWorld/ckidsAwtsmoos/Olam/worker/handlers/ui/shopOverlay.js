// B"H
/**
 * @file shopOverlay.js
 * @description Chapter 396: The shop overlay opens a sealed vessel and lets the
 * renderer, bindings, rows, and actions do their own work.
 */
import { closePanels, sealIsland } from './domKit.js?compact=true&v=npc-scroll-pass-through-20260609-bh638';
import { installNpcCss } from './npcCss.js?compact=true&v=npc-scroll-pass-through-20260609-bh638';
import { renderShop } from './shopRenderer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function openShopOverlay(manager, data = {}, mode = 'buy') {
  closePanels(); installNpcCss();
  const host = document.createElement('div');
  host.id = 'awtsmoos-npc-shop';
  host.dataset.mode = mode;
  host.__awtsData = data;
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true');
  document.body.appendChild(host);
  sealIsland(host);
  renderShop(host, manager);
}
