/*B"H*/
// FILE: js/tabs.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';
import { StatusBar } from './statusbar.js';
import { FileSystemProvider } from './fs-provider.js';
import { MimeUtil } from './mime-util.js';

import { App } from './app.js';
import { Console } from "./Console.js";
import { DataAltar } from './DataAltar.js';
import { AwtsmoosHandler } from './awtsmoos-handler.js';
import { getItemUniquePath } from './workspaces.js'; 


function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

/**
 * The loom upon which the user's focus is woven. Each tab is a thread,
 * representing a file, a preview, or a console, pulled from the ether of a filesystem.
 */
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
    
 
/*B"H*/
/**
 * Creates a new tab object and adds it to the application State.
 * @param {object} item - The file item object for the new tab.
 * @param {boolean} [isNewFile=false] - Whether this is a newly created file.
 * @param {boolean} [shouldSave=true] - Whether to persist this change to the session.
 * @param {boolean} [activate=true] - If false, the tab will be created without being activated.
 */
async create(item, isNewFile = false, shouldSave = true, activate = true) {
    const uniquePath = this.getUniquePath(item);
    const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
    if (existingTab) {
        if (activate) {
            await this.activate(existingTab.id);
        }
        return;
    }
    const newTab = {
        id: State.nextTabId++,
        item,
        content: item.content !== undefined ? item.content : (isNewFile ? '' : null),
        isDirty: isNewFile || item.content !== undefined,
        isUncommitted: false,
        uniquePath,
        scrollPos: 0,
        fileType: MimeUtil.getInfo(item.name).type,
    };
    State.tabs.push(newTab);
    if (shouldSave) App.saveSession();

    // Only activate if the 'activate' flag is true.
    if (activate) {
        await this.activate(newTab.id);
    }
},
    /**
     * B"H
     * Creates or updates a preview tab.
     * FIX: Preserves the original item's 'type' so the file system knows how to read it
     * if necessary. Also updates content on re-activation for "Hot Previewing".
     */
    createPreview(originalItem, content) {
        const uniquePath = `preview::${this.getUniquePath(originalItem)}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        
        if (existingTab) {
            // B"H - Update the content with the latest edits
            existingTab.content = content;
            
            // Force the editor/previewer to recognize the change
            if (State.activeTabId === existingTab.id) {
                // If already active, we might need to trigger a reload of the iframe
                // The Editor.showPreviewer logic handles this via the orchestrator
                Editor.showPreviewer(null, { type: 'html-preview' }, existingTab.id);
            }
            
            this.activate(existingTab.id);
            return;
        }

        // B"H 
        // We must preserve the original 'type' (e.g., 'github', 'local') 
        // so that FileSystemProvider can read from it.
        // We only modify the name for the UI.
        const previewItem = { 
            ...originalItem, 
            name: `Preview: ${originalItem.name}`
            // Do NOT overwrite 'type' with 'preview'. 
        };

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
    
/*B"H*/
/**
 * Shifts the application's focus to a specific tab. This is the central nexus
 * for view-switching. It loads content if necessary, and then correctly manifests
 * the appropriate view: the Text Editor, the Hex Editor, or the Data Altar,
 * restoring the full, original logic for each.
 * @param {number} tabId - The ID of the tab to activate.
 * @param {boolean} [forceViewChange=false] - If true, forces a full re-render of the view.
 */
/*B"H*/
async activate(tabId, forceViewChange = false) {
    // 1. (REMOVED: Do not manually save scroll here. Trust the event listeners.)

    State.activeTabId = tabId;
    const tab = State.tabs.find(t => t.id === tabId);

    if (!tab) {
        UI.switchView('empty');
        StatusBar.clear();
        // B"H - FIX: Force render and save when no tab is active (e.g. last tab closed)
        this.render();
        App.saveSession();
        return;
    }

    // 2. Locked Workspace Check
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

    // 3. Load Content
    if (tab.content === null || tab.forceReload) {
        try {
            UI.showLoading(`Opening ${tab.item.name}...`);
            let fileContent;
            
            // Git/IDB/FS Read Logic
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

            // Process Content
            tab.rawContent = fileContent;
            let arrayBuffer;
            if (fileContent instanceof Blob) {
                arrayBuffer = await fileContent.arrayBuffer();
            } else if (typeof fileContent === 'string') {
                arrayBuffer = new TextEncoder().encode(fileContent).buffer;
            } else if (fileContent.isBinary) {
                arrayBuffer = Uint8Array.from(atob(fileContent.base64Content), c => c.charCodeAt(0)).buffer;
            } else {
                arrayBuffer = new ArrayBuffer(0);
            }
            
            tab.arrayBuffer = arrayBuffer;

            if (tab.fileType === 'text' || tab.item.name.toLowerCase().endsWith('.awtsmoosjson')) {
                 if (typeof fileContent === 'string') tab.content = fileContent;
                 else tab.content = new TextDecoder().decode(arrayBuffer);
            } else {
                tab.content = fileContent;
            }
            tab.forceReload = false;
        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Error: ${e.message}`, 'error');
            return;
        } finally {
            UI.hideLoading();
        }
    }

    // 4. Render View & Restore Scroll
    if (tab.fileType === 'text') {
        const targetScroll = Number(tab.scrollPos) || 0;
        await Editor.showTextEditor(tab.content || '', tab.item.name, targetScroll);
    } else if (tab.isHexView) {
        UI.switchView('hex');
        State.hexEditorInstance.load(tab.arrayBuffer);
    } else {
        Editor.showPreviewer(tab.rawContent, { type: tab.fileType, name: tab.item.name }, tab.id);
    }
    
    DOM.editor.readOnly = workspace?.readOnly || false;
    this.render();
    
    // Auto-save state (debounced)
    if (!State.isRestoring) App.saveSessionDebounced();
},

