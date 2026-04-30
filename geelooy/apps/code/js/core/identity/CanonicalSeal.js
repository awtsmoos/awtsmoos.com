
/**
 * @file CanonicalSeal.js
 * @brief Forging unbreakable identity by weaving Intent with Coordinate.
 */
export const CanonicalSeal = {
    /**
     * B"H - Casts the absolute unique fingerprint for a digital vessel.
     * @param {Object} item - The data vessel.
     * @param {string} intent - The perspective (editor, vibe, preview, etc).
     */
    cast(item, intent = 'editor') {
        if (!item) return `void::${Date.now()}::${Math.random()}`;

        const dimension = (item.originalType ?? item.type ?? 'unmanifested').toLowerCase();
        const worldId = String(item.workspaceId ?? item.id ?? 'prime-void');

        let path = (item.path ?? '/').replace(/\\/g, '/');
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        if (item.type === 'zip-entry') {
            return `intent[${intent}]::dim[zip]::parent[${item.zipTabId}]::path[${path}]`;
        }

        // B"H - THE FOURFOLD SEAL: Intent + Dimension + World + Path
        return `intent[${intent}]::realm[${dimension}]::world[${worldId}]::coord[${path}]`;
    }
};
