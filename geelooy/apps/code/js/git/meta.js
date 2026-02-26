
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
        const ws = State.workspaces.find(w => w.id === wsId);
        return ws ? (ws.originalType || ws.type) : (item.originalType || item.type);
    },

    async getGitInfoForFolder(item) {
        if (!item) return null;
        if (item.type === 'github') return item; 

        // console.log(`[GitMeta] Inspecting: ${item.path}`);

        const physicalType = this.getPhysicalType(item);
        const wsId = item.workspaceId || item.id;

        // 1. Direct Root Check (Look for .awtsmoos-repo inside the current folder)
        if (item.kind === 'directory' || item.kind === 'root') {
            try {
                const listing = await FileSystemProvider.list(item);
                const entries = Array.isArray(listing) ? listing : (listing.entries || []);
                const hasRepoMarker = entries.some(e => e.name === '.awtsmoos-repo');
                
                if (hasRepoMarker) {
                    const prefix = (item.path === '/' || item.path === '') ? '' : item.path;
                    const markerPath = `${prefix}/.awtsmoos-repo/ikar.js`;
                    
                    const lookup = { 
                        path: markerPath, 
                        kind: 'file', 
                        workspaceId: wsId, 
                        type: physicalType,
                        originalType: physicalType
                    };
                    
                    try {
                        const raw = await FileSystemProvider.read(lookup);
                        
                        // B"H - The Tikkun: Ensure raw is converted to string *asynchronously* if needed
                        let textContent = "";
                        if (raw instanceof Blob) {
                            textContent = await raw.text();
                        } else if (typeof raw === 'string') {
                            textContent = raw;
                        } else {
                            textContent = String(raw); // Fallback for buffers/objects
                        }

                        const info = this._parseMarker(textContent);
                        
                        if (info && info.isClone) {
                            return { ...info, path: item.path, workspaceId: wsId };
                        }
                    } catch(readErr) {
                         // Quiet fail - marker might not be readable yet
                    }
                }
            } catch(listErr) {
                // Directory might not exist or be accessible
            }
        }

        // 2. Ascension (Walking up the tree)
        let currentPath = item.path;
        let limit = 20; 

        while (limit-- > 0) {
            const cacheKey = `${wsId}::${currentPath}`;
            if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

            if (currentPath === '/' || currentPath === '') break;
            
            // Move up one level
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
