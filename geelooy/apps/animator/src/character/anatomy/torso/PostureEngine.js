
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @file PostureEngine.js
 * @description
 * THE BURDEN OF TIME (Masa HaZman).
 * B"H
 * 
 * THE POEM OF THE BENDING SPINE:
 * The years roll on, the gravity pulls,
 * A heavy weight upon the souls!
 * The spine begins to curve and bow,
 * To the Master of Time, it makes its vow.
 * Kyphosis bends the upper chest,
 * Where the ancient weary heart finds rest!
 * 
 * This module calculates the physical decay of posture based on the character's age.
 * An elder's spine mathematically curves forward, dropping their height and tilting 
 * their neck to gaze slightly upward to compensate.
 */
export class PostureEngine {
  /**
   * @function calculate
   * @description Derives postural offsets for the torso and neck based on chronological age.
   * @param {Object} data - The soul's properties.
   * @returns {Object} Rotational and positional offsets for the skeletal rig.
   */
  static calculate(data) {
    const age = data.age || 0; // 0.0 (youth) to 1.0 (ancient)
    
    // Kyphosis: The forward curving of the upper spine.
    // Scales exponentially as age approaches 1.0.
    const spineCurve = Math.pow(age, 2) * 25; // Up to 25 degrees of forward bend
    
    // To look forward while bent, the neck must tilt back.
    const neckCompensate = -spineCurve * 0.8; 

    // The center of gravity shifts downward and forward.
    const yDrop = spineCurve * 0.5;
    const xShift = spineCurve * 0.3;
    
    // Walk cycle modification: Shorter, stiffer strides.
    const strideScale = 1.0 - (age * 0.4); 
    const impactHeaviness = age * 0.5; // Less bounce, more heavy thud

    return {
      spineRotation: spineCurve,
      neckRotation: neckCompensate,
      torsoDropY: yDrop,
      torsoShiftX: xShift,
      strideScale: Math.max(0.2, strideScale),
      rigidity: impactHeaviness
    };
  }
}
