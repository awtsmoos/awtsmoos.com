// B"H
// FILE: js/zip/zip-explorer.js

import { ZipReader } from '/scripts/awtsmoos/zip/decoder.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';
import { DOM, State } from '../state.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { Editor } from '../editor.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';

export const ZipExplorer = {
    currentZip: null,
    
    async open(blob, tab) {
        UI.showLoading("Decompressing archive...");
        try {
            this.currentZip = {
                tabId: tab.id,
                reader: new ZipReader(),
                entries: [],
                modifications: new Map(), // filename -> content (string/blob)
                name: tab.item.name,
                sourceItem: tab.item
            };
            
            await this.currentZip.reader.load(blob);
            this.currentZip.entries = this.currentZip.reader.getEntries();
            
            this.render();
            UI.switchView('zip');
        } catch(e) {
            console.error(e);
            UI.showToast("Failed to open ZIP: " + e.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    render() {
        const container = DOM.zipExplorerWrapper;
        if (!container) return; 
        
        container.innerHTML = `
            <div class="zip-toolbar">
                <div class="zip-info">
                    <span class="zip-filename">${this.currentZip.name}</span>
                    <span class="zip-stats">${this.currentZip.entries.length} items</span>
                </div>
                <div class="zip-actions">
                    <button id="zip-extract-all" class="secondary-btn">Extract All</button>
                    <button id="zip-save-btn" class="primary-btn">Save Changes</button>
                </div>
            </div>
            <div class="zip-content">
                <table class="zip-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Ratio</th>
                        </tr>
                    </thead>
                    <tbody id="zip-table-body"></tbody>
                </table>
            </div>
        `;
        
        const tbody = container.querySelector('#zip-table-body');
        const entries = this.currentZip.entries.sort((a, b) => {
            // Dirs first, then alphabetical
            if (a.isDir !== b.isDir) return b.isDir ? 1 : -1;
            return a.filename.localeCompare(b.filename);
        });
        
        if (entries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="zip-empty-msg">Archive is empty.</td></tr>`;
        }

        entries.forEach(entry => {
            const tr = document.createElement('tr');
            tr.className = 'zip-row';
            if (this.currentZip.modifications.has(entry.filename)) tr.classList.add('modified');
            
            const ratio = entry.compressedSize > 0 ? Math.round((entry.compressedSize / entry.uncompressedSize) * 100) : 0;
            const sizeStr = entry.isDir ? '' : this._formatSize(entry.uncompressedSize);
            
            tr.innerHTML = `
                <td class="zip-icon-cell">${entry.isDir ? '📁' : '📄'}</td>
                <td class="zip-name-cell">${entry.filename}</td>
                <td class="zip-size-cell">${sizeStr}</td>
                <td class="zip-ratio-cell">${entry.isDir ? '-' : ratio + '%'}</td>
            `;
            
            if (!entry.isDir) {
                tr.onclick = () => this.openEntry(entry);
            }
            tbody.appendChild(tr);
        });
        
        container.querySelector('#zip-save-btn').onclick = () => this.saveZipToDisk();
        container.querySelector('#zip-extract-all').onclick = () => this.extractAll();
    },
    
    _formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    async openEntry(entry) {
        UI.showLoading(`Extracting ${entry.filename}...`);
        try {
            let content = this.currentZip.modifications.get(entry.filename);
            
            if (!content) {
                const blob = await entry.getData();
                // B"H - Do NOT assume text here. Pass blob to Tabs.create.
                // Tabs logic will handle type detection via MimeUtil and _handleStandardContent.
                content = blob; 
            }
            
            const item = {
                name: entry.filename.split('/').pop(),
                path: entry.filename,
                type: 'zip-entry',
                zipTabId: this.currentZip.tabId,
                workspaceId: 'zip' 
            };
            
            Tabs.create({ ...item, content: content }, false, false); 
            
        } catch(e) {
            console.error(e);
            UI.showToast("Error extracting file: " + e.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    updateEntry(filename, content) {
        if (!this.currentZip) return;
        this.currentZip.modifications.set(filename, content);
        UI.showToast(`Updated ${filename} in archive memory.`, 'success');
        
        const zipTab = State.tabs.find(t => t.id === this.currentZip.tabId);
        if (zipTab) {
            zipTab.isDirty = true;
            Tabs.render();
        }
        this.render(); // Re-render to show modified status
    },

    async saveZipToDisk() {
        if (!this.currentZip) return;
        UI.showLoading("Recompressing ZIP...");
        
        try {
            const encoder = new ZipFile();
            const originalEntries = this.currentZip.entries;
            
            for (const entry of originalEntries) {
                if (entry.isDir) {
                    encoder.addFolder(entry.filename);
                    continue;
                }
                
                let data;
                if (this.currentZip.modifications.has(entry.filename)) {
                    const content = this.currentZip.modifications.get(entry.filename);
                    // Encode string to Uint8Array if needed
                    data = new TextEncoder().encode(content);
                } else {
                    const blob = await entry.getData();
                    data = await blob.arrayBuffer();
                    data = new Uint8Array(data);
                }
                
                encoder.addFile(entry.filename, data);
            }
            
            const newBlob = encoder.build();
            
            const zipTab = State.tabs.find(t => t.id === this.currentZip.tabId);
            if (zipTab) {
                await import('../tabs/persistence.js').then(m => m.TabsPersistence.save({ ...zipTab, content: newBlob }, Tabs));
            }
            
        } catch(e) {
            console.error(e);
            UI.showToast("Failed to save ZIP: " + e.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    async extractAll() {
        if (!this.currentZip || !this.currentZip.sourceItem) return;
        
        const sourceItem = this.currentZip.sourceItem;
        const parentPath = sourceItem.path.substring(0, sourceItem.path.lastIndexOf('/')) || '/';
        const zipName = sourceItem.name.replace(/\.zip$/i, '');
        const targetFolderName = await UI.showDialog({
            title: "Extract All",
            message: `Extract to folder "${zipName}"?`,
            hasInput: true,
            inputValue: zipName, // B"H - Assuming dialog supports this, if not it will just be text
            okText: "Extract",
            cancelText: "Cancel"
        });

        if (!targetFolderName) return;

        UI.showLoading("Extracting archive...");
        try {
            // 1. Create Target Directory
            // We need to construct a "directory" item to pass to create/write
            const workspace = State.workspaces.find(ws => ws.id === sourceItem.workspaceId);
            if (!workspace) throw new Error("Workspace not found.");

            const parentDirItem = { ...workspace, path: parentPath, kind: 'directory' };
            
            // Check existence logic could be here, but FileSystemProvider.create usually handles it or throws
            // B"H - Create the root extraction folder
            try {
                await FileSystemProvider.create(parentDirItem, targetFolderName, 'directory');
            } catch(e) {
                // If it exists, we might want to ask to overwrite, but for now we proceed/merge
                console.warn("Folder might exist, merging...", e);
            }

            const targetRootPath = parentPath === '/' ? `/${targetFolderName}` : `${parentPath}/${targetFolderName}`;
            const targetRootItem = { ...workspace, path: targetRootPath, kind: 'directory' };

            // 2. Iterate Entries
            for (const entry of this.currentZip.entries) {
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
                        try {
                            await FileSystemProvider.create({ ...workspace, path: currentPathAccum, kind: 'directory' }, dir, 'directory');
                        } catch(e) {/* ignore exists */}
                        currentPathAccum = nextPath;
                    }
                    currentDir = { ...workspace, path: currentPathAccum, kind: 'directory' };
                }

                if (!entry.isDir) {
                    // Write File
                    const blob = await entry.getData();
                    const arrayBuffer = await blob.arrayBuffer();
                    const fileItem = { ...workspace, path: `${currentDir.path}/${fileName}`, kind: 'file' };
                    await FileSystemProvider.write(fileItem, arrayBuffer);
                }
            }
            
            UI.showToast("Extraction complete!", "success");
            await Workspaces.refreshNode(parentDirItem);

        } catch (e) {
            console.error(e);
            UI.showToast("Extraction failed: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    }
};