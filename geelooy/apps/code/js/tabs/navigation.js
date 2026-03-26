
// B"H
import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { App } from '../app.js';
import { Tabs } from './index.js';
import { FileSystemProvider } from '../fs-provider.js';
import { VibeController } from '../vibe/vibe-controller.js';
import { FileCommander } from '../file-commander.js';
import { Terminal } from '../terminal/index.js';
import { DevTools } from '../devtools/index.js';
import { Editor } from '../editor.js';
import { TabsLoader } from './loader.js';

export const TabsNavigation = {
    async updatePreviewContext(tabId, newItem) {
        const numericTabId = Number(tabId);
        const tab = State.tabs.find(t => t.id === numericTabId);
        if (!tab) return;
        try {
            UI.showLoading("Navigating...");
            const contentRaw = await FileSystemProvider.read(newItem);
            const content = contentRaw instanceof Blob ? await contentRaw.text() : String(contentRaw);

            if (!tab.previewHistory) tab.previewHistory =[];
            tab.previewHistory.push({ item: { ...tab.item }, content: tab.content, rawContent: tab.rawContent, uniquePath: tab.uniquePath });

            tab.item = { ...newItem, name: "Preview: " + newItem.name, originalType: newItem.originalType || newItem.type, type: 'html-preview-file' };
            tab.uniquePath = "preview::" + newItem.workspaceId + "::" + newItem.path;
            tab.content = content; tab.rawContent = content; tab.forceReload = true;
            await this.activate(numericTabId, true);
        } catch(e) { UI.showToast("Navigation failed: " + e.message, "error"); } finally { UI.hideLoading(); }
    },

    async goBackPreview(tabId) {
        const numericTabId = Number(tabId);
        const tab = State.tabs.find(t => t.id === numericTabId);
        if (tab && tab.previewHistory && tab.previewHistory.length > 0) {
            const pastState = tab.previewHistory.pop();
            tab.item = pastState.item; tab.content = pastState.content; tab.rawContent = pastState.rawContent; tab.uniquePath = pastState.uniquePath; tab.forceReload = true;
            await this.activate(numericTabId, true);
        }
    },

    /**
     * @async
     * @function activate
     * @description B"H - The absolute authority on view manifestation. 
     * Enforces strict numeric matching to prevent duplicate 'active' states.
     */
    async activate(tabId, forceReload = false) {
        const numericTabId = Number(tabId);
        
        // B"H - Prevent redundant activation loops
        if (State.activeTabId === numericTabId && !forceReload && !State.isRestoring) {
            Tabs.render();
            return;
        }
        
        State.activeTabId = numericTabId;
        const tab = State.tabs.find(t => t.id === numericTabId);

        if (!tab) {
            UI.switchView('empty'); 
            Tabs.render();
            if (!State.isRestoring) App.saveSessionDebounced();
            return;
        }

        const workspace = State.workspaces.find(ws => ws.id === tab.item.workspaceId);
        if (workspace && workspace.isLocked && !workspace.isLost) {
            UI.switchView('empty');
            DOM.emptyEditorMessage.classList.remove('hidden');
            DOM.emptyEditorMessage.innerHTML = '<div style="text-align:center; padding: 40px;"><h2 style="color: var(--neon-magenta);">🔒 World Locked</h2><p>Click <strong>"RESUME"</strong> on the folder in the sidebar.</p></div>';
            Tabs.render(); 
            return;
        }

        // B"H - Centralized View Switching Logic
        let viewSwitched = false;
        const switchAndRender = async (view, renderer, ...args) => {
            // Ensure we are still the active tab before rendering to prevent race conditions
            if (State.activeTabId !== numericTabId) return;
            
            UI.switchView(view);
            await renderer(...args);
            viewSwitched = true;
        };

        const itemType = tab.item.type;
        const fileType = tab.fileType;

        // --- THE HIERARCHY OF EMANATION ---
        if (itemType === 'vibe-manager') {
            await switchAndRender('vibe-manager-wrapper', VibeController.render.bind(VibeController), tab);
        } else if (fileType === 'vibe' || itemType === 'vibe-session') {
            await switchAndRender('vibe', VibeController.render.bind(VibeController), tab);
        } else if (itemType === 'commander') {
            await switchAndRender('commander', FileCommander.render, tab, DOM.fileCommanderWrapper);
        } else if (itemType === 'terminal') {
            await switchAndRender('terminal', Terminal.render, tab, DOM.terminalWrapper);
        } else if (fileType === 'devtools') {
            await switchAndRender('devtools', (t, c) => new DevTools(c, t), tab, DOM.devtoolsWrapper);
        } else if (fileType === 'html-preview' || tab.isPreview) {
            await switchAndRender('preview', Editor.showPreviewer, tab.rawContent || tab.content, { type: fileType, name: tab.item.name }, tab.id, tab.forceReload || forceReload);
            tab.forceReload = false;
        } else if (fileType === 'zip') {
             // Zip handled by TabsLoader.renderTabView below if not switched here
        }

        // B"H - If a specialized view was manifested, we rest here.
        if (viewSwitched) {
            Tabs.render();
            return;
        }

        // --- Default Text/Binary File Handling ---
        const hasPreloaded = tab.content !== null && tab.content !== undefined;
        if (!hasPreloaded || tab.forceReload || forceReload) {
            const ok = await TabsLoader.loadTabContent(tab);
            // Verify we are still active after async load
            if (!ok || State.activeTabId !== numericTabId) { Tabs.render(); return; }
        }

        // Final switch to standard editor for normal files
        UI.switchView('editor');
        await TabsLoader.renderTabView(tab, tab.forceReload || forceReload);
        
        tab.forceReload = false; 
        Tabs.render();
        if (!State.isRestoring) App.saveSessionDebounced();
    }
};
