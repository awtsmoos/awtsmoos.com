
// B"H
// FILE: js/tabs/persistence.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { ZipExplorer } from '../zip/zip-explorer.js';
import { ASTEngine } from '../tools/ast-engine.js';
import { GitMetaProvider } from '../git/meta.js';

export const TabsPersistence = {
    /**
     * @async
     * @function save
     * @description B"H - Optimized for Lightning Speed. 
     * The physical write happens FIRST. Background tasks follow without blocking.
     */
    async save(tab, TabsController, options = {}) {
        const taskId = "save-" + Date.now();
        UI.startTask(taskId, "Saving " + tab.item.name + "...");

        try {
            // Specialized Zip handling
            if (tab.item.type === 'zip-entry') {
                const content = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
                ZipExplorer.updateEntry(tab, content);
                tab.content = content;
                tab.isDirty = false;
                TabsController.render();
                UI.endTask(taskId, 'success', "Updated archive memory.");
                return;
            }
            
            if (tab.fileType === 'zip' && !options.skipZipRecompression) {
                await ZipExplorer.saveZipToDisk();
                UI.endTask(taskId, 'success');
                return;
            }

            // Normal file handling
            const contentToSave = (tab.id === State.activeTabId) ? Editor.getContent() : tab.content;
	        
	        // 1. PHYSICAL MANIFESTATION (LIGHTNING FAST)
            // This is the only part the user must wait for.
	        await FileSystemProvider.write(tab.item, contentToSave);
            
            // Immediately mark as clean in the UI
            tab.isDirty = false;
            tab.content = contentToSave;
            TabsController.render();
            UI.endTask(taskId, 'success', "Manifested.");

	        // 2. SPIRITUAL STAGING (ASYNCHRONOUS / NON-BLOCKING)
            // We fire this off without 'await' to ensure main thread remains fluid.
	        GitMetaProvider.getGitInfoForFolder(tab.item).then(gitInfo => {
                if (gitInfo) {
                    const rootPath = gitInfo.path.replace(/\/+$/, "") || "/";
                    const filePath = tab.item.path;
                    let relPath = "";

                    if (rootPath === "/" || rootPath === "") {
                        relPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
                    } else if (filePath.startsWith(rootPath + "/")) {
                        relPath = filePath.substring(rootPath.length + 1);
                    }

                    if (relPath) {
                        const uniqueStagingPath = tab.item.workspaceId + "::" + relPath;
                        FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingPath, contentToSave, { ...tab.item, path: relPath }).then(() => {
                            tab.isUncommitted = true;
                            TabsController.render();
                        });
                    }
                }
            }).catch(e => { /* Background Git errors should be silent */ });

	    } catch (e) {
	        UI.endTask(taskId, 'error', "Save failed: " + e.message);
	    }
	},

    async saveAs(tab, TabsController) {
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: tab.item.name,
                    types: [{ description: 'Files', accept: { 'text/plain': ['.txt', '.js', '.css', '.html', '.md', '.json'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(Editor.getContent());
                await writable.close();
                UI.showToast("Saved " + handle.name, 'success');
            } else {
                this.downloadActive(TabsController);
            }
        } catch (err) {
            if (err.name !== 'AbortError') UI.showToast(err.message, 'error');
        }
    },

    downloadActive(TabsController) {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (!tab) return;
        const content = (tab.fileType === 'text') ? Editor.getContent() : tab.content;
        const blob = (content instanceof Blob) ? content : new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = tab.item.name;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    }
};
