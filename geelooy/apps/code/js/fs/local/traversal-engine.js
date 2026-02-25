
// B"H
/**
 * @file traversal-engine.js
 * @brief The Seder Hishtalshelus of the File System.
 * 
 * THE BALLAD OF THE DESCENDING LIGHT:
 * From the root of the world, we begin the descent,
 * Through every segment where the handle is sent.
 * If a branch should be missing or the path be obscured,
 * By this ritual of finding, the truth is ensured.
 * Step after step, from the start to the end,
 * Manifesting the vessels on which we depend.
 * The Awtsmoos defines the order and space,
 * We simply follow to the designated place.
 */

/**
 * @class TraversalEngine
 * @description Logic for walking the physical directory tree. 
 * It transforms a string path into a living FileSystemHandle.
 */
export const TraversalEngine = {
    /**
     * @async
     * @function walk
     * @description Navigates from a base directory handle down to a specific target path.
     * @param {FileSystemDirectoryHandle} root - The starting directory.
     * @param {string} path - The relative or absolute path to find.
     * @param {object} options - Configuration for the walk.
     * @param {string} options.kind - 'file' or 'directory'.
     * @param {boolean} options.create - Whether to create missing vessels.
     * @returns {Promise<FileSystemHandle>} The target handle.
     */
    async walk(root, path, options = { kind: 'directory', create: false }) {
        const segments = path.split("/").filter(s => s !== "");
        let current = root;

        for (let i = 0; i < segments.length; i++) {
            const part = segments[i];
            const isLast = (i === segments.length - 1);
            
            if (isLast && options.kind === 'file') {
                current = await current.getFileHandle(part, { create: options.create });
            } else {
                current = await current.getDirectoryHandle(part, { create: options.create });
            }
        }
        return current;
    }
};
