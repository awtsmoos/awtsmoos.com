
/**
 * B"H
 * @module GenesisRoute
 * @description
 * 🌟 THE GATEWAY OF ORIGINS 🌟
 * Isolates the logic for the very first command sent to the Worker.
 */
import { PawsawchProcessor } from '../pawsawch/PawsawchProcessor.js';

export class GenesisRoute {
    /**
     * @method execute
     * @description Hands the payload over to the Pawsawch Processor.
     */
    static async execute(payload, SystemCore, promiseMap) {
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
}
