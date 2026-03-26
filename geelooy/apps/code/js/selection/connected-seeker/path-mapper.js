
// B"H
/**
 * @file path-mapper.js
 * @brief Translates relative directions into absolute realities.
 */

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { PathResolver } from '../../utils/path-resolver.js';

export const SeekerPathMapper = {
    async resolve(baseItem, relPath) {
        const finalPathStr = PathResolver.resolve(baseItem.path, relPath);
        if (!finalPathStr || finalPathStr.startsWith('http')) return null;

        const candidates = [finalPathStr];
        if (!finalPathStr.match(/\.[a-zA-Z0-9]+$/)) {
            candidates.push(finalPathStr + '.js');
            candidates.push(finalPathStr + '.mjs');
            candidates.push(finalPathStr + '/index.js');
        }

        const ws = State.workspaces.find(w => w.id === baseItem.workspaceId);
        if (!ws) return null;

        for (const candidate of candidates) {
            const targetItem = { 
                ...ws, 
                path: candidate, 
                name: candidate.split('/').pop(), 
                kind: 'file', 
                workspaceId: ws.id 
            };
            
            try {
                const parentPath = candidate.substring(0, candidate.lastIndexOf('/')) || '/';
                const parentItem = { ...ws, path: parentPath, kind: 'directory', workspaceId: ws.id };
                
                const res = await FileSystemProvider.list(parentItem);
                const children = Array.isArray(res) ? res : (res.entries || []);
                const found = children.find(c => c.name === targetItem.name);
                
                if (found) return { ...targetItem, ...found };
            } catch (e) {}
        }
        return null;
    }
};
