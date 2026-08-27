
// B"H
import { VibeNavigator } from './navigator.js';
import { VibeMessenger } from './messenger.js';
import { VibeStateManager } from './state-manager.js';
import { VibeResourceTracker } from './resource-tracker.js';
import { VibeRenderer } from './renderer.js';

export const VibeController = {
    init() { VibeRenderer.init(); },
    render(tab) { return VibeRenderer.render(tab, this); },
    
    open(item) { return VibeNavigator.openSession(item); },
    openManager() { return VibeNavigator.openManager(); },
    previewFile(tab, path) { return VibeNavigator.previewFile(tab, path); },
    getRootItem(tab) { return VibeNavigator.getRootItem(tab); },

    sendMessage(tab) { return VibeMessenger.sendMessage(tab, this); },
    handleStreamChunk(c, t) { return VibeMessenger.handleStreamChunk(c, t, this); },
    
    resetChat(tab) { return VibeStateManager.resetChat(tab, this); },
    saveSessionToFile(tab) { return VibeStateManager.saveSession(tab); },
    
    updateTokenCount(tab) { return VibeResourceTracker.updateTokenCount(tab); },
    
    refreshView(tab) { return VibeRenderer.render(tab, this); },
    async refreshTree(tab) {
        const root = this.getRootItem(tab);
        const { VibeSidebarTree } = await import('../view/sidebar/tree.js');
        const container = document.getElementById('vibe-editor-wrapper');
        if (container) {
            await VibeSidebarTree.refresh(container, root, this);
        }
    }
};
