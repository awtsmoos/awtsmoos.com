
// B"H
import { VibeDB } from '../db.js';
import { Tabs } from '../../tabs/index.js';
import { UI } from '../../ui.js';
import { State } from '../../state.js';

export const VibeNavigator = {
    async openSession(folderItem) {
        UI.showLoading("Reconstituting state...");
        try {
            const id = folderItem.workspaceId + "::" + folderItem.path;
            let sess = await VibeDB.getSession(id);
            if (!sess) {
                sess = { 
                    id, name: "Vibe: " + folderItem.name, path: folderItem.path, workspaceId: folderItem.workspaceId, 
                    originalType: folderItem.originalType || folderItem.type, history: [], 
                    viewState: { activeSidebarTab: 'tree', isSidebarCollapsed: false } 
                };
                await VibeDB.saveSession(id, sess);
            }
            const vibeItem = { ...folderItem, name: sess.name, type: 'vibe-session', originalType: folderItem.originalType || folderItem.type };
            await Tabs.create({ ...vibeItem, content: sess }, false, true, true);
        } catch(e) { UI.showToast(`B"H Activation failed: ${e.message}`, "error"); } finally { UI.hideLoading(); }
    },
    async openManager() {
        const managerItem = { name: "Vibe Settings", type: 'vibe-manager', kind: 'file', path: 'vibe-dashboard-internal', content: "{}" };
        await Tabs.create(managerItem, false, false, true);
    },
    async previewFile(tab, path) {
        const currentTab = tab || State.tabs.find(t => t.id === State.activeTabId);
        if (!currentTab) return;
        const item = { name: path.split("/").pop(), path, kind: 'file', workspaceId: currentTab.item.workspaceId, type: currentTab.item.originalType || currentTab.item.type };
        await Tabs.create(item);
    },
    getRootItem(tab) { 
        const session = tab.vibeSession || tab.content || {};
        const rootPath = session.path || session.rootPath || (tab.item ? tab.item.path : "/");
        const nameStr = (tab.item?.name || "Vibe").split("Vibe: ").join("");
        return { name: nameStr, path: rootPath, workspaceId: session.workspaceId || tab.item?.workspaceId, type: session.originalType || tab.item?.originalType, kind: 'directory' }; 
    }
};
