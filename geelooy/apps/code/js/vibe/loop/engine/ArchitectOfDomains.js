
/**
 * B"H
 * 
 * CHAPTER V: THE ARCHITECT OF THE DIGITAL PALACES
 * 
 * Before the Word can be inscribed, the Palace (the folder structure) 
 * must be prepared. The Speech of the Awtsmoos is the source of 
 * both the vessel and the light.
 * 
 * This Architect recursively inspects the path to ensure every 
 * nested chamber exists. It uses the Seal of Protection (Lock) 
 * to prevent collisions during the parallel descent of multiple files.
 */

import { State } from '../../../state.js';
import { FileSystemProvider } from '../../../fs-provider.js';
import { VesselCreationLock } from './VesselCreationLock.js';

export const ArchitectOfDomains = {
    _memo: new Set(),

    /**
     * Recursively ensures the entire directory tree for a file path is manifested.
     * 
     * @param {Object} workspace - The Project World.
     * @param {string} filePath - The destination path.
     * @param {string} type - The physical realm (local/idb/etc).
     */
    async ensureExists(workspace, filePath, type) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return; // Only a root file
        segments.pop(); // Remove the filename to reach the folder level
        
        let currentPath = "";
        const worldId = String(workspace.id);
        
        for (const segment of segments) {
            currentPath += "/" + segment;
            const uniqueKey = `${worldId}::${currentPath}`;
            
            // 1. Check Memory (Instant)
            if (this._memo.has(uniqueKey) || State.domItemMap.has(uniqueKey)) {
                this._memo.add(uniqueKey);
                continue;
            }

            // 2. Use thread-safe lock for physical creation.
            await VesselCreationLock.acquire(uniqueKey, async () => {
                try {
                    const parent = { 
                        ...workspace, 
                        path: currentPath.substring(0, currentPath.lastIndexOf('/')) || "/", 
                        kind: 'directory', 
                        type 
                    };
                    
                    console.log(`[Architect] B"H - Manifesting Chamber: ${currentPath}`);
                    await FileSystemProvider.create(parent, segment, 'directory');
                    this._memo.add(uniqueKey);
                } catch (e) {
                    // Entry likely already exists, we record it and proceed.
                    this._memo.add(uniqueKey);
                }
            });
        }
    }
};
