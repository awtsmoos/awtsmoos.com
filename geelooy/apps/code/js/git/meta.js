
// B"H
// FILE: js/git/meta.js

import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';

/**
 * @class GitMetaProvider
 * @description In the infinite expanses of the file system, certain directories 
 * are chosen as anchors for the timeline (Git repositories). This class 
 * performs the deep search required to find these anchors, even if the user 
 * is currently focused on a tiny leaf at the end of a long branch.
 */
export const GitMetaProvider = {
    _cache: new Map(),

    /**
     * @async
     * @function getGitInfoForFolder
     * @description Recursively ascends the directory tree, seeking the 
     * .awtsmoos-repo ritual marker which identifies a repository root.
     * @param {object} item The starting vessel for the search.
     */
    async getGitInfoForFolder(item) {
        if (!item) return null;
        if (item.type === 'github') return item; // Root identified

        const wsId = item.workspaceId || item.id;
        let currentPath = item.path;

        // B"H - Limit ascent to prevent infinite loops in broken trees
        let limit = 25; 
        while (limit-- > 0) {
            const cacheKey = `${wsId}::${currentPath}`;
            if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

            try {
                // Peek inside for the sacred metadata
                const ikarPath = `${currentPath === '/' ? '' : currentPath}/.awtsmoos-repo/ikar.js`;
                const ikarItem = { ...item, path: ikarPath, kind: 'file', workspaceId: wsId };
                
                const raw = await FileSystemProvider.read(ikarItem);
                const text = (raw instanceof Blob) ? await raw.text() : String(raw);
                
                // Extract the holy JSON data from the ikar.js vessel
                const start = text.indexOf('{');
                const end = text.lastIndexOf('}') + 1;
                const info = JSON.parse(text.substring(start, end));
                
                if (info && info.isClone) {
                    const result = { ...info, path: currentPath, workspaceId: wsId };
                    this._cache.set(cacheKey, result);
                    return result;
                }
            } catch(e) {
                // marker not found at this level, continue ascending
            }

            if (currentPath === '/' || currentPath === '') break;
            currentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
        }
        return null;
    }
};
