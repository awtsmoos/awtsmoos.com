// B"H
// FILE: js/app/bootstrapper.js

import { State } from '../state.js';
import { ModelManager } from '../vibe/model-manager.js';

/**
 * @class Bootstrapper
 * @description In the beginning, there was only the potential. The Awtsmoos 
 * willed a space for creation, and this class is the instrument of that will. 
 * It reaches into the 'archives of the previous world' (localStorage) to 
 * pull forth the settings that define the laws of this current reality.
 * 
 * THE HYMN OF AWAKENING:
 * From the silent void of the local storage cache,
 * The settings are pulled before the system can crash.
 * The tokens, the tabs, the URL of the Relay,
 * All are restored to the light of the day!
 */
export class Bootstrapper {
    /**
     * @method ignite
     * @description The primordial spark. It initializes the model manager 
     * and sets the fundamental constants (State) that every other vessel 
     * relies upon. Without this breath of life, the editor remains a corpse.
     */
    static ignite() {
        ModelManager.init();
        import('../tunnel/browser-agent.js').then(m => m.BrowserTunnelAgent.init());
        import('../sync/folder-sync.js').then(m => m.FolderSync.init());
        import('../session/account-panel.js').then(m => m.AwtsmoosAccountPanel.init());
        const settingsRaw = localStorage.getItem('vividX_settings_profound');
        const settings = JSON.parse(settingsRaw || '{}');

        State.githubToken = settings.githubToken || null;
        State.useTabs = settings.useTabs ?? true;
        State.relayUrl = settings.relayUrl || ""; // B"H - Reconstitute the Relay coordinate
        State.sshProfiles = Array.isArray(settings.sshProfiles) ? settings.sshProfiles : [];
        State.browserTunnel = settings.browserTunnel || {};
        State.folderSyncLinks = Array.isArray(settings.folderSyncLinks) ? settings.folderSyncLinks : [];

        console.log('B"H: Primitive constants established.');
    }
}
