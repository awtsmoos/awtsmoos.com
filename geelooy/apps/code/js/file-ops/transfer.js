// B"H
// FILE: js/file-ops/transfer.js
import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Clipboard } from '../clipboard.js';
import { SelectionManager } from '../selection-manager.js';
import { Workspaces, getItemUniquePath } from '../workspaces.js';
import { Tabs } from '../tabs/index.js';
import { Exporter } from './exporter.js';

/**
 * --- TRANSFER ---
 * The vessel for moving and transforming the essence of files, whether it be
 * content, structure, or their very existence. B"H.
 */
export const Transfer = {
    /**
     * B"H - Generates a comprehensive Markdown string, a textual snapshot of a reality.
     */
    async generateMarkdownContext(items, basePath = "") {
        let combinedContent = 'B"H\n\n'; 
        
        const getRelative = (fullPath) => {
            if (!basePath || basePath === "/") return fullPath;
            const normBase = basePath.replace(/\/+$/, ""); 
            const normFull = fullPath.replace(/\/+$/, ""); 
            if (normFull === normBase) return ""; 
            if (normFull.startsWith(normBase + "/")) {
                return normFull.substring(normBase.length + 1);
            }
            return fullPath;
        };

        const processItem = async (item) => {
            if (!item || !item.kind) return;

            const displayPath = getRelative(item.path) || item.name;

            if (item.kind === 'file') {
                const ext = item.name.split('.').pop().toLowerCase();
                if (['png', 'jpg', 'zip', 'pdf', 'exe', 'bin', 'mp4'].includes(ext)) return;

                try {
                    const content = await FileSystemProvider.read(item);
                    let textContent = '';
                    if (typeof content === 'string') textContent = content;
                    else if (content instanceof Blob) textContent = await content.text();
                    else if (content && content.base64Content) textContent = atob(content.base64Content);

                    combinedContent += `### File: \`${displayPath}\`\n\n`;
                    combinedContent += '```\n';
                    combinedContent += textContent.trim() + '\n'; 
                    combinedContent += '```\n\n';
                    combinedContent += '---\n\n'; 
                } catch(e) {
                    console.warn(`[Transfer] Failed to read ${item.path}`, e);
                }

            } else if (item.kind === 'directory') {
                combinedContent += `## Directory: \`${displayPath}\`\n\n`;
                
                try {
                    const result = await FileSystemProvider.list(item);
                    const children = Array.isArray(result) ? result : (result.entries || []);
                    
                    for (const child of children) {
                        const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId ?? item.id));
                        if (workspace) {
                            await processItem({ ...workspace, ...child, workspaceId: workspace.id });
                        }
                    }
                } catch(e) {
                    console.error(`[Transfer] Failed to list directory ${displayPath}`, e);
                }
            }
        };

        for (const item of items) {
            await processItem(item);
        }
        
        return combinedContent;
    },

    async copySelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) return UI.showToast("No items selected.", "info");
        State.fileClipboard = selectedPaths;
        State.clipboardZip = null;
        UI.showToast(`${selectedPaths.length} item(s) copied.`, 'success');
        SelectionManager.end();
    },

    async copyAllContents(items) {
        if (!items || items.length === 0) return UI.showToast("Nothing to copy.", "info");
        const taskId = `copy-contents-${Date.now()}`;
        UI.startTask(taskId, "Preparing context...");
        try {
            const basePath = (items.length === 1 && items[0].kind === 'directory') ? items[0].path : "";
            const content = await this.generateMarkdownContext(items, basePath);
            const success = await Clipboard.write(content);
            if (success) UI.endTask(taskId, 'success', 'Copied to clipboard!');
            else UI.endTask(taskId, 'error', 'Clipboard failed.');
        } catch (error) {
            UI.endTask(taskId, 'error', error.message);
        }
    },
    
    async downloadAllContents(items) {
        if (!items || items.length === 0) return UI.showToast("Nothing to download.", "info");
        const taskId = `dl-contents-${Date.now()}`;
        UI.startTask(taskId, "Generating Markdown...");
        try {
            const basePath = (items.length === 1 && items[0].kind === 'directory') ? items[0].path : "";
            const content = await this.generateMarkdownContext(items, basePath);
            const blob = new Blob([content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `context_export_${Date.now()}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            UI.endTask(taskId, 'success', 'Downloaded!');
        } catch (error) {
            UI.endTask(taskId, 'error', error.message);
        }
    },

    async deleteSelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) return;
        const items = selectedPaths.map(p => State.domItemMap.get(p)?.item).filter(Boolean);
        await this.deleteSelectedSequentially(items, 'Standard');
    },

    async deleteSelectedSequentially(itemsToDelete, typeLabel) {
        const confirmed = await UI.showDialog({
            title: `Confirm Deletion`,
            message: `Delete ${itemsToDelete.length} item(s)?`,
            okText: 'Delete'
        });
        if (!confirmed) return;

        const taskId = `delete-${Date.now()}`;
        UI.startTask(taskId, `Deleting...`);
        try {
            for (let i = 0; i < itemsToDelete.length; i++) {
                const item = itemsToDelete[i];
                UI.updateTask(taskId, (i / itemsToDelete.length) * 100, `Deleting: ${item.name}`);
                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
                await FileSystemProvider.delete(item);
            }
            await this._refreshParents(itemsToDelete);
            UI.endTask(taskId, 'success', `Deleted ${itemsToDelete.length} items.`);
        } catch (e) {
            UI.endTask(taskId, 'error', e.message);
        } finally {
            SelectionManager.end();
        }
    },

    async _refreshParents(items) {
        const parents = new Set();
        items.forEach(item => {
            const p = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            parents.add(`${item.workspaceId}::${p}`);
        });
        for (const up of parents) {
            const entry = State.domItemMap.get(up);
            if (entry) await Workspaces.refreshNode(entry.item);
        }
    },

    async paste(destinationDir) {
        if (State.clipboardZip) {
            const taskId = `paste-zip-${Date.now()}`;
            UI.startTask(taskId, "Pasting ZIP...");
            try {
                const blob = State.clipboardZip.type === 'lazy-zip' 
                    ? await Exporter.createZipBlob(State.clipboardZip.items)
                    : State.clipboardZip.blob;
                const newItem = { ...destinationDir, name: State.clipboardZip.name, kind: 'file', path: `${destinationDir.path === '/' ? '' : destinationDir.path}/${State.clipboardZip.name}` };
                await FileSystemProvider.write(newItem, await blob.arrayBuffer());
                UI.endTask(taskId, 'success', "Pasted ZIP.");
            } catch(e) { UI.endTask(taskId, 'error', "Paste failed."); }
            finally { await Workspaces.refreshNode(destinationDir); }
            return;
        }

        if (!State.fileClipboard?.length) return UI.showToast("Clipboard empty.", "warning");
        const taskId = `paste-${Date.now()}`;
        UI.startTask(taskId, "Copying items...");
        try {
            const sourceItems = State.fileClipboard.map(p => State.domItemMap.get(p)?.item).filter(Boolean);
            for (const source of sourceItems) {
                await this._copyRecursive(source, destinationDir);
            }
            UI.endTask(taskId, 'success', `Paste complete.`);
        } catch(e) { UI.endTask(taskId, 'error', e.message); }
        finally { await Workspaces.refreshNode(destinationDir); }
    },

    async _copyRecursive(source, dest) {
        const newPath = dest.path === '/' ? `/${source.name}` : `${dest.path}/${source.name}`;
        const newItem = { ...dest, name: source.name, path: newPath };
        if (source.kind === 'file') {
            const content = await FileSystemProvider.read(source);
            await FileSystemProvider.write(newItem, content);
        } else {
            try { await FileSystemProvider.create(dest, source.name, 'directory'); } catch(e) {}
            const childrenResult = await FileSystemProvider.list(source);
            const children = Array.isArray(childrenResult) ? childrenResult : childrenResult.entries;
            for (const child of children) {
                const workspace = State.workspaces.find(ws => ws.id === (source.workspaceId ?? source.id));
                await this._copyRecursive({ ...workspace, ...child }, { ...newItem, kind: 'directory' });
            }
        }
    },
    
    async cloneRepo(githubSource, localTargetDir) {
	    const taskId = `clone-${Date.now()}`;
	    UI.startTask(taskId, `Cloning ${githubSource.name}...`);
	
	    try {
	        const treeData = await FileSystemProvider.GitHub.getFullTree(githubSource);
	        const files = treeData.tree.filter(n => n.type === 'blob');
	        const total = files.length;
	        const repoFolderName = githubSource.name.split('/').pop();
	        await FileSystemProvider.create(localTargetDir, repoFolderName, 'directory');
	        
	        const localRootPath = localTargetDir.path === '/' ? `/${repoFolderName}` : `${localTargetDir.path}/${repoFolderName}`;
	        const localRoot = { ...localTargetDir, path: localRootPath, kind: 'directory' };
	
	        for (let i = 0; i < files.length; i++) {
	            const file = files[i];
	            UI.updateTask(taskId, (i / total) * 100, `Cloning: ${file.path}`);
	            
	            const content = await FileSystemProvider.GitHub.read({ ...githubSource, path: file.path, sha: file.sha });
	            
	            const parts = file.path.split('/');
	            parts.pop();
	            let currentPath = localRootPath;
	            
	            for(const part of parts) {
	                const parent = { ...localTargetDir, path: currentPath, kind: 'directory' };
	                try { await FileSystemProvider.create(parent, part, 'directory'); } catch(e){}
	                currentPath += `/${part}`;
	            }
	
	            const localFileItem = { ...localTargetDir, path: `${localRootPath}/${file.path}`, kind: 'file' };
	            await FileSystemProvider.write(localFileItem, content);
	        }
	
	        const gitInfo = {
	            isClone: true,
	            repoInfo: githubSource.repoInfo,
	            branch: githubSource.branch,
	            baseCommitSHA: treeData.sha,
	            remoteTree: treeData.tree
	        };
	
	        await FileSystemProvider.create(localRoot, '.awtsmoos-repo', 'directory');
	        const ikarPath = `${localRootPath}/.awtsmoos-repo/ikar.js`;
	        const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
	        await FileSystemProvider.write({ ...localTargetDir, path: ikarPath, kind: 'file' }, ikarContent);
	
	        localRoot.isGitClone = true;
	        const uniquePath = getItemUniquePath(localRoot);
	        
	        const entry = State.domItemMap.get(uniquePath);
	        if (entry) {
	            entry.item.isGitClone = true;
	            const iconUse = entry.el.querySelector('.svg-icon use');
	            if (iconUse) iconUse.setAttribute('href', '#icon-git-folder');
	        }
	
	        UI.endTask(taskId, 'success', `Clone of ${githubSource.name} complete.`);
	        Workspaces.refreshNode(localTargetDir);
	
	    } catch (e) {
	        UI.endTask(taskId, 'error', `Clone failed: ${e.message}`);
	    }
	},
	
	
	
	/**
     * B"H - A holy ritual to align the local reality with the remote source of truth.
     * This will overwrite local files with what is on the server.
     * @param {object} gitContextItem - The local folder representing the Git repository.
     * @param {object} gitInfo - The metadata describing the remote connection.
     */
	async pullAndOverwrite(gitContextItem, gitInfo) {
	    const taskId = `pull-${Date.now()}`;
	    UI.startTask(taskId, `Syncing with GitHub...`);
	
	    try {
	        const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
	        const remoteFiles = treeData.tree.filter(n => n.type === 'blob');
	        const total = remoteFiles.length;
	
	        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;
	        let localRootPath = gitContextItem.path.replace(/\/+$/, "") || "/";
	        if (!localRootPath.startsWith('/')) localRootPath = '/' + localRootPath;
	
	        // Clear local staging for this repo to prevent conflicts
	        const uncommitted = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
	        for (const entry of uncommitted) {
	            if (entry.item.path.startsWith(localRootPath)) {
	                await FileSystemProvider.IndexedDB.deleteUncommitted(entry.uniquePath);
	            }
	        }
	
	        for (let i = 0; i < remoteFiles.length; i++) {
	            const file = remoteFiles[i];
	            UI.updateTask(taskId, (i / total) * 100, `Downloading: ${file.path}`);
	            
	            const content = await FileSystemProvider.GitHub.read({
	                workspaceId, repoInfo: gitInfo.repoInfo, branch: gitInfo.branch,
	                path: file.path, sha: file.sha, name: file.path.split('/').pop()
	            });
	
	            const pathParts = file.path.split('/');
	            pathParts.pop(); 
	            let currentPathAccum = localRootPath;
	            for (const part of pathParts) {
	                const parent = { ...gitContextItem, path: currentPathAccum, kind: 'directory' };
	                try { await FileSystemProvider.create(parent, part, 'directory'); } catch(e){}
	                currentPathAccum += (currentPathAccum === '/' ? '' : '/') + part;
	            }
	
	            const fullLocalPath = (localRootPath === '/' ? '/' : localRootPath + '/') + file.path.replace(/^\/+/, '');
	            await FileSystemProvider.write({ ...gitContextItem, path: fullLocalPath, kind: 'file' }, content);
	            
	            const uniquePath = `${workspaceId}::${fullLocalPath}`;
	            const tab = State.tabs.find(t => t.uniquePath === uniquePath);
	            if (tab) {
	                tab.content = (typeof content === 'string') ? content : (content instanceof Blob ? await content.text() : content);
	                tab.isDirty = false; tab.isUncommitted = false; tab.item.sha = file.sha;
	                if (State.activeTabId === tab.id) {
	                    const { Editor } = await import('../editor.js');
	                    Editor.setCurrentContent(tab.content);
	                }
	            }
	        }
	
	        const remotePaths = new Set(remoteFiles.map(f => f.path));
	        if (gitInfo.remoteTree) {
	            for (const oldFile of gitInfo.remoteTree) {
	                if (oldFile.type === 'blob' && !remotePaths.has(oldFile.path)) {
	                    const fullDelPath = (localRootPath === '/' ? '/' : localRootPath + '/') + oldFile.path;
	                    try { await FileSystemProvider.delete({ ...gitContextItem, path: fullDelPath, kind: 'file' }); } catch(e) {}
	                }
	            }
	        }
	
	        const updatedMetadata = {
	            ...gitInfo, isClone: true, baseCommitSHA: treeData.sha, remoteTree: treeData.tree
	        };
	
	        const ikarPath = (localRootPath === '/' ? '' : localRootPath) + '/.awtsmoos-repo/ikar.js';
	        const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedMetadata, null, 4)};`;
	        await FileSystemProvider.write({ ...gitContextItem, path: ikarPath, kind: 'file' }, ikarContent);
	
	        UI.endTask(taskId, 'success', `B"H: Pulled ${total} files. Workspace synchronized.`);
	        
	        const { Workspaces } = await import('../workspaces.js');
	        await Workspaces.refreshNode(gitContextItem);
	
	    } catch (e) {
	        console.error("[Pull Error]", e);
	        UI.endTask(taskId, 'error', "Pull Failed: " + e.message);
	    }
	}
};
