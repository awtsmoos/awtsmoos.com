// B"H
// FILE: js/vibe/vibe-controller.js
import { VibeView } from './vibe-view.js';
import { LogicController } from './controllers/logic.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { VibeDB } from './db.js';

export const VibeController = {
    init() { VibeView.init(); },

    async open(folderItem) {
	    UI.showLoading("Reconstituting state...");
	    try {
	        var id = folderItem.workspaceId + "::" + folderItem.path;
	        
	        // Ensure VibeDB is initialized and getSession exists
	        var sess = await VibeDB.getSession(id);
	        
	        if (!sess) {
	            sess = { 
	                id: id, 
	                name: "Vibe: " + folderItem.name, 
	                path: folderItem.path, 
	                workspaceId: folderItem.workspaceId, 
	                originalType: folderItem.type, 
	                history: [], 
	                viewState: { activeSidebarTab: 'tree', isSidebarCollapsed: false } 
	            };
	            await VibeDB.saveSession(id, sess);
	        }
	
	        var vibeItem = { 
	            ...folderItem, 
	            name: sess.name, 
	            type: 'vibe-session', 
	            originalType: folderItem.type 
	        };
	
	        import('../tabs/index.js').then(function(m) {
	            m.Tabs.create({ ...vibeItem, content: sess }, false, true, true);
	        });
	    } catch(e) { 
	        UI.showToast("B\"H Activation failed: " + e.message, "error"); 
	        console.error(e);
	    } finally { 
	        UI.hideLoading(); 
	    }
	},



    async sendMessage(tab) {
        const input = document.getElementById('vibe-input');
        const text = input.value.trim();
        if (!text || tab.vibeSession.isProcessing) return;
        input.value = '';
        tab.vibeSession.history.push({ role: 'user', content: text });
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        VibeView.render(tab, this);
        LogicController.runIteration(tab, this);
    },

    async previewFile(tab, path) {
        const wsId = tab.item.workspaceId;
        const workspace = { id: wsId, type: tab.item.originalType || 'local' };
        const p = path || "";
        const name = p.split("/").pop() || "vessel";
        Tabs.create({ ...workspace, name, path, kind: 'file', workspaceId: wsId });
    },

    getRootItem(tab) { 
        const session = tab.vibeSession || tab.content;
        const rootPath = session.path || session.rootPath || "/";
        
        return { 
            ...tab.item, 
            name: tab.item.name.split("Vibe: ").join(""), 
            path: rootPath, 
            kind: 'directory', 
            type: tab.item.originalType || 'local', 
            workspaceId: tab.item.workspaceId 
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
        // Safe string assembly for CDATA logic
        const closeTag = "]]" + "-->"; 
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        UI.showToast("State anchored.", "success");
    },
    
    // B"H - Add these to VibeController in js/vibe/vibe-controller.js

	// Trigger this before every manifest
	async createCheckpoint(tab) {
	    await VibeDB.saveCheckpoint(tab.vibeSession.id, tab.vibeSession.history);
	    UI.showToast("B\"H: State of Being archived.", "info");
	},
	
	// B"H - Add these to VibeController in js/vibe/vibe-controller.js

	async openManager() {
	    var managerItem = { 
	        name: "Vibe: Manager", 
	        type: 'vibe-manager', 
	        kind: 'file',
	        path: 'vibe-manager-dashboard' // Unique path for tab identification
	    };
	    
	    // B"H - Tell the tab system to create/activate this virtual dashboard
	    import('../tabs/index.js').then(function(m) {
	        m.Tabs.create(managerItem, false, true, true);
	    });
	},
	
	// B"H - Update only the render function in js/vibe/vibe-controller.js
	async render(tab) {
	    if (tab.item.type === 'vibe-manager') {
	        // 1. Ensure the element exists first
	        var wrap = document.getElementById('vibe-manager-wrapper');
	        if (!wrap) {
	            wrap = document.createElement('div');
	            wrap.id = 'vibe-manager-wrapper';
	            wrap.className = 'hidden'; // Start hidden so switchView works correctly
	            wrap.style.height = '100%';
	            wrap.style.overflowY = 'auto';
	            document.querySelector('.editor-area').appendChild(wrap);
	        }
	        
	        // 2. Switch view (this will hide the Vibe chat panel)
	        UI.switchView('vibe-manager-wrapper');
	        
	        // 3. Populate content
	        const { VibeManagerUI } = await import('./view/manager-ui.js');
	        await VibeManagerUI.render(wrap);
	        return;
	    }
	    
	    UI.switchView('vibe');
	    if (!tab.vibeSession) tab.vibeSession = tab.content;
	    await VibeView.render(tab, this);
	},
	
	// B"H - Add these methods to VibeController in js/vibe/vibe-controller.js

	// 1. Logic uses this to trigger a full UI sync
	refreshView: function(tab) {
	    this.render(tab);
	},
	
	// 2. Logic uses this to update the chat bubble while the AI is typing
	handleStreamChunk: function(content, tab) {
	    var hist = document.getElementById('vibe-chat-history');
	    if (!hist) return;
	    var self = this;
	    import('./view/chat-ui.js').then(function(m) {
	        m.ChatUI.updateLastMessage(hist, content, tab, self);
	    });
	},
	
	// 3. Logic uses this to refresh the sidebar tree after files are written
	refreshTree: async function(tab) {
	    var container = document.getElementById('vibe-editor-wrapper');
	    var root = this.getRootItem(tab);
	    var self = this;
	    var side = await import('./view/sidebar-ui.js');
	    await side.SidebarUI.refreshTree(container, root, self);
	},
	
};
