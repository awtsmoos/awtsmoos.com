
// B"H
// FILE: js/file-ops/transfer.js
import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { ContextGenerator } from './context-generator.js';
import { SelectionManager } from '../selection-manager.js';
import { Workspaces, getItemUniquePath } from '../workspaces.js';
import { Tabs } from '../tabs/index.js';
import { Exporter } from './exporter.js';

export const Transfer = {
    async generateMarkdownContext(items, basePath = "") {
        return await ContextGenerator.generate(items, basePath);
    },

    async copySelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) return UI.showToast("No items selected.", "info");

        const itemsToCopy = selectedPaths
            .map(p => State.domItemMap.get(p)?.item)
            .filter(Boolean);

        if (itemsToCopy.length === 0) return UI.showToast("Lost connection to selected vessels.", "error");

        State.fileClipboard = itemsToCopy;
        State.clipboardZip = null;
        
        UI.showToast(`${itemsToCopy.length} item(s) copied.`, 'success');
        SelectionManager.end();
    },

    async copyAllContents(items) {
        if (!items || items.length === 0) return;
        const taskId = `copy-ctx-${Date.now()}`;
        UI.startTask(taskId, "Preparing context...");
        try {
            const basePath = (items.length === 1 && items[0].kind === 'directory') ? items[0].path : "";
            const content = await this.generateMarkdownContext(items, basePath);
            await navigator.clipboard.writeText(content);
            UI.endTask(taskId, 'success', 'Copied to clipboard!');
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
    },
    
    async downloadAllContents(items) {
        if (!items || items.length === 0) return;
        const taskId = `dl-ctx-${Date.now()}`;
        UI.startTask(taskId, "Generating Markdown...");
        try {
            const basePath = (items.length === 1 && items[0].kind === 'directory') ? items[0].path : "";
            const content = await this.generateMarkdownContext(items, basePath);
            const blob = new Blob([content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `context_export_${Date.now()}.md`;
            a.click();
            URL.revokeObjectURL(url);
            UI.endTask(taskId, 'success', 'Downloaded!');
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
    },

    async deleteSelected() {
        const selected = Array.from(State.selectedItems).map(p => State.domItemMap.get(p)?.item).filter(Boolean);
        if (selected.length === 0) return;
        
        const confirmed = await UI.showDialog({ title: "Delete Selection", message: `Delete ${selected.length} items?`, okText: "Delete" });
        if (!confirmed) return;

        const taskId = `del-sel-${Date.now()}`;
        UI.startTask(taskId, "Deleting...");
        try {
            for (let i = 0; i < selected.length; i++) {
                const item = selected[i];
                UI.updateTask(taskId, (i / selected.length) * 100, `Purging: ${item.name}`);
                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
                await FileSystemProvider.delete(item);
            }
            const parents = new Set(selected.map(item => `${item.workspaceId}::${item.path.substring(0, item.path.lastIndexOf('/')) || '/'}`));
            for (const up of parents) {
                const entry = State.domItemMap.get(up);
                if (entry) await Workspaces.refreshNode(entry.item);
            }
            UI.endTask(taskId, 'success', 'Selection deleted.');
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
        finally { SelectionManager.end(); }
    },

    /**
     * @async
     * @function paste
     * @description The great manifestation. Now with lighting speed for local FS.
     */
    async paste(destinationDir) {
        if (!State.fileClipboard?.length && !State.clipboardZip) return UI.showToast("Clipboard empty.", "warning");
        
        const taskId = `paste-${Date.now()}`;
        UI.startTask(taskId, "Analyzing clipboard...");

        try {
            if (State.clipboardZip) {
                const blob = State.clipboardZip.type === 'lazy-zip' ? await Exporter.createZipBlob(State.clipboardZip.items) : State.clipboardZip.blob;
                const path = `${destinationDir.path === '/' ? '' : destinationDir.path}/${State.clipboardZip.name}`;
                await FileSystemProvider.write({ ...destinationDir, path, kind: 'file' }, await blob.arrayBuffer());
                UI.endTask(taskId, 'success', 'ZIP Pasted.');
            } else {
                const sourceItems = State.fileClipboard.map(p => {
                    if (typeof p === 'string') return State.domItemMap.get(p)?.item;
                    return p;
                }).filter(Boolean);
                
                // 1. Calculate Total Work for progress bar
                let totalFiles = 0;
                for(const src of sourceItems) {
                    if(src.kind === 'file') totalFiles++;
                    else {
                        const all = await FileSystemProvider.listAllFiles(src);
                        totalFiles += all.length;
                    }
                }
                
                let processedFiles = 0;
                const onProgress = (path) => {
                    processedFiles++;
                    const percent = (processedFiles / totalFiles) * 100;
                    UI.updateTask(taskId, percent, `Pasting: ${path.split('/').pop()}`);
                };

                // 2. High-speed local transfer ritual
                if (destinationDir.type === 'local') {
                    const { LocalProvider } = await import('../fs/local/index.js');
                    const destHandle = await LocalProvider.getHandle(
                        await LocalProvider._getRootHandle(destinationDir),
                        destinationDir.path,
                        { kind: 'directory' },
                        destinationDir.workspaceId
                    );

                    for (const src of sourceItems) {
                        await LocalProvider.fastCopy(src, destHandle, onProgress);
                    }
                } else {
                    // Fallback for non-local types
                    for (const src of sourceItems) {
                        await this._copyRecursive(src, destinationDir, onProgress);
                    }
                }

                UI.endTask(taskId, 'success', `B"H - ${totalFiles} items pasted.`);
            }
        } catch(e) { 
            console.error(e);
            UI.endTask(taskId, 'error', e.message); 
        } finally { 
            await Workspaces.refreshNode(destinationDir); 
        }
    },

    async _copyRecursive(src, dest, onProgress) {
        const path = `${dest.path === '/' ? '' : dest.path}/${src.name}`;
        const item = { ...dest, name: src.name, path };
        if (src.kind === 'file') {
            const content = await FileSystemProvider.read(src);
            await FileSystemProvider.write(item, content);
            if (onProgress) onProgress(src.path);
        } else {
            try { await FileSystemProvider.create(dest, src.name, 'directory'); } catch(e) {}
            const res = await FileSystemProvider.list(src);
            const children = Array.isArray(res) ? res : res.entries;
            for (const child of children) {
                const ws = State.workspaces.find(w => w.id === (src.workspaceId ?? src.id));
                await this._copyRecursive({ ...ws, ...child }, { ...item, kind: 'directory' }, onProgress);
            }
        }
    },

    async pullAndOverwrite(gitContextItem, gitInfo) {
	    const taskId = `pull-${Date.now()}`;
	    UI.startTask(taskId, `Syncing with GitHub...`);
	    try {
	        const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
	        const remoteFiles = treeData.tree.filter(n => n.type === 'blob');
	        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;
	        let localRoot = gitContextItem.path.replace(/\/+$/, "") || "/";
	        if (!localRoot.startsWith('/')) localRoot = '/' + localRoot;

	        for (let i = 0; i < remoteFiles.length; i++) {
	            const file = remoteFiles[i];
	            UI.updateTask(taskId, (i / remoteFiles.length) * 100, `Pulling: ${file.path}`);
	            const content = await FileSystemProvider.GitHub.read({ workspaceId, repoInfo: gitInfo.repoInfo, branch: gitInfo.branch, path: file.path, sha: file.sha });
                const fullLocalPath = (localRoot === '/' ? '/' : localRoot + '/') + file.path;
	            await FileSystemProvider.write({ ...gitContextItem, path: fullLocalPath, kind: 'file' }, content);
	            
                const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${fullLocalPath}`);
	            if (tab) {
	                tab.content = (typeof content === 'string') ? content : (content instanceof Blob ? await content.text() : content);
	                tab.isDirty = false; tab.item.sha = file.sha;
	                if (State.activeTabId === tab.id) {
                        const { Editor } = await import('../editor.js');
                        Editor.setCurrentContent(tab.content);
                    }
	            }
	        }
	        const updated = { ...gitInfo, baseCommitSHA: treeData.sha, remoteTree: treeData.tree };
	        await FileSystemProvider.write({ ...gitContextItem, path: `${localRoot === '/' ? '' : localRoot}/.awtsmoos-repo/ikar.js` }, `// B"H\nconst ikar = ${JSON.stringify(updated, null, 4)};`);
	        UI.endTask(taskId, 'success', `Pulled ${remoteFiles.length} files.`);
	        await Workspaces.refreshNode(gitContextItem);
	    } catch (e) { UI.endTask(taskId, 'error', e.message); }
	}
};
