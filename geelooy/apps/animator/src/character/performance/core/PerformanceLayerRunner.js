
// B"H

/**
 * @file PerformanceLayerRunner.js
 * @description
 * ============================================================================
 * CHAPTER: THE LAYER GATE THAT STOPPED CALLING CLASSES LIKE FUNCTIONS
 * ============================================================================
 *
 * The render broke because a class constructor was invoked as if it were a
 * plain function. That is a vessel-confusion bug: class, object, function,
 * static apply, static sample, static compose — each has its own gate.
 *
 * This runner is the single humble gatekeeper. It checks every layer form and
 * invokes only the valid path. The Awtsmoos creates all forms from nothing
 * every instant; this file merely refuses to confuse one created form with
 * another.
 *
 * @module PerformanceLayerRunner
 */

/**
 * @class PerformanceLayerRunner
 * @description
 * Safely invokes animation/performance layers regardless of whether they expose
 * static apply, static sample, static compose, an instance method, or an old
 * plain function.
 */
export class PerformanceLayerRunner {
  /**
   * Runs a performance layer safely.
   *
   * @param {Object|Function} layer - Layer module, class, object, or function.
   * @param {Object} pose - Mutable pose object.
   * @param {Object} state - Normalized performance state.
   * @param {Object} view - Stable view profile.
   * @param {number} time - Render time in milliseconds.
   * @param {Object} world - World/render context.
   * @returns {Object} The same pose object after layer effects.
   */
  static run(layer, pose, state, view, time, world = {}) {
    if (!layer) return pose;

    try {
      if (typeof layer.apply === 'function') {
        const result = layer.apply(pose, state, view, time, world);
        return this.mergeResult(pose, result);
      }

      if (typeof layer.sample === 'function') {
        const result = layer.sample({ pose, state, view, time, world, character: state.raw || state.data || state });
        return this.mergeResult(pose, result);
      }

      if (typeof layer.compose === 'function') {
        const result = layer.compose({ pose, state, view, time, world, character: state.raw || state.data || state });
        return this.mergeResult(pose, result);
      }

      if (this.isCallablePlainFunction(layer)) {
        const result = layer(pose, state, view, time, world);
        return this.mergeResult(pose, result);
      }
    } catch (error) {
      this.warnOnce(layer, error);
    }

    return pose;
  }

  /**
   * Merges returned layer data into pose.
   *
   * @param {Object} pose - Mutable pose object.
   * @param {Object|undefined} result - Result returned from layer.
   * @returns {Object} Pose.
   */
  static mergeResult(pose, result) {
    if (!result || result === pose || typeof result !== 'object') return pose;
    this.deepMerge(pose, result);
    return pose;
  }

  /**
   * Deeply merges objects while preserving nested pose containers.
   *
   * @param {Object} target - Target object.
   * @param {Object} source - Source object.
   * @returns {Object} Target object.
   */
  static deepMerge(target, source) {
    for (const [key, value] of Object.entries(source || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== 'object') target[key] = {};
        this.deepMerge(target[key], value);
      } else {
        target[key] = value;
      }
    }
    return target;
  }

  /**
   * Determines whether a function can be called without new.
   *
   * @param {Function} fn - Possible function.
   * @returns {boolean} True when it is not a class constructor.
   */
  static isCallablePlainFunction(fn) {
    if (typeof fn !== 'function') return false;
    const text = Function.prototype.toString.call(fn);
    return !text.startsWith('class ');
  }

  /**
   * Logs a layer failure only once per layer.
   *
   * @param {Object|Function} layer - Layer that failed.
   * @param {Error} error - Failure.
   * @returns {void}
   */
  static warnOnce(layer, error) {
    const name = layer?.name || layer?.constructor?.name || 'unknownLayer';
    this._warned = this._warned || new Set();
    if (this._warned.has(name)) return;
    this._warned.add(name);
    console.warn('B"H - Performance layer skipped safely:', name, error);
  }
}
