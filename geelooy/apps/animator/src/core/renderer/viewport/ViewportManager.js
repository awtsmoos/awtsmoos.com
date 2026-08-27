
/* B"H */
import { ViewportState } from './ViewportState.js';
import { ViewportRenderer } from './ViewportRenderer.js';
import { ViewportInteractions } from './ViewportInteractions.js';

/**
 * @class ViewportManager
 * @description
 * THE MASTER OF MAKOM (Place).
 * Completely listens to the global state to warp dimensions upon request!
 */
export class ViewportManager {
  /**
   * Initializes the infinite canvas environment.
   * @param {string} canvasId - The physical ID of the canvas element.
   * @param {string} stageId - The physical ID of the stage container.
   * @param {Object} state - The global App State to listen to.
   */
  static init(canvasId, stageId, state) {
    console.log('B"H - 👑 [ViewportManager] Establishing the Makom (Place) via Seder Histalshelus.');
    
    this.state = new ViewportState(canvasId, stageId);
    this.renderer = new ViewportRenderer(this.state);
    this.interactions = new ViewportInteractions(this.state, this.renderer);

    this.renderer.setupDOM();
    
    // Force default HD
    this.renderer.updateResolution(1920, 1080);
    this.interactions.bindEvents();
    
    if (this.state.stage) {
      const resizeObserver = new ResizeObserver(() => this.renderer.fitToScreen());
      resizeObserver.observe(this.state.stage);
    }

    // B"H - Listen for Reality Re-shaping (TikTok, Widescreen)
    if (state) {
      state.subscribe('canvas_resolution_changed', (res) => {
        console.log(`B"H - Reshaping the void to: ${res.w}x${res.h}`);
        this.renderer.updateResolution(res.w, res.h);
      });
    }
  }
}
