// B"H
// FILE: js/tabs/index.js

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { MimeUtil } from '../mime-util.js';
import { App } from '../app.js';
import { DataAltar } from '../DataAltar.js';
import { getItemUniquePath } from '../workspaces.js'; 
import { ZipExplorer } from '../zip/zip-explorer.js';

import { TabsRenderer } from './rendering.js';
import { TabsPersistence } from './persistence.js';

export const Tabs = {
    getUniquePath: (item) => `${item.workspaceId ?? 'temp'}::${item.path ?? item.name}`,

    createConsole(associatedTab) {
        const uniquePath = `console::${associatedTab.uniquePath}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            this.activate(existingTab.id);
            return;
        }
        const consoleTab = {
            id: State.nextTabId++,
            item: { name: `Console: ${associatedTab.item.name}`, type: 'console', associatedTabId: associatedTab.id },
            uniquePath: uniquePath,
            isDirty: false,
            isPreview: false,
            fileType: 'console'
        };
        State.tabs.push(consoleTab);
        this.activate(consoleTab.id);
    },
    
    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        const uniquePath = this.getUniquePath(item);
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            if (activate) await this.activate(existingTab.id);
            return;
        }
        const newTab = {
            id: State.nextTabId++,
            item,
            content: item.content !== undefined ? item.content : (isNewFile ? '' : null),
            // B"H - Dirty Logic Fix: 
            // If item.content is provided, it's usually dirty (unsaved), UNLESS it's a zip-entry 
            // which we load with content but treat as "clean" until edited.
            isDirty: isNewFile || (item.content !== undefined && item.type !== 'zip-entry'),
            isUncommitted: false,
            uniquePath,
            scrollPos: 0,
            fileType: MimeUtil.getInfo(item.name).type,
        };
        State.tabs.push(newTab);
        if (shouldSave) App.saveSession();

        if (activate) await this.activate(newTab.id);
    },

    createPreview(originalItem, content) {
        const uniquePath = `preview::${this.getUniquePath(originalItem)}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        
        if (existingTab) {
            existingTab.content = content;
            if (State.activeTabId === existingTab.id) {
                Editor.showPreviewer(null, { type: 'html-preview' }, existingTab.id);
            }
            this.activate(existingTab.id);
            return;
        }

        const previewItem = { ...originalItem, name: `Preview: ${originalItem.name}` };
        const newTab = {
            id: State.nextTabId++,
            item: previewItem,
            content: content,
            isDirty: false,
            uniquePath: uniquePath,
            scrollPos: 0,
            fileType: 'html-preview',
            isPreview: true,
        };
        State.tabs.push(newTab);
        this.activate(newTab.id);
    },
    
    createTemporary(name = 'Untitled', content = '') {
        const untitledCount = State.tabs.filter(t => t.item.type === 'temp').length + 1;
        const newName = `${name}-${untitledCount}`;
        const tempItem = { type: 'temp', name: newName, path: null, kind: 'file' };
        const uniquePath = this.getUniquePath(tempItem);
        const newTab = {
            id: State.nextTabId++,
            item: tempItem,
            content: content,
            isDirty: true,
            uniquePath,
            scrollPos: 0,
            fileType: 'text',
        };
        State.tabs.push(newTab);
        this.activate(newTab.id);
    },
    
    async activate(tabId, forceViewChange = false) {
        State.activeTabId = tabId;
        const tab = State.tabs.find(t => t.id === tabId);

        if (!tab) {
            UI.switchView('empty');
            this.render();
            App.saveSession();
            return;
        }

        const workspace = State.workspaces.find(ws => ws.id === tab.item.workspaceId);
        if (workspace && workspace.isLocked && !workspace.isLost) {
            UI.switchView('empty');
            DOM.emptyEditorMessage.classList.remove('hidden');
            DOM.emptyEditorMessage.innerHTML = `
                <div style="text-align:center; padding: 40px;">
                    <h2 style="color: var(--color-accent-warning);">🔒 Workspace Locked</h2>
                    <p>Please click <strong>"Resume"</strong> on the folder <em>"${workspace.name}"</em> in the sidebar.</p>
                </div>`;
            this.render();
            return;
        }

        // B"H - Content Loading Guard & Blob Processing Fix
        // If content is Blob but type is text (common with Zip opening), we must decode it.
        if (tab.content instanceof Blob && tab.fileType === 'text') {
             await this._handleStandardContent(tab, tab.content);
        } else if (tab.content === null || tab.forceReload) {
            const loaded = await this._loadTabContent(tab);
            if (!loaded) {
                return;
            }
        }

        this._renderTabView(tab);
        
        DOM.editor.readOnly = workspace?.readOnly || false;
        this.render();
        
        if (!State.isRestoring) App.saveSessionDebounced();
    },

    async _loadTabContent(tab) {
        try {
            UI.showLoading(`Opening ${tab.item.name}...`);
            let fileContent;
            
            if (tab.item.type === 'zip-entry') {
                // Zip entries pass content directly via Tabs.create
                fileContent = tab.content;
            } else {
                const gitInfo = await this._getGitInfoForTab(tab);
                if (gitInfo) {
                        try {
                        fileContent = await FileSystemProvider.IndexedDB.readUncommitted(tab.uniquePath);
                        tab.isUncommitted = true;
                        } catch (e) { /* not uncommitted */ }
                }
                if (fileContent === undefined) {
                    fileContent = await FileSystemProvider.read(tab.item);
                }
            }

            if (tab.item.name.toLowerCase().endsWith('.zip')) {
                tab.fileType = 'zip';
                this._handleZipContent(tab, fileContent);
            } else {
                await this._handleStandardContent(tab, fileContent);
            }
            tab.forceReload = false;
            return true; // Success
        } catch (e) {
            console.error("Tab Load Error:", e);
            UI.showToast(`Error opening file: ${e.message}`, 'error');
            return false; // Failed
        } finally {
            UI.hideLoading();
        }
    },

    _handleZipContent(tab, fileContent) {
        if (fileContent instanceof Blob) {
            tab.rawContent = fileContent; 
        } else if (fileContent.base64Content) { 
                const binStr = atob(fileContent.base64Content);
                const len = binStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
                tab.rawContent = new Blob([bytes], {type: 'application/zip'});
        } else if (fileContent instanceof ArrayBuffer || ArrayBuffer.isView(fileContent)) {
             tab.rawContent = new Blob([fileContent], {type: 'application/zip'});
        } else {
            tab.rawContent = new Blob([fileContent], {type: 'application/zip'});
        }
    },

    async _handleStandardContent(tab, fileContent) {
        tab.rawContent = fileContent;
        let arrayBuffer;
        if (fileContent instanceof Blob) {
            arrayBuffer = await fileContent.arrayBuffer();
        } else if (typeof fileContent === 'string') {
            arrayBuffer = new TextEncoder().encode(fileContent).buffer;
        } else if (fileContent.isBinary) {
            arrayBuffer = Uint8Array.from(atob(fileContent.base64Content), c => c.charCodeAt(0)).buffer;
        } else if (fileContent instanceof ArrayBuffer) {
            arrayBuffer = fileContent;
        } else if (ArrayBuffer.isView(fileContent)) {
            arrayBuffer = fileContent.buffer;
        } else {
            arrayBuffer = new ArrayBuffer(0);
        }
        tab.arrayBuffer = arrayBuffer;

        if (tab.fileType === 'text' || tab.item.name.toLowerCase().endsWith('.awtsmoosjson')) {
                if (typeof fileContent === 'string') {
                    tab.content = fileContent;
                } else {
                    tab.content = new TextDecoder().decode(arrayBuffer);
                }
        } else {
            tab.content = fileContent;
        }
    },

    async _renderTabView(tab) {
        if (tab.fileType === 'zip') {
            await ZipExplorer.open(tab.rawContent, tab);
        } else if (tab.fileType === 'text') {
            // B"H - Altar View Logic
            if (tab.isAltarView) {
                UI.switchView('altar');
                try {
                    const content = (tab.content === null || tab.content === undefined) ? '' : tab.content;
                    const jsonData = JSON.parse(content);
                    DataAltar.manifest(jsonData);
                } catch(e) {
                    UI.showToast("Content is not valid JSON. Reverting to text.", "error");
                    tab.isAltarView = false;
                    // Fallthrough to standard text editor
                    const targetScroll = Number(tab.scrollPos) || 0;
                    const textContent = (tab.content === null || tab.content === undefined) ? '' : tab.content;
                    await Editor.showTextEditor(textContent, tab.item.name, targetScroll);
                }
                return;
            }

            const targetScroll = Number(tab.scrollPos) || 0;
            // Guard against null content being passed to editor
            const textContent = (tab.content === null || tab.content === undefined) ? '' : tab.content;
            await Editor.showTextEditor(textContent, tab.item.name, targetScroll);
        } else if (tab.isHexView) {
            UI.switchView('hex');
            State.hexEditorInstance.load(tab.arrayBuffer);
        } else {
            // Ensure rawContent is safe for Editor.showPreviewer
            let safeContent = tab.rawContent;
            if (!(safeContent instanceof Blob) && !safeContent.isBinary && tab.arrayBuffer) {
                // If it's a binary array but not a blob yet, make it one
                safeContent = new Blob([tab.arrayBuffer], { type: MimeUtil.getInfo(tab.item.name).mime });
            }
            Editor.showPreviewer(safeContent, { type: tab.fileType, name: tab.item.name }, tab.id);
        }
    },

    async _getGitInfoForTab(tab) {
        if (tab.item.type === 'zip-entry') return null; 
        if (tab.item.type === 'github') {
            return State.workspaces.find(ws => ws.id === tab.item.workspaceId);
        }
        if (tab.item.type === 'local' || tab.item.type === 'indexeddb') {
            const findGitRoot = (item) => {
                if (!item || !item.path) return null;
                const uniquePath = getItemUniquePath(item);
                const entry = State.domItemMap.get(uniquePath);
                if (entry?.item.isGitClone) return entry.item;
                const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
                if (item.path === parentPath) return null;
                return findGitRoot({ ...item, path: parentPath, kind: 'directory' });
            };
            return findGitRoot(tab.item);
        }
        return null;
    },

    async close(tabId, force = false) {
        const tabIndex = State.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tabToClose = State.tabs[tabIndex];
        
        if (tabToClose.id === State.activeTabId && tabToClose.isAltarView) {
	        DataAltar.demanifest();
	    }
        
        if (tabToClose.isDirty && !force) {
            const choice = await UI.showDialog({
                 title: 'Unsaved Changes',
                 message: `You have unsaved changes in "${tabToClose.item.name}". Do you want to save them?`,
                 okText: 'Save',
                 cancelText: 'Don\'t Save'
            });

            if (choice === true) {
                await this.save(tabToClose);
            } else if (choice === null) {
                // Proceed to close
            } else {
                return;
            }
        }

        this._cleanupTabResources(tabToClose);
        
        const newTabIndex = State.tabs.findIndex(t => t.id === tabId);
        if (newTabIndex !== -1) {
           State.tabs.splice(newTabIndex, 1);
        }
        
        if (State.activeTabId === tabId) {
            const nextTab = State.tabs[newTabIndex] || State.tabs[newTabIndex - 1] || null;
            await this.activate(nextTab ? nextTab.id : null);
        } else {
            this.render();
            App.saveSession();
        }
    },

    async _cleanupTabResources(tab) {
        if (tab.fileType === 'html-preview') {
            const consoleTab = State.tabs.find(t => t.item.type === 'console' && t.item.associatedTabId === tab.id);
            if (consoleTab) await this.close(consoleTab.id, true);
            
            const iframe = State.previewIframes.get(tab.id);
            if (iframe) {
                if (iframe.src.startsWith('blob:')) URL.revokeObjectURL(iframe.src);
                iframe.remove();
            }
            State.previewIframes.delete(tab.id);
        }  else if (tab.fileType === 'console') {
            const instance = State.consoleInstances.get(tab.id);
            if (instance) instance.destroy();
            State.consoleInstances.delete(tab.id);
        }
    },

    async saveActive() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (!tab) return UI.showToast('No active file to save.', 'info');
        if (tab.isPreview) return UI.showToast('Cannot save a preview tab.', 'info');
        if (tab.item.type === 'temp') {
            await this.saveAs(tab);
            return;
        }
        if (!tab.isDirty) return UI.showToast('No changes to save.', 'info');
        await this.save(tab);
    },
    
    async save(tab) {
        return TabsPersistence.save(tab, this);
    },

    async saveAs(tab) {
        return TabsPersistence.saveAs(tab, this);
    },
    
    downloadActive() {
        return TabsPersistence.downloadActive(this);
    },

    render() {
        TabsRenderer.render(DOM.tabBar, this);
    },
};