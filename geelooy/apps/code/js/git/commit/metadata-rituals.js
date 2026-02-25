
// B"H
// FILE: js/git/commit/metadata-rituals.js

import { FileSystemProvider } from '../../fs-provider.js';

/**
 * @class MetadataRituals
 * @description Managing the 'Ikar' (Essence).
 * 
 * THE POEM OF THE IKAR:
 * Deep within the project resides a hidden name,
 * The .awtsmoos-repo folder, the repository's frame.
 * Inside is the ikar.js, the scroll of what's true,
 * It links the local vessels to the GitHub view.
 * We must write this carefully, with identity locked,
 * Lest the filesystem's gateway remain forever blocked.
 */
export const MetadataRituals = {
    /**
     * @async
     * @function updateLocalAnchor
     * @description B"H. Re-writes the ikar.js file with the new SHA 
     * and tree, while strictly preserving the item's originalType.
     */
    async updateLocalAnchor(contextItem, gitInfo, newCommitSHA) {
        const ikarData = { 
            ...gitInfo, 
            baseCommitSHA: newCommitSHA, 
            remoteTree: gitInfo.remoteTree,
            isClone: true 
        };

        const root = contextItem.path.replace(/\/+$/, "") || "/";
        const ikarPath = `${root}/.awtsmoos-repo/ikar.js`;
        
        const ikarItem = { 
            ...contextItem, 
            path: ikarPath, 
            kind: 'file',
            type: contextItem.originalType || contextItem.type,
            originalType: contextItem.originalType || contextItem.type
        };

        console.log(`[GitRitual] B"H Manifesting Ikar at: ${ikarPath}`);
        
        const content = `// B"H\nconst ikar = ${JSON.stringify(ikarData, null, 4)};`;
        await FileSystemProvider.write(ikarItem, content);
    }
};
