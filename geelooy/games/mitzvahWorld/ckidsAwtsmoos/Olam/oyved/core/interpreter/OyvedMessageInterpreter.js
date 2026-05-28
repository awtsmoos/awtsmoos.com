// B"H
/**
 * @module OyvedMessageInterpreter
 * @description Chapter 12: Routes genesis and continuous worker messages freshly.
 */
import { GenesisRoute } from './GenesisRoute.js?v=lean-l1-20260528-bh17';
import { ContinuousRoute } from './ContinuousRoute.js?v=lean-l1-20260528-bh17';

export class OyvedMessageInterpreter {
  /** Directs the initial creation message or delegates ongoing events. */
  static async handleMessage(data, isVesselsSound, SystemCore, promiseMap) {
    if (!data || typeof data !== 'object') return null;
    if (!isVesselsSound) {
      console.warn('B"H - Sub-vessels shattered. Command discarded:', Object.keys(data));
      return null;
    }
    if (data.type === 'pawsawch' || data.pawsawch) return await GenesisRoute.execute(data.payload || data.pawsawch, SystemCore, promiseMap);
    return 'CONTINUOUS';
  }

  /** Directs all post-creation pulses. */
  static async handleOngoing(ActiveOlamInstance, data, promiseMap) {
    await ContinuousRoute.route(ActiveOlamInstance, data, promiseMap);
  }
}
