
// B"H
/**
 * @file ZipBuilder.js
 * @brief THE GREAT BINDER.
 */

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';
import { ZipContentPacker } from './logic/ZipContentPacker.js';

export const ZipBuilder = {
    /**
     * @async
     * @function build
     * @description Recursively constructs the ZIP binary.
     */
    async build(items) {
        if (!items || items.length === 0) throw new Error("The void cannot be zipped.");

        const encoder = new ZipFile();
        
        const traversal = {
            run: async (item, basePath) => {
                // FOOLPROOF CONTEXT RE-BINDING
                const wsId = item?.workspaceId ?? item?.id;
                const wsRef = State.workspaces.find(w => String(w?.id) === String(wsId));
                
                if (!wsRef) {
                    console.warn(`[ZipBuilder] B"H - Item ${item.name} lost its World context. Skipping.`);
                    return;
                }

                // Forge the absolute reliable vessel
                const safeVessel = { ...wsRef, ...item, workspaceId: wsId };
                const name = safeVessel.name || 'unnamed_vessel';
                const pathInZip = basePath ? `${basePath}/${name}` : name;

                if (safeVessel.kind === 'file') {
                    await ZipContentPacker.packFile(encoder, safeVessel, pathInZip);
                } else {
                    encoder.addFolder(pathInZip);
                    try {
                        const listResult = await FileSystemProvider.list(safeVessel);
                        const entries = listResult?.entries || [];
                        for (const child of entries) {
                            await traversal.run(child, pathInZip);
                        }
                    } catch (e) {
                        console.warn(`[ZipBuilder] Directory access denied: ${pathInZip}`);
                    }
                }
            }
        };

        for (const root of items) {
            await traversal.run(root, '');
        }

        return encoder.build();
    }
};
