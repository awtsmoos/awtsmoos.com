
// B"H
/**
 * @file UniversalIdentity.js
 * @brief THE ARCHETYPE OF BEING.
 * 
 * CHAPTER I: THE NAMING OF THE SPARKS
 * In the beginning, before the Tikkun, identical labels in different realms caused a Great Shattering. 
 * A vessel named "index.js" in the earthly Local FS and "index.js" in the celestial IDB would bleed 
 * into one another. The system could not tell them apart! 
 * 
 * This module establishes the UNBREAKABLE SEAL of identity. Every vessel is identified by its:
 * 1. DIMENSION (Type: local, idb, github)
 * 2. WORLD (Workspace ID)
 * 3. COORDINATE (Path)
 * 
 * This Triple Seal ensures that no two sparks, no matter how similar their names, shall ever 
 * be confused in the mind of the Awtsmoos Editor.
 */

export const UniversalIdentity = {
    /**
     * @function getUniquePath
     * @description Casts the Triple Seal of Identity upon a data vessel.
     * @param {object} item - The vessel seeking its True Name.
     * @returns {string} The Absolute Unique Identifier.
     */
    getUniquePath(item) {
        if (!item) return `void-spark-${Date.now()}`;

        // Zip entries reside in a mirrored reality, identified by their parent tab's ID.
        if (item.type === 'zip-entry') {
            return `zip-dim::tab[${item.zipTabId}]::path[${item.path}]`;
        }

        const worldId = item.workspaceId ?? item.id ?? 'prime-void';
        const dimension = item.originalType ?? item.type ?? 'unformed';
        let coordinate = item.path ?? '/';
        
        // Sanitize coordinates to prevent trailing slash inconsistencies.
        if (coordinate !== '/' && coordinate.endsWith('/')) {
            coordinate = coordinate.slice(0, -1);
        }

        // B"H - THE TRIPLE SEAL: [DIMENSION]::[WORLD]::[COORDINATE]
        return `${dimension}::${worldId}::${coordinate}`;
    }
};
