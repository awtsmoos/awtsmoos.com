// B"H
/**
 * @module OyvedMessageInterpreter
 * @description
 * Chapter 34: Continuous Messages Wait Without Shattering The Console.
 *
 * The Awtsmoos keeps creating every vessel from nothing, yet not every spark is
 * ready at the first knock. Before the worker core is sound, commands are
 * counted, remembered, and reported sparingly instead of screaming forever.
 */
import { GenesisRoute } from './GenesisRoute.js?compact=true';
import { ContinuousRoute } from './ContinuousRoute.js?compact=true';

const SHATTERED_WARN_GAP_MS = 5000;
const SHATTERED_SAMPLE_LIMIT = 8;
const shattered = { total:0, lastWarnAt:0, firstAt:0, lastAt:0, lastKeys:[], samples:[] };

function keysOf(data) { return data && typeof data === 'object' ? Object.keys(data).slice(0, 12) : []; }
function publishShatteredDiagnostic(keys) {
  const now = Date.now();
  shattered.total += 1; shattered.firstAt ||= now; shattered.lastAt = now; shattered.lastKeys = keys;
  shattered.samples.push({ at:now, keys }); shattered.samples = shattered.samples.slice(-SHATTERED_SAMPLE_LIMIT);
  globalThis.__AWTSMOOS_SUB_VESSEL_DIAG__ = { ...shattered, message:'sub-vessels not ready; command ignored until vessel boot completes' };
  if (shattered.total === 1 || now - shattered.lastWarnAt >= SHATTERED_WARN_GAP_MS) {
    shattered.lastWarnAt = now;
    console.warn('B"H - Sub-vessels not ready; holding console silence after this diagnostic.', { total:shattered.total, keys });
  }
}

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
    if (!isVesselsSound) { publishShatteredDiagnostic(keysOf(data)); return null; }
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
