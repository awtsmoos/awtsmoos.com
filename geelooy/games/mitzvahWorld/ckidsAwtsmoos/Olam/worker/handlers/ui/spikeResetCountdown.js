// B"H
/**
 * @file spikeResetCountdown.js
 * @description Chapter 388: The countdown returns the player to safe feet.
 */
import { START_FEET, worker } from './domKit.js';
export function beginSpikeResetCountdown(overlay, manager) {
  let left = 3;
  const count = overlay.querySelector('[data-spike-count]');
  const text = overlay.querySelector('[data-spike-reset-text]');
  text.textContent = 'Returning in...';
  count.textContent = String(left);
  const timer = setInterval(() => {
    left -= 1;
    if (left <= 0) { clearInterval(timer); overlay.remove(); worker(manager)?.postMessage?.({ resetAfterSpikeDeath: { position: START_FEET, forceRunMode: false, resetLevelCollectibles: true } }); return; }
    count.textContent = String(left);
  }, 700);
}