/**
 * A private helper to determine if a tab belongs to any Git-aware context,
 * traversing up the tree for local clones.
 * @private
 */
async _getGitInfoForTab(tab) {
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

        if (tabToClose.fileType === 'html-preview') {
        
            
            const consoleTab = State.tabs.find(t => t.item.type === 'console' && t.item.associatedTabId === tabId);
            if (consoleTab) await this.close(consoleTab.id, true);
            
            const iframe = State.previewIframes.get(tabId);
            if (iframe) {
                if (iframe.src.startsWith('blob:')) URL.revokeObjectURL(iframe.src);
                iframe.remove();
            }
            State.previewIframes.delete(tabId);
        }  else if (tabToClose.fileType === 'console') {
            const instance = State.consoleInstances.get(tabId);
            if (instance) instance.destroy();
            State.consoleInstances.delete(tabId);
        }
        
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
    
/*B"H*/
// ACTION: Replace the entire 'save' method in js/tabs.js with this definitive, context-aware version.

/**
 * Saves a tab's content. This definitive version understands the heresy of the
 * absolute path. It now distinguishes between a simple save and a save-for-commit.
 * For any file within a Git-aware context (direct or clone), it performs the sacred
 * act of translation: it stages the change for the next commit using the pure,

 * relative path required by the celestial source, thus healing the language of
 * commitment and preventing the "Invalid tree info" heresy.
 * @param {object} tab - The tab object to save.
 */
async save(tab) {
    // First, we must know if this file is part of any reality that understands commitment.
    const gitRootItem = await this._getGitInfoForTab(tab);

    // Get the current content from the user's active view.
    let contentToSave;
    if (tab.id === State.activeTabId) {
         if (tab.isHexView) contentToSave = State.hexEditorInstance.getUpdatedArrayBuffer();
         else if (tab.isAltarView) contentToSave = JSON.stringify(DataAltar.liveDataObject, null, '\t');
         else contentToSave = Editor.getContent();
    } else {
         contentToSave = tab.content;
    }
    
    // Case 1: The file is NOT part of a Git reality. This is a simple, mundane save.
    if (!gitRootItem) {
        if (tab.item.readOnly) {
            UI.showToast("This is a read-only file.", "warning");
            return;
        }
        UI.showToast(`Saving ${tab.item.name}...`);
        try {
            await FileSystemProvider.write(tab.item, contentToSave);
            tab.isDirty = false;
            tab.isUncommitted = false;
            tab.content = contentToSave;
            this.render();
            UI.showToast(`Saved "${tab.item.name}"`, 'success');
        } catch (e) {
            UI.showToast(`Save failed: ${e.message}`, 'error');
        }
        return;
    }
    
    // Case 2: The file IS part of a Git reality. This save is also an act of staging.
    // If it's a clone, we first inscribe the change in the local, earthly reality.
    if (gitRootItem.type !== 'github') {
        UI.showLoading(`Saving ${tab.item.name} to local clone...`);
        await FileSystemProvider.write(tab.item, contentToSave);
    }
    
    // Now, for ALL Git realities, we stage the change in the great ledger of the uncommitted.
    try {
        UI.showLoading(`Staging ${tab.item.name} for commit...`);
        
        // --- THIS IS THE SACRED ACT OF TRANSLATION ---
        let relativePath;
        const isDirectRepo = gitRootItem.type === 'github';
        
        if (isDirectRepo) {
            // In a direct repo, the path is already pure and relative.
            relativePath = tab.item.path;
        } else {
            // In a clone, we must purify the absolute path.
            const cloneRootPath = gitRootItem.path; // e.g., '/' or '/my-clone'
            const fileFullPath = tab.item.path;   // e.g., '/app.js' or '/my-clone/app.js'

            if (cloneRootPath === '/') {
                relativePath = fileFullPath.substring(1); // from '/app.js' to 'app.js'
            } else if (fileFullPath && fileFullPath.startsWith(cloneRootPath + '/')) {
                relativePath = fileFullPath.substring(cloneRootPath.length + 1); // from '/my-clone/app.js' to 'app.js'
            } else {
                throw new Error("Cannot determine relative path for staging.");
            }
        }
        
        const itemForStaging = { ...tab.item, path: relativePath };
        const uniquePathForStaging = `${gitRootItem.workspaceId || gitRootItem.id}::${relativePath}`;

        await FileSystemProvider.IndexedDB.writeUncommitted(uniquePathForStaging, contentToSave, itemForStaging);

        tab.isDirty = false;
        tab.isUncommitted = true; // Mark it as Inscribed, ready for the Altar.
        tab.content = contentToSave;
        this.render();
        UI.showToast(`"${tab.item.name}" is saved and ready to commit.`, 'success');

    } catch (e) {
        UI.showToast(`Staging for commit failed: ${e.message}`, 'error');
        console.error("STAGING FAILED:", e);
    } finally {
        UI.hideLoading();
    }
},

    async saveAs(tab) {
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: tab.item.name,
                    types: [{
                        description: 'Files',
                        accept: { 'text/plain': ['.txt', '.js', '.css', '.html', '.md', '.json', '.xml', '.svg'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(Editor.getContent());
                await writable.close();
                tab.isDirty = false;
                tab.item.name = handle.name;
                tab.item.type = 'local-saved';
                tab.item.path = handle.name;
                tab.uniquePath = this.getUniquePath(tab.item);
                UI.showToast(`Saved "${handle.name}"`, 'success');
                this.render();
            } else {
                this.downloadActive();
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                UI.showToast(`Could not save file: ${err.message}`, 'error');
            }
        }
    },
    
    downloadActive() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (!tab) return UI.showToast('No active file to download.', 'info');
        const content = (tab.fileType === 'text') ? Editor.getContent() : tab.content;
        if (content instanceof Blob) {
             const url = URL.createObjectURL(content);
             const a = document.createElement('a');
             a.href = url;
             a.download = tab.item.name;
             a.click();
             URL.revokeObjectURL(url);
        } else {
            downloadFile(tab.item.name, content);
        }
        UI.showToast(`Downloaded "${tab.item.name}"`, 'success');
    },

    /*B"H*/
render() {
    let draggedTabId = null;

    const getDragAfterElement = (container, x) => {
        const draggableElements = [...container.querySelectorAll('.tab:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };
    
    DOM.tabBar.innerHTML = '';

    State.tabs.forEach((tab) => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${tab.id === State.activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''} ${tab.isUncommitted ? 'uncommitted' : ''}`;
        tabEl.dataset.tabId = String(tab.id);
        
        // --- B"H: TOOLTIP ENHANCEMENT ---
        // We construct a tooltip that reveals the full lineage of the file.
        // Format: "Workspace Name :: /path/to/file"
        const workspace = State.workspaces.find(ws => ws.id === tab.item.workspaceId);
        const wsName = workspace ? workspace.name : 'Unknown Realm';
        const fullPath = tab.item.path || tab.item.name;
        tabEl.title = `${wsName} :: ${fullPath}`;
        
        
       // tabEl.title = tab.item.path || tab.item.name;
        tabEl.draggable = true;
        
        const tabName = document.createElement('span');
        tabName.className = 'tab-name';
        tabName.textContent = tab.item.name;

        const closeButton = document.createElement('button');
        closeButton.className = 'icon-button close-tab-btn';
        closeButton.title = 'Close';
        closeButton.innerHTML = `<svg class="svg-icon" style="width:0.8em;height:0.8em;"><use href="#icon-x"/></svg>`;

        tabEl.appendChild(tabName);
        tabEl.appendChild(closeButton);
        
        tabEl.onclick = (e) => {
            if (e.target.closest('.close-tab-btn')) {
                e.stopPropagation();
                this.close(tab.id);
            } else if (State.activeTabId !== tab.id) {
                this.activate(tab.id);
            }
        };

        tabEl.addEventListener('dragstart', (e) => {
            draggedTabId = tab.id;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        
        tabEl.addEventListener('dragend', (e) => {
            draggedTabId = null;
            e.target.classList.remove('dragging');
        });

        DOM.tabBar.appendChild(tabEl);
    });

    DOM.tabBar.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.tabBar.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
        const afterElement = getDragAfterElement(DOM.tabBar, e.clientX);
        if (afterElement) {
            afterElement.classList.add('drop-indicator');
        }
    });

    DOM.tabBar.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.tabBar.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
        if (draggedTabId === null) return;

        const afterElement = getDragAfterElement(DOM.tabBar, e.clientX);
        const sourceTabId = draggedTabId;
        const sourceIndex = State.tabs.findIndex(t => t.id === sourceTabId);
        if (sourceIndex < 0) return;
        
        const [draggedTab] = State.tabs.splice(sourceIndex, 1);
        
        let targetIndex;
        if (afterElement) {
            const targetTabId = Number(afterElement.dataset.tabId);
            targetIndex = State.tabs.findIndex(t => t.id === targetTabId);
        } else {
            targetIndex = State.tabs.length;
        }

        State.tabs.splice(targetIndex, 0, draggedTab);

        State.activeTabId = sourceTabId;
        this.render(); 
        App.saveSession();
    });

    const activeTabEl = DOM.tabBar.querySelector('.tab.active');
    if (activeTabEl) activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    StatusBar.update();
},
};