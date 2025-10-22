


// B"H
// FILE: js/tabs.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';
import { StatusBar } from './statusbar.js';
import { FileSystemProvider } from './fs-provider.js';
import { MimeUtil } from './mime-util.js';
import { detachWorkerRequestHandler } from './html-preview-processor.js';
import { App } from './app.js';

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
    
    create(item, isNewFile = false, shouldSave = true) {
        const uniquePath = this.getUniquePath(item);
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            this.activate(existingTab.id);
            return;
        }
        const newTab = {
            id: State.nextTabId++, item, content: isNewFile ? '' : null,
            isDirty: isNewFile, uniquePath, scrollPos: 0, fileType: MimeUtil.getInfo(item.name).type,
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
            id: State.nextTabId++, item: previewItem, content: content,
            isDirty: false, uniquePath: uniquePath, scrollPos: 0,
            fileType: 'html-preview', isPreview: true,
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
            id: State.nextTabId++, item: tempItem, content: content,
            isDirty: true, uniquePath, scrollPos: 0, fileType: 'text',
        };
        State.tabs.push(newTab);
        this.activate(newTab.id);
    },

    async activate(tabId) {
        const currentTab = State.tabs.find(t => t.id === State.activeTabId);
        if (currentTab) {
            if (currentTab.fileType === 'text') {
                currentTab.content = Editor.getContent();
                currentTab.scrollPos = DOM.editor.scrollTop;
            }
        }
        State.activeTabId = tabId;
        const tab = State.tabs.find(t => t.id === tabId);
        // B"H - CONSOLE BUTTON VISIBILITY LOGIC
        if (tab && tab.fileType === 'html-preview') {
            DOM.viewConsoleBtn.classList.remove('hidden');
        } else {
            DOM.viewConsoleBtn.classList.add('hidden');
            // Close the console if we navigate away from a preview
            if (App.activeConsole && !App.activeConsole.consoleWindow.closed) {
                 App.activeConsole.consoleWindow.close();
                 App.activeConsole = null;
            }
        }
        
        
        if (!tab) {
            Editor.showTextEditor('', '');
            DOM.editorWrapper.classList.add('hidden');
            DOM.emptyEditorMessage.classList.remove('hidden');
            StatusBar.clear();
            this.render();
            App.saveSession();
            return;
        }
        DOM.emptyEditorMessage.classList.add('hidden');
        if (tab.content === null) {
            UI.showLoading(`Opening ${tab.item.name}...`);
            try {
                tab.content = await FileSystemProvider.read(tab.item);
            } catch (e) {
                UI.showToast(`Error opening ${tab.item.name}: ${e.message}`, 'error');
                this.close(tab.id, true); return;
            } finally { UI.hideLoading(); }
        }
        const fileInfo = { type: tab.fileType, name: tab.item.name };
        
        if (fileInfo.type === 'html-preview') {
            Editor.showPreviewer(tab.content, fileInfo);
        } else if (fileInfo.type === 'text') {
            if (tab.content instanceof Blob) {
                 const text = await tab.content.text();
                 tab.content = text;
                 Editor.showTextEditor(text, tab.item.name);
            } else {
                 Editor.showTextEditor(tab.content || '', tab.item.name);
            }
            DOM.editor.scrollTop = tab.scrollPos || 0;
            setTimeout(() => UI.syncScroll(), 0);
        } else {
            Editor.showPreviewer(tab.content, fileInfo);
        }
        this.render();
        App.saveSession();
    },
    
    async close(tabId, force = false) {
        const tabIndex = State.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tabToClose = State.tabs[tabIndex];
        
        
        
        // B"H - CONSOLE CLEANUP ON TAB CLOSE
        if (tabToClose.isPreview) {
            detachWorkerRequestHandler();
            if (App.activeConsole && !App.activeConsole.consoleWindow.closed) {
                 App.activeConsole.consoleWindow.close();
                 App.activeConsole = null;
            }
        }

        if (tabToClose.isDirty && !force) {
            const choice = await new Promise(resolve => {
                UI.showDialog({ 
                    title: "Unsaved Changes", 
                    message: `Do you want to save changes to "${tabToClose.item.name}"?`,
                    okText: '', cancelText: ''
                });
                const dialogContent = document.getElementById('dialog-content');
                const buttonContainer = dialogContent.querySelector('div:last-child');
                buttonContainer.innerHTML = `
                    <button class="secondary-btn" id="dialog-custom-dont-save">Don't Save</button>
                    <button class="secondary-btn" id="dialog-custom-cancel">Cancel</button>
                    <button class="primary-btn" id="dialog-custom-save">Save</button>
                `;
                document.getElementById('dialog-custom-save').onclick = () => { DOM.genericDialog.classList.remove('visible'); resolve('save'); };
                document.getElementById('dialog-custom-dont-save').onclick = () => { DOM.genericDialog.classList.remove('visible'); resolve('dont-save'); };
                document.getElementById('dialog-custom-cancel').onclick = () => { DOM.genericDialog.classList.remove('visible'); resolve('cancel'); };
            });
            if (choice === 'save') await this.saveActive();
            else if (choice === 'cancel') return;
        }

        State.tabs.splice(tabIndex, 1);
        
        if (State.activeTabId === tabId) {
            const nextTab = State.tabs[tabIndex] || State.tabs[tabIndex - 1] || null;
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
        UI.showLoading(`Saving ${tab.item.name}...`);
        try {
            if (tab.id === State.activeTabId) {
                tab.content = Editor.getContent();
            }
            let commitMessage;
            if (tab.item.type === 'github') {
                commitMessage = await UI.showDialog({ 
                    title: 'Commit Changes', hasTextarea: true, 
                    textareaContent:
                     `B"H
Boruch Hashem!
Biezras Hashem 
Blessed is He
update ${name}
At ${new Date()}`, 
                    okText: 'Commit & Save',
                    message: `Enter commit message for "${tab.item.name}".`
                });
                if (!commitMessage) throw new Error("Save cancelled.");
            }
            await FileSystemProvider.write(tab.item, tab.content, commitMessage);
            tab.isDirty = false;
            UI.showToast(`Saved "${tab.item.name}"`, 'success');
            this.render();
        } catch (e) {
            UI.showToast(`Save failed: ${e.message}`, 'error');
        } finally { UI.hideLoading(); }
    },

    async saveAs(tab) {
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: tab.item.name,
                    types: [{
                        description: 'Text Files',
                        accept: { 'text/plain': ['.txt', '.js', '.css', '.html', '.md', '.json'] },
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

    
    // B"H
// FILE: js/tabs.js
// ACTION: Replace the entire 'render' function with this one.

render() {
    // --- B"H: DRAG & DROP LOGIC ---
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
    
    // Clear the bar to prepare for re-rendering
    DOM.tabBar.innerHTML = '';

    State.tabs.forEach((tab, index) => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${tab.id === State.activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`;
        tabEl.dataset.tabId = String(tab.id);
        tabEl.title = tab.item.path || tab.item.name;
        tabEl.draggable = true; // IMPORTANT: Make the element draggable
        
        tabEl.innerHTML = `
            <span class="tab-name">${tab.item.name}</span>
            <button class="icon-button close-tab-btn" title="Close"><svg class="svg-icon" style="width:0.8em;height:0.8em;"><use href="#icon-x"/></svg></button>`;
        
        // --- REGULAR CLICK LOGIC (UNCHANGED) ---
        tabEl.onclick = (e) => {
            if (e.target.closest('.close-tab-btn')) {
                e.stopPropagation(); this.close(tab.id);
            } else if (State.activeTabId !== tab.id) {
                this.activate(tab.id);
            }
        };

        // --- NEW DRAG & DROP EVENT LISTENERS ---
        tabEl.addEventListener('dragstart', (e) => {
            draggedTabId = tab.id;
            // A short delay allows the browser to render the drag image correctly
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        
        tabEl.addEventListener('dragend', (e) => {
            draggedTabId = null;
            e.target.classList.remove('dragging');
        });

        DOM.tabBar.appendChild(tabEl);
    });

    // --- LISTENER ON THE TAB BAR CONTAINER ITSELF ---
    DOM.tabBar.addEventListener('dragover', (e) => {
        e.preventDefault(); // This is ESSENTIAL for 'drop' to work.
        
        // Remove old indicators
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
        
        // Remove the dragged tab from the array
        const [draggedTab] = State.tabs.splice(sourceIndex, 1);
        
        let targetIndex;
        if (afterElement) {
            const targetTabId = Number(afterElement.dataset.tabId);
            targetIndex = State.tabs.findIndex(t => t.id === targetTabId);
        } else {
            // If there's no element after, it means we're dropping at the very end.
            targetIndex = State.tabs.length;
        }

        // Insert the dragged tab at the new position
        State.tabs.splice(targetIndex, 0, draggedTab);

        // Re-render the UI from the new truth, save, and keep the dragged tab active
        State.activeTabId = sourceTabId;
        this.render(); 
        App.saveSession();
    });

    const activeTabEl = DOM.tabBar.querySelector('.tab.active');
    if (activeTabEl) activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    StatusBar.update();
},
};