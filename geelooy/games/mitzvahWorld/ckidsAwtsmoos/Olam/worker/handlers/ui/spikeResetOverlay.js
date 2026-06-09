// B"H
/**
 * @file spikeResetOverlay.js
 * @description Chapter 389: Lava death receives a sealed overlay and a clear
 * return countdown.
 */
import { bindPress, hardSeal } from './domKit.js';
import { beginSpikeResetCountdown } from './spikeResetCountdown.js';
import { spikeResetMarkup } from './spikeResetMarkup.js';
export function showSpikeResetOverlay(manager) {
  if (document.getElementById('awtsmoos-spike-reset-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'awtsmoos-spike-reset-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(30,0,0,.82);display:grid;place-items:center;color:#fff;font-family:Arial;text-align:center;pointer-events:auto;';
  overlay.innerHTML = spikeResetMarkup();
  document.body.appendChild(overlay);
  const start = e => { hardSeal(e); beginSpikeResetCountdown(overlay, manager); };
  bindPress(overlay, start);
  window.addEventListener('keydown', start, { once: true });
}
