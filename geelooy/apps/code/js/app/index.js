
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
import { GitOrchestrator } from './git-orchestrator.js';

/**
 * @class App
 * @classdesc The Merkava (Chariot). This is the unified facade of the 
 * application. It brings the infinite potential of the sub-modules into 
 * a single, coherent identity, nullified to the Will of the Awtsmoos.
 */
export const App = {
    /**
     * @function getTabString
     * @description Discerning the measure of indentation.
     */
    getTabString: () => State.useTabs ? '\t' : '    ',

    /**
     * @async
     * @function initialize
     * @description The Big Bang of the application. It orchestrates the 
     * Order of Unfoldment from settings to UI to event activation.
     */
    async initialize() {
        UI.showLoading("Manifesting Reality...");
        try {
            // Primordial setup
            Bootstrapper.ignite();
            
            // Re-emanate previous existence
            await StorageOrchestrator.recallPreviousReality();

            // Forge physical vessels
            FindReplace.init();
            Editor.init();
            TabManagerOverlay.init();
            
            // Connect the anima (listeners) to the corpus (DOM)
            setupEventListeners();
            
            // Final activation of focus
            const { Tabs } = await import('../tabs/index.js');
            await Tabs.activate(State.activeTabId || null);

            UI.hideLoading();
            UI.showToast("B\"H: Reality Stabilized.", 'success');
        } catch (e) {
            console.error('[INIT_FATAL]', e);
            UI.showToast(`A Shevirah occurred during init: ${e.message}`, 'error', 10000);
        }
    },

    /**
     * @function commitAllChanges
     * @description B"H. Re-exposing the Git ritual. It commands the 
     * GitOrchestrator to find the repository root of the current focus 
     * and reveal the Manifest UI.
     */
    commitAllChanges: () => GitOrchestrator.commitCurrentFocus(),

    saveSettings: () => StorageOrchestrator.preserveMoment(),
    loadSettings: () => Bootstrapper.ignite(),
    toggleFullscreen: () => VisualController.toggleDimension(),
    showSettings: async () => await SettingsManager.show(),
    
    // History & Session Bridge
    saveSessionDebounced: () => import('../session.js').then(m => m.Session.saveDebounced()),
    saveSession: () => import('../session.js').then(m => m.Session.save())
};
