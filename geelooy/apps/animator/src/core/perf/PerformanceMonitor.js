
// B"H
import { FPSCalculator } from './FPSCalculator.js';
import { EntityCounter } from './EntityCounter.js';
import { PerfRenderer } from './PerfRenderer.js';

/**
 * @class PerformanceMonitor
 * @description
 * THE EYE OF PERFORMANCE (Ein HaPe'ulah).
 * B"H
 * 
 * "The Awtsmoos sustains every atom." We must ensure the biological machine 
 * performing this computation does not break under the strain. 
 * This HUD tracks the exact millisecond delta of the render loop.
 */
export class PerformanceMonitor {
  static container = null;
  static isTracking = false;
  static appState = null;

  static init(state) {
    this.appState = state;
    this._ensureVessel();
    // Default to off unless toggled
    this.isTracking = false;
  }

  static toggle() {
    this.isTracking = !this.isTracking;
    if (this.container) {
      this.container.style.display = this.isTracking ? 'block' : 'none';
    }
  }

  static _ensureVessel() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'awtsmoos-perf-mount';
      this.container.className = 'perf-container hidden';
      document.body.appendChild(this.container);
    }
  }

  static recordFrame(timestamp) {
    if (!this.isTracking || !this.container) return;
    
    FPSCalculator.tick(timestamp);
    
    // Only update DOM twice a second to avoid causing the lag we are tracking
    if (FPSCalculator.shouldUpdateDOM()) {
      const stats = {
        fps: FPSCalculator.getFPS(),
        ms: FPSCalculator.getMsPerFrame(),
        entities: EntityCounter.count(this.appState)
      };
      
      this.container.innerHTML = PerfRenderer.render(stats);
    }
  }
}
