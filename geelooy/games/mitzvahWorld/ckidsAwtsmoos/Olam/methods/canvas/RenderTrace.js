// B"H
/**
 * @module RenderTrace
 * @description
 * Tiny render-life diagnostic voice.
 *
 * When the canvas becomes a silent night, these words mark whether the worker
 * received dimensions, created a renderer, found a camera, and actually asked
 * Three.js to paint. The trace is intentionally data-shaped so the console can
 * tell the truth without guesswork.
 */
export default class RenderTrace {
  /**
   * Logs and posts one render trace checkpoint.
   *
   * @param {string} stage Render lifecycle stage.
   * @param {Object} details Serializable diagnostic details.
   * @returns {void}
   * Nothing is returned; the console and main thread receive the checkpoint.
   */
  static speak(stage, details = {}) {
    const safeDetails = RenderTrace.safe(details);
    const text = JSON.stringify(safeDetails);
    console.info(`B"H | RENDER_TRACE | ${stage} | ${text}`);

    try {
      globalThis.self?.postMessage?.({
        type: "render_trace",
        stage,
        payload: safeDetails
      });
    } catch (error) {
      console.warn(`B"H | RENDER_TRACE | post_failed | ${error?.message || String(error)}`);
    }
  }

  /**
   * Converts diagnostics into JSON-safe data.
   *
   * @param {Object} details Raw diagnostic object.
   * @returns {Object} JSON-safe diagnostic object.
   */
  static safe(details = {}) {
    try {
      return JSON.parse(JSON.stringify(details));
    } catch {
      return { unserializable: true, keys: Object.keys(details || {}) };
    }
  }
}
