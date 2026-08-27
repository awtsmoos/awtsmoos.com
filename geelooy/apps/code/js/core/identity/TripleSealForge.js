
// B"H
/**
 * @file TripleSealForge.js
 * @brief THE ARCHETYPE OF UNIQUE IDENTITY.
 */

export const TripleSealForge = {
    /**
     * @function cast
     * @description Generates the absolute canonical identifier for any digital entity.
     */
    cast(item) {
        if (!item) return `void-spark-${Date.now()}`;

        // Zip Archives exist in a mirrored sub-dimension.
        if (item.type === 'zip-entry') {
            return `realm[zip]::tab[${item.zipTabId}]::coord[${item.path}]`;
        }

        const worldId = String(item.workspaceId ?? item.id ?? 'prime-void');
        const realmDimension = (item.originalType ?? item.type ?? 'unformed').toLowerCase();
        let path = (item.path ?? '/').replace(/\\/g, '/');
        
        // Canonicalize paths: remove trailing slashes (except for root).
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // B"H - THE TRIPLE SEAL: [REALM]::[WORLD]::[PATH]
        return `${realmDimension}::${worldId}::${path}`;
    }
};
