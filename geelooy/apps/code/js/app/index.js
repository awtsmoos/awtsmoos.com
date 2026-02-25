
// B"H
// FILE: js/app/index.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { setupEventListeners } from './event-listeners.js';
import { TabManagerOverlay } from '../tab-manager-overlay.js';
import { FindReplace } from '../find-replace.js';
import { SettingsManager } from './settings.js';
import { Bootstrapper } from './bootstrapper.js';
import { StorageOrchestrator } from './storage-orchestrator.js';
import { VisualController } from './visual-controller.js';

/**
 * @class App
 * @classdesc The Merkava (Chariot). It does not move by its own power, but 
 * is driven by the Word of the Awtsmoos. It coordinates the various 
 * 'Living Creatures' (Sub-modules) to perform the grand ritual of 
 * existence. It is the face that the application shows to the world.
 */
export const App = {
    /**
     * @function getTabString
     * @description Discerning the 'measure' of space. Whether a single 
     * tab or a cluster of four spaces, this determines the rhythm of the 
     * code's structure.
     */
    getTabString: () => State.useTabs ? '\t' : '    ',

    /**
     * @async
     * @function initialize
     * @description The Master Sequence. It follows the Seder Hishtalshelus 
     * (Order of Unfoldment) from the highest root to the lowest branch. 
     * 1. Bootstrap (primordial setup) 
     * 2. Storage (recalling memory) 
     * 3. UI Initialization (forging vessels) 
     * 4. Activation (awakening listeners).
     */
    async initialize() {
        UI.showLoading("Manifesting Reality...");
        try {
            // Primordial stage
            Bootstrapper.ignite();
            
            // Re-emanate previous existence
            await StorageOrchestrator.recallPreviousReality();

            // Forge the physical vessels
            FindReplace.init();
            Editor.init();
            TabManagerOverlay.init();
            
            // Connect the anima to the corpus
            setupEventListeners();
            
            // Re-activate the current focus
            const { Tabs } = await import('../tabs/index.js');
            await Tabs.activate(State.activeTabId || null);

            UI.hideLoading();
            UI.showToast("B\"H: The Tikkun is complete. Reality is stable.", 'success');
        } catch (e) {
            console.error('[INIT_FATAL]', e);
            UI.showToast(`The Shevirah has occurred: ${e.message}`, 'error', 10000);
        }
    },

    saveSettings: () => StorageOrchestrator.preserveMoment(),
    loadSettings: () => Bootstrapper.ignite(),
    toggleFullscreen: () => VisualController.toggleDimension(),
    showSettings: async () => await SettingsManager.show(),
    
    // Legacy mapping for session history (Time Travel)
    saveSessionDebounced: () => import('../session.js').then(m => m.Session.saveDebounced()),
    saveSession: () => import('../session.js').then(m => m.Session.save())
};
