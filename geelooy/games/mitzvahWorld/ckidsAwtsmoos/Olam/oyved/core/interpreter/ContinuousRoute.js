// B"H
/**
 * @module ContinuousRoute
 * @description
 * Chapter 31: The Ongoing Route Carries The New Lava Covenant.
 *
 * The Awtsmoos routes post-creation worker messages through the reset router
 * that understands countdown respawn and feet-on-ground positions.
 */
import { ContinuousEventRouter } from '../ContinuousEventRouter.js?v=lava-camera-axis-20260609-bh640';

export class ContinuousRoute {
  /**
   * Routes all ongoing event keys into the event router.
   *
   * @param {object} ActiveOlamInstance Active world.
   * @param {object} data Message payload.
   * @param {Map} promiseMap Promise bridge.
   * @returns {Promise<void>} Completion.
   */
  static async route(ActiveOlamInstance, data, promiseMap) {
    if (!ActiveOlamInstance) return;
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i += 1) await ContinuousEventRouter.route(ActiveOlamInstance, keys[i], data[keys[i]], promiseMap);
  }
}
