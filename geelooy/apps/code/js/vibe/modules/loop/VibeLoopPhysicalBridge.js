
// B"H
/**
 * @file VibeLoopPhysicalBridge.js
 * @brief THE HAND OF ASIYAH.
 * 
 * THE BALLAD OF THE ACTION:
 * Between the thought and the word lies the deed,
 * Planting the byte like a physical seed.
 * We ensure the domains exist in the land,
 * Before we allow the final write command.
 */

import { FileSystemProvider } from '../../../fs-provider.js';

export const VibeLoopPhysicalBridge = {
    _knownWorlds: new Set(),

    async ensureStructuresExist(workspace, filePath, type) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        segments.pop(); // The last one is the file itself.
        
        let pathAccumulator = "";
        const worldKey = String(workspace.id);
        
        for (const segment of segments) {
            pathAccumulator += "/" + segment;
            const fullKey = `${worldKey}::${pathAccumulator}`;
            
            if (this._knownWorlds.has(fullKey)) continue;
            
            try {
                const parentPath = pathAccumulator.substring(0, pathAccumulator.lastIndexOf('/')) || "/";
                const parentItem = { ...workspace, path: parentPath, kind: 'directory', type };
                await FileSystemProvider.create(parentItem, segment, 'directory');
            } catch (e) {
                // Directories may already exist; this is expected.
            }
            this._knownWorlds.add(fullKey);
        }
    },

    async applyChange(item, change) {
        if (change.operation === 'delete') {
            await FileSystemProvider.delete(item);
        } else {
            await FileSystemProvider.write(item, change.content);
        }
    }
};
