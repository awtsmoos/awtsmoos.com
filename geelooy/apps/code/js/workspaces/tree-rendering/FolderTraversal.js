
// B"H
/**
 * @file FolderTraversal.js
 * @brief Navigates the depths of the physical filesystem.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';

export const FolderTraversal = {
    /**
     * B"H - Retrieves the complete population of a directory.
     * @param {Object} parentItem - The vessel to explore.
     */
    async getChildren(parentItem) {
        const wsId = parentItem.workspaceId ?? parentItem.id;
        const ws = State.workspaces.find(w => String(w?.id) === String(wsId));
        
        // Merge workspace context for the physical read
        const fullParent = { ...ws, ...parentItem };
        
        try {
            const result = await FileSystemProvider.list(fullParent);
            const entries = result?.entries || [];
            
            // Mark Git roots visually
            if (result.isGitRoot) {
                window.dispatchEvent(new CustomEvent('awtsmoos-git-root-detected', { 
                    detail: { item: parentItem } 
                }));
            }

            // Sort by species then name
            return entries.sort((a, b) => {
                if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
            
        } catch (e) {
            throw e;
        }
    }
};
