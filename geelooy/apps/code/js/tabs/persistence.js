
// B"H
// FILE: js/tabs/persistence.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { ZipExplorer } from '../zip/zip-explorer.js';
import { ASTEngine } from '../tools/ast-engine.js';
import { GitMetaProvider } from '../git/meta.js';

/**
 * @class TabsPersistence
 * @description The holy scribe. It takes the ephemeral state of a tab 
 * and manifests it into permanent memory. It is rectified to ensure 
 * that every save also updates the Git uncommitted store, ensuring 
 * the timeline always reflects the latest creation.
 */
export const TabsPersistence = {
    /**
     * @async
     * @function save
     * @description B"H. The act of anchoring content to reality.
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
	        
	        // 1. Write to primary vessel
	        await FileSystemProvider.write(tab.item, contentToSave);
	        
	        // 2. Stage for Git (Tikkun: Ensure immediate visibility in Git UI)
	        const gitInfo = await GitMetaProvider.getGitInfoForFolder(tab.item);
	        if (gitInfo) {
                // Resolve relative path for staging
                const rootPath = gitInfo.path.replace(/\/+$/, "") || "/";
                const filePath = tab.item.path;
                let relPath = "";

	            if (rootPath === "/" || rootPath === "") {
	                relPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
	            } else if (filePath.startsWith(rootPath + "/")) {
	                relPath = filePath.substring(rootPath.length + 1);
	            }
	
	            if (relPath) {
	                const uniqueStagingPath = `${tab.item.workspaceId}::${relPath}`;
	                await FileSystemProvider.IndexedDB.writeUncommitted(uniqueStagingPath, contentToSave, { ...tab.item, path: relPath });
	                tab.isUncommitted = true;
	            }
	        }
	
	        tab.isDirty = false;
	        tab.content = contentToSave;
	        TabsController.render();
	        UI.endTask(taskId, 'success', `Saved.`);
	
	    } catch (e) {
	        UI.endTask(taskId, 'error', `Save failed: ${e.message}`);
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
                UI.showToast(`Saved "${handle.name}"`, 'success');
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
