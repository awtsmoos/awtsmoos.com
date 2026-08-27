
// B"H
/**
 * @file IdentityCaster.js
 * @brief The Casting of the Unique Name.
 * 
 * THE POEM OF THE TRUE NAME:
 * To find a world, one must know its true name,
 * Not just the label, or the physical frame.
 * We cast the Seal of Identity deep,
 * To wake the memories that the database may keep.
 */

import { WorkspaceIdentity } from '../../../../core/identity/WorkspaceIdentity.js';

/**
 * @class IdentityCaster
 * @description Generates the absolute canonical ID for a folder session.
 */
export class IdentityCaster {
    /**
     * B"H - Casts the unbreakable unique path for the folder.
     * @param {Object} item - The directory item.
     * @returns {string} The ID.
     */
    static cast(item) {
        return WorkspaceIdentity.getUniquePath(item);
    }
}
