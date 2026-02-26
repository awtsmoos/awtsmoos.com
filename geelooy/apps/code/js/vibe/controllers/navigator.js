
// B"H
/**
 * @file navigator.js
 * @brief The Compass of the Vibe. Handles transitions between sessions and dashboards.
 */

import { VibeDB } from '../db.js';
import { Tabs } from '../../tabs/index.js';
import { UI } from '../../ui.js';
import { State } from '../../state.js';

export const VibeNavigator = {
    /**
     * @async
     * @function openSession
     * @description Reconstitutes a session from the deep archive.
     */
    async openSession(folderItem) {
        UI.showLoading("Reconstituting state...");
        try {
            const id = folderItem.workspaceId + "::" + folderItem.path;
            let sess = await VibeDB.getSession(id);
            
            if (!sess) {
                sess = { 
                    id: id, 
                    name: "Vibe: " + folderItem.name, 
                    path: folderItem.path, 
                    workspaceId: folderItem.workspaceId, 
                    originalType: folderItem.originalType || folderItem.type, 
                    history: [], 
                    viewState: { 
                        activeSidebarTab: 'tree', 
                        isSidebarCollapsed: false,
                        isPanelMaximized: false,
                        isPanelMinimized: false
                    } 
                };
                await VibeDB.saveSession(id, sess);
            }

            const vibeItem = { 
                ...folderItem, 
                name: sess.name, 
                type: 'vibe-session', 
                originalType: folderItem.originalType || folderItem.type 
            };

            await Tabs.create({ ...vibeItem, content: sess }, false, true, true);
        } catch(e) { 
            UI.showToast(`B"H Activation failed: ${e.message}`, "error"); 
            console.error(e);
        } finally { 
            UI.hideLoading(); 
        }
    },

    /**
     * @async
     * @function openManager
     * @description Navigates to the specialized Dashboard vessel.
     */
    async openManager() {
        console.log("B\"H - Navigator: Summoning Dashboard...");
        const managerItem = { 
            name: "Vibe Settings", 
            type: 'vibe-manager', 
            kind: 'file',
            path: 'vibe-dashboard-internal-coordinate',
            content: "{}" 
        };
        // Activate instantly and skip standard FS reads
        await Tabs.create(managerItem, false, false, true);
    },

    /**
     * @async
     * @function previewFile
     * @description Mirrors a file from the Vibe context into the main editor.
     */
    async previewFile(tab, path) {
        const currentTab = tab || State.tabs.find(t => t.id === State.activeTabId);
        if (!currentTab) return;

        const wsId = currentTab.item.workspaceId;
        const oType = currentTab.item.originalType || currentTab.item.type;
        const name = (path || "").split("/").pop() || "vessel";

        const item = { 
            name, 
            path, 
            kind: 'file', 
            workspaceId: wsId, 
            type: oType, 
            originalType: oType 
        };
        
        await Tabs.create(item);
    },

    /**
     * @function getRootItem
     * @description Determines the physical root coordinate of the current session.
     */
    getRootItem(tab) { 
        const session = tab.vibeSession || tab.content || {};
        const wsId = session.workspaceId || (tab.item ? tab.item.workspaceId : null);
        const rootPath = session.path || session.rootPath || (tab.item ? tab.item.path : "/");
        const type = session.originalType || (tab.item ? (tab.item.originalType || tab.item.type) : "local");
        
        const nameStr = (tab.item && tab.item.name) ? tab.item.name : "Vibe Session";
        const displayName = nameStr.split("Vibe: ").join("");

        return { 
            name: displayName,
            path: rootPath, 
            workspaceId: wsId,
            type: type, 
            kind: 'directory'
        }; 
    }
};
