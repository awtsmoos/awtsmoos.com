// B"H
import { CutTransition } from '../transitions/CutTransition.js';
import { EaseTransition } from '../transitions/EaseTransition.js';
import { FadeTransition } from '../transitions/FadeTransition.js';

/**
 * @file CameraTransitionController.js
 * @description
 * Cut, ease, and fade transition sampler.
 */
export class CameraTransitionController {
  /**
   * Samples transition.
   *
   * @param {Object} from - From camera.
   * @param {Object} to - To camera.
   * @param {Object} meta - Transition meta.
   * @returns {Object} Camera state.
   */
  static sample(from, to, meta = {}) {
    const kind = meta.transition || to.transition || 'cut';
    const t = Number.isFinite(meta.progress) ? meta.progress : 1;

    if (kind === 'fade' || kind === 'crossDissolve' || kind === 'fadeBlack') {
      return FadeTransition.sample(from, to, t);
    }

    if (kind === 'ease' || kind === 'pushIn' || kind === 'pullOut') {
      return EaseTransition.sample(from, to, t);
    }

    return CutTransition.sample(from, to, t);
  }
}