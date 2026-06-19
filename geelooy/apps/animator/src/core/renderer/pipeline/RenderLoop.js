
// B"H
import { RenderPipeline } from './RenderPipeline.js';
import { AutoPlayCovenant } from '../../playback/AutoPlayCovenant.js';
import { CanvasSizeGuardian } from '../../../rectification/CanvasSizeGuardian.js';
import { NLEDirectorBridge } from '../../../nle/core/NLEDirectorBridge.js';

/**
 * @file RenderLoop.js
 * @description
 * ============================================================================
 * CHAPTER: ONE HEARTBEAT, ONE CANVAS, NO SILENT BLACKNESS
 * ============================================================================
 *
 * The Awtsmoos renews time from nothing every instant. This loop is a tiny
 * created rhythm: guard autoplay, update the director, mirror camera state,
 * rectify canvas dimensions, then ask the pipeline to reveal the world.
 *
 * @class RenderLoop
 */
export class RenderLoop {
  static _isRunning = false;
  static _rafHandle = null;

  /**
   * Starts the render loop.
   *
   * @param {Object} app - AppCore instance.
   * @param {number} timestamp - Optional initial timestamp.
   * @returns {void}
   */
  static start(app, timestamp) {
    if (this._isRunning) {
      console.warn('B"H - RenderLoop already running. Ignoring duplicate start.');
      return;
    }

    if (!app || !app.ctx) {
      console.error('B"H - RenderLoop: No RenderContext found. Cannot start.');
      return;
    }

    this._isRunning = true;

    if (app.state && app.director) {
      AutoPlayCovenant.ensure(app, { force: true });
    }

    this._tick(app, timestamp || performance.now());
  }

  /**
   * Stops the render loop.
   *
   * @returns {void}
   */
  static stop() {
    this._isRunning = false;
    if (this._rafHandle !== null) {
      cancelAnimationFrame(this._rafHandle);
      this._rafHandle = null;
    }
  }

  /**
   * Performs one heartbeat.
   *
   * @param {Object} app - AppCore instance.
   * @param {number} timestamp - RAF timestamp.
   * @returns {void}
   * @private
   */
  static _tick(app, timestamp) {
    if (!this._isRunning) return;

    if (app.ctx && app.ctx.canvas) {
      CanvasSizeGuardian.rectify(app.ctx.canvas, app.ctx);
    }

    if (app.state && app.director) {
      AutoPlayCovenant.ensure(app);
    }

    if (app.director && app.director.isPlaying && typeof app.director.update === 'function') {
      app.director.update();
    }

    NLEDirectorBridge.sync(app);

    if (app.ctx && app.state && app.state.get) {
      const cam = app.state.get('camera');
      if (cam) app.ctx.camera = cam;
    }

    RenderPipeline.execute(app, timestamp);

    this._rafHandle = requestAnimationFrame(t => this._tick(app, t));
  }
}
