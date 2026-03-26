
// B"H
import { UI } from '../../ui.js';
import { State } from '../../state.js';
import { Tabs } from '../../tabs/index.js';
import { ZipState } from '../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { ZipUtils } from './utils.js';

export const ZipExtract = {
    async openEntry(zipTab, entry) {
        if (entry.isDir) return;

        const taskId = `zip-open-${Date.now()}`;
        UI.startTask(taskId, `Extracting ${entry.filename.split('/').pop()}...`);

        try {
            const state = zipTab.zipState;
            let content;
            
            if (state.modifications.has(entry.filename)) {
                content = state.modifications.get(entry.filename);
            } 
            if (!content) {
                const blob = await entry.getData();
                content = blob; 
            }
            
            const item = {
                name: entry.filename.split('/').pop(),
                path: entry.filename,
                type: 'zip-entry',
                zipTabId: state.tabId,
                workspaceId: 'zip' 
            };
            
            await Tabs.create({ ...item, content: content }, false, false); 
            UI.endTask(taskId, 'success', 'File extracted.');
            
        } catch(e) {
            console.error(e);
            UI.endTask(taskId, 'error', "Extraction failed: " + e.message);
        }
    },

    async extractAll(zipTab) {
        const state = zipTab.zipState;
        if (!state) return;
        
        const sourceItem = zipTab.item;
        const parentPath = sourceItem.path.substring(0, sourceItem.path.lastIndexOf('/')) || '/';
        const zipName = sourceItem.name.replace(/\.zip$/i, '');
        
        const targetFolderName = await UI.showDialog({
            title: "Extract All",
            message: `Extract to folder "${zipName}"?`,
            hasInput: true,
            inputValue: zipName, 
            okText: "Extract",
            cancelText: "Cancel"
        });

        if (!targetFolderName) return;

        const taskId = `zip-ext-${Date.now()}`;
        UI.startTask(taskId, "Preparing extraction...");

        try {
            const workspace = State.workspaces.find(ws => ws.id === sourceItem.workspaceId);
            if (!workspace) throw new Error("Workspace not found.");

            const workspaceId = workspace.id;
            const parentDirItem = { ...workspace, workspaceId, path: parentPath, kind: 'directory' };
            
            try { await FileSystemProvider.create(parentDirItem, targetFolderName, 'directory'); } catch(e) {}

            const targetRootPath = parentPath === '/' ? `/${targetFolderName}` : `${parentPath}/${targetFolderName}`;
            const entriesToExtract = ZipState.getDisplayEntries(state);
            const total = entriesToExtract.length;
            let successCount = 0;

            for (let i = 0; i < total; i++) {
                const entry = entriesToExtract[i];
                UI.updateTask(taskId, (i / total) * 100, `Extracting: ${entry.filename.split('/').pop()}`);

                try {
                    const parts = entry.filename.split('/');
                    const fileName = parts.pop();
                    const dirPath = parts.join('/');
                    
                    let currentPathAccum = targetRootPath;
                    if (dirPath) {
                        const dirs = dirPath.split('/');
                        for (const dir of dirs) {
                            const parentForDir = { ...workspace, workspaceId, path: currentPathAccum, kind: 'directory' };
                            try { await FileSystemProvider.create(parentForDir, dir, 'directory'); } catch(e) {}
                            currentPathAccum += (currentPathAccum === '/' ? '' : '/') + dir;
                        }
                    }

                    if (!entry.isDir) {
                        let content = state.modifications.get(entry.filename);
                        if (!content) { content = await entry.getData(); }
                        
                        const dataToWrite = await ZipUtils.normalizeContent(content);
                        const fileItem = { ...workspace, workspaceId, path: `${currentPathAccum}/${fileName}`, kind: 'file' };
                        
                        await FileSystemProvider.write(fileItem, dataToWrite);
                        successCount++;
                    }
                } catch(entryError) {
                    console.error(`Failed to extract ${entry.filename}:`, entryError);
                }
            }
            
            UI.endTask(taskId, 'success', `Extracted ${successCount} files.`);
            import('../../workspaces.js').then(m => m.Workspaces.refreshNode(parentDirItem));

        } catch (e) {
            UI.endTask(taskId, 'error', "Extraction failed: " + e.message);
        }
    }
};
