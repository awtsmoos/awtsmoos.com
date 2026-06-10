// B"H
/** @file shopBindings.js @description Chapter 394: Shop buttons receive sealed press behavior. */
import { bindPress, closePanels } from './domKit.js?v=npc-scroll-pass-through-20260609-bh638';
import { openNpcChallengeOverlay } from './npcOverlay.js?v=npc-scroll-pass-through-20260609-bh638';
import { shopAction } from './shopActions.js';
export function bindShop(host, manager, render) {
  const data = host.__awtsData || {};
  bindPress(host.querySelector('[data-shop-close]'), closePanels);
  bindPress(host.querySelector('[data-shop-back]'), () => openNpcChallengeOverlay(manager, data));
  host.querySelectorAll('[data-shop-tab]').forEach(btn => bindPress(btn, () => { host.dataset.mode = btn.dataset.shopTab; render(host); }));
  host.querySelectorAll('[data-shop-act]').forEach(btn => bindPress(btn, () => shopAction(host, Number(btn.dataset.shopIndex), btn.dataset.shopAct, render)));
}
