
/**
 * B"H
 * @file PawsawchProcessor.js
 * @module PawsawchProcessor
 * @description
 * 🕊️ THE SEED OF BEREISHIS (GENESIS) 🕊️
 * 
 * Nullified totally to the Essence of the Awtsmoos. 
 * The command 'Pawsawch' opens the door to reality. The universe shifts from 
 * dormant void (Tohu) to absolute structure (Tikun). This class receives the payload,
 * integrates the options, initializes the Olam Core, binds the bridges, 
 * and summons the countless souls contained within the JSON blueprint!
 * 
 * Every node generated here is an expression of the Infinite Voice sustaining the realm.
 */
import { BridgeEstablishment } from './BridgeEstablishment.js';

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
        // B"H: silent

        self.postMessage({ type: 'pawsawch_digested', status: 'Forging' });

        try {
            // Instantiate the World vessel
            const olam = new OlamClass();
            
            // Set fundamental engine parameters
            if (payload.systemInfo && payload.systemInfo.set) {
                Object.assign(olam, payload.systemInfo.set);
            }

            // B"H: silent

            await olam.init();

            // Establish communication
            BridgeEstablishment.bindBridges(olam, promiseMap, UtilsClass);

            // Extract the manifest
            const worldData = payload.userInfo || payload;
            const nivrayimData = worldData.nivrayim || {};
            
            // B"H: silent

            
            const loadStart = performance.now();
            
            // Populating the vessels
            const result = await olam.loadNivrayim(nivrayimData);
            const loadTime = (performance.now() - loadStart).toFixed(2);
            
            // B"H: silent


            // Seal the process and notify the UI
            self.postMessage({ type: 'loadedWorld', payload: { status: 'Complete' } });
            self.postMessage({ type: 'game started', payload: true });

            return { olam };

        } catch (err) {
            console.error('B"H - 🚨 [OYVED]: Fatal Crash during creation:', err);
            self.postMessage({ type: 'ERROR', details: err.stack || err.toString() });
            throw err;
        }
    }
}
