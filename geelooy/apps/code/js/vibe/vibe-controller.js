
// B"H
import { VibeNavigator } from './controller/navigator.js';
import { VibeMessenger } from './controller/messenger.js';
import { VibeStateManager } from './controller/state-manager.js';
import { VibeRenderer } from './controller/renderer.js';
import { SessionOpener } from './controller/SessionOpener.js';

export const VibeController = {
    init() { VibeRenderer.init(); },
    render(tab) { return VibeRenderer.render(tab, this); },
    
    // B"H - The Modular Open Ritual
    open(item) { return SessionOpener.open(item); },

    openManager() { return VibeNavigator.openManager(); },
    previewFile(tab, path) { return VibeNavigator.previewFile(tab, path); },
    getRootItem(tab) { return VibeNavigator.getRootItem(tab); },

    sendMessage(tab) { return VibeMessenger.sendMessage(tab, this); },
    handleStreamChunk(c, t) { return VibeMessenger.handleStreamChunk(c, t, this); },
    
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
