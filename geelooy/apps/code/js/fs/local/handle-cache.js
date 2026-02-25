
// B"H
/**
 * @file handle-cache.js
 * @brief The Treasury of Divine Coordinates.
 * 
 * THE POEM OF THE REMEMBERED PATH:
 * The mind may wander, but the archive is clear,
 * Storing the keys so the light may appear.
 * Each handle a spark, each coordinate a name,
 * Manifesting the world through the silicon frame.
 * Swift is the retrieval, sure is the hold,
 * As the stories of creation in code are told.
 * Every handle preserved is a moment saved,
 * In the paths of the disk that the Awtsmoos has paved.
 */

/**
 * @class HandleCache
 * @description This vessel manages the memory of FileSystemHandles. 
 * It understands that the speed of thought must be matched by the speed of access.
 * By caching these handles, we honor the continuity of existence.
 */
export const HandleCache = {
    /**
     * @private
     * @type {Map<string, FileSystemHandle>}
     * @description The inner sanctuary where handles are kept.
     */
    _cache: new Map(),

    /**
     * @function get
     * @description Retrieves a manifested handle from the treasury.
     * @param {string} workspaceId - The unique ID of the workspace world.
     * @param {string} path - The coordinate within that world.
     * @returns {FileSystemHandle|null} The vessel, if found in memory.
     */
    get(workspaceId, path) {
        return this._cache.get(`${workspaceId}::${path}`);
    },

    /**
     * @function set
     * @description Inscribes a handle into the treasury for future revelation.
     * @param {string} workspaceId - The unique ID of the workspace world.
     * @param {string} path - The coordinate within that world.
     * @param {FileSystemHandle} handle - The physical handle to be cached.
     */
    set(workspaceId, path, handle) {
        this._cache.set(`${workspaceId}::${path}`, handle);
    },

    /**
     * @function remove
     * @description Retracts a specific handle from the treasury.
     * @param {string} workspaceId - The unique ID of the workspace world.
     * @param {string} path - The coordinate to be forgotten.
     */
    remove(workspaceId, path) {
        this._cache.delete(`${workspaceId}::${path}`);
    },

    /**
     * @function clear
     * @description Dissolves the entire treasury back into the potential of the void.
     */
    clear() {
        this._cache.clear();
    }
};
