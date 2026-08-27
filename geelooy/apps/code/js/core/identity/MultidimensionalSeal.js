
// B"H
/**
 * @file MultidimensionalSeal.js
 * @brief THE ARCHETYPE OF UNIQUE IDENTITY.
 */

export const MultidimensionalSeal = {
    /**
     * @function cast
     * @description Generates the absolute canonical identifier for any digital entity.
     * @param {object} item - The vessel seeking identity.
     * @returns {string} The SEAL: [REALM]::[WORLD_ID]::[COORDINATE]
     */
    cast(item) {
        if (!item) return `void-spark-${Date.now()}`;

        if (item.type === 'zip-entry') {
            return `zip-realm::parent[${item.zipTabId}]::path[${item.path}]`;
        }

        const worldId = String(item.workspaceId ?? item.id ?? 'prime-void');
        const realmDimension = (item.originalType ?? item.type ?? 'unformed').toLowerCase();
        let path = (item.path ?? '/').replace(/\\/g, '/');
        
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        return `${realmDimension}::${worldId}::${path}`;
    }
};
