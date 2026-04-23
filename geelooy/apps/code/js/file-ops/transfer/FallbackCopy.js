
// B"H
/**
 * @file FallbackCopy.js
 * @brief The Universal Seder Hishtalshelus (Chain of Emanation) for Transfer.
 * 
 * THE POEM OF THE UNIVERSAL WILL:
 * If the lightning path is closed, the water must flow through the canals.
 * This vessel reads the essence into memory, and manually writes it to the
 * new destination. It works everywhere, from GitHub to IDB to Mobile.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';

export const FallbackCopy = {
    /**
     * @async
     * @function execute
     * @description Recursively reads from source and writes to destination.
     */
    async execute(src, dest, onProgress) {
        // Construct the new path
        const newPath = `${dest.path === '/' ? '' : dest.path}/${src.name}`;
        const newItem = { ...dest, name: src.name, path: newPath };
        
        if (src.kind === 'file') {
            try {
                const content = await FileSystemProvider.read(src);
                await FileSystemProvider.write(newItem, content);
                if (onProgress) onProgress(src.path);
            } catch (e) {
                console.error(`[FallbackCopy] B"H - Failed to copy file ${src.name}:`, e);
                throw e;
            }
        } else if (src.kind === 'directory') {
            try {
                // Ensure directory exists
                await FileSystemProvider.create(dest, src.name, 'directory');
            } catch(e) {
                // It might already exist, continue
            }
            
            try {
                const res = await FileSystemProvider.list(src);
                const children = Array.isArray(res) ? res : (res.entries || []);
                
                for (const child of children) {
                    const wsId = src.workspaceId ?? src.id;
                    const ws = State.workspaces.find(w => w.id === wsId);
                    
                    const fullChildSrc = { ...ws, ...child, workspaceId: wsId };
                    const nextDest = { ...newItem, kind: 'directory' };
                    
                    // Recurse
                    await this.execute(fullChildSrc, nextDest, onProgress);
                }
            } catch (e) {
                console.error(`[FallbackCopy] B"H - Failed to traverse directory ${src.name}:`, e);
                throw e;
            }
        }
    }
};
