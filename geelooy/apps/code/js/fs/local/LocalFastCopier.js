
// B"H
/**
 * @file LocalFastCopier.js
 * @brief The Lightning Path for Local FS Transfers.
 */

import { LocalRoot } from './LocalRoot.js';
import { TraversalEngine } from './traversal-engine.js';
import { MobileGuard } from './guard/MobileGuard.js';

export const LocalFastCopier = {
    /**
     * B"H
     * Pours data directly between OS handles, bypassing massive string memory loads.
     * @param {Object} srcItem - Source coordinates.
     * @param {FileSystemDirectoryHandle} destHandle - The target directory handle.
     * @param {Function} onProgress - Progress hook.
     */
    async fastCopy(srcItem, destHandle, onProgress) {
        const executor = async () => {
            const root = await LocalRoot.get(srcItem);
            const traverse = async (curPath, targetDir) => {
                try {
                    const curH = await TraversalEngine.walk(root, curPath, {}, srcItem.workspaceId);
                    if (curH.kind === 'file') {
                        const file = await curH.getFile();
                        const newF = await targetDir.getFileHandle(curH.name, { create: true });
                        const wr = await newF.createWritable();
                        await wr.write(file); 
                        await wr.close();
                        if (onProgress) onProgress(curPath);
                    } else {
                        const newD = await targetDir.getDirectoryHandle(curH.name, { create: true });
                        for await (const [name, entry] of curH.entries()) {
                            await traverse((curPath === '/' ? '' : curPath) + '/' + name, newD);
                        }
                    }
                } catch (trErr) {
                    console.warn(`Blocked traversal in local branch: ${curPath}`, trErr);
                }
            };
            await traverse(srcItem.path, destHandle);
        };
        return await MobileGuard.execute(executor(), srcItem);
    }
};
