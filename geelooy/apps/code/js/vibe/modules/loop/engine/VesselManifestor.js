
// B"H
/**
 * @file VesselManifestor.js
 * @brief THE ENGRAVER OF REALITY.
 */

import { FileSystemProvider } from '../../../../fs-provider.js';
import { ArchitectOfDomains } from './ArchitectOfDomains.js';

export const VesselManifestor = {
    /**
     * @async
     * @function manifest
     * @description Inscribes the AI's dream into the physical disk.
     */
    async manifest(workspace, change, type) {
        const physicalItem = { 
            ...workspace, 
            path: change.path, 
            kind: 'file', 
            workspaceId: workspace.id, 
            type: type, 
            originalType: type 
        };

        if (change.operation === 'delete') {
            await FileSystemProvider.delete(physicalItem);
        } else {
            // First, ensure the house is built.
            await ArchitectOfDomains.ensureExists(workspace, change.path, type);
            
            // Then, manifest the spark.
            await FileSystemProvider.write(physicalItem, change.content);
        }
    }
};
