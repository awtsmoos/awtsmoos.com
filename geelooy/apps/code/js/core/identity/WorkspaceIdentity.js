
// B"H
/**
 * @file WorkspaceIdentity.js
 * @brief The Divine Calculus of Absolute Identity.
 * 
 * THE TRACTATE OF THE TRUE NAME:
 * The prior chaos arose when separate worlds (IndexedDB vs Local FS) named a folder
 * identically, intertwining their dimensions. We now cast the Triple Seal, ensuring
 * that [RealmType] :: [WorldID] :: [Coordinate] are permanently bound together.
 */

export const WorkspaceIdentity = {
    /**
     * @function getUniquePath
     * @description Calculates the irrevocable, multidimensional True Name of a vessel.
     */
    getUniquePath(item) {
        if (!item) return `null-spark-void-${Date.now()}`;
        if (item.type === 'zip-entry') return `zip-realm-${item.zipTabId}::${item.path}`;

        // B"H - Extracting the Tripartite Essence with optional chaining defenses
        const worldId = item.workspaceId ?? item.id ?? 'global-void';
        const realmType = item.originalType ?? item.type ?? 'unmanifested';
        let physicalCoordinate = item.path ?? '/';
        
        if (physicalCoordinate !== '/' && physicalCoordinate.endsWith('/')) {
            physicalCoordinate = physicalCoordinate.slice(0, -1);
        }

        return `${realmType}::${worldId}::${physicalCoordinate}`;
    }
};
