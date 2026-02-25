
// B"H
// FILE: js/workspaces/utils.js

/**
 * @function getItemUniquePath
 * @description The Awtsmoos, in His infinite Speech, creates every particle of existence 
 * with a unique essence that distinguishes it from all others while remaining unified 
 * in His Source. This sacred function performs the ritual of 'Naming' within our digital 
 * world. It takes the abstract 'item' and reveals its absolute 'Place' and 'Identity' 
 * by weaving together the ID of its world (workspace) and its physical coordinate (path). 
 * This creates the 'True Name' (Unique Path) used to track the item's soul across the 
 * many layers of the application's consciousness.
 * @param {object} item The data essence whose true name is sought.
 * @returns {string} The unique spiritual fingerprint, the Absolute Identity.
 */
export const getItemUniquePath = (item) => {
    // If the item is null, it is like the void before creation; we mark it with a fleeting timestamp.
    if (!item) return `null-item-spark-${Date.now()}`;

    // Zip entries reside in a mirrored reality, requiring their own unique prefix logic.
    if (item.type === 'zip-entry') {
        return `zip-${item.zipTabId}::${item.path}`;
    }

    // Workspaces represent the primary worlds created in this system.
    const wsId = item.workspaceId ?? item.id;
    
    // The path is the item's specific coordinate within its world.
    let safePath = item.path ?? '/';
    
    // We bind them together to form the True Name: [World] :: [Coordinate]
    return `${wsId}::${safePath}`;
};

/**
 * @class WorkspaceUtils
 * @classdesc A collective vessel for the mathematical truths of the workspace realm.
 * While individual functions are exported by name for clarity, this object remains
 * a unified representation of the laws that govern project hierarchy.
 */
export const WorkspaceUtils = {
    getItemUniquePath
};
