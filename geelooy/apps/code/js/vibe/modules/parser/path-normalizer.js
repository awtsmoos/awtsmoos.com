
// B"H
/**
 * @file path-normalizer.js
 * @brief The Aligner of Coordinates.
 * Ensures the abstract paths from the AI map perfectly to the physical workspace root.
 */

export const PathNormalizer = {
    /**
     * @function normalize
     * @description Weaves the root path and the relative file path into a unified absolute path.
     * @param {string} root - The base coordinate.
     * @param {string} file - The relative file coordinate.
     * @returns {string} The pure absolute path.
     */
    normalize(root, file) {
        const r = (root || "/").replace(/\\/g, '/');
        const f = (file || "").replace(/\\/g, '/');

        const rootSegs = r.split('/').filter(p => p && p !== 'undefined');
        const fileSegs = f.split('/').filter(p => p && p !== 'undefined');
        
        let isAlreadyAnchored = false;
        if (fileSegs.length >= rootSegs.length) {
            isAlreadyAnchored = true;
            for (let i = 0; i < rootSegs.length; i++) {
                if (fileSegs[i] !== rootSegs[i]) {
                    isAlreadyAnchored = false;
                    break;
                }
            }
        }

        const finalSegs = isAlreadyAnchored ? fileSegs : rootSegs.concat(fileSegs);
        const result = '/' + finalSegs.join('/');
        
        return result.replace(/\/+/g, '/');
    }
};
