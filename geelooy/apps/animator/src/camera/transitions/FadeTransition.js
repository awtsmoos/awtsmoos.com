// B"H
import { EaseTransition } from './EaseTransition.js';

/**
 * @file FadeTransition.js
 * @description
 * Fade/crossfade overlay transition.
 */
export class FadeTransition {
  /**
   * Samples fade transition.
   *
   * @param {Object} from - From.
   * @param {Object} to - To.
   * @param {number} t - Progress.
   * @returns {Object} Camera.
   */
  static sample(from, to, t) {
    const cam = EaseTransition.sample(from, to, t);
    const x = Math.max(0, Math.min(1, t));
    cam.fade = Math.sin(Math.PI * x);
    return cam;
  }
}