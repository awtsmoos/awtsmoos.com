// B"H
/**
 * @file HeatHaze.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 36: THE SHIMMERING AIR (Tirtur HaAvir)
 * ═══════════════════════════════════════════════════════════════
 * 
 * At High Noon (timeOfDay = 0.5), the heat of the sun causes the air to 
 * refract light differently based on thermal density. Distant objects 
 * appear to shimmer and warp.
 * 
 * Since we ban standard WebGL pixel shaders to maintain pure vector 
 * dominance, we apply a high-frequency, low-amplitude sine wave offset 
 * natively to the Y-coordinates of the background mountain points!
 * 
 * @class HeatHaze
 */

export class HeatHaze {
  /**
   * @function apply
   * @description Modifies a raw Y-coordinate point based on time and heat intensity.
   * @param {number} py - The original Y-coordinate of the mountain peak.
   * @param {number} px - The X-coordinate (used to offset the wave phase).
   * @param {number} timeOfDay - Determines if it is hot enough to shimmer.
   * @param {number} realTime - The continuous ms clock for movement.
   * @returns {number} The warped Y-coordinate.
   */
  static apply(py, px, timeOfDay, realTime) {
    // Only shimmer intensely around noon (0.4 to 0.6)
    const distanceFromNoon = Math.abs(0.5 - timeOfDay);
    if (distanceFromNoon > 0.2) return py;

    // Intensity peaks precisely at 0.5
    const intensity = (0.2 - distanceFromNoon) * 5.0; // 0.0 to 1.0 multiplier

    // Rapid, jagged sine wave simulating optical refraction
    const shimmer = Math.sin(realTime * 0.015 + px * 0.1) * (2.5 * intensity);
    const secondaryRipple = Math.cos(realTime * 0.027 + px * 0.05) * (1.5 * intensity);

    return py + shimmer + secondaryRipple;
  }
}