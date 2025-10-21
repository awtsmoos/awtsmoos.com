// B"H
// FILE: js/tabs.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';
import { StatusBar } from './statusbar.js';
import { FileSystemProvider } from './fs-provider.js';
import { MimeUtil } from './mime-util.js';


// Helper function to create a downloadable link
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
    
    // --- B"H --- MODIFIED FUNCTION ---
    create(item, isNewFile = false) {
        const uniquePath = this.getUniquePath(item);
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            this.activate(existingTab.id);
            return;
        }
        const newTab = {
            id: State.nextTabId++,
            item,
            content: isNewFile ? '' : null,
            isDirty: isNewFile,
            uniquePath,
            scrollPos: 0,
            fileType: MimeUtil.getInfo(item.name).type, // Store the file type on creation
        };
        State.tabs.push(newTab);
        this.activate(newTab.id);
    },
    // --- END MODIFIED FUNCTION ---
    createPreview(originalItem, content) {
        // Create a unique path for the preview tab to distinguish it from the code tab
        const uniquePath = `preview::${this.getUniquePath(originalItem)}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            this.activate(existingTab.id);
            return;
        }

        // Create a new item object specifically for the preview tab
        const previewItem = {
            ...originalItem,
            name: `Preview: ${originalItem.name}`,
            type: 'preview', // A special type to identify it
        };

        const newTab = {
            id: State.nextTabId++,
            item: previewItem,
            content: content, // The raw HTML content
            isDirty: false, // Previews are not editable
            uniquePath: uniquePath,
            scrollPos: 0,
            fileType: 'html-preview', // A special file type for our logic
        };
        State.tabs.push(newTab);
        this.activate(newTab.id);
    },
    

    createTemporary(name = 'Untitled', content = '') {
        const untitledCount = State.tabs.filter(t => t.item.type === 'temp').length + 1;
        const newName = `${name}-${untitledCount}`;
        const tempItem = {
            type: 'temp',
            name: newName,
            path: null,
            kind: 'file'
        };
        const uniquePath = this.getUniquePath(tempItem);
        const newTab = {
            id: State.nextTabId++,
            item: tempItem,
            content: content,
            isDirty: true, // New files are inherently "dirty"
            uniquePath,
            scrollPos: 0
        };
        State.tabs.push(newTab);
        this.activate(newTab.id);
    },

    async activate(tabId) {
        const currentTab = State.tabs.find(t => t.id === State.activeTabId);
        if (currentTab) {
            // Save text content if it was a text file
            if (currentTab.fileType === 'text') {
                currentTab.content = Editor.getContent();
                currentTab.scrollPos = DOM.editor.scrollTop;
            }
        }

        State.activeTabId = tabId;
        const tab = State.tabs.find(t => t.id === tabId);

        if (!tab) {
            Editor.showTextEditor('', ''); // Show empty text editor
            DOM.editorWrapper.classList.add('hidden');
            DOM.emptyEditorMessage.classList.remove('hidden');
            StatusBar.clear();
            this.render();
            return;
        }

        DOM.emptyEditorMessage.classList.add('hidden');

        // Load content from storage if it's not already loaded
        if (tab.content === null) {
            UI.showLoading(`Opening ${tab.item.name}...`);
            try {
                tab.content = await FileSystemProvider.read(tab.item);
            } catch (e) {
                UI.showToast(`Error opening ${tab.item.name}: ${e.message}`, 'error');
                this.close(tab.id, true);
                return;
            } finally {
                UI.hideLoading();
            }
        }

        // --- B"H: THE CORE LOGIC CHANGE ---
        // Decide whether to show the text editor or the previewer
        const fileInfo = { type: tab.fileType, name: tab.item.name };

        // Priority 1: Check if it's our special HTML preview tab
        if (fileInfo.type === 'html-preview') {
            Editor.showPreviewer(tab.content, fileInfo);
        
        // Priority 2: Check if it's a standard text file
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
        
        // Priority 3: It must be a binary file (image, video, etc.)
        } else {
            Editor.showPreviewer(tab.content, fileInfo);
        }
        // --- END CHANGE ---

        this.render();
    },
    
    async close(tabId, force = false) {
        const tabIndex = State.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tabToClose = State.tabs[tabIndex];
        if (tabToClose.isDirty && !force) {
            const choice = await new Promise(resolve => {
                UI.showDialog({ 
                    title: "Unsaved Changes", 
                    message: `Do you want to save changes to "${tabToClose.item.name}"?`,
                    okText: '', cancelText: ''
                });
                // Manually create and handle buttons for three-way choice
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
        }
    },

    async saveActive() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (!tab) return UI.showToast('No active file to save.', 'info');

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

                // This tab is no longer temporary. Mark it as saved.
                tab.isDirty = false;
                tab.item.name = handle.name;
                tab.item.type = 'local-saved'; // A special type
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
        
        const content = Editor.getContent();
        downloadFile(tab.item.name, content);
        UI.showToast(`Downloaded "${tab.item.name}"`, 'success');
    },

    render() {
        DOM.tabBar.innerHTML = '';
        State.tabs.forEach(tab => {
            const tabEl = document.createElement('div');
            tabEl.className = `tab ${tab.id === State.activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`;
            tabEl.dataset.tabId = tab.id;
            tabEl.title = tab.item.path || tab.item.name;
            tabEl.innerHTML = `
                <span class="tab-name">${tab.item.name}</span>
                <button class="icon-button close-tab-btn" title="Close"><svg class="svg-icon" style="width:0.8em;height:0.8em;"><use href="#icon-x"/></svg></button>`;
            
            tabEl.onclick = (e) => {
                if (e.target.closest('.close-tab-btn')) {
                    e.stopPropagation(); this.close(tab.id);
                } else if (State.activeTabId !== tab.id) {
                    this.activate(tab.id);
                }
            };
            DOM.tabBar.appendChild(tabEl);
        });
        const activeTabEl = DOM.tabBar.querySelector('.tab.active');
        if (activeTabEl) activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        StatusBar.update();
    },
};