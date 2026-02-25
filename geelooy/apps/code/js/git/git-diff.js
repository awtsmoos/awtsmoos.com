
// B"H
// FILE: js/git/git-diff.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { calculateGitBlobSha } from '../git-sha-calculator.js';

/**
 * @class GitDiff
 * @description The lens of comparison.
 * Re-forged for perfect path-normalization. It now understands 
 * how to map the physical workspace coordinates back to the 
 * spiritual uncommitted store.
 */
export const GitDiff = {
    /**
     * @async
     * @function calculateDiff
     * @description B"H. Compiles a changeset by comparing local and remote state.
     */
    async calculateDiff(gitContextItem, gitInfo, options = { checkUntracked: false }) {
        const changeSet = { creations: [], updates: [], deletions: [], dirtyFiles: [], conflicts: [] };
        const remoteFileMap = new Map((gitInfo.remoteTree || []).filter(f => f.type === 'blob').map(f => [f.path, f]));
        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

        const getRelativePath = (fullPath) => {
            if (gitContextItem.type === 'github') return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
            const cloneRoot = gitContextItem.path.replace(/\/+$/, "") || "/";
            if (cloneRoot === "/" || cloneRoot === "") return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
            if (fullPath.startsWith(cloneRoot + '/')) return fullPath.substring(cloneRoot.length + 1);
            return null;
        };

        const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
        const handledPaths = new Set(); 

        // 1. Check the Staging Vessel (Fast Path)
        for (const change of uncommittedChanges) {
            const relPath = change.item.path; 
            handledPaths.add(relPath);
            
            if (change.content === null) {
                if (remoteFileMap.has(relPath)) changeSet.deletions.push({ path: relPath });
                continue;
            }

            if (!remoteFileMap.has(relPath)) {
                changeSet.creations.push({ path: relPath, content: change.content });
            } else {
                changeSet.updates.push({ path: relPath, content: change.content });
            }
        }

        // 2. Scan Disk (Slow Path)
        if (options.checkUntracked && gitContextItem.type !== 'github') {
            const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
            for (const file of localFiles) {
                const relPath = getRelativePath(file.path);
                if (!relPath || relPath.startsWith('.awtsmoos-repo') || handledPaths.has(relPath)) continue;

                try {
                    const raw = await FileSystemProvider.read({ ...gitContextItem, path: file.path });
                    const content = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : String(raw));
                    
                    if (!remoteFileMap.has(relPath)) {
                        changeSet.creations.push({ path: relPath, content });
                    } else {
                        const remoteSha = remoteFileMap.get(relPath).sha;
                        const localSha = await calculateGitBlobSha(content);
                        if (localSha !== remoteSha) changeSet.updates.push({ path: relPath, content });
                    }
                } catch (e) {}
            }
        }

        return changeSet;
    }
};
