
/**
 * @file LocalWriter.js
 * @brief The Inscriber of Reality.
 */

import { LocalRoot } from './LocalRoot.js';
import { TraversalEngine } from './traversal-engine.js';
import { HandleCache } from './handle-cache.js';
import { MobileGuard } from './guard/MobileGuard.js';

export const LocalWriter = {
    /**
     * B"H
     * Pushes bytes to the disk, resolving OS locks with exponential patience.
     */
    async write(item, content, onStatus) {
        const executor = async () => {
            const safeLog = (perc, msg) => { if(onStatus) onStatus(perc, msg); };
            const label = item.path.split('/').pop();

            safeLog(10, `Preparing handles...`);
            const root = await LocalRoot.get(item);
            let handle = HandleCache.get(item.workspaceId, item.path);
            const buffer = (content instanceof Blob) ? await content.arrayBuffer() : content;
            
            if (!handle) {
                handle = await TraversalEngine.walk(root, item.path, { kind: 'file', create: true }, item.workspaceId);
            }

            let attempts = 0;
            const max = 5; 
            
            while (attempts < max) {
                let writable = null;
                try {
                    safeLog(30, `Opening Stream...`);
                    // Use a shorter timeout to prevent hanging the whole UI
                    writable = await handle.createWritable({ keepExistingData: false, mode: 'exclusive' });

                    safeLog(60, `Engraving bytes...`);
                    await writable.write(buffer);

                    safeLog(90, `Closing stream...`);
                    await writable.close();

                    safeLog(100, `Complete.`);
                    return;

                } catch (e) {
                    attempts++;
                    // Cleanup failed streams immediately
                    if (writable) {
                        try { await writable.abort(); } catch(abortErr) {}
                    }

                    if (e.name === 'NoModificationAllowedError' || e.message.includes('locked')) {
                        const backoff = 100 * attempts;
                        safeLog(attempts * 15, `OS Locked. Waiting ${backoff}ms...`);
                        await new Promise(r => setTimeout(r, backoff));
                        if (attempts === max) throw e;
                    } else {
                        // Force a fresh walk on any other error
                        HandleCache.remove(item.workspaceId, item.path);
                        handle = await TraversalEngine.walk(root, item.path, { kind: 'file', create: true }, item.workspaceId, true);
                        if (attempts === max) throw e;
                    }
                }
            }
        };
        return await MobileGuard.execute(executor(), item);
    }
};
