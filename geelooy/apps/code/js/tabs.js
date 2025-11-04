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
import {Console} from "./Console.js";
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
    getUniquePath: (item) => \`\${item.workspaceId ?? 'temp'}::\${item.path ?? item.name}\`,
    createConsole(associatedTab) {
        const uniquePath = \`console::\${associatedTab.uniquePath}\`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            this.activate(existingTab.id);
            return;
        }

        const consoleTab = {
            id: State.nextTabId++,
            item: { name: \`Console: \${associatedTab.item.name}\`, type: 'console', associatedTabId: associatedTab.id },
            uniquePath: uniquePath,
            isDirty: false,
            isPreview: false,
            fileType: 'console'
        };

        State.tabs.push(consoleTab);
        this.activate(consoleTab.id);
    },
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
        const uniquePath = \`preview::\${this.getUniquePath(originalItem)}\`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            this.activate(existingTab.id);
            return;
        }
        const previewItem = { ...originalItem, name: \`Preview: \${originalItem.name}\`, type: 'preview' };
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
        const newName = \`\${name}-\${untitledCount}\`;
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
        // When navigating away from a preview, move its persistent iframe to the hidden cache
        if (currentTab.fileType === 'html-preview') {
             const iframe = State.previewIframes.get(currentTab.id);
             if (iframe) DOM.iframeCache.appendChild(iframe);
        }
    }
    
    State.activeTabId = tabId;
    const tab = State.tabs.find(t => t.id === tabId);

    // --- CONSOLE BUTTON VISIBILITY ---
    // The button is only visible when an HTML preview tab is active
    const shouldShowConsoleBtn = tab && tab.fileType === 'html-preview';
    DOM.viewConsoleBtn.classList.toggle('hidden', !shouldShowConsoleBtn);

    if (!tab) {
        UI.switchView('empty');
        StatusBar.clear();
        this.render();
        App.saveSession();
        return;
    }

    // Lazy-load file content if it hasn't been loaded yet
    if (tab.content === null) {
        UI.showLoading(\`Opening \${tab.item.name}...\`);
        try {
            tab.content = await FileSystemProvider.read(tab.item);
        } catch (e) {
            UI.showToast(\`Error opening \${tab.item.name}: \${e.message}\`, 'error');
            this.close(tab.id, true); return;
        } finally { UI.hideLoading(); }
    }

    const fileInfo = { type: tab.fileType, name: tab.item.name };

    // --- MAIN VIEW-HANDLING LOGIC ---
    switch (tab.fileType) {
        case 'console':
            UI.switchView('console');
            
            // Get or create the console instance for this tab
            let instance = State.consoleInstances.get(tab.id);
            if (!instance) {
                const associatedIframe = State.previewIframes.get(tab.item.associatedTabId);
                if (associatedIframe) {
                    instance = new Console(associatedIframe, DOM.consoleHost, tab.id);
                    instance.render();
                    State.consoleInstances.set(tab.id, instance);
                } else {
                     DOM.consoleHost.innerHTML = \`<div style="padding: 20px; color: var(--console-error-border);">Error: Could not find the associated HTML preview. It may have been closed. Please open the HTML file again.</div>\`;
                }
            }
            break;

        case 'html-preview':
            Editor.showPreviewer(tab.content, fileInfo, tab.id);
            break;

        case 'text':
            if (tab.content instanceof Blob) {
                 const text = await tab.content.text();
                 tab.content = text;
                 Editor.showTextEditor(text, tab.item.name);
            } else {
                 Editor.showTextEditor(tab.content || '', tab.item.name);
            }
            DOM.editor.scrollTop = tab.scrollPos || 0;
            setTimeout(() => UI.syncScroll(), 0);
            break;
            
        default: // Handle images, pdfs, etc.
            Editor.showPreviewer(tab.content, fileInfo, tab.id);
            break;
    }

    this.render();
    App.saveSession();
},
    
    // B"H
// FILE: js/tabs.js
// ACTION: Replace the entire \`close\` method with this one.

async close(tabId, force = false) {
    const tabIndex = State.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tabToClose = State.tabs[tabIndex];
    
    // --- CRITICAL CLEANUP LOGIC ---
    if (tabToClose.fileType === 'html-preview') {
        detachWorkerRequestHandler();
        detachDynamicAssetHandler();
        
        // Find and force-close the associated console tab
        const consoleTab = State.tabs.find(t => t.item.type === 'console' && t.item.associatedTabId === tabId);
        if (consoleTab) {
            // By closing the console first, its own cleanup logic will run
            await this.close(consoleTab.id, true);
        }
        
        // Clean up the persistent iframe and its Blob URL
        const iframe = State.previewIframes.get(tabId);
        if (iframe) {
            // Revoke the Object URL to free up memory
            if(iframe.src.startsWith('blob:')) {
                URL.revokeObjectURL(iframe.src);
            }
            iframe.remove();
        }
        State.previewIframes.delete(tabId);

    } else if (tabToClose.fileType === 'console') {
        // Destroy the console instance and remove it from the map
        const instance = State.consoleInstances.get(tabId);
        if (instance) instance.destroy();
        State.consoleInstances.delete(tabId);
    }
    
    if (tabToClose.isDirty && !force) {
        const choice = await UI.showDialog({
             title: 'Unsaved Changes',
             message: `You have unsaved changes in "\${tabToClose.item.name}".`,
             okText: 'Save and Close',
             cancelText: 'Discard'
        });
        if (choice) {
             await this.save(tabToClose);
        } else if (choice === null) {
            // User chose 'Discard'
        } else {
            return; // Dialog was cancelled
        }
    }

    // Refind the index because a recursive close might have changed the array
    const newTabIndex = State.tabs.findIndex(t => t.id === tabId);
    if(newTabIndex !== -1) {
       State.tabs.splice(newTabIndex, 1);
    }
    
    if (State.activeTabId === tabId) {
        // Activate the next available tab
        const nextTab = State.tabs[newTabIndex] || State.tabs[newTabIndex - 1] || null;
        await this.activate(nextTab ? nextTab.id : null);
    } else {
        // If the closed tab wasn't active, just re-render the UI
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
        UI.showToast(\`Saving \${tab.item.name}...\`);
        try {
            if (tab.id === State.activeTabId) {
                tab.content = Editor.getContent();
            }
            let commitMessage;
            if (tab.item.type === 'github') {
                commitMessage = await UI.showDialog({ 
                    title: 'Commit Changes', hasTextarea: true, 
                    textareaContent:
                     \`B"H
Boruch Hashem!
Biezras Hashem 
Blessed is He
update \${name}
At \${new Date()}\`, 
                    okText: 'Commit & Save',
                    message: \`Enter commit message for "\${tab.item.name}".\`
                });
                if (!commitMessage) throw new Error("Save cancelled.");
            }
            await FileSystemProvider.write(tab.item, tab.content, commitMessage);
            tab.isDirty = false;
            UI.showToast(\`Saved "\${tab.item.name}"\`, 'success');
            this.render();
        } catch (e) {
            UI.showToast(\`Save failed: \${e.message}\`, 'error');
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
                UI.showToast(\`Saved "\${handle.name}"\`, 'success');
                this.render();
            } else {
                this.downloadActive();
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                UI.showToast(\`Could not save file: \${err.message}\`, 'error');
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
        UI.showToast(\`Downloaded "\${tab.item.name}"\`, 'success');
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
        tabEl.className = \`tab \${tab.id === State.activeTabId ? 'active' : ''} \${tab.isDirty ? 'dirty' : ''}\`;
        tabEl.dataset.tabId = String(tab.id);
        tabEl.title = tab.item.path || tab.item.name;
        tabEl.draggable = true; // IMPORTANT: Make the element draggable
        
        tabEl.innerHTML = \`
            <span class="tab-name">\${tab.item.name}</span>
            <button class="icon-button close-tab-btn" title="Close"><svg class="svg-icon" style="width:0.8em;height:0.8em;"><use href="#icon-x"/></svg></button>\`;
        
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