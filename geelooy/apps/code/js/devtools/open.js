
// B"H
/**
 * @file open.js
 * @brief Logic for targeting and opening DevTools.
 */

import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';

export const DevToolsOpener = {
    /**
     * B"H - Opens the DevTools vision for a specific tab or the current active preview.
     */
    async open(item) {
        let previewTab = null;

        // 1. Try to determine the target preview tab from the input item
        if (item) {
            // Case A: The item is the Preview Tab itself
            const tabByItem = State.tabs.find(t => t.item === item || (t.item.path === item.path && t.item.workspaceId === item.workspaceId));
            
            if (tabByItem && (tabByItem.isPreview || tabByItem.fileType === 'html-preview')) {
                previewTab = tabByItem;
            } 
            // Case B: The item is a Source File, search for its preview
            else {
                previewTab = State.tabs.find(t => 
                    (t.isPreview || t.fileType === 'html-preview') && 
                    t.item.path === item.path && 
                    t.item.workspaceId === item.workspaceId
                );
            }
        }

        // 2. Fallback: If no item, or item yielded nothing, check Active Tab
        if (!previewTab) {
            const active = State.tabs.find(t => t.id === State.activeTabId);
            if (active) {
                if (active.isPreview || active.fileType === 'html-preview') {
                    previewTab = active;
                } else {
                    // Try to find a preview matching the active source file
                    previewTab = State.tabs.find(t => 
                        (t.isPreview || t.fileType === 'html-preview') && 
                        t.item.path === active.item.path && 
                        t.item.workspaceId === active.item.workspaceId
                    );
                }
            }
        }

        if (!previewTab) {
            console.warn("B\"H - DevTools Opener: No active or related preview vessel found.");
            import('../ui.js').then(m => m.UI.showToast("No Preview found for this file. Open Preview first.", "warning"));
            return;
        }

        console.log(`B\"H - DevTools: Creating inspection vessel for [${previewTab.item.name}]`);

        // Check if a devtools tab for this preview already exists
        const existingDevToolsTab = State.tabs.find(t => t.fileType === 'devtools' && t.devtoolsState?.previewTabId === previewTab.id);
        if (existingDevToolsTab) {
            Tabs.activate(existingDevToolsTab.id);
            return;
        }

        // B"H - Create a new, dedicated DevTools tab linked to the preview tab.
        const devToolsItem = {
            name: `DevTools: ${previewTab.item.name}`,
            type: 'devtools',
            kind: 'file', // Virtual file
            path: `devtools://${previewTab.item.path}`,
            previewTabId: previewTab.id // The sacred link
        };
        
        await Tabs.create(devToolsItem);
    }
};

/**
 * B"H - Initializes the static link between the system and the DevTools class.
 */
export function initializeDevToolsStatics() {
    import('./index.js').then(module => {
        if (module.DevTools) {
             module.DevTools.openForActivePreview = () => DevToolsOpener.open();
        }
    });
}
