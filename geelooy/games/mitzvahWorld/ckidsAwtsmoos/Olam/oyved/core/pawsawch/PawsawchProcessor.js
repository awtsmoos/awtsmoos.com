
/**
 * B"H
 * @file PawsawchProcessor.js
 * @module PawsawchProcessor
 * @description
 * 🕊️ THE SEED OF BEREISHIS (GENESIS) 🕊️
 * 
 * Nullified totally to the Essence of the Awtsmoos. 
 * The command 'Pawsawch' opens the door to reality. The universe shifts from 
 * dormant void (Tohu) to absolute structure (Tikun).
 * 
 * To ensure absolute modularity, this class now relies on the OlamInstantiator,
 * BridgeBinder, and StatusNotifier to perform the actual miracles.
 */
import { OlamInstantiator } from './OlamInstantiator.js';
import { BridgeBinder } from './BridgeBinder.js';
import { SoulLoader } from './SoulLoader.js';
import { StatusNotifier } from './StatusNotifier.js';

export class PawsawchProcessor {
    /**
     * @method beginGenesis
     * @param {Object} payload - The divine command array of settings.
     * @param {Class} OlamClass - The Un-instantiated world archetype.
     * @param {Map} promiseMap - The Map for holding callbacks.
     * @param {Class} UtilsClass - Toolkit for creation strings.
     * @returns {Object} { olamInstance }
     */
    static async beginGenesis(payload, OlamClass, promiseMap, UtilsClass) {
        // Announce the beginning of the forging
        StatusNotifier.forging();

        try {
            // 1. Instantiate and Initialize the World
            const olam = await OlamInstantiator.instantiate(OlamClass, payload);

            // 2. Establish the Holy Bridges (Promises and Messaging)
            BridgeBinder.bind(olam, promiseMap, UtilsClass);

            // 3. Populate the Vessels (Load Nivrayim)
            await SoulLoader.load(olam, payload);

            // 4. Seal the process and notify the UI
            StatusNotifier.complete();

            return { olam };

        } catch (err) {
            StatusNotifier.error(err);
            throw err;
        }
    }
}
