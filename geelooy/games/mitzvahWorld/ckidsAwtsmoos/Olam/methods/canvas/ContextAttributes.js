// B"H
/**
 * @module ContextAttributes
 * @description
 * Chapter 8: Minimal WebGL vows for the worker canvas.
 *
 * The renderer was failing before the scene could draw: Chrome reported the GPU
 * as disabled while trying to create the OffscreenCanvas WebGL context. The
 * safest repair is to stop asking for expensive or fragile context flags. No
 * antialias, no logarithmic depth buffer, no high-performance demand: first let
 * the browser give us any stable WebGL vessel, then the small Level 1 scene can
 * draw normally.
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
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false
    };
  }
}
