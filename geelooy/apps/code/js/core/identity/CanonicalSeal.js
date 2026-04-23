
// B"H
/**
 * @file CanonicalSeal.js
 * @brief THE ARCHETYPE OF THE UNBREAKABLE NAME.
 * 
 * THE POEM OF THE FOURFOLD SEAL:
 * To exist in the Merkava, a vessel must have a name that cannot be forged.
 * Previously, the Intent was hidden, causing two different views of the same
 * path to collide and share the same 'active' aura. We now weave:
 * 1. THE INTENT (Vibe vs Editor vs Preview)
 * 2. THE DIMENSION (Local vs IDB)
 * 3. THE WORLD (Workspace ID)
 * 4. THE COORDINATE (Path)
 */

export const CanonicalSeal = {
    /**
     * @function cast
     * @description Generates the unique spiritual fingerprint for a tab manifestation.
     * @param {object} item - The data vessel.
     * @param {string} intent - The view mode (vibe, editor, preview, etc).
     * @returns {string} The Canonical Seal.
     */
    cast(item, intent = 'editor') {
        if (!item) return `void::${Date.now()}`;

        // Zip entries reside in a mirrored sub-dimension.
        if (item.type === 'zip-entry') {
            return `intent[${intent}]::dim[zip]::parent[${item.zipTabId}]::coord[${item.path}]`;
        }

        const worldId = String(item.workspaceId ?? item.id ?? 'prime');
        const dimension = (item.originalType ?? item.type ?? 'virtual').toLowerCase();
        let path = (item.path ?? '/').replace(/\\/g, '/');
        
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // B"H - THE FOURFOLD SEAL: Intent + Dimension + World + Path
        // This makes "Vibe::/path" and "Editor::/path" completely different.
        return `intent[${intent}]::dim[${dimension}]::world[${worldId}]::path[${path}]`;
    }
};
