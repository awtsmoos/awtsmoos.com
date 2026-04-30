
// B"H
/**
 * @file vibe-controller.js
 * @description
 * * Chapter 1: The Charioteer of Intent
 * This is the central hub for Vibe operations. 
 * * RECTIFICATION: The 'handleStreamChunk' method has been widened to 
 * receive the type of the chunk (thought vs text), ensuring the 'History'
 * correctly represents the dual nature of the model's response.
 */

import { VibeNavigator } from './controller/navigator.js';
import { VibeMessenger } from './controller/messenger.js';
import { VibeStateManager } from './controller/state-manager.js';
import { VibeRenderer } from './controller/renderer.js';
import { SessionOpener } from './controller/SessionOpener.js';

export const VibeController = {
    init() { VibeRenderer.init(); },
    render(tab) { return VibeRenderer.render(tab, this); },
    
    open(item) { return SessionOpener.open(item); },

    openManager() { return VibeNavigator.openManager(); },
    previewFile(tab, path) { return VibeNavigator.previewFile(tab, path); },
    getRootItem(tab) { return VibeNavigator.getRootItem(tab); },

    sendMessage(tab) { return VibeMessenger.sendMessage(tab, this); },

    /**
     * B"H
     * Receives droplets of light from the stream.
     * @param {string} fullContent - The total accumulated text for this message.
     * @param {object} tab - The target session.
     */
    handleStreamChunk(fullContent, tab) { 
        // Delegate to the messenger, which knows how to reach the physical history element.
        return VibeMessenger.handleStreamChunk(fullContent, tab, this); 
    },
    
    resetChat(tab) { return VibeStateManager.resetChat(tab, this); },
    saveSessionToFile(tab) { return VibeStateManager.saveSession(tab); },
    
    updateTokenCount(tab) { 
        import('./controller/resource-tracker.js').then(m => m.VibeResourceTracker.updateTokenCount(tab)); 
    },
    
    refreshView(tab) { return VibeRenderer.render(tab, this); },
    async refreshTree(tab) {
        const root = this.getRootItem(tab);
        const { VibeSidebarTree } = await import('./view/sidebar/tree.js');
        const container = document.getElementById('vibe-editor-wrapper');
        if (container) await VibeSidebarTree.refresh(container, root, this);
    }
};
