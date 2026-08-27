
// B"H
import { SHOT_PRESET_REGISTRY } from './ShotPresetRegistry.js';
import { SubjectBoundsSolver } from './SubjectBoundsSolver.js';

/**
 * @file ShotSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE SHOT THAT BOWED TO THE SUBJECT
 * ============================================================================
 *
 * Shot intent comes first, subject bounds answer second, safe-frame mercy comes
 * last. This solver computes a camera target without letting one aligner erase
 * all cinema.
 *
 * @module ShotSolver
 */

/**
 * @class ShotSolver
 * @description
 * Converts shot names and focus into camera targets.
 */
export class ShotSolver {
  /**
   * Computes camera target.
   *
   * @param {Object} state - App state.
   * @param {Object} intent - Shot intent.
   * @returns {Object} Camera target.
   */
  static target(state, intent = {}) {
    const shotName = intent.shot || intent.type || 'group';
    const preset = SHOT_PRESET_REGISTRY[shotName] || SHOT_PRESET_REGISTRY.group;
    const bounds = SubjectBoundsSolver.solve(state, intent);
    const focusX = bounds ? (bounds.centerX - this.viewportWidth(state) * 0.5) * 0.65 : 0;
    const focusY = bounds ? (bounds.centerY - this.viewportHeight(state) * 0.5) * 0.12 : 0;

    return {
      x: this.clamp((preset.x || 0) + focusX, -420, 420),
      y: this.clamp((preset.y || -118) + focusY, -260, 60),
      zoom: this.clamp(intent.zoom || preset.zoom || 0.62, 0.28, 1.55),
      rotation: intent.rotation ?? preset.rotation ?? 0,
      shot: shotName,
      safe: preset.safe,
      focusBounds: bounds
    };
  }

  /**
   * Resolves viewport width.
   *
   * @param {Object} state - App state.
   * @returns {number} Width.
   */
  static viewportWidth(state) {
    const m = state && state.get ? state.get('canvas_metrics') : null;
    return m?.pixelWidth || window.innerWidth || 800;
  }

  /**
   * Resolves viewport height.
   *
   * @param {Object} state - App state.
   * @returns {number} Height.
   */
  static viewportHeight(state) {
    const m = state && state.get ? state.get('canvas_metrics') : null;
    return m?.pixelHeight || window.innerHeight || 600;
  }

  /**
   * Clamps a number.
   *
   * @param {number} value - Value.
   * @param {number} min - Minimum.
   * @param {number} max - Maximum.
   * @returns {number} Clamped value.
   */
  static clamp(value, min, max) {
    const n = Number.isFinite(value) ? value : min;
    return Math.max(min, Math.min(max, n));
  }
}
