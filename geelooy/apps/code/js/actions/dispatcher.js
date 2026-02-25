
// B"H
// FILE: js/actions/dispatcher.js

import { State } from '../state.js';
import { UI } from '../ui.js';

/**
 * @class Dispatcher
 * @classdesc The Keter (Crown) of Intent. It stands above all other 
 * action vessels, receiving the user's will and deciding which 
 * subordinate vessel should manifest it. By using dynamic imports 
 * within its branches, it severs the circular dependencies that 
 * would otherwise cause the system to shatter.
 */
export const Dispatcher = {
    /**
     * @async
     * @function handle
     * @description The great navigator of intent. It maps abstract 
     * action strings to the actual rituals required to perform them.
     * @param {string} action The name of the intent to manifest.
     * @param {object} item The target of the intent.
     */
    async handle(action, item = State.contextTarget) {
        const workspaceId = item?.workspaceId || item?.id;
        
        try {
            // Map actions to their respective modules and functions
            const handlers = {
                // --- Filesystem Branch ---
                "new-file": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
                "new-folder": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
                "rename": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
                "delete": async () => (await import('./file-actions.js')).FileActions.handle(action, item),

                // --- Navigation Branch ---
                "open-file-commander-tab": async () => (await import('../file-commander.js')).FileCommander.open(item),
                "open-terminal-tab": async () => (await import('../terminal/index.js')).Terminal.open(item),
                "open-file-tab": async () => (await import('../tabs/index.js')).Tabs.create(item),
                "refresh": async () => (await import('../workspaces/index.js')).Workspaces.refreshNode(item),
                
                // --- Application Branch ---
                "open-vibe": async () => {
                    const { VibeController } = await import('../vibe/vibe-controller.js');
                    VibeController.init();
                    VibeController.open(item);
                },
                "git-init": async () => (await import('../git/index.js')).GitManager.initializeRepository(item),
                "settings": async () => (await import('../app/index.js')).App.showSettings(),
                "toggle-fullscreen": async () => (await import('../app/index.js')).App.toggleFullscreen()
            };

            if (handlers[action]) {
                await handlers[action]();
            } else {
                // Fallback for simple/un-modularized actions
                const { Actions } = await import('./index.js');
                await Actions.handle(action, item);
            }
        } catch (e) {
            UI.showToast(`B"H Manifestation Error: ${e.message}`, "error");
            console.error(e);
        }
    }
};
