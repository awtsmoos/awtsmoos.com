
// B"H
/**
 * @file vibe-controller.js
 * @brief The conductor of the AI-Harmonics.
 * 
 * THE POEM OF THE VIBE:
 * A thought becomes code at the touch of a whim,
 * Creating a world where the shadows are dim.
 * We click on a card, and the vessel appears,
 * Banishing errors and calming the fears.
 * But if we forget where the handle is tied,
 * The door to the disk remains locked from inside.
 * We refresh the tree so the seeker can find,
 * The fruits of the logic that bloomed in the mind.
 */

import { VibeView } from './vibe-view.js';
import { LogicController } from './controllers/logic.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { VibeDB } from './db.js';
import { Workspaces } from '../workspaces/index.js';

export const VibeController = {
    /**
     * @function init
     * @description Awaken the Vibe view system.
     */
    init() { VibeView.init(); },

    /**
     * @async
     * @function open
     * @description Opens a gateway to a Vibe coding session.
     */
    async open(folderItem) {
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
                    viewState: { activeSidebarTab: 'tree', isSidebarCollapsed: false } 
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
     * @function sendMessage
     * @description Manifests the user's will into the AI dialogue.
     */
    async sendMessage(tab) {
        const input = document.getElementById('vibe-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text || tab.vibeSession.isProcessing) return;
        
        input.value = '';
        tab.vibeSession.history.push({ role: 'user', content: text });
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        
        VibeView.render(tab, this);
        
        try {
            await LogicController.runIteration(tab, this);
            
            // B"H - Automatic Refresh Sequence:
            // After the AI might have written new files, we MUST refresh the tree.
            const root = this.getRootItem(tab);
            await Workspaces.refreshNode(root);
            
            console.log(`[Vibe] B"H - Iteration finished. Refreshing node: ${root.path}`);
        } catch (e) {
            UI.showToast(`AI Ritual Error: ${e.message}`, "error");
        }
    },

    /**
     * @async
     * @function previewFile
     * @description B"H - Opens a manifested file. 
     * Rectified: Now carries originalType and workspaceId to prevent NotFound errors.
     */
    async previewFile(tab, path) {
        console.log(`[VibePreview] B"H - Attempting to open: ${path}`);
        
        // If tab is null, we are likely calling from a Card with context, 
        // but it's safer to use the active tab if not provided.
        const currentTab = tab || State.tabs.find(t => t.id === State.activeTabId);
        if (!currentTab) return;

        const wsId = currentTab.item.workspaceId;
        const oType = currentTab.item.originalType || currentTab.item.type;
        
        const p = path || "";
        const name = p.split("/").pop() || "vessel";
        
        // B"H - Build a fortified item that the FS Provider can actually resolve.
        const item = { 
            name, 
            path: p, 
            kind: 'file', 
            workspaceId: wsId, 
            type: oType,
            originalType: oType 
        };
        
        await Tabs.create(item);
    },

    /**
     * @function getRootItem
     * @description Extracts the anchor item for the session.
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
    },

    async resetChat(tab) {
        const confirmed = await UI.showDialog({ title: "Reset", message: "Clear history?", okText: "Yes" });
        if (confirmed) {
            tab.vibeSession.history = [];
            await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
            this.render(tab);
        }
    },

    async saveSessionToFile(tab) {
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        UI.showToast("State anchored.", "success");
    },
    
    async createCheckpoint(tab) {
        await VibeDB.saveCheckpoint(tab.vibeSession.id, tab.vibeSession.history);
        UI.showToast("B\"H: State of Being archived.", "info");
    },
	
    async openManager() {
        const managerItem = { 
            name: "Vibe: Manager", 
            type: 'vibe-manager', 
            kind: 'file',
            path: 'vibe-manager-dashboard' 
        };
        await Tabs.create(managerItem, false, true, true);
    },
	
    async render(tab) {
        if (tab.item.type === 'vibe-manager') {
            let wrap = document.getElementById('vibe-manager-wrapper');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.id = 'vibe-manager-wrapper';
                wrap.className = 'hidden';
                wrap.style.height = '100%';
                wrap.style.overflowY = 'auto';
                document.querySelector('.editor-area').appendChild(wrap);
            }
            UI.switchView('vibe-manager-wrapper');
            const { VibeManagerUI } = await import('./view/manager-ui.js');
            await VibeManagerUI.render(wrap);
            return;
        }
        
        UI.switchView('vibe');
        if (!tab.vibeSession) tab.vibeSession = tab.content;
        await VibeView.render(tab, this);
    },
	
    refreshView(tab) {
        this.render(tab);
    },
	
    handleStreamChunk(content, tab) {
        const hist = document.getElementById('vibe-chat-history');
        if (!hist) return;
        import('./view/chat-ui.js').then(m => {
            m.ChatUI.updateLastMessage(hist, content, tab, this);
        });
    },
	
    async refreshTree(tab) {
        const container = document.getElementById('vibe-editor-wrapper');
        const root = this.getRootItem(tab);
        const side = await import('./view/sidebar-ui.js');
        await side.SidebarUI.refreshTree(container, root, this);
    }
};
