
// B"H
import { DragState } from './DragState.js';

/**
 * @file DragGhost.js
 * @brief THE PHANTOM SPARK (HaNitzotz HaTzel).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 12: THE TRANSLUCENT PROXY
 * ═══════════════════════════════════════════════════════════════
 * Manipulating the true clip DOM node during a drag causes severe 
 * layout thrashing and reflow penalties.
 * 
 * Instead, we clone the clip, drop its opacity to 0.5, and cast a 
 * glowing shadow. This "Ghost" tracks the mouse flawlessly, while 
 * the original clip remains dormant and hidden until the drop.
 * 
 * @class DragGhost
 */
export class DragGhost {
  /**
   * @function summon
   * @description Creates the ghost and the tooltip.
   */
  static summon(clip, currentPx, trackLane) {
    DragState.ghostClip = clip.cloneNode(true);
    DragState.ghostClip.style.opacity = '0.5';
    DragState.ghostClip.style.boxShadow = '0 0 15px rgba(0,255,204,0.5)';
    DragState.ghostClip.style.zIndex = '999';
    DragState.ghostClip.style.left = `${currentPx}px`; 
    
    trackLane.appendChild(DragState.ghostClip);
    
    DragState.originalClip.style.opacity = '0.1';

    DragState.timeTooltip = document.createElement('div');
    DragState.timeTooltip.style.cssText = 'position:absolute; top:-20px; background:#000; color:#00ffcc; font-size:9px; padding:2px 4px; border-radius:2px; z-index:1000; pointer-events:none; border:1px solid #00ffcc;';
    trackLane.appendChild(DragState.timeTooltip);
  }

  /**
   * @function update
   * @description Moves the ghost to the newly calculated pixel coordinate.
   */
  static update(snappedPx, snappedMs) {
    if (!DragState.ghostClip || !DragState.timeTooltip) return;
    
    DragState.ghostClip.style.left = `${snappedPx}px`;
    DragState.timeTooltip.style.left = `${snappedPx}px`;
    DragState.timeTooltip.innerText = `${(snappedMs / 1000).toFixed(2)}s`;
    
    // Store the pending time for the drop phase
    DragState.ghostClip.dataset.pendingStart = snappedMs;
  }

  /**
   * @function banish
   * @description Destroys the ghost and restores the original clip.
   */
  static banish() {
    if (DragState.ghostClip) {
      DragState.ghostClip.remove();
    }
    if (DragState.timeTooltip) {
      DragState.timeTooltip.remove();
    }
    if (DragState.originalClip) {
      DragState.originalClip.style.opacity = '1';
    }
  }
}
