// B"H
// FILE: code/js/tabs/persistence.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { DataAltar } from '../DataAltar.js';
import { ZipExplorer } from '../zip/zip-explorer.js';

export const TabsPersistence = {
    async save(tab, TabsController, options = {}) {
        const taskId = `save-${Date.now()}`;
        UI.startTask(taskId, `Saving ${tab.item.name}...`);

        try {
            // Zip Entry Saving
            if (tab.item.type === 'zip-entry') {
                const content = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
                ZipExplorer.updateEntry(tab, content);
                tab.content = content;
                tab.isDirty = false;
                TabsController.render();
                UI.endTask(taskId, 'success', `Updated archive memory.`);
                return;
            }
            
            // Main Zip Saving (Prevent Recursion)
            if (tab.fileType === 'zip' && !options.skipZipRecompression) {
                await ZipExplorer.saveZipToDisk();
                UI.endTask(taskId, 'success');
                return;
            }

            const gitRootItem = await TabsController._getGitInfoForTab(tab);

            let contentToSave;
            if (tab.content instanceof Blob || tab.content instanceof Uint8Array || (typeof tab.content === 'string' && tab.id !== State.activeTabId)) {
                 contentToSave = tab.content;
            } else if (tab.id === State.activeTabId) {
                 if (tab.isHexView) contentToSave = State.hexEditorInstance.getUpdatedArrayBuffer();
                 else if (tab.isAltarView) contentToSave = JSON.stringify(DataAltar.liveDataObject, null, '\t');
                 else contentToSave = Editor.getContent();
            } else {
                 contentToSave = tab.content;
            }
            
            if (!gitRootItem) {
                if (tab.item.readOnly) {
                    UI.showToast("This is a read-only file.", "warning");
                    UI.endTask(taskId, 'error', "Read-only");
                    return;
                }
                await FileSystemProvider.write(tab.item, contentToSave);
                tab.isDirty = false;
                tab.isUncommitted = false;
                tab.content = contentToSave; 
                TabsController.render();
                UI.endTask(taskId, 'success', `Saved to disk.`);
                return;
            }
            
            const savePromises = [];
            savePromises.push(FileSystemProvider.write(tab.item, contentToSave));
            
            if (gitRootItem.type !== 'github') {
                let relativePath;
                const cloneRootPath = gitRootItem.path;
                const fileFullPath = tab.item.path;

                if (cloneRootPath === '/') {
                    relativePath = fileFullPath.substring(1);
                } else if (fileFullPath && fileFullPath.startsWith(cloneRootPath + '/')) {
                    relativePath = fileFullPath.substring(cloneRootPath.length + 1);
                } else {
                    throw new Error("Cannot determine relative path for staging.");
                }
                
                const itemForStaging = { ...tab.item, path: relativePath };
                const uniquePathForStaging = `${gitRootItem.workspaceId || gitRootItem.id}::${relativePath}`;
                savePromises.push(FileSystemProvider.IndexedDB.writeUncommitted(uniquePathForStaging, contentToSave, itemForStaging));
            }

            UI.updateTask(taskId, 50);
            await Promise.all(savePromises);

            tab.isDirty = false;
            tab.isUncommitted = true;
            tab.content = contentToSave;
            TabsController.render();
            UI.endTask(taskId, 'success', `Saved and Staged.`);

        } catch (e) {
            UI.endTask(taskId, 'error', `Save failed: ${e.message}`);
            console.error("SAVE FAILED:", e);
        }
    },

    async saveAs(tab, TabsController) {
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
                tab.uniquePath = TabsController.getUniquePath(tab.item);
                UI.showToast(`Saved "${handle.name}"`, 'success');
                TabsController.render();
            } else {
                this.downloadActive(TabsController);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                UI.showToast(`Could not save file: ${err.message}`, 'error');
            }
        }
    },

    downloadActive(TabsController) {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (!tab) return UI.showToast('No active file to download.', 'info');
        
        const content = (tab.fileType === 'text') ? Editor.getContent() : tab.content;
        
        if (content instanceof Blob) {
             const url = URL.createObjectURL(content);
             this._triggerDownload(url, tab.item.name);
             URL.revokeObjectURL(url);
        } else {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            this._triggerDownload(url, tab.item.name);
            window.URL.revokeObjectURL(url);
        }
        UI.showToast(`Downloaded "${tab.item.name}"`, 'success');
    },

    _triggerDownload(url, filename) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
};