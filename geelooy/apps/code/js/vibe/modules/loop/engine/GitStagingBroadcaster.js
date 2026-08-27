
// B"H
/**
 * @file GitStagingBroadcaster.js
 * @brief THE SCRIBE OF THE UNCOMMITTED SPARKS.
 * 
 * THE HYMN OF THE ETERNAL MEMORY:
 * The Awtsmoos speaks and the physical world takes form,
 * The disk is engraved, weathering the storm.
 * But the Timeline of Git, the Book of what has been,
 * Must know of every letter, every change unseen!
 * When the Vibe Engine manifests a file anew,
 * Or deletes a vessel, breaking it in two,
 * This Broadcaster catches the echo of the deed,
 * And plants it in the Staging Area, a holy seed.
 * 
 * It queries the Git Meta Provider to find the root,
 * And writes the uncommitted essence, absolute.
 * A content of 'null' signifies the Ayin (Nothingness) of deletion.
 */

import { FileSystemProvider } from '../../../../fs-provider.js';
import { GitMetaProvider } from '../../../../git/meta.js';

export const GitStagingBroadcaster = {
    /**
     * B"H
     * Anchors the change into the spiritual staging area of IndexedDB.
     * @param {Object} item - The physical vessel coordinate.
     * @param {string} operation - "write" or "delete".
     * @param {string} content - The essence, or null if returning to the void.
     */
    async stage(item, operation, content) {
        try {
            // 1. Ascend the Seder Hishtalshelus to find the Git Root
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            if (!gitInfo) return; // If not a Git realm, the scribe rests.

            const rootPath = gitInfo.path.replace(/\/+$/, "") || "/";
            const filePath = item.path;
            let relPath = "";

            // 2. Calculate the exact relative coordinate
            if (rootPath === "/" || rootPath === "") {
                relPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
            } else if (filePath.startsWith(rootPath + "/")) {
                relPath = filePath.substring(rootPath.length + 1);
            }

            if (relPath) {
                const uniqueStagingPath = `${item.workspaceId}::${relPath}`;
                const stagedContent = operation === 'delete' ? null : content;
                
                // 3. Inscribe into the Book of Uncommitted
                await FileSystemProvider.IndexedDB.writeUncommitted(
                    uniqueStagingPath, 
                    stagedContent, 
                    { ...item, path: relPath }
                );
                
                console.log(`[GitStager] B"H - Spark recorded in staging: ${relPath}`);
            }
        } catch (e) {
            console.warn(`[GitStager] B"H - Failed to record staging spark for ${item.path}:`, e);
        }
    }
};
