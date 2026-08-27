// B"H
/**
 * @file zip/state.js
 * @brief Persists and refreshes in-editor ZIP vessel state.
 */
import { ZipReader } from '/scripts/awtsmoos/zip/decoder.js';

export const ZipState = {
    /**
     * Retrieves the zip state attached to a tab, or initializes it if missing.
     *
     * @param {object} tab Editor tab with raw blob content.
     * @returns {Promise<object>} Zip state.
     */
    async getOrInit(tab) {
        if (!tab.zipState) {
            const blob = tab.rawContent;
            if (!blob) throw new Error("No content available for Zip state initialization.");

            const reader = new ZipReader();
            await reader.load(blob);

            tab.zipState = {
                reader,
                entries: reader.getEntries(),
                modifications: new Map(),
                newEntries: new Map(),
                deletedPaths: new Set(),
                tabId: tab.id,
                sortColumn: 'name',
                sortAsc: true
            };
        }
        return tab.zipState;
    },

    /**
     * Refreshes the zip state after a save operation.
     *
     * @param {object} tab Editor tab.
     * @param {Blob} newBlob New zip blob.
     * @returns {Promise<void>}
     */
    async refresh(tab, newBlob) {
        if (!tab.zipState) return;

        const reader = new ZipReader();
        await reader.load(newBlob);

        tab.zipState.reader = reader;
        tab.zipState.entries = reader.getEntries();

        tab.zipState.modifications.clear();
        tab.zipState.newEntries.clear();
        tab.zipState.deletedPaths.clear();
    },

    /**
     * Builds displayable entry state with deletions and new entries merged.
     *
     * @param {object} state Zip state.
     * @returns {Array<object>} Display entries.
     */
    getDisplayEntries(state) {
        if (!state) return [];

        const entries = state.entries.filter(e => !state.deletedPaths.has(e.filename));

        state.newEntries.forEach((info, filename) => {
            if (!state.deletedPaths.has(filename)) {
                entries.push({
                    filename,
                    isDir: info.isDir,
                    uncompressedSize: 0,
                    compressedSize: 0,
                    getData: async () => new Blob([''])
                });
            }
        });

        return entries;
    }
};
