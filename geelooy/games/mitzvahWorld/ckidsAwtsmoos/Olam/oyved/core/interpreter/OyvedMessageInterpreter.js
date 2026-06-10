// B"H
/**
 * @module OyvedMessageInterpreter
 * @description
 * Chapter 33: Continuous Messages Carry The Countdown Route.
 *
 * The Awtsmoos routes genesis and every after-breath through fresh vessels:
 * authored Y is preserved, lava reset waits for touch/key, then feet return.
 */
import { GenesisRoute } from './GenesisRoute.js?compact=true';
import { ContinuousRoute } from './ContinuousRoute.js?compact=true';

export class OyvedMessageInterpreter {
  /**
   * Directs the initial creation message or delegates ongoing events.
   *
   * @param {object} data Incoming worker message.
   * @param {boolean} isVesselsSound Runtime health flag.
   * @param {object} SystemCore Core classes.
   * @param {Map} promiseMap Promise bridge.
   * @returns {Promise<object|string|null>} Genesis world, continuous marker, or null.
   */
  static async handleMessage(data, isVesselsSound, SystemCore, promiseMap) {
    if (!data || typeof data !== 'object') return null;
    if (!isVesselsSound) {
      console.warn('B"H - Sub-vessels shattered. Command discarded:', Object.keys(data));
      return null;
    }
    if (data.type === 'pawsawch' || data.pawsawch) return await GenesisRoute.execute(data.payload || data.pawsawch, SystemCore, promiseMap);
    return 'CONTINUOUS';
  }

  /**
   * Directs all post-creation pulses.
   *
   * @param {object} ActiveOlamInstance Active world.
   * @param {object} data Incoming data.
   * @param {Map} promiseMap Promise bridge.
   * @returns {Promise<void>} Completion.
   */
  static async handleOngoing(ActiveOlamInstance, data, promiseMap) {
    await ContinuousRoute.route(ActiveOlamInstance, data, promiseMap);
  }
}
