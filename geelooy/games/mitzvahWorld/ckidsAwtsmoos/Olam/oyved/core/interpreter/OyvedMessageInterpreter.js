
/**
 * B"H
 * @file OyvedMessageInterpreter.js
 * @module OyvedMessageInterpreter
 * @description
 * ✉️ THE READING OF THE SCROLL ✉️
 * Parses messages arriving from the Heavenly dimension (Main Thread) and 
 * channels them into the appropriate processing routines.
 * 
 * Entirely stripped of mass; it merely hands off the data to the 
 * GenesisRoute or the ContinuousRoute.
 */
import { GenesisRoute } from './GenesisRoute.js';
import { ContinuousRoute } from './ContinuousRoute.js';

export class OyvedMessageInterpreter {
    /**
     * @method handleMessage
     * @description Directs the initial thrust of creation or delegates ongoing events.
     */
    static async handleMessage(data, isVesselsSound, SystemCore, promiseMap) {
        if (!data || typeof data !== 'object') return null;

        // Await structural confirmation
        if (!isVesselsSound) {
            console.warn("B\"H - ⚠️ Sub-vessels shattered! Command discarded: ", Object.keys(data));
            return null;
        }

        // Phase 1: The Initial Outpouring (Genesis / Pawsawch)
        if (data.type === 'pawsawch' || data.pawsawch) {
            const payload = data.payload || data.pawsawch;
            return await GenesisRoute.execute(payload, SystemCore, promiseMap);
        }

        return 'CONTINUOUS';
    }

    /**
     * @method handleOngoing
     * @description Directs all post-creation heartbeat pulses.
     */
    static handleOngoing(ActiveOlamInstance, data, promiseMap) {
        ContinuousRoute.route(ActiveOlamInstance, data, promiseMap);
    }
}
