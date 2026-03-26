
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

export const VibeController = {
    init() { 
        VibeView.init(); 
    },

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

    sendMessage(tab) { 
        return VibeMessenger.sendMessage(tab, this); 
    },
    
    handleStreamChunk(content, tab) { 
        return VibeMessenger.handleStreamChunk(content, tab, this); 
    },

    resetChat(tab) { 
        return VibeStateManager.resetChat(tab, this); 
    },
    
    saveSessionToFile(tab) { 
        return VibeStateManager.saveSession(tab); 
    },
    
    createCheckpoint(tab) { 
        return VibeStateManager.createCheckpoint(tab); 
    },

    updateTokenCount(tab) { 
        return VibeResourceTracker.updateTokenCount(tab); 
    },

    /**
     * B"H - Rendering Ritual.
     * Rectified to only switch physical DOM views if the tab is truly active.
     */
    async render(tab) {
        if (!tab || !tab.item) return;

        // B"H - ROUTE: Manager/Settings Dashboard
        if (tab.item.type === 'vibe-manager') {
            let wrap = document.getElementById('vibe-manager-wrapper');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.id = 'vibe-manager-wrapper';
                wrap.className = 'hidden';
                wrap.style.cssText = 'height: 100%; width: 100%; flex-grow: 1; overflow-y: auto; background: var(--color-bg-deep); z-index: 1000;';
                const editorArea = document.querySelector('.editor-area');
                if (editorArea) editorArea.appendChild(wrap);
            }
            
            // ONLY force UI switch if this tab is the active one!
            if (State.activeTabId === tab.id) {
                UI.switchView('vibe-manager-wrapper');
            }
            
            await VibeManagerUI.render(wrap, this);
            return;
        }
        
        // B"H - ROUTE: Vibe Coding Session
        if (State.activeTabId === tab.id) {
            UI.switchView('vibe');
        }
        
        if (!tab.vibeSession) tab.vibeSession = tab.content;
        await VibeView.render(tab, this);
        this.updateTokenCount(tab);
    },
	
    refreshView(tab) { 
        this.render(tab); 
    },
	
    async refreshTree(tab) {
        const container = document.getElementById('vibe-editor-wrapper');
        const root = this.getRootItem(tab);
        await SidebarUI.refreshTree(container, root, this);
    }
};
