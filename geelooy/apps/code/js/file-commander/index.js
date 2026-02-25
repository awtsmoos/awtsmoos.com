
// B"H
// FILE: js/file-commander/index.js

import { FileCommanderCore } from './core.js';
import { FileCommanderUI } from './ui.js';
import { Tabs } from '../tabs/index.js';
import { UI } from '../ui.js';

export const FileCommander = {
    // B"H - Opens the commander in a new tab
    open(startItem) {
        let initialItem;
        
        if (startItem) {
            initialItem = { ...startItem };
            // Ensure directory kind if it's a file path
            if (initialItem.kind !== 'directory' && initialItem.kind !== 'root') {
                 if (initialItem.path && initialItem.path.includes('/')) {
                     const parentPath = initialItem.path.substring(0, initialItem.path.lastIndexOf('/')) || '/';
                     initialItem.path = parentPath;
                     initialItem.name = parentPath.split('/').pop() || 'Root';
                     initialItem.kind = 'directory';
                 } else {
                     initialItem.path = '/';
                     initialItem.kind = 'directory';
                 }
            }
        } else {
            initialItem = { kind: 'root', name: 'Workspaces', path: '/' };
        }

        const item = {
            name: `CMD: ${initialItem.name}`,
            type: "commander",
            kind: "file",
            path: initialItem.path,
            workspaceId: initialItem.workspaceId || null,
            // Initialize State immediately
            commanderState: {
                currentPathItem: initialItem,
                currentFiles: [],
                loading: true
            }
        };
        
        Tabs.create(item, false, false, true);
    },

    // Called by the Tab rendering system when a commander tab is activated
    render(tab, container) {
        // B"H - State Hydration
        // If tab is restored from session, content might be in tab.content but we need it in tab.commanderState
        if (!tab.commanderState && tab.content) {
            tab.commanderState = tab.content;
        }
        
        if (!tab.commanderState) {
            // Default if lost
            tab.commanderState = {
                currentPathItem: { kind: 'root', name: 'Workspaces', path: '/' },
                currentFiles: [],
                loading: true
            };
        }

        const controller = {
            navigate: async (item) => {
                // UI Loading State
                if (container.querySelector('.fc-content')) {
                    container.querySelector('.fc-content').innerHTML = '<div style="padding:20px; text-align:center; color:gray;">Accessing vessel...</div>';
                }

                try {
                    const result = await FileCommanderCore.navigate(item);
                    tab.commanderState.currentPathItem = result.currentPathItem;
                    tab.commanderState.currentFiles = result.currentFiles;
                    tab.commanderState.loading = false;
                    
                    // Update Tab Name & Path
                    tab.item.name = `CMD: ${result.currentPathItem.name}`;
                    tab.item.path = result.currentPathItem.path;
                    Tabs.render(); 

                    FileCommanderUI.render({
                        currentFiles: result.currentFiles,
                        currentPathItem: result.currentPathItem
                    });
                } catch (e) {
                    UI.showToast(`Navigation Failed: ${e.message}`, 'error');
                    if (item.kind !== 'root') {
                        controller.navigate({ kind: 'root', name: 'Workspaces', path: '/' });
                    }
                }
            },
            goUp: () => {
                const parent = FileCommanderCore.getParent(tab.commanderState.currentPathItem);
                if (parent) controller.navigate(parent);
            },
            refresh: () => {
                controller.navigate(tab.commanderState.currentPathItem);
            },
            getData: () => tab.commanderState
        };

        FileCommanderUI.init(controller, container);
        
        // Trigger initial load if needed
        if (tab.commanderState.loading) {
            controller.navigate(tab.commanderState.currentPathItem);
        } else {
            FileCommanderUI.render(tab.commanderState);
        }
    }
};
