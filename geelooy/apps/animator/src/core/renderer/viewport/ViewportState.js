
/**
 * @file ViewportState.js
 * @description
 * THE VESSEL OF MEASUREMENTS (Kli HaMiddot).
 * Holds the truth of the physical manifestation. 
 * 
 * RECTIFICATION:
 * We no longer use document.getElementById in the constructor, which 
 * was causing a race condition. Instead, we create the elements here, 
 * in the World of Briah (Creation), so they are ready to be birthed 
 * into the DOM by the Renderer.
 */

export class ViewportState {
  /**
   * @param {string} canvasId - The ID to bestow upon the canvas.
   * @param {string} stageId - The ID of the existing stage parent.
   */
  constructor(canvasId, stageId) {
    this.canvasId = canvasId;
    this.stageId = stageId;
    
    // Create the physical vessels
    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasId;
    
    this.container = document.createElement('div');
    this.container.className = 'viewport-container';
    
    // Default dimensions of the universe
    this.internalW = 1920;
    this.internalH = 1080;
    
    this.zoom = 1.0;
    this.pan = { x: 0, y: 0 };
    this.baseScale = 1.0;
  }
}
