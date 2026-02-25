
// B"H
// FILE: js/actions/dispatcher.js

import { State } from '../state.js';
import { UI } from '../ui.js';

/**
 * @class Dispatcher
 * @classdesc The Keter (Crown) of Intent. It receives the user's will 
 * and directs it to the appropriate vessel of manifestation. 
 * By using dynamic late-binding imports, it ensures that the flow 
 * of energy never circles back on itself to cause a module crash.
 */
export const Dispatcher = {
    /**
     * @async
     * @function handle
     * @description B"H. Maps intent strings to their holy rituals.
     */
    async handle(action, item = State.contextTarget) {
        try {
            const handlers = {
                // --- Filesystem Rituals ---
                "new-file": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
                "new-folder": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
                "rename": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
                "delete": async () => (await import('./file-actions.js')).FileActions.handle(action, item),

                // --- Navigation Rituals ---
                "open-file-commander-tab": async () => (await import('../file-commander.js')).FileCommander.open(item),
                "open-terminal-tab": async () => (await import('../terminal/index.js')).Terminal.open(item),
                "open-file-tab": async () => (await import('../tabs/index.js')).Tabs.create(item),
                "refresh": async () => (await import('../workspaces/index.js')).Workspaces.refreshNode(item),
                
                // --- Git Rituals ---
                "git-init": async () => (await import('../git/index.js')).GitManager.initializeRepository(item),
                "commit-changes": async () => (await import('../app/index.js')).App.commitAllChanges(),
                
                // --- Application Rituals ---
                "open-vibe": async () => {
                    const { VibeController } = await import('../vibe/vibe-controller.js');
                    VibeController.init();
                    VibeController.open(item);
                },
                "settings": async () => (await import('../app/index.js')).App.showSettings(),
                "toggle-fullscreen": async () => (await import('../app/index.js')).App.toggleFullscreen()
            };

            if (handlers[action]) {
                await handlers[action]();
            } else {
                // Absolute fallback for complex legacy actions
                const { Actions } = await import('./index.js');
                await Actions.handle(action, item);
            }
        } catch (e) {
            UI.showToast(`B"H Manifestation Error: ${e.message}`, "error");
            console.error(e);
        }
    }
};
