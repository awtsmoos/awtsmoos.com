
// B"H
/**
 * @file path-resolver.js
 * @brief The instrument of discernment for absolute and relative paths.
 * 
 * THE POEM OF THE COORDINATE:
 * In the world of the project, every vessel has a place.
 * A label like './js/main.js' is a direction from a starting point.
 * If we do not know the starting point, the direction leads to void.
 * This class calculates the Absolute Path, the True Name, 
 * by combining the parent's location with the relative direction.
 * It follows the Seder Hishtalshelus from the root down to the leaf.
 */
export const PathResolver = {
    /**
     * @function resolve
     * @description B"H. Computes the absolute workspace path from a base and a relative label.
     * @param {string} base The absolute path of the calling vessel.
     * @param {string} rel The relative direction provided in the code.
     * @returns {string} The Absolute Path within the Workspace cosmos.
     */
    resolve(base, rel) {
        // Return external realms immediately
        if (!rel || rel.startsWith('http') || rel.startsWith('data:') || rel.startsWith('blob:')) {
            return rel;
        }

        // Treat absolute paths as relative to the workspace root for safety
        if (rel.startsWith('/')) return rel;
        
        // Find the parent directory of the caller
        let basePath = base.substring(0, base.lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(Boolean) : [];
        const parts = rel.split('/');
        
        // Iterate through the relative instructions
        for (const p of parts) {
            if (p === '..') {
                // Ascend to a higher sphere
                stack.pop();
            } else if (p !== '.') {
                // Descend into a more specific manifestation
                stack.push(p);
            }
        }

        // Return the manifested absolute truth
        const finalPath = '/' + stack.join('/');
        console.log(`[PathResolver] Resolved: ${base} + ${rel} -> ${finalPath}`);
        return finalPath;
    }
};
