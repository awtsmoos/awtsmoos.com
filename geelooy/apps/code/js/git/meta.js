
// B"H
// FILE: js/git/meta.js

import { FileSystemProvider } from '../fs-provider.js';

export const GitMetaProvider = {
    _gitInfoCache: new Map(), // workspaceId -> gitInfo

    /**
     * Safely reads and parses the .awtsmoos-repo/ikar.js file from a folder.
     * Caches the result to improve performance on subsequent calls.
     * @param {object} folderItem - The item representing the folder to check.
     * @returns {Promise<object|null>} - The Git metadata object, or null if not found.
     */
    async getGitInfoForFolder(folderItem) {
        if (folderItem.type === 'github') {
            return null;
        }

        const workspaceId = folderItem.workspaceId || folderItem.id;
        // If we are checking the root of a workspace, try cache
        if (folderItem.path === '/' && this._gitInfoCache.has(workspaceId)) {
            return this._gitInfoCache.get(workspaceId);
        }

        // B"H - Path normalization to avoid double slashes
        const basePath = folderItem.path === '/' ? '' : folderItem.path;
        const ikarFilePath = `${basePath}/.awtsmoos-repo/ikar.js`;

        const ikarFileItem = { ...folderItem, path: ikarFilePath, kind: 'file' };

        console.log(`[GitMeta] Checking for repo at: ${ikarFilePath}`);

        try {
            const content = await FileSystemProvider.read(ikarFileItem);
            
            let textContent = (content instanceof Blob) ? await content.text() : content;
            if (!textContent) {
                console.warn(`[GitMeta] ikar.js found but empty or unreadable at ${ikarFilePath}`);
                return null;
            }

            const objectStartIndex = textContent.indexOf('{');
            const objectEndIndex = textContent.lastIndexOf('}');
            if (objectStartIndex === -1 || objectEndIndex === -1 || objectEndIndex < objectStartIndex) {
                console.warn(`[GitMeta] ikar.js content invalid format at ${ikarFilePath}`);
                return null;
            }
            const jsonText = textContent.slice(objectStartIndex, objectEndIndex + 1);
            
            const gitInfo = JSON.parse(jsonText);
            if (gitInfo && gitInfo.isClone === true) {
                console.log(`[GitMeta] Repository confirmed at ${basePath || '/'}`);
                // Cache it if it's the root
                if (folderItem.path === '/') {
                    this._gitInfoCache.set(workspaceId, gitInfo);
                }
                return gitInfo;
            } else {
                console.warn(`[GitMeta] ikar.js parsed but isClone is not true.`);
                return null;
            }

        } catch (e) {
            console.warn(`[GitMeta] Read failed for ${ikarFilePath}:`, e.message);
            
            // B"H - Diagnostic: Try to list the parent to see if .awtsmoos-repo is even visible
            // This often catches issues where the browser hides dot-folders.
            try {
                const parentPath = basePath || '/';
                console.log(`[GitMeta] Diagnostic: Listing ${parentPath} to check for .awtsmoos-repo existence...`);
                
                // Use a shallow copy to avoid mutating the original item during listing
                const parentItem = { ...folderItem, path: parentPath, kind: 'directory' };
                const children = await FileSystemProvider.list(parentItem);
                
                const repoDir = children.find(c => c.name === '.awtsmoos-repo');
                if (repoDir) {
                    console.log(`[GitMeta] .awtsmoos-repo EXISTS in listing. Read failure likely due to permission or locking.`);
                } else {
                    console.warn(`[GitMeta] .awtsmoos-repo NOT FOUND in listing of ${parentPath}.`);
                }
            } catch (listErr) {
                console.error(`[GitMeta] Diagnostic listing failed:`, listErr);
            }
            
            return null;
        }
    },
    
    // Call this when Git Init or Clone happens
    clearCache(workspaceId) {
        this._gitInfoCache.delete(workspaceId);
    }
};
