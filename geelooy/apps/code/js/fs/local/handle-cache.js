
// B"H
/**
 * @file handle-cache.js
 * @brief Aggressive Lightning-Fast Memory Registry for Filesystem Handles.
 * 
 * THE POEM OF THE ARCHIVE OF LIGHT:
 * The OS holds the file, but the journey there is slow,
 * Re-walking every directory takes time to let it flow.
 * But here within the RAM, we hold the spark inside,
 * A direct link to the Awtsmoos, with nothing left to hide.
 * Instantaneous writing, instantaneous sight,
 * The handle cache illuminates the dark and heavy night!
 * 
 * Every node we discover through Seder Hishtalshelus is cached, meaning 
 * sub-files require ZERO path traversal after the first read/write.
 */

export const HandleCache = {
    _cache: new Map(),

    /**
     * B"H
     * Retrieves the physical handle instantly from RAM.
     * @param {string|number} workspaceId - The World ID.
     * @param {string} path - The Coordinate.
     * @returns {FileSystemHandle|undefined}
     */
    get(workspaceId, path) {
        return this._cache.get(`${workspaceId}::${path}`);
    },

    /**
     * B"H
     * Burns the handle into memory for instant future access.
     */
    set(workspaceId, path, handle) {
        this._cache.set(`${workspaceId}::${path}`, handle);
    },

    /**
     * B"H
     * Forgets the handle if the file is deleted or lost.
     */
    remove(workspaceId, path) {
        this._cache.delete(`${workspaceId}::${path}`);
    },

    /**
     * B"H
     * Clears the entire registry.
     */
    clear() {
        this._cache.clear();
    }
};
