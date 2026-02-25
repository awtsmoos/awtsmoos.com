
// B"H
/**
 * @file traversal-engine.js
 * @brief The Seder Hishtalshelus of the File System.
 * 
 * THE BALLAD OF THE DESCENDING LIGHT:
 * From the root of the world, we begin the descent,
 * Through every segment where the handle is sent.
 * If the path is a void, if the coordinate is null,
 * We remain at the source, where the potential is full.
 * By checking the word before we divide,
 * We ensure that the handle has nowhere to hide.
 */

/**
 * @class TraversalEngine
 * @description Recursively navigates the directory structure. 
 * Rectified to handle empty or undefined paths safely.
 */
export const TraversalEngine = {
    /**
     * @async
     * @function walk
     * @description Navigates from a base directory handle down to a specific target path.
     * @param {FileSystemDirectoryHandle} root - The starting directory.
     * @param {string} path - The coordinate to find.
     * @param {object} options - Configuration for the walk.
     * @returns {Promise<FileSystemHandle>}
     */
    async walk(root, path, options = { kind: 'directory', create: false }) {
        // B"H - Defensive Rectification: Default to empty string if path is void.
        const safePath = path || "";
        const segments = safePath.split("/").filter(s => s !== "");
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
