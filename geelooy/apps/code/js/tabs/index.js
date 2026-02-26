
// B"H
/**
 * @file tabs/index.js
 * @brief The Nexus of Manifested Documents.
 */

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { MimeUtil } from '../mime-util.js';
import { App } from '../app.js';
import { DataAltar } from '../data-altar/index.js';
import { getItemUniquePath } from '../workspaces/index.js'; 
import { ZipExplorer } from '../zip/zip-explorer.js';
import { VibeController } from '../vibe/vibe-controller.js'; 
import { FileCommander } from '../file-commander.js'; 
import { Terminal } from '../terminal/index.js';
import { DevTools } from '../devtools/index.js';

import { TabsRenderer } from './rendering.js';
import { TabsPersistence } from './persistence.js';

export const Tabs = {
    getUniquePath: (item) => `${item.workspaceId ?? 'temp'}::${item.path ?? item.name}`,

    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        if (!item) return;

        if (item.type === 'commander') {
            const newTab = { id: State.nextTabId++, item, content: item.commanderState, isDirty: false, uniquePath: `commander::${Date.now()}`, fileType: 'commander' };
            State.tabs.push(newTab);
            if (activate) await this.activate(newTab.id);
            return;
        }

        if (item.type === 'terminal') {
            const newTab = { id: State.nextTabId++, item, content: item.terminalState, isDirty: false, uniquePath: `terminal::${Date.now()}`, fileType: 'terminal' };
            State.tabs.push(newTab);
            if (activate) await this.activate(newTab.id);
            return;
        }
        
        // B"H - DevTools Tab Creation
        if (item.type === 'devtools') {
            const newTab = { 
                id: State.nextTabId++, 
                item, 
                isDirty: false, 
                uniquePath: `devtools::${item.previewTabId}`, 
                fileType: 'devtools', 
                devtoolsState: { previewTabId: item.previewTabId, logs:[], networkReqs:[], domString:'' } 
            };
            State.tabs.push(newTab);
            if (activate) await this.activate(newTab.id);
            return;
        }

        const uniquePath = this.getUniquePath(item);
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            if (activate) await this.activate(existingTab.id);
            return;
        }
        
        let fileType = MimeUtil.getInfo(item.name).type;
        if (item.type === 'vibe-session') fileType = 'vibe';

        const newTab = {
            id: State.nextTabId++,
            item,
            content: item.content !== undefined ? item.content : (isNewFile ? '' : null),
            isDirty: isNewFile || (item.content !== undefined && item.type !== 'zip-entry'),
            isUncommitted: false,
            uniquePath,
            scrollPos: 0,
            fileType: fileType,
        };
        State.tabs.push(newTab);
        if (shouldSave) App.saveSession();

        if (activate) await this.activate(newTab.id);
    },

    /**
     * B"H - Creates a distinct, parallel tab for the HTML Preview.
     * It does not destroy the code editing tab.
     */
    async createPreview(item, content) {
        const uniquePreviewPath = `preview::${item.workspaceId}::${item.path}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePreviewPath);
        
        if (existingTab) {
            existingTab.content = content;
            existingTab.rawContent = content;
            existingTab.forceReload = true;
            await this.activate(existingTab.id, true);
            return;
        }

        const previewItem = { ...item, name: `Preview: ${item.name}`, type: 'html-preview-file' };
        
        const newTab = {
            id: State.nextTabId++,
            item: previewItem,
            content: content,
            rawContent: content,
            isDirty: false,
            isUncommitted: false,
            uniquePath: uniquePreviewPath,
            scrollPos: 0,
            fileType: 'html-preview',
            isPreview: true
        };
        
        State.tabs.push(newTab);
        App.saveSession();
        await this.activate(newTab.id);
    },

    async activate(tabId, forceReload = false) {
        State.activeTabId = tabId;
        const tab = State.tabs.find(t => t.id === tabId);

        if (!tab) {
            UI.switchView('empty');
            this.render();
            if (!State.isRestoring) App.saveSessionDebounced();
            return;
        }

        const workspace = State.workspaces.find(ws => ws.id === tab.item.workspaceId);
        if (workspace && workspace.isLocked && !workspace.isLost) {
            UI.switchView('empty');
            DOM.emptyEditorMessage.classList.remove('hidden');
            DOM.emptyEditorMessage.innerHTML = `<div style="text-align:center; padding: 40px;"><h2 style="color: var(--neon-magenta);">🔒 World Locked</h2><p>Click <strong>"RESUME"</strong> on the folder in the sidebar.</p></div>`;
            this.render();
            return;
        }

        if (tab.fileType === 'vibe' || tab.item.type === 'vibe-session') {
            UI.switchView('vibe');
            if (!tab.vibeSession) tab.vibeSession = tab.content;
            VibeController.render(tab);
            this.render();
            return;
        }

        if (tab.item.type === 'commander') {
            UI.switchView('commander');
            FileCommander.render(tab, document.getElementById('file-commander-wrapper'));
            this.render();
            return;
        }

        if (tab.item.type === 'terminal') {
            UI.switchView('terminal');
            Terminal.render(tab, document.getElementById('terminal-wrapper'));
            this.render();
            return;
        }
        
        // B"H - DevTools Routing
        if (tab.fileType === 'devtools') {
            UI.switchView('devtools');
            DevTools.render(tab, DOM.devtoolsWrapper);
            this.render();
            return;
        }

        // B"H - HTML Preview Routing
        if (tab.fileType === 'html-preview' || tab.isPreview) {
            UI.switchView('preview');
            Editor.showPreviewer(tab.rawContent || tab.content, { type: tab.fileType, name: tab.item.name }, tab.id, tab.forceReload || forceReload);
            tab.forceReload = false;
            this.render();
            if (!State.isRestoring) App.saveSessionDebounced();
            return;
        }

        const hasPreloaded = tab.content !== null && tab.content !== undefined;
        if (!hasPreloaded || tab.forceReload || forceReload) {
            const ok = await this._loadTabContent(tab);
            if (!ok) { this.render(); return; }
        }

        await this._renderTabView(tab, tab.forceReload || forceReload);
        tab.forceReload = false;
        
        this.render();
        if (!State.isRestoring) App.saveSessionDebounced();
    },

    async _loadTabContent(tab) {
        try {
            UI.showLoading(`Opening ${tab.item.name}...`);
            let fileContent;
            
            if (tab.item.type === 'zip-entry' || tab.item.type === 'temp') {
                fileContent = tab.content;
            } else {
                try {
                    fileContent = await FileSystemProvider.IndexedDB.readUncommitted(tab.uniquePath);
                    tab.isUncommitted = true;
                } catch (e) {
                    fileContent = await FileSystemProvider.read(tab.item);
                }
            }

            if (tab.item.name.toLowerCase().endsWith('.zip')) {
                tab.fileType = 'zip';
                tab.rawContent = (fileContent instanceof Blob) ? fileContent : new Blob([fileContent]);
            } else {
                tab.rawContent = fileContent;
                if (typeof fileContent === 'string') {
                    tab.content = fileContent;
                } else if (fileContent instanceof Blob) {
                    tab.content = await fileContent.text();
                } else {
                    tab.content = String(fileContent);
                }
            }
            return true;
        } catch (e) {
            UI.showToast(`Error reading file: ${e.message}`, "error");
            return false;
        } finally {
            UI.hideLoading();
        }
    },

    async _renderTabView(tab, forceReload) {
        if (tab.fileType === 'zip') {
            await ZipExplorer.open(tab.rawContent, tab);
        } else if (tab.fileType === 'text') {
            await Editor.showTextEditor(tab.content || "", tab.item.name, tab.scrollPos || 0);
        } else if (tab.isHexView) {
            UI.switchView('hex');
        } else {
            // Fallback for raw files, should be handled above for html-preview
            Editor.showPreviewer(tab.rawContent, { type: tab.fileType, name: tab.item.name }, tab.id, forceReload);
        }
    },

    async close(tabId, force = false) {
        const idx = State.tabs.findIndex(t => t.id === tabId);
        if (idx === -1) return;

        const tab = State.tabs[idx];
        if (tab.isDirty && !force) {
            const res = await UI.showDialog({ title: "Unsaved Changes", message: `Save changes to ${tab.item.name}?`, okText: "Save", cancelText: "Discard" });
            if (res === true) await this.save(tab);
            else if (res === null) return; 
        }

        // B"H - Memory Management: Clear persistent resources
        if (tab.fileType === 'html-preview' || tab.isPreview) {
            Editor.closePreviewer(tab.id);
            // Also close attached DevTools if any
            const dtTab = State.tabs.find(t => t.fileType === 'devtools' && t.devtoolsState?.previewTabId === tab.id);
            if (dtTab) this.close(dtTab.id, true);
        }

        State.tabs.splice(idx, 1);
        if (State.activeTabId === tabId) {
            const next = State.tabs[idx] || State.tabs[idx - 1] || null;
            await this.activate(next ? next.id : null);
        } else {
            this.render();
        }
        App.saveSession();
    },

    async saveActive() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (tab) await this.save(tab);
    },

    async save(tab) {
        return TabsPersistence.save(tab, this);
    },

    render() {
        TabsRenderer.render(DOM.tabBar, this);
    }
};
