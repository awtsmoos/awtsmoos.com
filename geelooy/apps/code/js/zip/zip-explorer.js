
// B"H
// FILE: js/zip/zip-explorer.js

import { UI } from '../ui.js';
import { State } from '../state.js';
import { ZipState } from './state.js';
import { ZipRenderer } from './render.js';
import { ZipOps } from './ops.js';

export const ZipExplorer = {
    // Current Zip is now tracked by the Active Tab's state
    get currentZip() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        return tab?.zipState;
    },
    
    async open(blob, tab) {
        UI.showLoading("Opening archive...");
        try {
            // B"H - Initialize or Retrieve State attached to Tab
            await ZipState.getOrInit(tab);
            this.render(tab);
        } catch(e) {
            console.error(e);
            UI.showToast("Failed to open ZIP: " + e.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    render(tab) {
        // If no tab provided, use active
        const targetTab = tab || State.tabs.find(t => t.id === State.activeTabId);
        if (!targetTab) return;
        ZipRenderer.render(targetTab, ZipOps);
    },

    // Delegate Operations
    async openEntry(entry) {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if(tab) await ZipOps.openEntry(tab, entry);
    },

    async createItem(kind) {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if(tab) await ZipOps.createItem(tab, kind);
    },

    async deleteItem(filename) {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if(tab) await ZipOps.deleteItem(tab, filename);
    },

    async saveZipToDisk() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if(tab) await ZipOps.save(tab);
    },

    async extractAll() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if(tab) await ZipOps.extractAll(tab);
    },

    // Called by TabsPersistence for sub-file updates
    updateEntry(subFileTab, content) {
        let zipTabId;
        
        // Handle both (tab, content) and legacy (filename, content) signatures for robustness
        if (typeof subFileTab === 'string') {
            // Legacy fallback: try to find tab by path
            const filename = subFileTab;
            const foundTab = State.tabs.find(t => t.item.path === filename && t.item.type === 'zip-entry');
            zipTabId = foundTab?.item?.zipTabId;
        } else {
            // Correct way: use the tab object
            zipTabId = subFileTab.item.zipTabId;
        }
        
        if (zipTabId) {
            const zipTab = State.tabs.find(t => t.id === zipTabId);
            if (zipTab) {
                const filename = typeof subFileTab === 'string' ? subFileTab : subFileTab.item.path;
                ZipOps.updateEntry(zipTab, filename, content);
            } else {
                console.warn("Parent Zip Tab not found for update.");
            }
        }
    },

    // B"H - Virtual FileSystem Interface for Provider routing
    fs: {
        async list(item) {
            const tab = State.tabs.find(t => t.id === item.zipTabId);
            if (!tab || !tab.zipState) throw new Error("Zip tab closed or invalid.");
            
            const entries = ZipState.getDisplayEntries(tab.zipState);
            const dirPath = item.path.endsWith('/') ? item.path.slice(0, -1) : item.path;
            
            const results = [];
            const prefix = dirPath ? dirPath + '/' : ''; 
            
            entries.forEach(e => {
                if (e.filename.startsWith(prefix) && e.filename !== prefix.slice(0, -1)) {
                    const relative = e.filename.substring(prefix.length);
                    if (!relative.includes('/')) {
                        results.push({
                            name: relative,
                            kind: e.isDir ? 'directory' : 'file',
                            path: e.filename,
                            type: 'zip-entry',
                            zipTabId: item.zipTabId,
                            workspaceId: 'zip'
                        });
                    } else if (e.isDir && relative.endsWith('/')) {
                         // Trailing slash directory handling
                         const cleanRel = relative.slice(0, -1);
                         if(!cleanRel.includes('/')) {
                             results.push({
                                name: cleanRel,
                                kind: 'directory',
                                path: e.filename,
                                type: 'zip-entry',
                                zipTabId: item.zipTabId,
                                workspaceId: 'zip'
                             });
                         }
                    }
                }
            });
            return results;
        },

        async read(item) {
            const tab = State.tabs.find(t => t.id === item.zipTabId);
            if (!tab || !tab.zipState) throw new Error("Zip tab closed.");
            
            // Check modifications
            if (tab.zipState.modifications.has(item.path)) {
                return tab.zipState.modifications.get(item.path);
            }
            
            // Check original entries
            const entry = tab.zipState.entries.find(e => e.filename === item.path);
            if (entry) {
                const blob = await entry.getData();
                return blob;
            }
            throw new Error("File not found in archive.");
        },

        async write(item, content) {
            const tab = State.tabs.find(t => t.id === item.zipTabId);
            if (!tab) throw new Error("Zip tab not found.");
            // B"H - Ensure no leading slash for internal zip paths
            const cleanPath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
            ZipOps.updateEntry(tab, cleanPath, content);
        },

        async create(parentDir, name, kind) {
            const tab = State.tabs.find(t => t.id === parentDir.zipTabId);
            if (!tab) throw new Error("Zip tab not found.");
            
            const newPath = parentDir.path ? `${parentDir.path}/${name}` : name;
            // Ensure no leading slash if parentDir.path was empty/undefined
            const cleanPath = newPath.startsWith('/') ? newPath.slice(1) : newPath;
            
            await ZipOps.createEntry(tab, cleanPath, kind);
        },

        async delete(item) {
            const tab = State.tabs.find(t => t.id === item.zipTabId);
            if (!tab) return;
            // Bypass UI confirmation
            ZipOps.deleteEntry(tab, item.path);
        }
    }
};
