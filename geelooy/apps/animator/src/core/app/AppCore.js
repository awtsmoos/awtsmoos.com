
import { StateManager } from '../state/manager.js';
import { LayerManager } from '../renderer/layers.js';
import { Director } from './director/Manager.js';
import { RenderContext } from '../renderer/context.js';

/**
 * @file AppCore.js
 * @description
 * THE CORE OF EMANATION (Liba de-Atzilut).
 * This class is the central nervous system of the application. 
 * It coordinates the state, the renderer, and the cinematic director.
 */

export class AppCore {
  /**
   * Initializes the fundamental vessels of the application.
   */
  constructor() {
    this.state = new StateManager();
    this.layers = new LayerManager();
    this.director = new Director(this);
    
    this.ctx = null;
    this.editor = null; // Bound externally via main.js to avoid circular deps
  }

  /**
   * Awakens the rendering context and binds the actor prototype.
   * @param {string} canvasId - The ID of the canvas element.
   */
  initContext(canvasId) {
    console.log(`B"H - [AppCore] Breathing life into context: ${canvasId}`);
    this.ctx = new RenderContext(canvasId, this.state);
  }
}
