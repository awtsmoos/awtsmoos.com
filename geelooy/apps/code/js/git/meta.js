
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
        if (!item || item.type === 'github') return item; 

        const physicalType = this.getPhysicalType(item);
        const wsId = item.workspaceId || item.id;
        let currentPath = item.path;

        let limit = 25; 
        while (limit-- > 0) {
            const cacheKey = `${wsId}::${currentPath}`;
            if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

            try {
                const markerPath = `${currentPath === '/' ? '' : currentPath}/.awtsmoos-repo/ikar.js`;
                const lookup = { 
                    path: markerPath, 
                    kind: 'file', 
                    workspaceId: wsId, 
                    type: physicalType 
                };
                
                const raw = await FileSystemProvider.read(lookup);
                const info = this._parseMarker(raw);
                
                if (info && info.isClone) {
                    const res = { ...info, path: currentPath, workspaceId: wsId };
                    this._cache.set(cacheKey, res);
                    return res;
                }
            } catch(e) {
                // B"H - Suppress the OPFS TypeMismatchError / NotFoundError silently.
                // The physical path might be a file, so looking inside it for `.awtsmoos-repo` throws.
                // This is expected and harmless.
            }

            if (currentPath === '/' || currentPath === '') break;
            
            const lastSlash = currentPath.lastIndexOf('/');
            currentPath = (lastSlash <= 0) ? '/' : currentPath.substring(0, lastSlash);
        }
        return null;
    },

    _parseMarker(raw) {
        try {
            const text = (raw instanceof Blob) ? raw.text() : String(raw);
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}') + 1;
            if (start === -1 || end === 0) return null;
            return JSON.parse(text.substring(start, end));
        } catch(e) {
            return null;
        }
    }
};
