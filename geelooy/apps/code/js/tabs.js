/*B"H*/
// FILE: js/tabs.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';
import { StatusBar } from './statusbar.js';
import { FileSystemProvider } from './fs-provider.js';
import { MimeUtil } from './mime-util.js';
import { detachWorkerRequestHandler, detachDynamicAssetHandler } from './html-preview-processor.js';
import { App } from './app.js';
import { Console } from "./Console.js";
import { DataAltar } from './DataAltar.js';
import { AwtsmoosHandler } from './awtsmoos-handler.js';

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
/*B"H*/
/**
 * Creates a new tab object and adds it to the application State.
 * @param {object} item - The file item object for the new tab.
 * @param {boolean} [isNewFile=false] - Whether this is a newly created file.
 * @param {boolean} [shouldSave=true] - Whether to persist this change to the session.
 * @param {boolean} [activate=true] - Whether to immediately activate this new tab.
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

    if (activate) {
        await this.activate(newTab.id);
    }
},
    createPreview(originalItem, content) {
        const uniquePath = `preview::${this.getUniquePath(originalItem)}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            this.activate(existingTab.id);
            return;
        }
        const previewItem = { ...originalItem, name: `Preview: ${originalItem.name}`, type: 'preview' };
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
    
    /**
     * Shifts the application's focus to a specific tab, drawing its contents
     * from the correct realm (IndexedDB for uncommitted changes, or the source filesystem).
     * @param {number} tabId - The ID of the tab to activate.
     * @param {boolean} [forceViewChange=false] - If true, forces a full re-render of the view.
     */
