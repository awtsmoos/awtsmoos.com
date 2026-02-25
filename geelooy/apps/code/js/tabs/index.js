
// B"H
/**
 * @file tabs/index.js
 * @brief The Nexus of Manifested Documents.
 * 
 * THE HYMN OF THE OPEN PAGE:
 * Every tab is a portal, a window to light,
 * Bringing the word from the deeps into sight.
 * If the path is obscured, if the vessel is gone,
 * We stay at the source till the darkness has drawn.
 * We catch every error, we hold every handle,
 * Keeping the flame on the digital candle.
 * Refreshing the vision, ensuring the truth,
 * In the wisdom of age and the passion of youth.
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

import { TabsRenderer } from './rendering.js';
import { TabsPersistence } from './persistence.js';

export const Tabs = {
    getUniquePath: (item) => `${item.workspaceId ?? 'temp'}::${item.path ?? item.name}`,

    /**
     * @async
     * @function create
     * @description B"H - Brings a new document vessel into the active world.
     */
    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        if (!item) return;

        // B"H - Specialized Vessel Check
        if (item.type === 'commander') {
            const newTab = {
                id: State.nextTabId++,
                item,
                content: item.commanderState,
                isDirty: false,
                isUncommitted: false,
                uniquePath: `commander::${Date.now()}`, 
                scrollPos: 0,
                fileType: 'commander',
            };
            State.tabs.push(newTab);
            if (activate) await this.activate(newTab.id);
            return;
        }

        if (item.type === 'terminal') {
            const newTab = {
                id: State.nextTabId++,
                item,
                content: item.terminalState, 
                isDirty: false,
                uniquePath: `terminal::${Date.now()}`,
                fileType: 'terminal',
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
        if (item.type === 'vibe-session') {
            fileType = 'vibe';
        }

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
     * @async
     * @function activate
     * @description Focusing the application's consciousness on a specific tab.
     */
    async activate(tabId) {
        console.log(`[Tabs] B"H - Activating tab ID: ${tabId}`);
        State.activeTabId = tabId;
        const tab = State.tabs.find(t => t.id === tabId);

        if (!tab) {
            UI.switchView('empty');
            this.render();
            if (!State.isRestoring) App.saveSessionDebounced();
            return;
        }

        // B"H - Persistence check for local handles
        const workspace = State.workspaces.find(ws => ws.id === tab.item.workspaceId);
        if (workspace && workspace.isLocked && !workspace.isLost) {
            UI.switchView('empty');
            DOM.emptyEditorMessage.classList.remove('hidden');
            DOM.emptyEditorMessage.innerHTML = `
                <div style="text-align:center; padding: 40px;">
                    <h2 style="color: var(--neon-magenta);">🔒 World Locked</h2>
                    <p>Access to "${workspace.name}" must be renewed.</p>
                    <p>Click <strong>"RESUME"</strong> on the folder in the sidebar.</p>
                </div>`;
            this.render();
            return;
        }

        // --- View Logic Branching ---
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

        // --- Data Loading Ritual ---
        const hasPreloaded = tab.content !== null && tab.content !== undefined;
        if (!hasPreloaded || tab.forceReload) {
            const ok = await this._loadTabContent(tab);
            if (!ok) {
                // If loading failed (e.g. NotFound), we still render the UI
                // so the user can close the broken tab.
                this.render();
                return;
            }
        }

        await this._renderTabView(tab);
        this.render();
        if (!State.isRestoring) App.saveSessionDebounced();
    },

    /**
     * @async
     * @function _loadTabContent
     * @description Retrieving the raw light from the physical disk.
     */
    async _loadTabContent(tab) {
        try {
            UI.showLoading(`B"H - Opening ${tab.item.name}...`);
            let fileContent;
            
            if (tab.item.type === 'zip-entry' || tab.item.type === 'temp') {
                fileContent = tab.content;
            } else {
                // Try uncommitted memory first (Git staging)
                try {
                    fileContent = await FileSystemProvider.IndexedDB.readUncommitted(tab.uniquePath);
                    tab.isUncommitted = true;
                } catch (e) {
                    // Not in uncommitted, read from source
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
            
            tab.forceReload = false;
            return true;
        } catch (e) {
            console.error(`[Tabs] B"H - Load Error for ${tab.item.path}:`, e);
            UI.showToast(`The vessel "${tab.item.name}" could not be found or read.`, "error");
            return false;
        } finally {
            UI.hideLoading();
        }
    },

    async _renderTabView(tab) {
        if (tab.fileType === 'zip') {
            await ZipExplorer.open(tab.rawContent, tab);
        } else if (tab.fileType === 'text') {
            UI.switchView('editor');
            await Editor.showTextEditor(tab.content || "", tab.item.name, tab.scrollPos || 0);
        } else if (tab.isHexView) {
            UI.switchView('hex');
            // Instance initialization assumed elsewhere
        } else {
            UI.switchView('preview');
            Editor.showPreviewer(tab.rawContent, { type: tab.fileType, name: tab.item.name }, tab.id);
        }
    },

    async close(tabId, force = false) {
        const idx = State.tabs.findIndex(t => t.id === tabId);
        if (idx === -1) return;

        const tab = State.tabs[idx];
        if (tab.isDirty && !force) {
            const res = await UI.showDialog({
                title: "Unsaved Changes",
                message: `Save changes to ${tab.item.name}?`,
                okText: "Save",
                cancelText: "Discard"
            });
            if (res === true) await this.save(tab);
            else if (res === null) return; // User pressed X or Esc
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
        if (!tab || !tab.item) return;
        return TabsPersistence.save(tab, this);
    },

    render() {
        TabsRenderer.render(DOM.tabBar, this);
    }
};
