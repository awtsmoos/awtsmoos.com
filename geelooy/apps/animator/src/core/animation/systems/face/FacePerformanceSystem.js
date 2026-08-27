
// B"H
import { BrowEmotionOverlay } from './BrowEmotionOverlay.js';
import { MouthEmotionOverlay } from './MouthEmotionOverlay.js';

/**
 * @file FacePerformanceSystem.js
 * @description
 * CHAPTER: THE FACE GAINS LIFE.
 *
 * The base morph system gives the face its emotional skeleton.
 * This performance layer adds the moving flesh: brows that react,
 * cheeks that wake up, mouths that invite, and speech that breathes.
 */
export class FacePerformanceSystem {
  /**
   * Processes facial performance overlays.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Real time.
   * @returns {void}
   */
  static process(data, time) {
    if (!data) return;

    data.morphParams = data.morphParams || {
      bx: 0,
      bi: 0,
      bo: 0,
      ba: -5,
      squint: 1,
      cheek: 0,
      mouthSmile: 0,
      mouthFrown: 0,
      mouthGrimace: 0
    };

    BrowEmotionOverlay.apply(data, time);
    MouthEmotionOverlay.apply(data);
  }
}
