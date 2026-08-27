
// B"H

/**
 * @file BikeSchema.js
 * @description
 * ============================================================================
 * CHAPTER: THE WHEELED VESSEL THAT LEARNED ITS OWN BONES
 * ============================================================================
 *
 * A bike is not a floating prop. It has wheels, frame, seat, handlebar, pedals,
 * crank, fork, and attachment points. This schema gives it order.
 *
 * @module BikeSchema
 */

/**
 * @class BikeSchema
 * @description
 * Creates complete bike entity data.
 */
export class BikeSchema {
  /**
   * Creates a normalized bike.
   *
   * @param {Object} data - Bike data.
   * @returns {Object} Complete bike.
   */
  static create(data = {}) {
    const id = data.id || 'bike_' + Date.now() + '_' + Math.floor(Math.random() * 9999);

    return {
      id,
      type: 'bike',
      preset: data.preset || 'cityBike',
      position: {
        x: Number(data.position?.x) || Number(data.x) || 0,
        y: Number(data.position?.y) || Number(data.y) || 0
      },
      scale: Math.max(0.25, Number(data.scale) || 1),
      speed: Number(data.speed) || 0,
      steering: Number(data.steering) || 0,
      cadence: Number(data.cadence) || 1,
      riderId: data.riderId || null,
      colors: {
        frame: data.colors?.frame || '#22d3ee',
        tire: data.colors?.tire || '#101114',
        rim: data.colors?.rim || '#e5e7eb',
        seat: data.colors?.seat || '#111827',
        handlebar: data.colors?.handlebar || '#d1d5db'
      }
    };
  }
}
