// B"H
// FILE: code/js/tabs/persistence.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { DataAltar } from '../DataAltar.js';
import { ZipExplorer } from '../zip/zip-explorer.js';
import { ASTEngine } from '../tools/ast-engine.js';
import { GitMetaProvider } from '../git/meta.js';

/**
 * --- TABS PERSISTENCE ---
 * The sacred scribe that manifests the ephemeral state of a tab into a
 * permanent vessel, whether it be local disk, a Zip archive, or the
 * uncommitted state of a Git repository. B"H.
 * @module js/tabs/persistence
 */
export const TabsPersistence = {
    /**
     * The core ritual of saving a tab's content.
     */
    async save(tab, TabsController, options = {}) {
        const taskId = `save-${Date.now()}`;
        UI.startTask(taskId, `Saving ${tab.item.name}...`);

        try {
            if (tab.item.type === 'zip-entry') {
                const content = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
                ZipExplorer.updateEntry(tab, content);
                tab.content = content;
                tab.isDirty = false;
                TabsController.render();
                UI.endTask(taskId, 'success', `Updated archive memory.`);
                return;
            }
            
            if (tab.fileType === 'zip' && !options.skipZipRecompression) {
                await ZipExplorer.saveZipToDisk();
                UI.endTask(taskId, 'success');
                return;
            }

            if (tab.id === State.activeTabId && tab.fileType === 'text') {
                ASTEngine.unfoldAll();
            }

            const contentToSave = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
	        
	        // 1. Always write to the primary filesystem provider first.
	        await FileSystemProvider.write(tab.item, contentToSave);
	        
	        // 2. If part of a Git repository, also stage the change.
	        const gitInfo = await GitMetaProvider.getGitInfoForFolder(tab.item);
	        if (gitInfo) {
	            const gitRoot = { ...tab.item, path: (await GitMetaProvider.getGitInfoForFolder(tab.item))?.path || '/' };
                const rootPath = gitRoot.path.replace(/\/+$/, "") || "/";
                const filePath = tab.item.path;
                let relativePath = "";

	            if (rootPath === "/" || rootPath === "") {
	                relativePath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
	            } else if (filePath.startsWith(rootPath + "/")) {
	                relativePath = filePath.substring(rootPath.length + 1);
	            }
	
	            if (relativePath && relativePath !== rootPath) {
	                const itemForStaging = { ...tab.item, path: relativePath };
	                const uniquePathForStaging = `${tab.item.workspaceId}::${relativePath}`;
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
