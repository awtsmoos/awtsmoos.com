
// B"H
// FILE: code/js/tabs/persistence.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { DataAltar } from '../DataAltar.js';
import { ZipExplorer } from '../zip/zip-explorer.js';
import { ASTEngine } from '../tools/ast-engine.js'; // B"H

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

            // B"H - CRITICAL SAFETY RITUAL: Unfold all blocks before persistence
            if (tab.id === State.activeTabId && tab.fileType === 'text') {
                ASTEngine.unfoldAll();
            }

            // 1. USE THE CONTROLLER TO FIND THE GIT ROOT (FIXED LINE)
	        const gitRootItem = await TabsController._getGitInfoForTab(tab); 
	
	        // 2. Get the content
	        const contentToSave = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
	        
	        // 3. Always write to local disk first
	        await FileSystemProvider.write(tab.item, contentToSave);
	        
	        // 4. Handle Staging
	        if (gitRootItem) {
	            let relativePath = "";
	            const filePath = tab.item.path;
	            const rootPath = gitRootItem.path.replace(/\/+$/, "") || "/";
	
	            // Calculate path relative to the REPO root
	            if (rootPath === "/" || rootPath === "") {
	                relativePath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
	            } else if (filePath.startsWith(rootPath + "/")) {
	                relativePath = filePath.substring(rootPath.length + 1);
	            }
	
	            if (relativePath && relativePath !== rootPath) {
	                const itemForStaging = { ...tab.item, path: relativePath };
	                const uniquePathForStaging = `${gitRootItem.workspaceId || gitRootItem.id}::${relativePath}`;
	                await FileSystemProvider.IndexedDB.writeUncommitted(uniquePathForStaging, contentToSave, itemForStaging);
	                tab.isUncommitted = true;
	            }
	        }
	
	        tab.isDirty = false;
	        tab.content = contentToSave;
	        TabsController.render();
	        UI.endTask(taskId, 'success', `Saved.`);
	
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
