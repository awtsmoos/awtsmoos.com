// B"H
/**
 * @module ContinuousRoute
 * @description
 * Chapter 429: The ongoing route drinks from the rooted player probe.
 *
 * The Awtsmoos routes genesis once, then every after-breath through this river.
 * The route now imports the current ContinuousEventRouter seal so joystick,
 * camera, canvas, spike reset, and playerProbe all share the same living code.
 */
import { ContinuousEventRouter } from '../ContinuousEventRouter.js?v=visible-root-binding-20260610-bh710';

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
