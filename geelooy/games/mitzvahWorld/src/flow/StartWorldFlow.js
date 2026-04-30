
import BittleNullification from '../core/BittleNullification.js';
import IkarOyvedManager from '../workers/IkarOyvedManager.js';
import UIManager from '../ui/managers/UIManager.js';

/**
 * B"H
 * @class StartWorldFlow
 * @description
 * 🌌 GENESIS ORCHESTRATOR 🌌
 * 
 * Coordinates the flow of creation. Connects the UI updates to the Worker's
 * initialization states. Fixes the issue where existence would halt at Stage 6
 * by respectfully awaiting the Vessel's readiness before speaking.
 */
export default class StartWorldFlow extends BittleNullification {
    constructor() {
        super();
        this.acknowledgeAwtsmoos('StartWorldFlow');
        this.ui = new UIManager();
    }

    /**
     * @method initiateGenesis
     * @description Begins the process of building the 3D Heavens and Earth.
     * @param {Object} payload - The initial spark of creation.
     */
    async initiateGenesis(payload) {
        console.log('B"H - ⚡ Signal sent: Genesis begins.');
        console.log('B"H - ⚡ INTENSE LOG: Main Thread startWorld initiated. Payload:', payload);
        
        // Render the extreme loading screen
        this.ui.manifestLandingScreen();
        this.ui.updateProgress(20, 'Forming the Tzimtzum (Constriction)...');

        // Create the worker manager (pointing to the correct path)
        const workerPath = 'src/workers/WorkerTzimtzum.js';
        const oyvedManager = new IkarOyvedManager(workerPath);

        this.ui.updateProgress(50, 'Vessels are aligning. Waiting for readiness...');

        // CRITICAL FIX: We MUST await the vessel ready signal!
        // Without this, the message goes into the void before the worker listens.
        await oyvedManager.waitForVessel();

        this.ui.updateProgress(80, 'Vessel Ready. Dispatching the First Word (pawsawch)...');

        // Now dispatch
        oyvedManager.dispatchGenesisPayload(payload);

        this.ui.updateProgress(100, 'Creation is actively unfolding! Welcome to Mitzvah World.');
        
        // Eventually fade out landing screen
        setTimeout(() => {
            const landing = document.getElementById('mitzvahWorldLanding');
            if (landing) {
                landing.style.opacity = '0';
                setTimeout(() => landing.remove(), 1000);
            }
        }, 3000);
    }
}
