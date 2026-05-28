// B"H
/**
 * @module ContinuousRoute
 * @description Chapter 20: Ongoing worker route with bh24 local-reset router.
 */
import { ContinuousEventRouter } from '../ContinuousEventRouter.js?v=lean-l1-20260528-bh28';

export class ContinuousRoute {
  /** Routes all ongoing event keys into the event router. */
  static async route(ActiveOlamInstance, data, promiseMap) {
    if (!ActiveOlamInstance) return;
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i += 1) {
      await ContinuousEventRouter.route(ActiveOlamInstance, keys[i], data[keys[i]], promiseMap);
    }
  }
}
