// B"H
/**
 * @module ContinuousRoute
 * @description
 * Chapter 32: The ongoing route drinks from the active mobileMove router.
 *
 * The old router had camera/key events only. The Awtsmoos now sends every
 * post-genesis worker message through a ContinuousEventRouter that knows the
 * real wall joystick packet: `mobileMove`.
 */
import { ContinuousEventRouter } from '../ContinuousEventRouter.js?v=wall-direct-mobile-router-20260610-bh706';

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
