
// B"H
/**
 * @file open.js
 * @brief Logic for targeting and opening DevTools.
 */

import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';

export const DevToolsOpener = {
    /**
     * B"H - Opens the DevTools vision for a specific tab.
     */
    async open(target) {
        let inspectTab = null;

        // 1. Resolve Target Identity
        if (target && target.id) {
            // Find the physical tab object in state
            inspectTab = State.tabs.find(t => t.id === Number(target.id) || t === target);
        }

        // 2. Fallback to Active Tab if target is ambiguous
        if (!inspectTab) {
            inspectTab = State.tabs.find(t => t.id === State.activeTabId);
        }

        // 3. Verify Inspectability
        const isInspectable = inspectTab && (
            inspectTab.isPreview || 
            inspectTab.fileType === 'html-preview' || 
            inspectTab.item.type === 'browser' ||
            inspectTab.item.type === 'html-preview-file'
        );

        if (!isInspectable) {
            console.warn("B\"H - DevTools Opener: Target is not a visual vessel.", inspectTab);
            import('../ui.js').then(m => m.UI.showToast("No inspectable window active.", "warning"));
            return;
        }

        console.log(`B\"H - DevTools: Manifesting Console for [${inspectTab.item.name}]`);

        // 4. Check for Existing Manifestation
        const existingDevToolsTab = State.tabs.find(t => 
            t.fileType === 'devtools' && 
            t.devtoolsState?.previewTabId === inspectTab.id
        );

        if (existingDevToolsTab) {
            return await Tabs.activate(existingDevToolsTab.id);
        }

        // 5. Manifest the new Console Tab
        const devToolsItem = {
            name: `Console: ${inspectTab.item.name.replace('Web: ', '').replace('Preview: ', '')}`,
            type: 'devtools',
            kind: 'file',
            path: `devtools://${inspectTab.id}`,
            previewTabId: inspectTab.id,
            workspaceId: inspectTab.item.workspaceId || 'global'
        };
        
        // Directly create and activate the new tab
        const newTab = await Tabs.create(devToolsItem, false, true, true);
        
        // Final visual enforcement
        if (newTab) {
            import('../tabs/orchestrator.js').then(m => m.TabOrchestrator.activate(newTab.id));
        }
    }
};
