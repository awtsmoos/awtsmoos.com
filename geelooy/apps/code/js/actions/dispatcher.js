
// B"H
// FILE: js/actions/dispatcher.js

import { State } from '../state.js';
import { UI } from '../ui.js';

/**
 * @class Dispatcher
 * @description The Supreme Orchestrator of Action. 
 * Re-forged to ensure absolute architectural clarity.
 * 
 * THE POEM OF THE DISPATCHER:
 * Intent arrives from the Menu's touch,
 * The Dispatcher knows what to do, and how much.
 * It maps the label to the module of power,
 * Manifesting the will in this very hour.
 */
export const Dispatcher = {
    async handle(action, item = State.contextTarget) {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        
        // B"H - Pure Mapping of Sacred Intent
        const ritualHandlers = {
            // --- Content Branch ---
            "select-all": async () => (await import('./text-actions.js')).TextActions.selectAll(),
            "copy-all": async () => (await import('./text-actions.js')).TextActions.copyAll(),
            "view-html": async () => (await import('../tabs/index.js')).Tabs.createPreview(activeTab.item, activeTab.content),
            "beautify": async () => {
                const { Editor } = await import('../editor.js');
                const { beautify } = await import("/scripts/awtsmoos/MerkavaBeautifier/beautifier.js");
                Editor.setCurrentContent(await beautify(Editor.getContent()));
            },

            // --- Filesystem Branch ---
            "new-file": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "new-folder": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "rename": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "delete": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "paste": async () => (await import('../file-operations.js')).FileOperations.paste(item),
            
            // --- Navigation Branch ---
            "open-file-commander-tab": async () => (await import('../file-commander.js')).FileCommander.open(item),
            "open-terminal-tab": async () => (await import('../terminal/index.js')).Terminal.open(item),
            "open-file-tab": async () => (await import('../tabs/index.js')).Tabs.Tabs.create(item),
            "refresh": async () => (await import('../workspaces/index.js')).Workspaces.refreshNode(item),
            "reveal-in-workspace": async () => (await import('../menus/tabs.js')).TabMenus.revealInWorkspace(State.contextTabTarget),

            // --- Archival & Context Branch ---
            "copy-zip-single": async () => (await import('../file-ops/exporter.js')).Exporter.copyAsZip([item]),
            "download-zip-single": async () => (await import('../file-ops/exporter.js')).Exporter.downloadAsZip([item]),
            "download-file": async () => (await import('../file-ops/exporter.js')).Exporter.downloadFile(item),
            "copy-all-contents": async () => (await import('../file-operations.js')).FileOperations.copyAllContents([item]),
            "download-all-contents": async () => (await import('../file-operations.js')).FileOperations.downloadAllContents([item]),
            "copy-single": async () => {
                const { getItemUniquePath } = await import('../workspaces/index.js');
                State.fileClipboard = [getItemUniquePath(item)];
                UI.showToast(`Copied ${item.name}`, "success");
            },

            // --- System Branch ---
            "open-vibe": async () => {
                const vc = await import('../vibe/vibe-controller.js');
                vc.VibeController.init(); vc.VibeController.open(item);
            },
            "git-init": async () => (await import('../git/index.js')).GitManager.initializeRepository(item),
            "commit-changes": async () => (await import('../app/index.js')).App.commitAllChanges(),
            "settings": async () => (await import('../app/index.js')).App.showSettings(),
            "toggle-fullscreen": async () => (await import('../app/index.js')).App.toggleFullscreen()
        };

        try {
            const handleRitual = ritualHandlers[action];
            if (handleRitual) {
                await handleRitual();
            } else {
                // If it's a selected-set action
                const { SelectionManager } = await import('../selection-manager.js');
                if (action === "start-selection") SelectionManager.start(item);
            }
        } catch (e) {
            console.error(`B"H Dispatch Ritual Failed: ${action}`, e);
            UI.showToast(`Ritual Shevirah: ${e.message}`, "error");
        }
    }
};
