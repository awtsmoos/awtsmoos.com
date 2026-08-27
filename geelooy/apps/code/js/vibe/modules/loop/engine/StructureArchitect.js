
// B"H
/**
 * @file StructureArchitect.js
 * @brief THE BUILDER OF THE DOMAINS.
 */

import { FileSystemProvider } from '../../../../fs-provider.js';

export const StructureArchitect = {
    _knownFolders: new Set(),

    /**
     * @async
     * @function ensureDir
     * @description Recursively builds directory segments for a given path.
     */
    async ensureDir(workspace, filePath, type) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        segments.pop(); 
        
        let pathAccumulator = "";
        const worldId = String(workspace.id);
        
        for (const segment of segments) {
            pathAccumulator += "/" + segment;
            const fullKey = `${worldId}::${pathAccumulator}`;
            
            if (this._knownFolders.has(fullKey)) continue;
            
            try {
                const parentPath = pathAccumulator.substring(0, pathAccumulator.lastIndexOf('/')) || "/";
                const parentItem = { ...workspace, path: parentPath, kind: 'directory', type };
                await FileSystemProvider.create(parentItem, segment, 'directory');
            } catch (e) {
                // Directory likely exists.
            }
            this._knownFolders.add(fullKey);
        }
    }
};
