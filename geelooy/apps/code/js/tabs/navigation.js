
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
        const tab = State.tabs.find(t => t.id === tabId);
        if (!tab) return;
        try {
            UI.showLoading(`Navigating to ${newItem.name}...`);
            const contentRaw = await FileSystemProvider.read(newItem);
            const content = contentRaw instanceof Blob ? await contentRaw.text() : String(contentRaw);

            if (!tab.previewHistory) tab.previewHistory =[];
            tab.previewHistory.push({ item: { ...tab.item }, content: tab.content, rawContent: tab.rawContent, uniquePath: tab.uniquePath });

            tab.item = { ...newItem, name: `Preview: ${newItem.name}`, originalType: newItem.originalType || newItem.type, type: 'html-preview-file' };
            tab.uniquePath = `preview::${newItem.workspaceId}::${newItem.path}`;
            tab.content = content; tab.rawContent = content; tab.forceReload = true;
            await this.activate(tabId, true);
        } catch(e) { UI.showToast("Navigation failed: " + e.message, "error"); } finally { UI.hideLoading(); }
    },

    async goBackPreview(tabId) {
        const tab = State.tabs.find(t => t.id === tabId);
        if (tab && tab.previewHistory && tab.previewHistory.length > 0) {
            const pastState = tab.previewHistory.pop();
            tab.item = pastState.item; tab.content = pastState.content; tab.rawContent = pastState.rawContent; tab.uniquePath = pastState.uniquePath; tab.forceReload = true;
            await this.activate(tabId, true);
        }
    },

    async activate(tabId, forceReload = false) {
        State.activeTabId = tabId;
        const tab = State.tabs.find(t => t.id === tabId);

        if (!tab) {
            UI.switchView('empty'); Tabs.render();
            if (!State.isRestoring) App.saveSessionDebounced();
            return;
        }

        const workspace = State.workspaces.find(ws => ws.id === tab.item.workspaceId);
        if (workspace && workspace.isLocked && !workspace.isLost) {
            UI.switchView('empty'); DOM.emptyEditorMessage.classList.remove('hidden');
            DOM.emptyEditorMessage.innerHTML = `<div style="text-align:center; padding: 40px;"><h2 style="color: var(--neon-magenta);">🔒 World Locked</h2><p>Click <strong>"RESUME"</strong> on the folder in the sidebar.</p></div>`;
            Tabs.render(); return;
        }

        // B"H - VIBE ROUTING (Manager + Session)
        if (tab.item.type === 'vibe-manager' || tab.fileType === 'vibe' || tab.item.type === 'vibe-session') {
            // VibeController.render handles UI switching internally
            await VibeController.render(tab); 
            Tabs.render(); 
            return;
        }

        if (tab.item.type === 'commander') {
            UI.switchView('commander'); FileCommander.render(tab, document.getElementById('file-commander-wrapper')); Tabs.render(); return;
        }

        if (tab.item.type === 'terminal') {
            UI.switchView('terminal'); Terminal.render(tab, document.getElementById('terminal-wrapper')); Tabs.render(); return;
        }
        
        if (tab.fileType === 'devtools') {
            UI.switchView('devtools'); new DevTools(DOM.devtoolsWrapper, tab); Tabs.render(); return;
        }

        if (tab.fileType === 'html-preview' || tab.isPreview) {
            UI.switchView('preview'); Editor.showPreviewer(tab.rawContent || tab.content, { type: tab.fileType, name: tab.item.name }, tab.id, tab.forceReload || forceReload);
            tab.forceReload = false; Tabs.render(); if (!State.isRestoring) App.saveSessionDebounced(); return;
        }

        const hasPreloaded = tab.content !== null && tab.content !== undefined;
        if (!hasPreloaded || tab.forceReload || forceReload) {
            const ok = await TabsLoader.loadTabContent(tab);
            if (!ok) { Tabs.render(); return; }
        }

        await TabsLoader.renderTabView(tab, tab.forceReload || forceReload);
        tab.forceReload = false; Tabs.render();
        if (!State.isRestoring) App.saveSessionDebounced();
    }
};
