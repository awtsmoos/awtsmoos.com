
/* B”H */

/**
 * @class TimeState
 * @description
 * THE SEFIRAH OF ZMAN (Time).
 * Time itself is an illusion, re-created from absolute nothingness every single 
 * instant by the breath of the Awtsmoos. Past, present, and future exist simultaneously 
 * in the higher realms, but here, they are stretched out across the tracks of this NLE.
 * 
 * This engine calculates the exact ratio of milliseconds to physical pixels.
 * When the user 'Zooms' the timeline, they are performing a Tzimtzum (Contraction)
 * or Hitpashtut (Expansion) of their perception of eternity.
 */
export class TimeState {
  /**
   * Constructs the TimeState vessel.
   * @param {Object} appState - The global state manager.
   * @param {number} defaultDuration - The absolute length of the sequence in ms.
   */
  constructor(appState, defaultDuration = 60000) {
    this.state = appState;
    this.duration = defaultDuration;
    
    // The base constant of physical reality: 50 pixels equals one second of existence.
    this.basePixelsPerSecond = 50; 
    
    // The lens of perception. 1.0 is native truth. 
    // < 1 is distant (zoomed out), > 1 is microscopic (zoomed in).
    this.zoomLevel = 1.0; 
  }

  /**
   * Retrieves the unified scale factor combining base physics and the zoom lens.
   * @returns {number} The current multiplier for pixels per second.
   */
  get scaleFactor() {
    return this.basePixelsPerSecond * this.zoomLevel;
  }

  /**
   * Adjusts the lens of perception.
   * @param {number} delta - The shift in perception (e.g., +0.2 or -0.2).
   */
  setZoom(delta) {
    // We restrict the zoom so the universe does not collapse into a singularity (0.1)
    // nor expand beyond the capacity of the DOM to hold it (10.0).
    this.zoomLevel = Math.max(0.1, Math.min(10.0, this.zoomLevel + delta));
    
    // Alert the heavens that the scale of reality has shifted.
    this.state.notify('nle_zoom_changed');
  }

  /**
   * Transforms a spiritual measurement of time into a physical measurement of space.
   * @param {number} ms - Milliseconds since the beginning of the sequence.
   * @returns {number} The exact physical pixel width or position.
   */
  timeToPixels(ms) {
    return (ms / 1000) * this.scaleFactor;
  }

  /**
   * Transforms physical space back into the spiritual measurement of time.
   * @param {number} pixels - The physical pixels measured on the screen.
   * @returns {number} The equivalent milliseconds in the sequence.
   */
  pixelsToTime(pixels) {
    return (pixels / this.scaleFactor) * 1000;
  }
}
