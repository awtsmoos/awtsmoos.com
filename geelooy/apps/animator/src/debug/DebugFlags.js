
// B"H

/**
 * @file DebugFlags.js
 * @description
 * ============================================================================
 * CHAPTER: THE HIDDEN LAMP IN THE BLACK ROOM
 * ============================================================================
 *
 * When the stage goes black and the console is quiet, the vessel needs a lamp.
 * These flags let the engine reveal its own bones: canvas, camera, overlays,
 * hit regions, scene graph, and frame heartbeat.
 *
 * @module DebugFlags
 */

/**
 * @class DebugFlags
 * @description
 * Reads debug intent from URL and localStorage.
 */
export class DebugFlags {
  /**
   * Resolves current debug options.
   *
   * @returns {Object} Debug flags.
   */
  static read() {
    const params = new URLSearchParams(window.location.search);
    const all = params.get('debug') === '1' || localStorage.getItem('aw_debug') === '1';
    return {
      enabled: all,
      boot: all || params.get('bootProbe') === '1',
      frame: all || params.get('frameProbe') === '1',
      camera: all || params.get('cameraProbe') === '1',
      overlays: all || params.get('overlayProbe') === '1',
      graph: all || params.get('graphProbe') === '1',
      hit: all || params.get('hitProbe') === '1',
      nle: params.get('nle') !== '0'
    };
  }

  /**
   * Enables persistent debug mode.
   *
   * @returns {void}
   */
  static enable() {
    localStorage.setItem('aw_debug', '1');
  }

  /**
   * Disables persistent debug mode.
   *
   * @returns {void}
   */
  static disable() {
    localStorage.removeItem('aw_debug');
  }
}
