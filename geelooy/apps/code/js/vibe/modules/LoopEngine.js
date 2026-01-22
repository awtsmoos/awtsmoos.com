// B"H
// FILE: js/vibe/modules/LoopEngine.js

import { State } from '../../state.js';
import { UI } from '../../ui.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces.js';
import { Tabs } from '../../tabs/index.js';

export const LoopEngine = {
    /**
     * B"H - Materializes the changes into the vessels (files).
     */
    async apply(changeList, workspaceId) {
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) throw new Error("Workspace not found.");

        const affectedParents = new Set();

        for (const change of changeList) {
            try {
                const item = { ...workspace, path: change.path, kind: 'file', workspaceId };
                
                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item);
                    // Close tab if open
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) await Tabs.close(tab.id, true);
                } else {
                    await FileSystemProvider.write(item, change.content);
                    
                    // Update open tab content
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) {
                        tab.content = change.content;
                        tab.isDirty = false; // Saved by AI
                        if (State.activeTabId === tab.id) {
                            import('../../editor.js').then(m => m.Editor.setCurrentContent(change.content));
                        }
                    }
                }

                // Calculate parent path for refresh
                const lastSlash = change.path.lastIndexOf('/');
                const parentPath = lastSlash === -1 ? '/' : (change.path.substring(0, lastSlash) || '/');
                affectedParents.add(parentPath);

            } catch (e) {
                console.error(`B"H - Failed to apply change to ${change.path}`, e);
                UI.showToast(`Failed to update ${change.path}`, "error");
            }
        }

        // Refresh File Explorer Trees
        for (const parentPath of affectedParents) {
            await Workspaces.refreshNode({ ...workspace, path: parentPath, kind: 'directory', workspaceId });
        }
    }
};