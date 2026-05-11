
// B"H
/**
 * @file TraversalWisdom.js
 * @brief The sorting and retrieval logic for the Tree of Knowledge.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';

export const TraversalWisdom = {
    /**
     * B"H - Fetches and sorts children for a parent item.
     */
    async getChildren(parentItem) {
        if (!parentItem) return [];

        const wsId = parentItem.workspaceId ?? parentItem.id;
        const ws = State.workspaces.find(w => String(w?.id) === String(wsId));
        
        const fullParent = { ...ws, ...parentItem };

        try {
            const result = await FileSystemProvider.list(fullParent);
            const children = result?.entries || [];

            if (result.isGitRoot) {
                window.dispatchEvent(new CustomEvent('awtsmoos-git-root-detected', { 
                    detail: { item: parentItem } 
                }));
            }

            return children.sort((a, b) => {
                const aIsDir = a.kind === 'directory';
                const bIsDir = b.kind === 'directory';
                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;
                return (a.name || "").localeCompare(b.name || "");
            });

        } catch (e) {
            throw e;
        }
    }
};
