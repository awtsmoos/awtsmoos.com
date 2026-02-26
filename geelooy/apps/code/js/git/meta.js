
// B"H
/**
 * @file meta.js
 * @brief Ascends the directory hierarchy to find repository markers.
 */

import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';

export const GitMetaProvider = {
    _cache: new Map(),

    getPhysicalType(item) {
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));
        return ws ? (ws.originalType || ws.type) : (item.originalType || item.type);
    },

    async getGitInfoForFolder(item) {
        if (!item) return null;
        if (item.type === 'github') return item; 

        const physicalType = this.getPhysicalType(item);
        const wsId = item.workspaceId || item.id;
        let currentPath = item.path;

        // B"H - Unified Traversal: Check current, then ascend
        let limit = 20; 
        while (limit-- > 0) {
            const cacheKey = `${wsId}::${currentPath}`;
            if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

            // Construct the path to the holy marker
            const prefix = (currentPath === '/' || currentPath === '') ? '' : currentPath;
            const markerPath = `${prefix}/.awtsmoos-repo/ikar.js`;
            
            try {
                const lookup = { 
                    path: markerPath, 
                    kind: 'file', 
                    workspaceId: wsId, 
                    type: physicalType, 
                    originalType: physicalType 
                };
                
                // B"H - The Tikkun: We actually perform the read!
                const raw = await FileSystemProvider.read(lookup);
                
                // Ensure raw is converted to string asynchronously if needed
                let textContent = "";
                if (raw instanceof Blob) {
                    textContent = await raw.text();
                } else if (typeof raw === 'string') {
                    textContent = raw;
                } else {
                    textContent = String(raw);
                }

                const info = this._parseMarker(textContent);
                
                // If the marker is valid, we have found the root!
                if (info && info.isClone) {
                    const res = { ...info, path: currentPath, workspaceId: wsId };
                    this._cache.set(cacheKey, res);
                    return res;
                }
            } catch(e) {
                // Ignore missing file errors as we traverse up. It is expected.
            }

            // If we've reached the absolute root and found nothing, stop.
            if (currentPath === '/' || currentPath === '') break;
            
            // Move up one level in the hierarchy
            const lastSlash = currentPath.lastIndexOf('/');
            currentPath = (lastSlash <= 0) ? '/' : currentPath.substring(0, lastSlash);
        }
        
        return null;
    },

    _parseMarker(text) {
        if (typeof text !== 'string') return null;
        try {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}') + 1;
            if (start === -1 || end === 0) return null;
            return JSON.parse(text.substring(start, end));
        } catch(e) {
            return null;
        }
    }
};
