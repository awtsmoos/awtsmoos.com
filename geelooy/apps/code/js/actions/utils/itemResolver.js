
// B"H
/**
 * @file itemResolver.js
 * @brief THE PURE ESSENCE DECODER.
 */

import { State } from '../../state.js';

export const ItemResolver = {
    resolve(context) {
        let item = null;
        
        // 1. Payload Check
        if (context && typeof context === 'object') {
            if (context.path !== undefined && (context.kind !== undefined || context.type !== undefined)) {
                item = context; 
            } else if (context.item) {
                item = context.item;
            } else if (context.payload && context.payload.item) {
                item = context.payload.item;
            }
        }

        // 2. Global Context Target (Right-click)
        if (!item && State.contextTarget) {
            item = State.contextTarget;
        }

        // 3. Active Tab SITUATIONAL AWARENESS
        // If the user clicks a global button, infer context from the current tab.
        if (!item && State.tabs) {
            let activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab && activeTab.item) {
                item = activeTab.item;
                console.log(`B"H - Context inferred from active tab: ${item.path}`);
            }
        }

        // 4. Workspace Root Fallback
        if (!item && State.workspaces) {
             const activeWs = State.workspaces.find(w => w.isActive) || State.workspaces[0];
             if (activeWs) item = { ...activeWs, path: '/', kind: 'directory', workspaceId: activeWs.id };
        }

        // Mandatory Rectification
        if (item && item.path) {
            const wsId = item.workspaceId || item.id;
            const bindWs = State.workspaces.find(w => String(w.id) === String(wsId));
            if (bindWs) {
                item.workspaceId = bindWs.id;
                if (!item.type) item.type = bindWs.originalType || bindWs.type;
            }
            if (!item.kind) {
                item.kind = (item.path.endsWith('/') || item.type === 'directory') ? 'directory' : 'file';
            }
        }

        return item;
    }
};
