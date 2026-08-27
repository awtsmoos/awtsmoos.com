
// B"H
/**
 * @file FootRoll.js
 * @brief THE ARTICULATION OF THE HEEL (Perek HaAkev).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE CONTACT WITH ASSIYAH
 * ═══════════════════════════════════════════════════════════════
 * When a character's foot touches the earth, it does not remain perfectly 
 * parallel to the horizon. As the body moves forward, the heel lifts, 
 * the toes remain planted, and the ankle joint rotates up to 45 degrees.
 * 
 * This engine tracks the 'Phase' of the double-pendulum walk cycle. 
 * If the foot is in the 'Push-Off' state, it applies a sharp negative 
 * rotation. If it is in the 'Heel-Strike' state, it points the toes upward.
 * 
 * @class FootRoll
 */

export class FootRoll {
  /**
   * @function calculate
   * @description Computes the physical ankle rotation based on the stride phase.
   * @param {number} footWorldX - The absolute world X of the foot relative to the hip.
   * @param {number} strideLength - The maximum stretch of the leg.
   * @returns {number} The ankle rotation angle in degrees.
   */
  static calculate(footWorldX, strideLength) {
    // Normalize the foot's position from -1.0 (far back) to 1.0 (far front)
    const normalizedPos = footWorldX / strideLength;

    let ankleAngle = 0;

    // The Toe-Off Phase (Foot is far behind the body)
    if (normalizedPos < -0.6) {
      // As it reaches -1.0, the heel lifts sharply to push off
      const pushFactor = (Math.abs(normalizedPos) - 0.6) / 0.4; // 0.0 to 1.0
      ankleAngle = pushFactor * -45; // Roll toes down / heel up
    } 
    // The Heel-Strike Phase (Foot is reaching far in front of the body)
    else if (normalizedPos > 0.7) {
      // As it reaches 1.0, the toes point up to catch the earth
      const reachFactor = (normalizedPos - 0.7) / 0.3; // 0.0 to 1.0
      ankleAngle = reachFactor * 25; // Roll toes up
    }

    return ankleAngle;
  }
}
