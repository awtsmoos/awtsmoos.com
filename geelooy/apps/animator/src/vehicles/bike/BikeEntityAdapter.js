
// B"H
import { BikeSchema } from './BikeSchema.js';
import { BikeSkeletonFactory } from './BikeSkeletonFactory.js';
import { BikeRenderer } from './BikeRenderer.js';
import { BikeAttachmentSolver } from './BikeAttachmentSolver.js';

/**
 * @file BikeEntityAdapter.js
 * @description
 * ============================================================================
 * CHAPTER: THE BIKE THAT ENTERED THE ENTITY WORLD
 * ============================================================================
 *
 * The bike becomes a first-class entity: normalized schema, skeleton, renderer,
 * hit region, and attachment points. It can be selected, animated, and later
 * bound to a rider through IK.
 *
 * @module BikeEntityAdapter
 */

/**
 * @class BikeEntityAdapter
 * @description
 * Renders bike entities safely.
 */
export class BikeEntityAdapter {
  /**
   * Renders one bike entity.
   *
   * @param {Object} rawBike - Raw bike data.
   * @param {Object} args - Render arguments.
   * @returns {Object} Render result.
   */
  static render(rawBike, args = {}) {
    const bike = BikeSchema.create(rawBike);
    const skeleton = BikeSkeletonFactory.create(bike, args);
    const node = BikeRenderer.render(bike, skeleton);
    const attachments = BikeAttachmentSolver.attachments(skeleton);

    return {
      node,
      skeleton,
      attachments,
      hitRegion: {
        id: bike.id,
        entityType: 'bike',
        part: 'vehicle',
        x: skeleton.rearWheel.x - skeleton.wheelRadius,
        y: skeleton.seat.y - 28 * skeleton.scale,
        width: skeleton.frontWheel.x - skeleton.rearWheel.x + skeleton.wheelRadius * 2,
        height: skeleton.root.y - skeleton.seat.y + skeleton.wheelRadius + 28 * skeleton.scale,
        depth: Number(rawBike.depth || -20),
        payload: { bike, skeleton, attachments }
      }
    };
  }
}
