// B"H
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

    // In tabs.js, replace the 'create' method
create(item, isNewFile = false, shouldSave = true) {
    const uniquePath = this.getUniquePath(item);
    const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
    if (existingTab) {
        this.activate(existingTab.id);
        return;
    }
    const newTab = {
        id: State.nextTabId++,
        item,
        // --- THIS IS THE KEY CHANGE ---
        // If content is passed in the item (from postMessage), use it.
        // Otherwise, set it to null to be loaded from the file system.
        content: item.content !== undefined ? item.content : (isNewFile ? '' : null),
        isDirty: isNewFile || item.content !== undefined,
        // --- END CHANGE ---
        uniquePath,
        scrollPos: 0,
        fileType: MimeUtil.getInfo(item.name).type,
    };
    State.tabs.push(newTab);
    if (shouldSave) App.saveSession();
    this.activate(newTab.id);
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
    
async activate(tabId, forceViewChange = false) {
    // --- Step 1: Save the state of the tab we are leaving ---
    const currentTab = State.tabs.find(t => t.id === State.activeTabId);
    if (currentTab) {
        if (currentTab.isHexView && State.hexEditorInstance?.isDirty()) {
            currentTab.arrayBuffer = State.hexEditorInstance.getUpdatedArrayBuffer();
            currentTab.rawContent = new Blob([currentTab.arrayBuffer]);
            currentTab.isDirty = true;
        } else if (currentTab.isAltarView) {
            // RITUAL OF RECONSTITUTION (Partial)
            // If the data is dirty, turn it back into text before switching.
            if(currentTab.isDirty) {
                 currentTab.content = JSON.stringify(currentTab.liveDataObject, null, '\t');
            }
        } else { 
            currentTab.content = Editor.getContent();
        }
        currentTab.scrollPos = DOM.editor.scrollTop || 0;
    }

    State.activeTabId = tabId;
    const tab = State.tabs.find(t => t.id === tabId);

    if (!tab) {
        UI.switchView('empty'); StatusBar.clear(); this.render(); App.saveSession(); return;
    }

    // --- Step 2: Load File Content if Necessary ---
    if (tab.content === null || tab.forceReload) {
        UI.showLoading(`Opening ${tab.item.name}...`);
        try {
            const fileContent = tab.rawContent || await FileSystemProvider.read(tab.item);
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
                tab.content = await new Blob([arrayBuffer]).text();
            } else {
                tab.content = fileContent;
            }
        } catch (e) {
            UI.showToast(`Error opening ${tab.item.name}: ${e.message}`, 'error');
            this.close(tab.id, true); return;
        } finally {
            UI.hideLoading();
            tab.forceReload = false;
        }
    }

    // --- Step 3: Manifest the Correct View ---
    if (tab.isAltarView) {
        // --- RITUAL OF TRANSMUTATION ---
        try {
            // Always re-parse from the master text content unless the live object already exists
            const dataToManifest = tab.liveDataObject && !forceViewChange ? tab.liveDataObject : JSON.parse(tab.content);
            tab.liveDataObject = dataToManifest; // Ensure it's set
            UI.switchView('altar');
            DataAltar.manifest(dataToManifest);
        } catch (e) {
            UI.showToast("JSON is malformed; cannot perform transmutation.", "error", 5000);
            tab.isAltarView = false; // Ritual failed, revert the state
            Editor.showTextEditor(tab.content || '', tab.item.name, tab.scrollPos || 0);
        }
    } else if (tab.isHexView) {
        UI.switchView('hex');
        State.hexEditorInstance.load(tab.arrayBuffer);
    } else {
        // RITUAL OF RECONSTITUTION (Full)
        // If coming from an Altar view, ensure the text is updated.
        if (tab.liveDataObject) {
            tab.content = JSON.stringify(tab.liveDataObject, null, '\t');
            tab.liveDataObject = null; // Purge the live data
        }
        DataAltar.demanifest(); // Explicitly hide the altar
        const fileInfo = { type: tab.fileType, name: tab.item.name };
        if (tab.fileType === 'text') {
            Editor.showTextEditor(tab.content || '', tab.item.name, tab.scrollPos || 0);
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
	    DataAltar.demanifest(); // A new function we will create to hide the Altar
	}
        
        if (tabToClose.isDirty && !force) {
            const choice = await UI.showDialog({
                 title: 'Unsaved Changes',
                 message: `You have unsaved changes in "${tabToClose.item.name}". Do you want to save them?`,
                 okText: 'Save',
                 cancelText: 'Don\'t Save'
            });

            if (choice === true) { // User clicked "Save"
                await this.save(tabToClose);
            } else if (choice === null) { // User clicked "Don't Save"
                // Proceed to close
            } else {
                return; // User cancelled the dialog
            }
        }

        // --- Perform Cleanup AFTER user confirms ---
        if (tabToClose.fileType === 'html-preview') {
            detachWorkerRequestHandler();
            detachDynamicAssetHandler();
            
            const consoleTab = State.tabs.find(t => t.item.type === 'console' && t.item.associatedTabId === tabId);
            if (consoleTab) {
                await this.close(consoleTab.id, true);
            }
            
            const iframe = State.previewIframes.get(tabId);
            if (iframe) {
                if (iframe.src.startsWith('blob:')) {
                    URL.revokeObjectURL(iframe.src);
                }
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
    
    async save(tab) {
	    UI.showToast(`Saving ${tab.item.name}...`);
	    let originalContent = tab.content; // Keep a reference in case of failure
	
	    try {
	        let contentToSave;
	
	        // --- B"H - STEP 1: Determine the correct content to save ---
	        if (tab.isHexView) {
	            // SCENARIO 1: Saving from the Hex Editor
	            // The source of truth is the Hex Editor component itself.
	            if (tab.id === State.activeTabId && State.hexEditorInstance?.isDirty()) {
	                // If the active tab is our target and the editor has changes, get the updated binary data.
	                contentToSave = State.hexEditorInstance.getUpdatedArrayBuffer();
	            } else {
	                // Otherwise, use the binary data already stored on the tab object.
	                contentToSave = tab.arrayBuffer;
	            }
	        } else if (tab.isAwtsmoos) {
	            // SCENARIO 2: Saving an .awtsmoosJSON file from the JSON (text) view.
	            // We need to encode the text from the editor back into binary.
	            UI.showLoading('Encoding to binary...');
	            const editorContent = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
	            contentToSave = await AwtsmoosHandler.encodeContent(editorContent);
	        } else {
	            // SCENARIO 3: Saving a regular text file.
	            // The source of truth is the standard text editor.
	            contentToSave = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
	        }
	
	        if (contentToSave === undefined || contentToSave === null) {
	            throw new Error("Content to save is missing or invalid.");
	        }
	
	        // --- STEP 2: Handle GitHub commit message if necessary ---
	        let commitMessage;
	        if (tab.item.type === 'github') {
	            commitMessage = await UI.showDialog({ 
	                title: 'Commit Changes', 
	                hasTextarea: true, 
	                textareaContent: `B"H\nUpdate ${tab.item.name}`, 
	                okText: 'Commit & Save',
	                message: `Enter commit message for "${tab.item.name}".`
	            });
	            if (commitMessage === null) { // User cancelled the dialog
	                throw new Error("Save cancelled by user.");
	            }
	        }
	             
	        // --- STEP 3: Write the file to the filesystem ---
	        await FileSystemProvider.write(tab.item, contentToSave, commitMessage);
	        
	        // --- STEP 4: Update the tab's state after a successful save ---
	        tab.isDirty = false;
	
	        if (tab.isHexView) {
	            // If we saved from hex, update the tab's stored ArrayBuffer and clear the editor's dirty state.
	            tab.arrayBuffer = contentToSave;
	            tab.rawContent = new Blob([contentToSave]);
	            State.hexEditorInstance?.clearDirtyState();
	        } else if (tab.isAwtsmoos) {
	            // If we saved an awtsmoos file from JSON, update its stored binary content.
	            tab.arrayBuffer = contentToSave.buffer;
	            tab.rawContent = new Blob([contentToSave]);
	        } else {
	            // For regular text files, update the string content.
	            tab.content = contentToSave;
	        }
	
	        UI.showToast(`Saved "${tab.item.name}"`, 'success');
	        this.render(); // Re-render tab bar to remove the "dirty" indicator.
	
	    } catch (e) {
	        // If anything fails, show an error and restore the original content if needed.
	        tab.content = originalContent; 
	        UI.showToast(`Save failed: ${e.message}`, 'error');
	        console.error("SAVE FAILED:", e);
	    } finally {
	        // Always hide any loading indicators.
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
                tab.item.type = 'local-saved'; // This type indicates it's a standalone saved file, not part of a workspace
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
            tabEl.className = `tab ${tab.id === State.activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`;
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
