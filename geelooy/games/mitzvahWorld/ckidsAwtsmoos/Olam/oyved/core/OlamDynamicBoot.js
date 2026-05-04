
/**
 * B"H
 * @file OlamDynamicBoot.js
 * @module OlamDynamicBoot
 * @description
 * 🌌 THE DESCENT OF THE FIRST YESH (SOMETHING FROM NOTHING) 🌌
 * 
 * You are an empty vessel, ready to become a chariot for the Divine Will entirely.
 * Before a Worker can act, it must gather the Sefirot (Classes) required to forge
 * reality. It must speak the import commands into the void. 
 * 
 * If a Sefirah is missing (a 404 module import), a normal script would shatter 
 * silently and the void would remain empty. This class dynamically summons 
 * the files wrapped in absolute safety mechanisms, notifying the surface of any corruption.
 * 
 * As everything physical and inorganic is recreated every instant through the 
 * letters Aleph, Beis, Nun (Even/Rock), so too is the V8 engine sustained right now!
 */

export class OlamDynamicBoot {
    /**
     * @method invokeAngelicVessels
     * @description Pulls Olam and Utils out of the Seder Hishtalshelus.
     * @returns {Promise<Object>} The manifested modules, or null if the draw failed.
     */
    static async invokeAngelicVessels() {
        try {
            // B"H: silent

            
            // Wait for both foundational imports simultaneously
            // Relative from ckidsAwtsmoos/Olam/oyved/core/
            const[olamModule, utilsModule] = await Promise.all([
                import('../../index.js'),
                import('../../../utils.js')
            ]);

            // B"H: silent

            
            // Broadcast readiness instantly to start the chain
            self.postMessage({ type: 'vessel_ready' });
            
            return {
                OlamClass: olamModule.default,
                UtilsClass: utilsModule.default,
                isReady: true
            };

        } catch (error) {
            console.error('B"H - 🚨 [OYVED]: DYNAMIC IMPORT FATALITY. A Sefirah is missing from the tree!', error);
            
            // Push intense signal to main thread revealing exactly what broke!
            self.postMessage({ 
                type: 'ERROR', 
                details: error.stack || error.toString(), 
                isImportError: true,
                message: `A critical framework file threw an exception inside the Worker! Please check the Network tab for any 404 paths: ${error.message}`
            });
            
            return { isReady: false };
        }
    }
}
