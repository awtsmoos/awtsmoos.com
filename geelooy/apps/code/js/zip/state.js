// B"H
// FILE: js/zip/state.js

import { ZipReader } from '/scripts/awtsmoos/zip/decoder.js';

export const ZipState = {
    /**
     * Retrieves the zip state attached to a tab, or initializes it if missing.
     * This ensures state persists when switching tabs.
     */
    async getOrInit(tab) {
        if (!tab.zipState) {
            const blob = tab.rawContent;
            if (!blob) throw new Error("No content available for Zip initialization.");
            
            const reader = new ZipReader();
            await reader.load(blob);
            
            tab.zipState = {
                reader,
                entries: reader.getEntries(),
                modifications: new Map(), // filename -> content (Blob/String)
                newEntries: new Map(),    // filename -> { isDir: boolean }
                deletedPaths: new Set(),  // filenames marked for deletion
                tabId: tab.id,
                sortColumn: 'name',
                sortAsc: true
            };
        }
        return tab.zipState;
    },
    
    /**
     * Refreshes the state after a save operation (reloading from the new blob).
     */
    async refresh(tab, newBlob) {
        if (!tab.zipState) return;
        
        const reader = new ZipReader();
        await reader.load(newBlob);
        
        tab.zipState.reader = reader;
        tab.zipState.entries = reader.getEntries();
        
        // Clear pending changes as they are now baked into the blob
        tab.zipState.modifications.clear();
        tab.zipState.newEntries.clear();
        tab.zipState.deletedPaths.clear();
    },

    getDisplayEntries(state) {
        if (!state) return [];
        
        // 1. Start with original entries, excluding deleted ones
        const entries = state.entries.filter(e => !state.deletedPaths.has(e.filename));
        
        // 2. Add new entries
        state.newEntries.forEach((info, filename) => {
            // Ensure not marked deleted
            if (!state.deletedPaths.has(filename)) {
                entries.push({
                    filename: filename,
                    isDir: info.isDir,
                    uncompressedSize: 0,
                    compressedSize: 0,
                    // Mock getData for new files
                    getData: async () => new Blob(['']) 
                });
            }
        });
        
        return entries;
    }
};