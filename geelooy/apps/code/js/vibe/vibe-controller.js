
// B"H
/**
 * @file vibe-controller.js
 * @brief The Master Orchestrator of Vibe Intelligence.
 */

import { UI } from '../ui.js';
import { State } from '../state.js';
import { VibeView } from './vibe-view.js';
import { VibeNavigator } from './controllers/navigator.js';
import { VibeMessenger } from './controllers/messenger.js';
import { VibeStateManager } from './controllers/state-manager.js';
import { VibeResourceTracker } from './controllers/resource-tracker.js';
import { VibeManagerUI } from './view/manager-ui.js';
import { SidebarUI } from './view/sidebar-ui.js';

/**
 * @constant VibeController
 * @description The unified interface for the Vibe coding world.
 */
export const VibeController = {
    /**
     * B"H - Initialization of the visual layer.
     */
    init() { 
        console.log("B\"H - VibeController: Awakening Visual Chariot.");
        VibeView.init(); 
    },

    /**
     * B"H - Navigation Logic: Opening sessions, managers, and files.
     */
    open(folderItem) { 
        return VibeNavigator.openSession(folderItem); 
    },
    
    openManager() { 
        return VibeNavigator.openManager(); 
    },
    
    previewFile(tab, path) { 
        return VibeNavigator.previewFile(tab, path); 
    },
    
    getRootItem(tab) { 
        return VibeNavigator.getRootItem(tab); 
    },

    /**
     * B"H - Messaging Logic: Sending instructions and handling the stream.
     */
    sendMessage(tab) { 
        return VibeMessenger.sendMessage(tab, this); 
    },
    
    handleStreamChunk(content, tab) { 
        return VibeMessenger.handleStreamChunk(content, tab, this); 
    },

    /**
     * B"H - State Management: Resilience, resets, and history checkpoints.
     */
    resetChat(tab) { 
        return VibeStateManager.resetChat(tab, this); 
    },
    
    saveSessionToFile(tab) { 
        return VibeStateManager.saveSession(tab); 
    },
    
    createCheckpoint(tab) { 
        return VibeStateManager.createCheckpoint(tab); 
    },

    /**
     * B"H - Resource Logic: Token auditing and real-time counting.
     */
    updateTokenCount(tab) { 
        return VibeResourceTracker.updateTokenCount(tab); 
    },

    /**
     * B"H - Rendering Ritual: Master routing between Editor and Dashboard.
     */
    async render(tab) {
        if (!tab || !tab.item) return;

        console.log("B\"H - VibeController: Rendering ritual for type:", tab.item.type);

        // B"H - ROUTE: Manager/Dashboard Dashboard Settings
        if (tab.item.type === 'vibe-manager') {
            console.log("B\"H - VibeController: Routing to Manager Dashboard UI.");
            let wrap = document.getElementById('vibe-manager-wrapper');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.id = 'vibe-manager-wrapper';
                wrap.className = 'hidden';
                wrap.style.cssText = 'height: 100%; width: 100%; flex-grow: 1; overflow-y: auto; background: var(--color-bg-deep); z-index: 1000;';
                const editorArea = document.querySelector('.editor-area');
                if (editorArea) editorArea.appendChild(wrap);
            }
            
            // Switch view ensuring all others (editor, vibe, etc) are hidden
            UI.switchView('vibe-manager-wrapper');
            
            await VibeManagerUI.render(wrap, this);
            return;
        }
        
        // B"H - ROUTE: Standard Vibe Coding Session
        UI.switchView('vibe');
        if (!tab.vibeSession) {
            tab.vibeSession = tab.content;
        }
        
        await VibeView.render(tab, this);
        this.updateTokenCount(tab);
    },
	
    /**
     * @function refreshView
     * @description Forces a full UI refresh for the active tab.
     */
    refreshView(tab) { 
        this.render(tab); 
    },
	
    /**
     * @async
     * @function refreshTree
     * @description Synchronizes the sidebar file tree with physical reality.
     */
    async refreshTree(tab) {
        const container = document.getElementById('vibe-editor-wrapper');
        const root = this.getRootItem(tab);
        await SidebarUI.refreshTree(container, root, this);
    }
};
