
/* B”H */
import { ViewportState } from './viewport/ViewportState.js';
import { ViewportRenderer } from './viewport/ViewportRenderer.js';
import { ViewportInteractions } from './viewport/ViewportInteractions.js';

/**
 * @class ViewportManager
 * @description
 * THE MASTER OF MAKOM (Place).
 * Now completely shattered into sub-modules for extreme performance and 
 * infinite modularity. It delegates the responsibility of the physical canvas 
 * to the State, Renderer, and Interaction vessels.
 */
export class ViewportManager {
  static init(canvasId, stageId) {
    console.log('B"H - [ViewportManager] Establishing the Makom (Place) via Seder Histalshelus.');
    this.state = new ViewportState(canvasId, stageId);
    this.renderer = new ViewportRenderer(this.state);
    this.interactions = new ViewportInteractions(this.state, this.renderer);

    this.renderer.setupDOM();
    this.renderer.updateResolution(1920, 1080);
    this.interactions.bindEvents();
    
    if (this.state.stage) {
      const resizeObserver = new ResizeObserver(() => this.renderer.fitToScreen());
      resizeObserver.observe(this.state.stage);
    }
  }
}
