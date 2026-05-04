
/**
 * B"H
 * @file OyvedMessageInterpreter.js
 * @module OyvedMessageInterpreter
 * @description
 * ✉️ THE READING OF THE SCROLL ✉️
 * Parses messages arriving from the Heavenly dimension (Main Thread) and 
 * channels them into the appropriate processing routines.
 */
import { PawsawchProcessor } from './PawsawchProcessor.js';
import { ContinuousEventRouter } from './ContinuousEventRouter.js';

export class OyvedMessageInterpreter {
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
            
            try {
                const manifestation = await PawsawchProcessor.beginGenesis(
                    payload, 
                    SystemCore.OlamClass, 
                    promiseMap, 
                    SystemCore.UtilsClass
                );
                
                // Return the eternal instance so index can hold it globally
                return manifestation.olam;

            } catch (genErr) {
                console.error('B"H - 🚨[GENESIS CRITICAL]: World shattered at the origin point.', genErr);
                return null;
            }
        }

        return 'CONTINUOUS';
    }

    static handleOngoing(ActiveOlamInstance, data, promiseMap) {
        if (!ActiveOlamInstance) return;

        const keys = Object.keys(data);
        const isSpam = keys.some(k => ['mousemove', 'keydown', 'keyup', 'mousedown', 'mouseup', 'cameraDrag', 'wheel'].includes(k));
        if (!isSpam) {
            // B"H: silent

        }

        for (let i = 0; i < keys.length; i++) {
            const eventKey = keys[i];
            const eventPayload = data[eventKey];
            ContinuousEventRouter.route(ActiveOlamInstance, eventKey, eventPayload, promiseMap);
        }
    }
}

