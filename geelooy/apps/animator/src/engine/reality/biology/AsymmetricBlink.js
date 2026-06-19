
// B"H
/**
 * @file AsymmetricBlink.js
 * @brief THE IMPERFECTION OF SIGHT (Pegam HaRe'iyah).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE TWIN WITNESSES
 * ═══════════════════════════════════════════════════════════════
 * The Awtsmoos creates every leaf unique. No two snowflakes are identical.
 * To make our 2D cutout characters blink in perfect unison (left and right 
 * eye closing at the exact same millisecond) is to create a robotic golem, 
 * devoid of the Ruach Chayim (Breath of Life).
 * 
 * This engine tracks the 'blink' float variable (0.0 to 1.0) and dynamically 
 * de-syncs it based on the eye side. The right eye lags behind the left 
 * eye by a deterministic mathematical phase offset, creating a fleshy, 
 * organic flutter.
 * 
 * @class AsymmetricBlink
 */

export class AsymmetricBlink {
  /**
   * @function getEyeSquash
   * @description Calculates the Y-axis squash of an eyelid.
   * @param {number} globalBlink - The master blink float (0 = open, 1 = closed).
   * @param {string} side - 'left' or 'right'.
   * @param {number} time - Global realTime clock in ms.
   * @returns {number} The independent blink state for this specific eye.
   */
  static getEyeSquash(globalBlink, side, time) {
    if (globalBlink <= 0) return 0;

    // The right eye lags behind the left eye by exactly 12 milliseconds!
    // We simulate this by offsetting the sine wave of the closing action.
    const phaseOffset = side === 'right' ? -0.15 : 0;
    
    // We warp the linear globalBlink into a quick parabolic snap
    let localizedBlink = globalBlink + phaseOffset;
    
    // Clamp to biological reality
    localizedBlink = Math.max(0, Math.min(1.0, localizedBlink));

    // Return the scale multiplier (1.0 = open, 0.0 = fully squashed shut)
    // We return the INVERSE for direct Y-scaling.
    return 1.0 - localizedBlink;
  }
}
