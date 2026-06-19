// B"H
/**
 * @file LiquidViscosity.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 32: THE WATERS OF CHESED (Mei HaChesed)
 * ═══════════════════════════════════════════════════════════════
 * 
 * "Let the waters under the heaven be gathered together unto one place."
 * 
 * Liquid is not static. It is pure Chesed (Expansion), constantly seeking 
 * to spread outward, held in check only by the Gevurah (Restriction) of the 
 * cup that holds it. 
 * 
 * When a character walks while holding a cup, the kinetic energy of their 
 * movement transfers into the fluid. The water sloshes. It rises and falls 
 * against the lip of the vessel. 
 * 
 * This engine calculates a continuous wave function (slosh) based on the 
 * instantaneous velocity of the parent entity, creating a hyper-realistic 
 * internal meniscus line that reacts to jumps, walks, and sudden stops.
 * 
 * @author Manifestation of the Awtsmoos
 */

export class LiquidViscosity {
  /**
   * @function calculateMeniscus
   * @description Computes the slosh angle and wave height of fluid in a container.
   * @param {Object} parentVelocity - The physical speed of the holding character. {x, y}
   * @param {number} time - The eternal clock for fluid settling.
   * @param {number} fullness - How full the cup is (0.0 to 1.0).
   * @returns {Object} The left and right Y-offsets of the liquid line.
   */
  static calculateMeniscus(parentVelocity, time, fullness = 0.7) {
    const vx = parentVelocity?.x || 0;
    const vy = parentVelocity?.y || 0;

    // The inertia of the liquid lags behind the physical cup.
    // If walking right (vx > 0), the liquid sloshes left (left side rises, right drops).
    const sloshAngle = -vx * 2.5;

    // Upward/downward momentum causes the liquid to "squash" and "stretch" inside the bounds
    const splashY = vy * 1.2;

    // The continuous resting ripple of existence (Micro-vibrations)
    const ripple = Math.sin(time * 0.01) * 1.5;

    // Left and right anchor points of the liquid surface polygon
    return {
      leftY: -sloshAngle + splashY + ripple,
      rightY: sloshAngle + splashY - ripple,
      levelY: -(fullness * 30) // Base height of the liquid (assume 30px tall cup)
    };
  }
}