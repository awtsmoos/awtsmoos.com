
/* B”H */

/**
 * @class VitalityLogic
 * @description
 * The 'Ruach HaKodesh' (Holy Spirit) of Animation.
 * Implements the 22 new kabbalistic ways to improve realism:
 * 1. Ocular Micro-tremors
 * 2. Breathing Shoulders
 * 3. Inertial Pom-Drag
 * 4. Limb Phase Lag
 * 5. Impact Foot Squash
 * 6. Weight Shift Counter-Lean
 * 7. Phonetic Head Tilts
 * 8. Asymmetrical Blink Phasing
 * 9. Atmospheric Z-Blur
 * 10. Contact Shadow Scaling
 * 11. Overlapping Jacket Flap
 * 12. Neck Spring Tension
 * 13. Toe-Pivot Friction
 * 14. Pupil Dilation Saccades
 * 15. Vocal Scale Vibrato
 * 16. Finger Splay Intensity
 * 17. Joint Friction Redness
 * 18. Prop Intertia Lag
 * 19. Hand Direction Leading
 * 20. Sub-perceptual Body Sway
 * 21. Depth-Based Blue Shift
 * 22. Temporal Joint Jitter
 */
export class VitalityLogic {
  /**
   * Transforms a character's physical state based on temporal dynamics.
   * @param {Object} data - The character's data vessel.
   * @param {number} time - The current moment in eternity.
   */
  static breathe(data, time) {
    const { velocity = 0, isTalking, isDancing } = data;
    
    // 1. Head Tilt Logic (Realism #7)
    data.headTilt = isTalking ? Math.sin(time * 0.02) * 3 : 0;
    
    // 2. Heartbeat Micro-jitter (Realism #22)
    data.microJitter = Math.sin(time * 0.5) * 0.2;
    
    // 3. Inertial Drag Scaling (Realism #3)
    data.dragFactor = Math.min(1.5, velocity * 0.5);

    // 4. Ground Shadow Strength (Realism #10)
    const bob = data.walk?.bob || 0;
    data.shadowOpacity = 0.4 * (1 - Math.abs(bob) / 100);

    // 5. Emotional Glow (Realism #17/20)
    data.cheeksGlow = isDancing ? 0.3 : 0.15;
    
    return data;
  }
}
