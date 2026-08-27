
// B"H
import { LassoState } from './LassoState.js';
import { LassoRenderer } from './LassoRenderer.js';
import { LassoBoundsMath } from './LassoBoundsMath.js';

/**
 * @class LassoManager
 * @description
 * THE NET OF GATHERING (Reshet Kibbutz).
 * B"H
 * 
 * Allows the Creator to drag a box of selection across the timeline, 
 * sweeping multiple sparks into a unified selection state.
 */
export class LassoManager {
  static init(viewport, state) {
    if (!viewport) return;
    this.viewport = viewport;
    this.appState = state;
    
    LassoRenderer.ensureVessel(viewport);

    viewport.addEventListener('mousedown', (e) => {
      // Only trigger lasso if clicking empty void space, not on clips or rulers
      if (e.target.closest('.nle-clip') || e.target.closest('.nle-ruler-container')) return;
      if (e.shiftKey) { // Require Shift+Drag for Lasso to avoid conflicting with Scrubbing
        LassoState.isDragging = true;
        const rect = viewport.getBoundingClientRect();
        LassoState.startX = e.clientX - rect.left + viewport.scrollLeft;
        LassoState.startY = e.clientY - rect.top + viewport.scrollTop;
        LassoState.currentX = LassoState.startX;
        LassoState.currentY = LassoState.startY;
        LassoRenderer.draw();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!LassoState.isDragging) return;
      const rect = viewport.getBoundingClientRect();
      LassoState.currentX = e.clientX - rect.left + viewport.scrollLeft;
      LassoState.currentY = e.clientY - rect.top + viewport.scrollTop;
      LassoRenderer.draw();
    });

    window.addEventListener('mouseup', () => {
      if (LassoState.isDragging) {
        LassoState.isDragging = false;
        LassoRenderer.hide();
        this._evaluateSelection();
      }
    });
  }

  static _evaluateSelection() {
    const selectedClips = LassoBoundsMath.findIntersections(LassoState, this.viewport);
    console.log(`B"H - Captured ${selectedClips.length} sparks in the net.`);
    // In a full multi-select setup, we would update state.set('selected_clips_array', selectedClips);
  }
}
