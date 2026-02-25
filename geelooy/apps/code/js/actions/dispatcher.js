
// B"H
// FILE: js/actions/dispatcher.js

import { State } from '../state.js';
import { UI } from '../ui.js';

/**
 * @class Dispatcher
 * @description The Keter of Intent. Re-forged with the complete list 
 * of global actions, mapping every user command to its subordinate vessel.
 */
export const Dispatcher = {
    async handle(action, item = State.contextTarget) {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        
        // B"H - Pure Data Mapping of Intent to Execution
        const handlers = {
            "select-all": async () => (await import('./text-actions.js')).TextActions.selectAll(),
            "copy-all": async () => (await import('./text-actions.js')).TextActions.copyAll(),
            "view-html": async () => (await import('../tabs/index.js')).Tabs.createPreview(tab.item, tab.content),
            "reveal-in-workspace": async () => (await import('../menus/tabs.js')).TabMenus.revealInWorkspace(State.contextTabTarget),
            "new-file": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "new-folder": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "rename": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "delete": async () => (await import('./file-actions.js')).FileActions.handle(action, item),
            "open-file-commander-tab": async () => (await import('../file-commander.js')).FileCommander.open(item),
            "open-terminal-tab": async () => (await import('../terminal/index.js')).Terminal.open(item),
            "open-file-tab": async () => (await import('../tabs/index.js')).Tabs.Tabs.create(item),
            "refresh": async () => (await import('../workspaces/index.js')).Workspaces.refreshNode(item),
            "open-vibe": async () => {
                const vc = await import('../vibe/vibe-controller.js');
                vc.VibeController.init(); vc.VibeController.open(item);
            },
            "git-init": async () => (await import('../git/index.js')).GitManager.initializeRepository(item),
            "commit-changes": async () => (await import('../app/index.js')).App.commitAllChanges(),
            "settings": async () => (await import('../app/index.js')).App.showSettings(),
            "visual-settings": async () => (await import('./dispatcher.js')).Dispatcher.handle("legacy-visual"),
            "show-docs": async () => (await import('../help.js')).Help.show(),
            "beautify": async () => {
                const { Editor } = await import('../editor.js');
                const { beautify } = await import("/scripts/awtsmoos/MerkavaBeautifier/beautifier.js");
                Editor.setCurrentContent(await beautify(Editor.getContent()));
            },
            "save": async () => (await import('../tabs/index.js')).Tabs.Tabs.saveActive(),
            "find-replace": async () => (await import('../find-replace.js')).FindReplace.show(),
            "copy-single": async () => {
                const { getItemUniquePath } = await import('../workspaces/index.js');
                State.fileClipboard = [getItemUniquePath(item)];
                UI.showToast(`Copied ${item.name}`, "success");
            },
            "copy-all-contents": async () => (await import('../file-operations.js')).FileOperations.copyAllContents([item]),
            "download-all-contents": async () => (await import('../file-operations.js')).FileOperations.downloadAllContents([item])
        };

        try {
            if (handlers[action]) {
                await handlers[action]();
            } else {
                console.warn(`B"H Dispatcher: Ritual '${action}' not found in current world.`);
            }
        } catch (e) {
            console.error(e);
            UI.showToast(`Shevirah in ${action}: ${e.message}`, "error");
        }
    }
};
