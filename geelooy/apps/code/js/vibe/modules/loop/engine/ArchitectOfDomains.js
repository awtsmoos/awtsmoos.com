
// B"H
/**
 * @file ArchitectOfDomains.js
 * @brief THE BUILDER OF THE PHYSICAL FOUNDATIONS.
 * 
 * THE POEM OF THE ORDERED STONES:
 * When a hundred files seek the same new folder to reside,
 * We must not let them crash together, nowhere left to hide!
 * We put a lock upon the gate, a promise in the air,
 * And check the memory map to see if it's already there!
 * No native errors, no heavy cost, just lightning speed restored,
 * As every vessel finds its place upon the digital board.
 */

import { State } from '../../../../state.js';
import { FileSystemProvider } from '../../../../fs-provider.js';

export const ArchitectOfDomains = {
    _knownFolders: new Set(),
    _buildingLocks: new Map(),

    /**
     * @async
     * @function ensureExists
     * @description Recursively builds directory paths safely with 0ms RAM verification.
     */
    async ensureExists(workspace, filePath, type) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        segments.pop(); 
        
        let pathAccumulator = "";
        const worldId = String(workspace.id);
        
        for (const segment of segments) {
            pathAccumulator += "/" + segment;
            const fullKey = `${worldId}::${pathAccumulator}`;
            
            // 0ms Latency Verification: RAM Check
            if (this._knownFolders.has(fullKey) || State.domItemMap.has(fullKey)) {
                this._knownFolders.add(fullKey);
                continue;
            }

            // B"H - Lock for parallel execution
            if (this._buildingLocks.has(fullKey)) {
                await this._buildingLocks.get(fullKey);
                continue;
            }

            let unlock;
            const lockPromise = new Promise(r => unlock = r);
            this._buildingLocks.set(fullKey, lockPromise);
            
            try {
                const parentPath = pathAccumulator.substring(0, pathAccumulator.lastIndexOf('/')) || "/";
                const parentItem = { ...workspace, path: parentPath, kind: 'directory', type };
                await FileSystemProvider.create(parentItem, segment, 'directory');
                this._knownFolders.add(fullKey);
            } catch (e) {
                this._knownFolders.add(fullKey);
            } finally {
                unlock();
                this._buildingLocks.delete(fullKey);
            }
        }
    }
};
