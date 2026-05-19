
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
import { GitOrchestrator } from './git-orchestrator.js';
import { FullscreenManager } from './fullscreen-manager.js';
import { registerCodeTabTunnel } from '../tunnel/tabTunnelRegistrar.js';

export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',

    async initialize() {
        UI.showLoading("Manifesting Reality...");
        try {
            registerCodeTabTunnel();
            Bootstrapper.ignite();
            await StorageOrchestrator.recallPreviousReality();

            FindReplace.init();
            Editor.init();
            TabManagerOverlay.init();
            
            setupEventListeners();
            
            const { Tabs } = await import('../tabs/index.js');
            await Tabs.activate(State.activeTabId || null);

            UI.hideLoading();
            UI.showToast("B\"H: Reality Stabilized.", 'success');
        } catch (e) {
            console.error('[INIT_FATAL]', e);
            UI.showToast(`A Shevirah occurred during init: ${e.message}`, 'error', 10000);
        }
    },

    commitAllChanges: () => GitOrchestrator.commitCurrentFocus(),

    saveSettings: () => StorageOrchestrator.preserveMoment(),
    loadSettings: () => Bootstrapper.ignite(),
    
    // B"H - Directed to specialized vessel
    toggleFullscreen: () => FullscreenManager.toggleApp(),
    
    showSettings: async () => await SettingsManager.show(),
    saveSessionDebounced: () => import('../session.js').then(m => m.Session.saveDebounced()),
    saveSession: () => import('../session.js').then(m => m.Session.save())
};
