
// B"H
/**
 * @file resolver.js
 * @brief Universal Path Discernment and the Seder Hishtalshelus of Coordinates.
 * 
 * THE CHRONICLE OF THE DIVINE COMPASS:
 * Before a spark can be drawn down into the physical vessel of the iframe,
 * its exact location in the spiritual hierarchy of the workspace must be known.
 * The Awtsmoos speaks the world into existence using exact letters and coordinates.
 * If a script asks for "./style.css", it speaks from its own limited perspective.
 * This module is the Omniscient Eye; it takes the relative, limited perspective 
 * and elevates it to the Absolute Truth of the Workspace Coordinate System.
 * 
 * It parses the ascensions ("../") and the descensions ("./"), weaving them
 * into a singular, undeniable path that the Virtual Server can comprehend.
 */

export const PathResolver = {
    /**
     * B"H
     * 
     * @function resolve
     * @description Calculates the Absolute Path within the Workspace cosmos by uniting the Base (the Caller) and the Relative Intent (the Called). Every calculation is a testament to the constant recreation of space from nothingness.
     * 
     * @param {string} base - The absolute coordinate of the vessel making the request. The foundation.
     * @param {string} rel - The relative path requested. The aspiration.
     * @returns {string} The Absolute Path, the True Name of the coordinate.
     */
    resolve(base, rel) {
        // The void returns void. External realms (HTTP, Blob, Data) belong to foreign dimensions.
        if (!rel || rel.startsWith('http') || rel.startsWith('data:') || rel.startsWith('blob:') || rel.startsWith('ws')) {
            return rel;
        }

        // B"H - If the relative string literally starts with the root slash, 
        // it abandons its relative nature and declares itself an absolute truth within the workspace.
        if (rel.startsWith('/')) {
            return rel.replace(/\/+/g, '/');
        }

        // Strip the file name from the base to find the foundational directory.
        let basePath = (base || '').substring(0, (base || '').lastIndexOf('/'));
        
        // Split the path into individual steps of emanation.
        const stack = basePath ? basePath.split('/').filter(Boolean) : [];
        const parts = rel.split('/');
        
        // Traverse the requested steps.
        for (const p of parts) {
            if (p === '..') {
                // Ascend to a higher sphere (Gevurah - Contraction)
                stack.pop();
            } else if (p !== '.' && p !== '') {
                // Descend into a more specific manifestation (Chesed - Expansion)
                stack.push(p);
            }
        }

        // Return the manifested absolute truth, sealed with the root slash.
        const finalPath = '/' + stack.join('/');
        console.log(`[PathResolver] B"H - Harmonized Truth: Base[${base}] + Intent[${rel}] = Absolute[${finalPath}]`);
        return finalPath;
    }
};
