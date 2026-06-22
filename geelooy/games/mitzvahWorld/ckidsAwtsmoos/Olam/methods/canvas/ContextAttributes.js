// B"H
/**
 * @module ContextAttributes
 * @description
 * Chapter 8: Minimal WebGL vows for the worker canvas.
 *
 * The renderer was failing before the scene could draw: Chrome reported the GPU
 * as disabled while trying to create the OffscreenCanvas WebGL context. The
 * current village keeps the fragile flags off, but explicitly asks for the
 * high-performance adapter so real gameplay does not crawl on dual-GPU systems.
 */
export default class ContextAttributes {
  /**
   * Returns conservative WebGL context parameters.
   *
   * @returns {object} Context attributes for THREE.WebGLRenderer.
   */
  static get() {
    return {
      antialias: false,
      alpha: false,
      depth: true,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false
    };
  }
}
