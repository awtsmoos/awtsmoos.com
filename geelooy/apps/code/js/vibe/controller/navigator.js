
// B"H
/**
 * @file navigator.js
 * @brief THE MODULAR CONDUCTOR OF THE VIBE JOURNEY.
 */

import { UI } from '../../ui.js';
import { VibeDB } from '../db.js';
import { State } from '../../state.js';
import { SessionOpener } from './SessionOpener.js';
import { Tabs } from '../../tabs/index.js';

export const VibeNavigator = {
    /**
     * B"H - Resonates the session attributes and opens the portal.
     */
    async openSession(folderItem, forceNew = false) {
        return await SessionOpener.open(folderItem, forceNew);
    },

    /**
     * B"H - Opens the Global Dashboard.
     */
    async openManager() {
        const item = { 
            name: "Global Sentience Controls", 
            type: 'vibe-manager', 
            kind: 'file', 
            path: 'settings-root', 
            content: "{}" 
        };
        await Tabs.create(item, false, false, true);
    },

    /**
     * B"H - Opens a physical file for preview alongside the Vibe.
     */
    async previewFile(tabContext, targetPath) {
        const ref = tabContext || State.tabs.find(t => t.id === State.activeTabId);
        if (!ref) return;

        const model = {
            name: (targetPath || "").split("/").pop(),
            path: targetPath,
            kind: 'file',
            workspaceId: ref.item.workspaceId,
            type: ref.item.originalType || ref.item.type
        };
        await Tabs.create(model);
    },

    /**
     * B"H - Harmonizes the session data into a Workspace root item.
     * RELIES strictly on tab.item to avoid database corruption.
     */
    getRootItem(tab) { 
        const wsId = tab.item?.workspaceId || tab.item?.id;
        const ws = State.workspaces.find(w => String(w?.id) === String(wsId));
        
        return {
            ...ws,
            name: (tab.item?.name || "Target").split("Vibe: ").join(""),
            path: tab.item?.path || "/", // FORCE physical truth
            workspaceId: wsId,
            type: tab.item?.originalType || ws?.type,
            originalType: tab.item?.originalType || ws?.originalType,
            kind: 'directory'
        }; 
    }
};
