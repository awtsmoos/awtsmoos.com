// B"H
/**
 * @file spikeResetCountdown.js
 * @description Chapter 639: The countdown returns the player to the active
 * lava course's own safe feet, not an old fossil coordinate.
 */
import { worker } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { resetFeetFromPayload } from '../../../shared/SpikeResetPosition.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export function beginSpikeResetCountdown(overlay, manager, payload = {}) {
  let left = 3;
  const count = overlay.querySelector('[data-spike-count]');
  const text = overlay.querySelector('[data-spike-reset-text]');
  const position = resetFeetFromPayload(payload);
  text.textContent = 'Returning in...';
  count.textContent = String(left);
  const timer = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      clearInterval(timer);
      overlay.remove();
      const resetAfterSpikeDeath = { forceRunMode: false, resetLevelCollectibles: true };
      if (position) resetAfterSpikeDeath.position = position;
      worker(manager)?.postMessage?.({ resetAfterSpikeDeath });
      return;
    }
    count.textContent = String(left);
  }, 700);
}
