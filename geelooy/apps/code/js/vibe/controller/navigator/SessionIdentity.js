
// B"H
/**
 * @file SessionIdentity.js
 * @brief The Casting of the Unique Name.
 * 
 * THE POEM OF THE TRUE NAME:
 * To find a world, one must know its true name,
 * Not just the label, or the physical frame.
 * We cast the Seal of Identity deep,
 * To wake the memories that the database may keep.
 * From the workspace and the path, a signature is born,
 * Shining like the light of a new-created morn.
 */

import { WorkspaceIdentity } from '../../../core/identity/WorkspaceIdentity.js';

/**
 * @class SessionIdentity
 * @description Generates the absolute canonical ID for a folder session.
 */
export class SessionIdentity {
    /**
     * B"H - Casts the unbreakable unique path for the folder.
     * @param {Object} item - The directory item.
     * @returns {string} The ID.
     */
    static cast(item) {
        return WorkspaceIdentity.getUniquePath(item);
    }
}
