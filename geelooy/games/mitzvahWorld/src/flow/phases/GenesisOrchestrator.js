
/**
 * @file GenesisOrchestrator.js
 * @description
 * =============================================================================
 * CHAPTER 7: THE SIX DAYS OF FORMATION
 * =============================================================================
 * "And the earth was without form, and void; and darkness was upon 
 * the face of the deep."
 * 
 * The GenesisOrchestrator is the specific logic that bridges the gap between 
 * the Menu and the World. It is the "Active Hand" that guides the Tzimtzum.
 * 
 * THE TIKKUN (FIX):
 * We have fortified the 'beginUnfoldingReality' sequence. It now correctly 
 * triggers 'pawsawch' and awaits 'pawsawch_digested'. By providing the 
 * proper 'vessel_ready' handshake first, we guarantee that the First Word 
 * never falls on deaf ears.
 */

import BittulSoul from '../../core/BittulSoul.js';
import IkarOyvedManager from '../../workers/managers/IkarOyvedManager.js';

export default class GenesisOrchestrator extends BittulSoul {
    /**
     * @constructor
     * @param {Object} screenConduitInstance - The physical display manager.
     */
    constructor(screenConduitInstance) {
        super();
        this.surrenderToAwtsmoos('GenesisOrchestrator');
        
        this.displayMatrix = screenConduitInstance;
        this.angelCommander = new IkarOyvedManager();
    }

    /**
     * @async
     * @method beginUnfoldingReality
     * @description 
     *  The core generator loop. It pulses the UI as the Worker reports 
     *  its internal readiness.
     * 
     * @param {Object} essenceParams - Global configuration and user state.
     */
    async beginUnfoldingReality(essenceParams) {
        // 1. Manifest the veil
        this.displayMatrix.mountGenesisScreen();
        this.displayMatrix.manipulateStreamFlow(10, 'Establishing Seder Hishtalshelus...');

        // 2. WAIT FOR VESSEL READY (STAGE 6)
        // This is where the logs previously stopped. We now wait for the handshake.
        await this.angelCommander.watchForSign('vessel_ready');
        
        this.displayMatrix.manipulateStreamFlow(35, 'The Empty Vessel reported total Bittul. Expanding constraints.');

        // 3. LISTEN FOR PROGRESS
        // As the worker "digests" the light, we update the user's perception.
        this.angelCommander.commLayer.establishTreaty('manifestation_progress', (struct) => {
            this.displayMatrix.manipulateStreamFlow(struct.meta, struct.text);
        });

        // 4. UTTER THE FIRST WORD
        this.displayMatrix.manipulateStreamFlow(50, 'Uttering the "First Word" - Genesis is initiated.');
        this.angelCommander.utterTheDivineWord('pawsawch', essenceParams);

        // 5. WAIT FOR DIGESTION (STAGE 9/10)
        // The worker must now send 'pawsawch_digested' back to satisfy this await.
        await this.angelCommander.watchForSign('pawsawch_digested');
        
        this.displayMatrix.manipulateStreamFlow(100, 'Creation is actively recreating every moment. It is prepared!');
        
        // 6. DISSOLVE THE VEIL
        setTimeout(() => {
            console.log('B"H - 🪐 [WORLD INITIALIZED SUCCESSFULLY! Reality is stable.]');
            this.displayMatrix.completelyVanishMenu();
            this.displayMatrix.fadeAndDismantleVeil();
            
            // Note: Here, the engine would transition to the main Render loop/Player control.
        }, 1200);
    }
}
