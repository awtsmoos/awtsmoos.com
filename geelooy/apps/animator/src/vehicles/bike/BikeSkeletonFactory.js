
// B"H

/**
 * @file BikeSkeletonFactory.js
 * @description
 * ============================================================================
 * CHAPTER: THE TWO WHEELS AND THE FRAME BETWEEN THEM
 * ============================================================================
 *
 * The bike receives a skeleton: wheels, seat, handlebar, pedals, chain ring,
 * and fork. Once named, the rider can attach hands, feet, and pelvis to it.
 *
 * @module BikeSkeletonFactory
 */

/**
 * @class BikeSkeletonFactory
 * @description
 * Creates bike skeleton points.
 */
export class BikeSkeletonFactory {
  /**
   * Creates skeleton for a bike.
   *
   * @param {Object} bike - Bike entity.
   * @param {Object} args - Render args.
   * @returns {Object} Bike skeleton.
   */
  static create(bike = {}, args = {}) {
    const scale = Math.max(0.25, Number(bike.scale) || 1);
    const pos = bike.position || {};
    const x = Number(pos.x) || 0;
    const y = Number(pos.y) || 0;
    const wheelR = 30 * scale;
    const wheelGap = 112 * scale;
    const time = Number(args.realTime) || performance.now();
    const rotation = (time * 0.006 * (bike.speed || 0.4)) % (Math.PI * 2);
    const pedalR = 17 * scale;
    const crank = rotation * (bike.cadence || 1);

    const rearWheel = { x: x - wheelGap * 0.5, y };
    const frontWheel = { x: x + wheelGap * 0.5, y };
    const crankCenter = { x, y: y - wheelR * 0.75 };
    const seat = { x: x - 18 * scale, y: y - wheelR * 2.05 };
    const handlebar = { x: x + 48 * scale, y: y - wheelR * 2.08 };

    return {
      root: { x, y },
      rearWheel,
      frontWheel,
      wheelRadius: wheelR,
      crankCenter,
      seat,
      handlebar,
      frameTop: { x: x + 8 * scale, y: y - wheelR * 1.65 },
      frontForkTop: { x: x + 38 * scale, y: y - wheelR * 1.7 },
      rearForkTop: { x: x - 30 * scale, y: y - wheelR * 1.45 },
      leftPedal: {
        x: crankCenter.x + Math.cos(crank) * pedalR,
        y: crankCenter.y + Math.sin(crank) * pedalR
      },
      rightPedal: {
        x: crankCenter.x + Math.cos(crank + Math.PI) * pedalR,
        y: crankCenter.y + Math.sin(crank + Math.PI) * pedalR
      },
      rotation,
      steering: Number(bike.steering) || 0,
      scale
    };
  }
}