/*B"H*/
async activate(tabId, forceViewChange = false) {
    const currentTab = State.tabs.find(t => t.id === State.activeTabId);
    if (currentTab) {
        const isEditorVisible = !DOM.editorWrapper.classList.contains('hidden');
        if (currentTab.isAltarView && !isEditorVisible) {
            currentTab.content = JSON.stringify(currentTab.liveDataObject, null, '\t');
        } 
        else if (currentTab.isHexView) {
            if(State.hexEditorInstance?.isDirty()) {
                currentTab.arrayBuffer = State.hexEditorInstance.getUpdatedArrayBuffer();
                currentTab.rawContent = new Blob([currentTab.arrayBuffer]);
                currentTab.isDirty = true;
            }
        } 
        else if (currentTab.fileType === 'text' && isEditorVisible) {
            currentTab.content = Editor.getContent();
        }
        currentTab.scrollPos = DOM.editor.scrollTop || 0;
    }

    State.activeTabId = tabId;
    const tab = State.tabs.find(t => t.id === tabId);

    if (!tab) {
        UI.switchView('empty');
        StatusBar.clear();
        this.render();
        App.saveSession(); 
        return;
    }

    if (tab.content === null || tab.forceReload) {
        
        try {
            let fileContent;
            let wasLoadedFromIndexedDB = false;

            if (tab.item.type === 'github') {
                try {
                    fileContent = await FileSystemProvider.IndexedDB.readUncommitted(tab.uniquePath);
                    tab.isUncommitted = true;
                    wasLoadedFromIndexedDB = true;
                } catch (e) {
                    tab.isUncommitted = false;
                }
            }

            if (!wasLoadedFromIndexedDB) {
                fileContent = tab.rawContent || await FileSystemProvider.read(tab.item);
            }

            tab.rawContent = fileContent;

            const arrayBuffer = (fileContent instanceof Blob) 
                ? await fileContent.arrayBuffer() 
                : (typeof fileContent === 'string' ? new TextEncoder().encode(fileContent).buffer : (fileContent.isBinary ? atob(fileContent.base64Content) : fileContent));
            tab.arrayBuffer = arrayBuffer;

            if (tab.item.name.toLowerCase().endsWith('awtsmoosjson')) {
                tab.isAwtsmoos = true;
                if (!tab.isHexView) {
                    try { tab.content = await AwtsmoosHandler.decodeContent(fileContent); } 
                    catch (parseError) {
                        UI.showToast(`Parse failed: ${parseError.message}. Showing Hex view.`, 'error', 5000);
                        tab.isHexView = true;
                    }
                }
            } else if (tab.fileType === 'text') {
                tab.content = typeof fileContent === 'string' ? fileContent : await new Blob([arrayBuffer]).text();
            } else {
                tab.content = fileContent;
            }
        } catch (e) {
            UI.showToast(`Error opening ${tab.item.name}: ${e.message}`, 'error');
            this.close(tab.id, true); return;
        } finally {
            // The redundant UI.hideLoading() call has also been removed.
            tab.forceReload = false;
        }
    }

    if (tab.isAltarView) {
        try {
            const dataToManifest = tab.liveDataObject && !forceViewChange ? tab.liveDataObject : JSON.parse(tab.content);
            tab.liveDataObject = dataToManifest;
            UI.switchView('altar');
            DataAltar.manifest(dataToManifest);
        } catch (e) {
            UI.showToast("JSON is malformed; cannot perform transmutation.", "error", 5000);
            tab.isAltarView = false;
            await Editor.showTextEditor(tab.content || '', tab.item.name, tab.scrollPos || 0);
        }
    } else if (tab.isHexView) {
        UI.switchView('hex');
        State.hexEditorInstance.load(tab.arrayBuffer);
    } else {
        if (tab.liveDataObject) {
            tab.content = JSON.stringify(tab.liveDataObject, null, '\t');
            tab.liveDataObject = null;
        }
        DataAltar.demanifest();
        const fileInfo = { type: tab.fileType, name: tab.item.name };
        if (tab.fileType === 'text') {
            await Editor.showTextEditor(tab.content || '', tab.item.name, tab.scrollPos || 0);
        } else {
            Editor.showPreviewer(tab.rawContent, fileInfo, tab.id);
        }
    }

    this.render();
    App.saveSession();
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
            detachWorkerRequestHandler();
            detachDynamicAssetHandler();
            const consoleTab = State.tabs.find(t => t.item.type === 'console' && t.item.associatedTabId === tabId);
            if (consoleTab) await this.close(consoleTab.id, true);
            const iframe = State.previewIframes.get(tabId);
            if (iframe) {
                if (iframe.src.startsWith('blob:')) URL.revokeObjectURL(iframe.src);
                iframe.remove();
            }
            State.previewIframes.delete(tabId);
        } else if (tabToClose.fileType === 'console') {
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
    
    /**
     * Commits a tab's current content to its filesystem. For GitHub workspaces,
     * this now means saving to a local, uncommitted state in IndexedDB.
     * @param {object} tab - The tab object to save.
     */
    /*B"H*/
async save(tab) {
    UI.showToast(`Saving ${tab.item.name}...`);
    let textContent;
    let contentToSave;

    if (tab.id === State.activeTabId) {
        const isAltarVisible = !DOM.dataAltarContainer.classList.contains('hidden');
        if (tab.isHexView) {
            contentToSave = State.hexEditorInstance.getUpdatedArrayBuffer();
        } else if (isAltarVisible && tab.isAltarView) {
            textContent = JSON.stringify(DataAltar.liveDataObject, null, '\t');
        } else {
            textContent = Editor.getContent();
        }
    } else {
        if (tab.isHexView) contentToSave = tab.arrayBuffer;
        else textContent = tab.content;
    }
    
    if (tab.item.type === 'github') {
        try {
            await FileSystemProvider.IndexedDB.writeUncommitted(tab.uniquePath, textContent, tab.item);
            tab.isDirty = false;
            tab.isUncommitted = true;
            tab.content = textContent;
            UI.showToast(`Saved "${tab.item.name}" locally`, 'success');
            this.render();
        } catch(e) {
            UI.showToast(`Local save failed: ${e.message}`, 'error');
            console.error("INDEXEDDB SAVE FAILED:", e);
        }
        return;
    }

    try {
        if (contentToSave === undefined) {
            if (tab.isAwtsmoos && !tab.isHexView) {
                UI.showLoading('Encoding to binary...');
                contentToSave = await AwtsmoosHandler.encodeContent(textContent);
            } else {
                contentToSave = textContent;
            }
        }
        
        // This is your original write logic, which will now only handle non-GitHub saves.
        // It requires the GitHub-specific `commitMessage` parameter to be handled.
        let commitMessage; // This will be undefined for non-GitHub types, which is fine.
        await FileSystemProvider.write(tab.item, contentToSave, commitMessage);
        
        tab.isDirty = false;
        if (tab.isHexView) {
            tab.arrayBuffer = contentToSave;
            tab.rawContent = new Blob([contentToSave]);
            if (tab.id === State.activeTabId) State.hexEditorInstance?.clearDirtyState();
        } else if (tab.isAwtsmoos) {
            tab.arrayBuffer = contentToSave.buffer;
            tab.rawContent = new Blob([contentToSave]);
            tab.content = textContent;
        } else {
            tab.content = textContent;
        }

        UI.showToast(`Saved "${tab.item.name}"`, 'success');
        this.render();
    } catch (e) {
        UI.showToast(`Save failed: ${e.message}`, 'error');
        console.error("SAVE FAILED:", e);
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
        tabEl.title = tab.item.path || tab.item.name;
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