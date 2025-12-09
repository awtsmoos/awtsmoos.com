// B"H
// FILE: js/zip/ops.js

import { UI } from '../ui.js';
import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { ZipState } from './state.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { ZipRenderer } from './render.js';

export const ZipOps = {
    
    async openEntry(zipTab, entry) {
        // Only open files
        if (entry.isDir) return;

        UI.showLoading(`Extracting ${entry.filename}...`);
        try {
            const state = zipTab.zipState;
            let content;
            
            // Check modifications first (priority)
            if (state.modifications.has(entry.filename)) {
                content = state.modifications.get(entry.filename);
            } 
            // If not in modifications, fallback to entry data
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
            
        } catch(e) {
            console.error(e);
            UI.showToast("Error extracting file: " + e.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    async createItem(zipTab, kind) {
        const name = await UI.showDialog({
            title: `New ${kind === 'directory' ? 'Folder' : 'File'} in Zip`,
            hasInput: true,
            placeholder: 'path/to/item'
        });
        
        if (!name) return;
        
        try {
            await this.createEntry(zipTab, name, kind);
        } catch (e) {
            UI.showToast(e.message, "error");
        }
    },

    // B"H - Programmatic Create (Separated Logic)
    async createEntry(zipTab, path, kind) {
        const state = zipTab.zipState;
        if (!state) return;

        const currentEntries = ZipState.getDisplayEntries(state);
        if (currentEntries.some(e => e.filename === path)) {
            throw new Error("Item already exists!");
        }

        const isDir = kind === 'directory';
        state.newEntries.set(path, { isDir });
        // Initialize content
        state.modifications.set(path, isDir ? new Uint8Array(0) : "");
        
        this._markDirty(zipTab);
        ZipRenderer.render(zipTab, this);
    },

    async deleteItem(zipTab, filename) {
        const state = zipTab.zipState;
        if (!state) return;
        
        const confirmed = await UI.showDialog({
            title: "Delete from Zip",
            message: `Are you sure you want to delete "${filename}"?`,
            okText: "Delete",
            cancelText: "Cancel"
        });
        
        if (!confirmed) return;

        this.deleteEntry(zipTab, filename);
    },

    // B"H - Programmatic Delete (Separated Logic)
    deleteEntry(zipTab, filename) {
        const state = zipTab.zipState;
        if (!state) return;

        state.deletedPaths.add(filename);
        state.modifications.delete(filename); // Clear any pending mods for this file
        state.newEntries.delete(filename); // If it was a new entry, remove it entirely
        
        // Close the tab if it's open
        const openTab = State.tabs.find(t => t.item.type === 'zip-entry' && t.item.path === filename && t.item.zipTabId === state.tabId);
        if (openTab) {
            Tabs.close(openTab.id, true);
        }

        this._markDirty(zipTab);
        ZipRenderer.render(zipTab, this);
    },

    // Called when a sub-file is saved via TabsPersistence (and FS Provider Write)
    updateEntry(zipTab, filename, content) {
        const state = zipTab.zipState;
        if (!state) return;

        state.modifications.set(filename, content);
        // If it was deleted, undelete it
        if (state.deletedPaths.has(filename)) state.deletedPaths.delete(filename);

        // B"H - Implicit Creation Check:
        // If we are writing a file that isn't in original entries and not explicitly created yet,
        // we must add it to newEntries so it appears in the list.
        // This handles Paste operations.
        const inOriginal = state.entries.some(e => e.filename === filename);
        const inNew = state.newEntries.has(filename);
        
        if (!inOriginal && !inNew) {
            state.newEntries.set(filename, { isDir: false });
        }

        UI.showToast(`Updated ${filename} in archive memory.`, 'success');
        this._markDirty(zipTab);
        
        // If the zip explorer is currently visible, refresh it
        if (State.activeTabId === zipTab.id) {
            ZipRenderer.render(zipTab, this);
        }
    },

    async save(zipTab) {
        const state = zipTab.zipState;
        if (!state) return;
        
        UI.showLoading("Recompressing ZIP...");
        
        try {
            const encoder = new ZipFile();
            const originalEntries = state.entries;
            const processedPaths = new Set();

            // 1. Process Original Entries
            for (const entry of originalEntries) {
                // Skip deleted
                if (state.deletedPaths.has(entry.filename)) continue;

                processedPaths.add(entry.filename);

                if (entry.isDir) {
                    encoder.addFolder(entry.filename);
                    continue;
                }
                
                let data;
                // Check if modified
                if (state.modifications.has(entry.filename)) {
                    const content = state.modifications.get(entry.filename);
                    data = await this._normalizeContent(content);
                } else {
                    // Use original data
                    const blob = await entry.getData();
                    data = new Uint8Array(await blob.arrayBuffer());
                }
                
                encoder.addFile(entry.filename, data);
            }

            // 2. Process NEW entries (that were not in original)
            // Iterate newEntries map to ensure we catch folders too
            for (const [filename, info] of state.newEntries) {
                if (processedPaths.has(filename)) continue; 
                if (state.deletedPaths.has(filename)) continue;

                if (info.isDir) {
                    encoder.addFolder(filename);
                } else {
                    // For files, get content from modifications. 
                    // If not in modifications (shouldn't happen for created files), use empty.
                    let content = state.modifications.get(filename);
                    if (!content) content = new Uint8Array(0);
                    
                    const data = await this._normalizeContent(content);
                    encoder.addFile(filename, data);
                }
                processedPaths.add(filename);
            }
            
            // 3. Catch-all for modifications that might have missed newEntries (safety net)
            for (const [filename, content] of state.modifications) {
                if (processedPaths.has(filename)) continue;
                if (state.deletedPaths.has(filename)) continue;
                
                // Assume file if only in mods
                const data = await this._normalizeContent(content);
                encoder.addFile(filename, data);
            }
            
            const newBlob = encoder.build();
            
            // Update the Tab content
            zipTab.content = newBlob;
            zipTab.rawContent = newBlob; 

            // Persist to Disk via TabsPersistence
            // Pass skipZipRecompression to prevent infinite recursion
            await import('../tabs/persistence.js').then(m => 
                m.TabsPersistence.save(zipTab, Tabs, { skipZipRecompression: true })
            );
            
            // Refresh State with new blob
            await ZipState.refresh(zipTab, newBlob);
            ZipRenderer.render(zipTab, this);
            
            UI.showToast("Archive updated and saved.", "success");
            
        } catch(e) {
            console.error(e);
            UI.showToast("Failed to save ZIP: " + e.message, 'error');
        } finally {
            UI.hideLoading();
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

        UI.showLoading("Extracting archive...");
        try {
            // 1. Create Target Directory
            const workspace = State.workspaces.find(ws => ws.id === sourceItem.workspaceId);
            if (!workspace) throw new Error("Workspace not found.");

            const workspaceId = workspace.id;
            const parentDirItem = { ...workspace, workspaceId, path: parentPath, kind: 'directory' };
            
            try {
                await FileSystemProvider.create(parentDirItem, targetFolderName, 'directory');
            } catch(e) {
                console.warn("Folder might exist, merging...", e);
            }

            const targetRootPath = parentPath === '/' ? `/${targetFolderName}` : `${parentPath}/${targetFolderName}`;
            const targetRootItem = { ...workspace, workspaceId, path: targetRootPath, kind: 'directory' };

            // 2. Iterate Display Entries
            const entriesToExtract = ZipState.getDisplayEntries(state);
            let successCount = 0;
            let errorCount = 0;

            for (const entry of entriesToExtract) {
                try {
                    const parts = entry.filename.split('/');
                    const fileName = parts.pop();
                    const dirPath = parts.join('/');
                    
                    // Ensure directories exist
                    let currentDir = targetRootItem;
                    if (dirPath) {
                        const dirs = dirPath.split('/');
                        let currentPathAccum = targetRootPath;
                        for (const dir of dirs) {
                            const nextPath = `${currentPathAccum}/${dir}`;
                            // Try to create dir, ignore if exists
                            try {
                                await FileSystemProvider.create(
                                    { ...workspace, workspaceId, path: currentPathAccum, kind: 'directory' }, 
                                    dir, 
                                    'directory'
                                );
                            } catch(e) {}
                            currentPathAccum = nextPath;
                        }
                        currentDir = { ...workspace, workspaceId, path: currentPathAccum, kind: 'directory' };
                    }

                    if (!entry.isDir) {
                        let content;
                        // Check modifications first
                        if (state.modifications.has(entry.filename)) {
                            content = state.modifications.get(entry.filename);
                        } else {
                            const blob = await entry.getData();
                            content = blob;
                        }
                        
                        const dataToWrite = await this._normalizeContent(content);

                        const fileItem = { 
                            ...workspace, 
                            workspaceId, 
                            path: `${currentDir.path}/${fileName}`, 
                            kind: 'file' 
                        };
                        
                        await FileSystemProvider.write(fileItem, dataToWrite);
                        successCount++;
                    }
                } catch(entryError) {
                    console.error(`Failed to extract ${entry.filename}:`, entryError);
                    errorCount++;
                }
            }
            
            const msg = errorCount > 0 
                ? `Extracted ${successCount} files. ${errorCount} failed.` 
                : "Extraction complete!";
            
            UI.showToast(msg, errorCount > 0 ? "warning" : "success");
            await Workspaces.refreshNode(parentDirItem);

        } catch (e) {
            console.error(e);
            UI.showToast("Extraction failed: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    },

    async _normalizeContent(content) {
        if (content instanceof Uint8Array) return content;
        if (content instanceof ArrayBuffer) return new Uint8Array(content);
        if (content instanceof Blob) return new Uint8Array(await content.arrayBuffer());
        if (typeof content === 'string') return new TextEncoder().encode(content);
        return new Uint8Array(0);
    },

    _markDirty(tab) {
        if (!tab.isDirty) {
            tab.isDirty = true;
            Tabs.render(); // Refresh tab bar
        }
    }
};