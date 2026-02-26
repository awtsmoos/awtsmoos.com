
// B"H
/**
 * @file devtools/index.js
 * @brief The Merkava Console - The Developer's Chariot.
 */

import { DevToolsUI } from './ui.js';
import { DevToolsBridge } from './bridge.js';
import { State, DOM } from '../state.js';

export const DevTools = {
    openForActivePreview() {
        const active = State.tabs.find(t => t.id === State.activeTabId);
        if (!active || active.fileType !== 'html-preview') return;

        const devToolsItem = {
            name: `DevTools: ${active.item.name.replace('Preview: ', '')}`,
            type: 'devtools',
            kind: 'file',
            previewTabId: active.id,
            workspaceId: active.item.workspaceId // Inherit the world connection
        };

        import('../tabs/index.js').then(m => m.Tabs.create(devToolsItem));
    },

    render(tab, container) {
        // B"H - Rely on the pre-manifested DOM wrapper
        if (!container) container = DOM.devtoolsWrapper;

        if (!tab.devtoolsState) {
            tab.devtoolsState = { 
                previewTabId: tab.item.previewTabId,
                activePanel: 'console',
                logs: [],
                networkReqs:[],
                domString: ''
            };
        }

        DevToolsUI.render(container, tab.devtoolsState);
        DevToolsBridge.attach(tab.devtoolsState);
    }
};
